const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: '', database: 'anizil'
  });

  const stmts = [
    `CREATE TABLE IF NOT EXISTS profile_frames (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      price_xp INT NOT NULL DEFAULT 500,
      rarity ENUM('common','rare','epic','legendary') DEFAULT 'common',
      border_color VARCHAR(20) DEFAULT '#0ea5e9',
      is_active TINYINT(1) DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_frames (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      frame_id INT NOT NULL,
      purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active TINYINT(1) DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (frame_id) REFERENCES profile_frames(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_frame (user_id, frame_id)
    )`,
    `CREATE TABLE IF NOT EXISTS user_purchased_anime (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      anime_id INT NOT NULL,
      purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_anime (user_id, anime_id)
    )`,
  ];

  for (const sql of stmts) {
    await pool.query(sql);
  }
  console.log('Tables created');

  try {
    await pool.query('ALTER TABLE users ADD COLUMN active_frame_id INT DEFAULT NULL');
    console.log('Added active_frame_id column');
  } catch (e) {
    console.log('active_frame_id column already exists');
  }

  try {
    await pool.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL');
    console.log('Added google_id column');
  } catch (e) {
    console.log('google_id column already exists');
  }

  try {
    await pool.query('ALTER TABLE anime ADD COLUMN is_premium TINYINT(1) DEFAULT 0');
    console.log('Added is_premium column');
  } catch (e) {
    console.log('is_premium column already exists');
  }

  const frames = [
    ['No Frame', '', 0, 'common', '#64748b', 0],
    ['Bronze Shield', 'https://api.dicebear.com/7.x/shapes/svg?seed=bronze&backgroundColor=78350f', 200, 'common', '#cd7f32', 1],
    ['Silver Wing', 'https://api.dicebear.com/7.x/shapes/svg?seed=silver&backgroundColor=475569', 500, 'rare', '#c0c0c0', 2],
    ['Golden Crown', 'https://api.dicebear.com/7.x/shapes/svg?seed=gold&backgroundColor=713f12', 1000, 'rare', '#ffd700', 3],
    ['Emerald Leaf', 'https://api.dicebear.com/7.x/shapes/svg?seed=emerald&backgroundColor=064e3b', 2000, 'epic', '#10b981', 4],
    ['Ruby Flame', 'https://api.dicebear.com/7.x/shapes/svg?seed=ruby&backgroundColor=7f1d1d', 3500, 'epic', '#ef4444', 5],
    ['Diamond Ice', 'https://api.dicebear.com/7.x/shapes/svg?seed=diamond&backgroundColor=1e3a5f', 5000, 'legendary', '#0ea5e9', 6],
    ['Sakura Blossom', 'https://api.dicebear.com/7.x/shapes/svg?seed=sakura&backgroundColor=831843', 7500, 'legendary', '#ec4899', 7],
    ['Dragon Heart', 'https://api.dicebear.com/7.x/shapes/svg?seed=dragon&backgroundColor=450a0a', 10000, 'legendary', '#f97316', 8],
    ['Galaxy Nova', 'https://api.dicebear.com/7.x/shapes/svg?seed=galaxy&backgroundColor=172554', 25000, 'legendary', '#a855f7', 9],
  ];

  const [existing] = await pool.query('SELECT COUNT(*) as cnt FROM profile_frames');
  if (existing[0].cnt === 0) {
    for (const f of frames) {
      await pool.query('INSERT INTO profile_frames (name, image_url, price_xp, rarity, border_color, sort_order) VALUES (?, ?, ?, ?, ?, ?)', f);
    }
    console.log('Seeded', frames.length, 'profile frames');
  } else {
    console.log('Profile frames already exist:', existing[0].cnt);
  }

  await pool.end();
  console.log('Done!');
})();
