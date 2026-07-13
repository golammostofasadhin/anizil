const express = require('express');
const pool = require('../config/database');
const { paginate } = require('../utils/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    const pagination = paginate(page, limit);

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = `%${q.trim()}%`;

    const [animeCount] = await pool.query(
      `SELECT COUNT(*) as total FROM anime 
       WHERE title LIKE ? OR series_title LIKE ? OR description LIKE ? OR genres LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
    const total = animeCount[0].total;

    const [anime] = await pool.query(
      `SELECT id, title, slug, poster, rating, status, genres, release_year, episode_count
       FROM anime 
       WHERE title LIKE ? OR series_title LIKE ? OR description LIKE ? OR genres LIKE ?
       ORDER BY 
         CASE 
           WHEN title LIKE ? THEN 0
           WHEN series_title LIKE ? THEN 1
           ELSE 2
         END,
         rating DESC, views DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, q.trim(), q.trim(), pagination.limit, pagination.offset]
    );

    const [genres] = await pool.query(
      `SELECT DISTINCT genres FROM anime 
       WHERE genres LIKE ? 
       LIMIT 10`,
      [searchTerm]
    );

    let genreResults = [];
    genres.forEach(g => {
      if (g.genres) {
        g.genres.split(',').forEach(genre => {
          if (genre.trim().toLowerCase().includes(q.trim().toLowerCase())) {
            genreResults.push(genre.trim());
          }
        });
      }
    });
    genreResults = [...new Set(genreResults)].slice(0, 5);

    res.json({
      success: true,
      data: {
        anime,
        genres: genreResults,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          pages: Math.ceil(total / pagination.limit)
        },
        query: q.trim()
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
