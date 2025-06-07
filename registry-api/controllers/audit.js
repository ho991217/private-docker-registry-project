import express from 'express';
import { checkAuth } from '../middlewares/auth.js';
import fs from 'node:fs';
import path from 'node:path';

const router = express.Router();
const AUDIT_FILE = process.env.AUDIT_FILE || './data/audit.log';

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function addAudit(log) {
  ensureDirExists(AUDIT_FILE);
  const line = `[${new Date().toISOString()}] ${JSON.stringify(log)}\n`;
  fs.appendFileSync(AUDIT_FILE, line, 'utf-8');
}

router.get('/', checkAuth, (req, res) => {
  try {
    const { user, image } = req.query;
    const logs = fs.existsSync(AUDIT_FILE)
      ? fs.readFileSync(AUDIT_FILE, 'utf-8').split('\n').filter(Boolean).map(l => JSON.parse(l.split('] ')[1]))
      : [];
    let filtered = logs;
    if (user) filtered = filtered.filter(l => l.user === user);
    if (image) filtered = filtered.filter(l => l.image === image);
    res.json({ logs: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get logs', details: err.message });
  }
});

export { addAudit };
export default router;
