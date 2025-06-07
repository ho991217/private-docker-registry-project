import path from 'node:path';
import fs from 'node:fs';

function parseHtpasswd(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  const lines = fs.readFileSync(absPath, 'utf-8').split('\n');
  const users = {};

  lines.forEach(line => {
      if (!line.trim() || line.startsWith('#')) return;
      const [user, hash] = line.split(':');
      users[user] = hash;
  });
  
  return users;
}

export { parseHtpasswd };