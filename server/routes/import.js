const express = require('express');
const { getPool } = require('../config/database');
const auth = require('../middleware/auth');
const { adminAuth, requirePermission } = require('../middleware/adminAuth');
const { generateSlug, delay } = require('../utils/helpers');

const router = express.Router();

router.use(auth, adminAuth);

// Check Anikoto API status
router.get('/anikoto/status', async (req, res) => {
  try {
    const response = await fetch('https://anikotoapi.site/recent-anime?page=1&per_page=1');
    const data = await response.json();
    res.json({ success: true, online: data.ok === true });
  } catch (error) {
    res.json({ success: true, online: false });
  }
});

// Search Anikoto API
router.get('/anikoto/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.json({ success: true, data: { anime: [], pagination: {} } });
    // Use the Anikoto search endpoint directly
    const response = await fetch(`https://anikotoapi.site/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    const animeList = data.data || [];
    const pool = await getPool();

    const withStatus = await Promise.all(animeList.map(async (a) => {
      const [existing] = await pool.query('SELECT id FROM anime WHERE anikoto_id = ?', [a.id]);
      return { ...a, imported: existing.length > 0 };
    }));

    res.json({ success: true, data: { anime: withStatus, pagination: data.pagination || {} } });
  } catch (error) {
    console.error('Anikoto search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Browse Anikoto recent
router.get('/anikoto/browse', async (req, res) => {
  try {
    const { page = 1, per_page = 20 } = req.query;
    // Try recent first, then search if q is provided
    let response;
    if (req.query.q) {
      response = await fetch(`https://anikotoapi.site/search?q=${encodeURIComponent(req.query.q)}`);
    } else {
      response = await fetch(`https://anikotoapi.site/recent-anime?page=${page}&per_page=${per_page}`);
    }
    const data = await response.json();
    const animeList = data.data || [];
    const pool = await getPool();

    const withStatus = await Promise.all(animeList.map(async (a) => {
      const [existing] = await pool.query('SELECT id FROM anime WHERE anikoto_id = ?', [a.id]);
      return { ...a, imported: existing.length > 0 };
    }));

    res.json({ success: true, data: { anime: withStatus, pagination: data.pagination || {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Import from Anikoto - FULL import with episodes
router.post('/anikoto', requirePermission('add_anime'), async (req, res) => {
  try {
    const { anikoto_id, is_premium } = req.body;
    if (!anikoto_id) {
      return res.status(400).json({ success: false, message: 'anikoto_id is required' });
    }

    const pool = await getPool();
    const [existing] = await pool.query('SELECT id FROM anime WHERE anikoto_id = ?', [anikoto_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Anime already imported' });
    }

    // Fetch series details with episodes from Anikoto API
    const response = await fetch(`https://anikotoapi.site/series/${anikoto_id}`);
    if (!response.ok) {
      return res.status(500).json({ success: false, message: `Anikoto API error: ${response.statusText}` });
    }
    const apiData = await response.json();
    if (!apiData.ok) {
      return res.status(500).json({ success: false, message: 'Anikoto API returned error' });
    }

    const animeInfo = apiData.data.anime;
    const episodes = apiData.data.episodes || [];

    const title = animeInfo.title || 'Unknown Title';
    const slug = generateSlug(title);

    const [existingSlug] = await pool.query('SELECT id FROM anime WHERE slug = ?', [slug]);
    let finalSlug = slug;
    if (existingSlug.length > 0) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    const genres = animeInfo.terms_by_type?.genre
      ? animeInfo.terms_by_type.genre.join(',')
      : '';
    const studio = animeInfo.terms_by_type?.studios
      ? animeInfo.terms_by_type.studios.join(',')
      : '';
    const anilist_id = animeInfo.ani_id || null;
    const mal_id = animeInfo.mal_id || null;

    const [result] = await pool.query(
      `INSERT INTO anime (title, slug, description, poster, banner, genres, studio,
        rating, mal_score, release_year, duration, language, status, episode_count,
        anilist_id, mal_id, anikoto_id, is_premium)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        finalSlug,
        animeInfo.description || '',
        animeInfo.poster || '',
        animeInfo.background_image || '',
        genres,
        studio,
        animeInfo.score || 0,
        animeInfo.score || 0,
        animeInfo.year || null,
        animeInfo.duration ? `${animeInfo.duration}m` : '',
        animeInfo.is_dub ? 'dub' : 'sub',
        animeInfo.status === 'Currently Airing' ? 'ongoing' : 'completed',
        episodes.length || 0,
        anilist_id,
        mal_id,
        anikoto_id,
        is_premium ? 1 : 0
      ]
    );

    const animeId = result.insertId;

    // Insert episodes with actual embed URLs from API
    for (const ep of episodes) {
      const [epResult] = await pool.query(
        'INSERT INTO episodes (anime_id, episode_number, title, description, thumbnail, duration) VALUES (?, ?, ?, ?, ?, ?)',
        [
          animeId,
          ep.number,
          ep.title || `Episode ${ep.number}`,
          '',
          '',
          ''
        ]
      );

      // Add SUB source
      if (ep.embed_url?.sub) {
        await pool.query(
          'INSERT INTO episode_sources (episode_id, language, server_name, video_url, source_type) VALUES (?, ?, ?, ?, ?)',
          [epResult.insertId, 'sub', 'MegaPlay', ep.embed_url.sub, 'embed']
        );
      }

      // Add DUB source
      if (ep.embed_url?.dub) {
        await pool.query(
          'INSERT INTO episode_sources (episode_id, language, server_name, video_url, source_type) VALUES (?, ?, ?, ?, ?)',
          [epResult.insertId, 'dub', 'MegaPlay', ep.embed_url.dub, 'embed']
        );
      }
    }

    // Update episode count
    await pool.query('UPDATE anime SET episode_count = ? WHERE id = ?', [episodes.length, animeId]);

    await pool.query(
      'INSERT INTO activity_feed (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'import_anime', `Imported from Anikoto: ${title} (${episodes.length} episodes)`]
    );

    const [newAnime] = await pool.query('SELECT * FROM anime WHERE id = ?', [animeId]);
    res.status(201).json({ success: true, data: newAnime[0] });
  } catch (error) {
    console.error('Import from Anikoto error:', error);
    res.status(500).json({ success: false, message: `Import failed: ${error.message}` });
  }
});

module.exports = router;
