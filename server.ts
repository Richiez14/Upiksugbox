import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("suggestions.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT,
    department TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    status TEXT DEFAULT 'pending',
    admin_response TEXT,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    author_role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions (id)
  );

  -- Insert default admin if not exists (password: admin123)
  INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  
  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
  app.post("/api/suggestions", (req, res) => {
    const { student_name, department, text, image_url, video_url } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO suggestions (student_name, department, text, image_url, video_url)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(student_name || "Anonymous", department, text, image_url, video_url);
      res.json({ id: result.lastInsertRowid, status: 'pending' });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit suggestion" });
    }
  });

  // Get public suggestions
  app.get("/api/suggestions/public", (req, res) => {
    const suggestions = db.prepare(`
      SELECT * FROM suggestions WHERE is_public = 1 ORDER BY created_at DESC
    `).all();
    res.json(suggestions);
  });

  // Admin: Get all suggestions
  app.get("/api/admin/suggestions", (req, res) => {
    const suggestions = db.prepare(`
      SELECT * FROM suggestions ORDER BY created_at DESC
    `).all();
    res.json(suggestions);
  });

  // Admin: Update suggestion (response, status, visibility)
  app.patch("/api/admin/suggestions/:id", (req, res) => {
    const { id } = req.params;
    const { admin_response, status, is_public } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE suggestions 
        SET admin_response = COALESCE(?, admin_response),
            status = COALESCE(?, status),
            is_public = COALESCE(?, is_public)
        WHERE id = ?
      `);
      stmt.run(admin_response, status, is_public, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update suggestion" });
    }
  });

  // Admin: Change password
  app.post("/api/admin/change-password", (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, currentPassword);
      if (!user) {
        return res.status(401).json({ error: "Invalid current password" });
      }
      db.prepare("UPDATE users SET password = ? WHERE username = ?").run(newPassword, username);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Comments
  app.get("/api/suggestions/:id/comments", (req, res) => {
    const comments = db.prepare(`
      SELECT * FROM comments WHERE suggestion_id = ? ORDER BY created_at ASC
    `).all(req.params.id);
    res.json(comments);
  });

  app.post("/api/suggestions/:id/comments", (req, res) => {
    const { comment_text, author_role } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO comments (suggestion_id, comment_text, author_role)
        VALUES (?, ?, ?)
      `);
      stmt.run(req.params.id, comment_text, author_role);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
