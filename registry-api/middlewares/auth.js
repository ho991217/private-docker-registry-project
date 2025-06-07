import basicAuth from 'basic-auth';
import bcrypt from 'bcryptjs';
import { parseHtpasswd } from '../utils/htpasswd.js';
import { HTPASSWD_PATH } from '../lib/constants.js';

function checkAuth(req, res, next) {
  const user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
      res.set('WWW-Authenticate', 'Basic realm="Registry Realm"');
      return res.status(401).send('Authentication required');
  }
  const users = parseHtpasswd(HTPASSWD_PATH);
  const hash = users[user.name];
  if (!hash) {
      return res.status(401).send('Invalid user');
  }
  let safeHash = hash.replace(/^\$2y\$/, '$2b$');
  if (!bcrypt.compareSync(user.pass, safeHash)) {
      return res.status(401).send('Invalid password');
  }
  
  req.user = user.name;
  next();
}

export { checkAuth };