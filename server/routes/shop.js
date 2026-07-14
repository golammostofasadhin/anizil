const express = require('express');
const { getPool } = require('../config/database');
const auth = require('../middleware/auth');
const { generateRedeemCode } = require('../utils/helpers');

const router = express.Router();

// Redeem a code
router.post('/redeem', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const pool = await getPool();
    const upperCode = code.trim().toUpperCase();
    console.log(`[REDEEM] User ${req.user.id} attempting to redeem: "${upperCode}"`);

    const [codes] = await pool.query(
      'SELECT * FROM redeem_codes WHERE code = ? AND is_redeemed = 0',
      [upperCode]
    );

    if (codes.length === 0) {
      const [allCodes] = await pool.query('SELECT code, is_redeemed FROM redeem_codes ORDER BY id DESC LIMIT 10');
      console.log(`[REDEEM] Code not found. Recent codes in DB:`, allCodes);
      return res.status(400).json({ success: false, message: 'Invalid or already redeemed code' });
    }

    const redeemCode = codes[0];
    console.log(`[REDEEM] Found code:`, { id: redeemCode.id, type: redeemCode.reward_type, amount: redeemCode.reward_amount });

    // Apply reward
    if (redeemCode.reward_type === 'xp' || redeemCode.reward_type === 'credits') {
      await pool.query('UPDATE users SET xp = xp + ? WHERE id = ?', [redeemCode.reward_amount, req.user.id]);
    } else if (redeemCode.reward_type === 'premium_days') {
      await pool.query(
        'UPDATE users SET premium_until = GREATEST(COALESCE(premium_until, NOW()), NOW()) + INTERVAL ? DAY WHERE id = ?',
        [redeemCode.reward_amount, req.user.id]
      );
    }

    // Mark as redeemed
    await pool.query(
      'UPDATE redeem_codes SET is_redeemed = 1, redeemed_by = ?, redeemed_at = NOW() WHERE id = ?',
      [req.user.id, redeemCode.id]
    );

    // Activity log
    await pool.query(
      'INSERT INTO activity_feed (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'redeem_code', `Redeemed code: ${redeemCode.code} (+${redeemCode.reward_amount} ${redeemCode.reward_type})`]
    );

    const [updatedUser] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [req.user.id]);
    console.log(`[REDEEM] Success! User XP: ${updatedUser[0].xp}`);

    res.json({
      success: true,
      message: `Successfully redeemed ${redeemCode.reward_amount} ${redeemCode.reward_type.replace('_', ' ')}!`,
      data: { new_xp: updatedUser[0].xp }
    });
  } catch (error) {
    console.error('[REDEEM] Error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Get user inventory (earned items)
router.get('/inventory', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const [items] = await pool.query(
      'SELECT * FROM activity_feed WHERE user_id = ? AND action IN ("redeem_code", "purchase", "achievement") ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ success: true, data: { items } });
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Purchase XP pack (simulated - in real app would integrate payment gateway)
router.post('/purchase', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const pool = await getPool();

    const PACKS = {
      small: { xp: 500, price: '$0.99' },
      medium: { xp: 1500, price: '$2.49' },
      large: { xp: 5000, price: '$6.99' },
      mega: { xp: 15000, price: '$17.99' },
    };

    const pack = PACKS[itemId];
    if (!pack) {
      return res.status(400).json({ success: false, message: 'Invalid pack' });
    }

    // For demo, directly add XP (in production, redirect to payment gateway)
    await pool.query('UPDATE users SET xp = xp + ? WHERE id = ?', [pack.xp, req.user.id]);

    await pool.query(
      'INSERT INTO activity_feed (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'purchase', `Purchased ${pack.xp} XP pack`]
    );

    res.json({
      success: true,
      message: `Successfully purchased ${pack.xp} XP!`,
      data: { xp_added: pack.xp }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Debug: check redeem codes table status (remove in production)
router.get('/redeem-debug', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const [count] = await pool.query('SELECT COUNT(*) as total FROM redeem_codes');
    const [unredeemed] = await pool.query('SELECT COUNT(*) as total FROM redeem_codes WHERE is_redeemed = 0');
    const [recent] = await pool.query('SELECT id, code, reward_type, reward_amount, is_redeemed FROM redeem_codes ORDER BY id DESC LIMIT 10');
    res.json({
      success: true,
      data: {
        total_codes: count[0].total,
        unredeemed_codes: unredeemed[0].total,
        recent,
        user: { id: req.user.id, xp: req.user.xp }
      }
    });
  } catch (error) {
    console.error('[REDEEM-DEBUG] Error:', error);
    res.status(500).json({ success: false, message: 'Debug error: ' + error.message });
  }
});

// Get all profile frames
router.get('/frames', async (req, res) => {
  try {
    const pool = await getPool();
    const [frames] = await pool.query('SELECT * FROM profile_frames WHERE is_active = 1 ORDER BY sort_order ASC, price_xp ASC');
    res.json({ success: true, data: frames });
  } catch (error) {
    console.error('Get frames error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's purchased frames + active frame
router.get('/frames/my', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const [purchased] = await pool.query(
      `SELECT uf.*, pf.name, pf.image_url, pf.border_color, pf.rarity
       FROM user_frames uf
       JOIN profile_frames pf ON uf.frame_id = pf.id
       WHERE uf.user_id = ? ORDER BY pf.rarity DESC`,
      [req.user.id]
    );
    const [user] = await pool.query('SELECT active_frame_id FROM users WHERE id = ?', [req.user.id]);
    res.json({
      success: true,
      data: {
        frames: purchased,
        active_frame_id: user[0]?.active_frame_id || null,
      }
    });
  } catch (error) {
    console.error('Get my frames error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Purchase a profile frame with XP
router.post('/frames/purchase', auth, async (req, res) => {
  try {
    const { frame_id } = req.body;
    if (!frame_id) return res.status(400).json({ success: false, message: 'frame_id is required' });

    const pool = await getPool();
    const [frames] = await pool.query('SELECT * FROM profile_frames WHERE id = ? AND is_active = 1', [frame_id]);
    if (frames.length === 0) return res.status(404).json({ success: false, message: 'Frame not found' });

    const frame = frames[0];

    const [existing] = await pool.query('SELECT id FROM user_frames WHERE user_id = ? AND frame_id = ?', [req.user.id, frame_id]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'You already own this frame' });

    const [user] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    if (user[0].xp < frame.price_xp) {
      return res.status(400).json({ success: false, message: `Not enough XP. Need ${frame.price_xp} XP, you have ${user[0].xp} XP` });
    }

    await pool.query('UPDATE users SET xp = xp - ? WHERE id = ?', [frame.price_xp, req.user.id]);
    await pool.query('INSERT INTO user_frames (user_id, frame_id) VALUES (?, ?)', [req.user.id, frame_id]);

    await pool.query(
      'INSERT INTO activity_feed (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'purchase_frame', `Purchased frame: ${frame.name} (-${frame.price_xp} XP)`]
    );

    const [updatedUser] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: `Purchased ${frame.name}!`, data: { new_xp: updatedUser[0].xp } });
  } catch (error) {
    console.error('Purchase frame error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Set active frame
router.post('/frames/activate', auth, async (req, res) => {
  try {
    const { frame_id } = req.body;
    const pool = await getPool();

    if (frame_id === null || frame_id === 0) {
      await pool.query('UPDATE users SET active_frame_id = NULL WHERE id = ?', [req.user.id]);
      return res.json({ success: true, message: 'Frame removed' });
    }

    const [owned] = await pool.query('SELECT id FROM user_frames WHERE user_id = ? AND frame_id = ?', [req.user.id, frame_id]);
    if (owned.length === 0) return res.status(400).json({ success: false, message: 'You do not own this frame' });

    await pool.query('UPDATE users SET active_frame_id = ? WHERE id = ?', [frame_id, req.user.id]);
    res.json({ success: true, message: 'Frame activated!' });
  } catch (error) {
    console.error('Activate frame error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Purchase premium anime with XP
router.post('/purchase-anime', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const [premiumSetting] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['premium_enabled']);
    if (premiumSetting.length > 0 && premiumSetting[0].setting_value === '0') {
      return res.status(400).json({ success: false, message: 'Premium system is disabled' });
    }

    const { anime_id } = req.body;
    if (!anime_id) return res.status(400).json({ success: false, message: 'anime_id is required' });

    const [animes] = await pool.query('SELECT * FROM anime WHERE id = ? AND is_premium = 1', [anime_id]);
    if (animes.length === 0) return res.status(400).json({ success: false, message: 'Anime not found or not premium' });

    const [existing] = await pool.query('SELECT id FROM user_purchased_anime WHERE user_id = ? AND anime_id = ?', [req.user.id, anime_id]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'You already have access to this anime' });

    const PREMIUM_PRICE = 200;
    const [user] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    if (user[0].xp < PREMIUM_PRICE) {
      return res.status(400).json({ success: false, message: `Not enough XP. Need ${PREMIUM_PRICE} XP, you have ${user[0].xp} XP` });
    }

    await pool.query('UPDATE users SET xp = xp - ? WHERE id = ?', [PREMIUM_PRICE, req.user.id]);
    await pool.query('INSERT INTO user_purchased_anime (user_id, anime_id) VALUES (?, ?)', [req.user.id, anime_id]);

    await pool.query(
      'INSERT INTO activity_feed (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'purchase_anime', `Unlocked premium anime: ${animes[0].title} (-${PREMIUM_PRICE} XP)`]
    );

    const [updatedUser] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: `Unlocked ${animes[0].title}!`, data: { new_xp: updatedUser[0].xp } });
  } catch (error) {
    console.error('Purchase anime error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check if user has access to premium anime
router.get('/anime-access/:animeId', auth, async (req, res) => {
  try {
    const pool = await getPool();

    const [premiumSetting] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['premium_enabled']);
    if (premiumSetting.length > 0 && premiumSetting[0].setting_value === '0') {
      return res.json({ success: true, data: { has_access: true } });
    }

    const animeId = req.params.animeId;

    if (req.user.role === 'super_admin' || req.user.role === 'content_admin') {
      return res.json({ success: true, data: { has_access: true } });
    }

    if (req.user.premium_until && new Date(req.user.premium_until) > new Date()) {
      return res.json({ success: true, data: { has_access: true } });
    }

    const [purchased] = await pool.query('SELECT id FROM user_purchased_anime WHERE user_id = ? AND anime_id = ?', [req.user.id, animeId]);
    if (purchased.length > 0) {
      return res.json({ success: true, data: { has_access: true } });
    }

    res.json({ success: true, data: { has_access: false } });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get XP earning methods info
router.get('/xp-info', auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      methods: [
        { action: 'Watch an episode', xp: 10, icon: 'play' },
        { action: 'Complete an anime', xp: 50, icon: 'check' },
        { action: 'Post a comment', xp: 5, icon: 'message' },
        { action: 'Add to watchlist', xp: 5, icon: 'list' },
        { action: 'Daily login', xp: 20, icon: 'calendar' },
        { action: 'Redeem a code', xp: 0, icon: 'gift', note: 'Variable' },
        { action: 'Purchase XP pack', xp: 0, icon: 'coins', note: 'Variable' },
      ],
      level_thresholds: {
        formula: 'level = floor(xp / 1000) + 1',
        next_level_at: 'every 1000 XP',
      }
    }
  });
});

module.exports = router;
