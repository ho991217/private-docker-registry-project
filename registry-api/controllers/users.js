import express from 'express';
import { checkAuth } from '../middlewares/auth.js';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { parseHtpasswd } from '../utils/htpasswd.js';
import { HTPASSWD_PATH } from '../lib/constants.js';
import { addAudit } from './audit.js';

const router = express.Router();

router.get('/', checkAuth, (req, res) => {
  const users = Object.keys(parseHtpasswd(HTPASSWD_PATH));
  addAudit({ user: req.user, action: 'list_users' });
  res.json({ users });
});

router.post('/', checkAuth, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
  }

  const users = parseHtpasswd(HTPASSWD_PATH);
  if (users[username]) {
      return res.status(409).json({ error: 'user already exists' });
  }

  try {
      const hash = await bcrypt.hash(password, 10);
    let fileText = fs.readFileSync(HTPASSWD_PATH, 'utf-8').trimEnd();
    
      if (fileText.length > 0) fileText += '\n';
      fileText += `${username}:${hash}\n`;
      fs.writeFileSync(HTPASSWD_PATH, fileText, 'utf-8');
      addAudit({ user: req.user, action: 'add_user', username });
      res.json({ success: true });
  } catch (err) {
      addAudit({ user: req.user, action: 'add_user', username, error: err.message });
      res.status(500).json({ error: 'failed to add user', details: err.message });
  }
});

router.delete('/:username', checkAuth, (req, res) => {
  const delUser = req.params.username;
  let lines = fs.readFileSync(HTPASSWD_PATH, 'utf-8').split('\n');
  const before = lines.length;

  lines = lines.filter(line => !line.startsWith(`${delUser}:`));
  if (lines.length === before) {
      return res.status(404).json({ error: 'user not found' });
  }

  const newText = lines.filter(l => l.trim() !== '').join('\n') + '\n';
  fs.writeFileSync(HTPASSWD_PATH, newText, 'utf-8');
  addAudit({ user: req.user, action: 'delete_user', username: delUser });
  res.json({ success: true });
});

export default router;