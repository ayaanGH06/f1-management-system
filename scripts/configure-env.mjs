// Keep existing credentials local. Never print environment values.
import fs from 'node:fs';
import crypto from 'node:crypto';
const path = '.env.local';
let text = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
const values = new Map();
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) values.set(m[1], m[2]);
}
const settings = [
  ['MYSQL_HOST', 'SQL_HOST', '127.0.0.1'],
  ['MYSQL_USER', 'SQL_USER', 'root'],
  ['MYSQL_PASSWORD', 'SQL_PASSWORD', ''],
  ['MYSQL_DB', null, 'Formula_Racing_DB'],
  ['MONGO_URI', 'MONGODB_URI', 'mongodb://127.0.0.1:27017'],
  ['MONGO_DB', null, 'f1_telemetry'],
  ['JWT_SECRET', null, crypto.randomBytes(32).toString('hex')],
];
let added = [];
for (const [key, previous, fallback] of settings) {
  if (values.has(key)) continue;
  const value = previous && values.has(previous) ? values.get(previous) : fallback;
  text += `\n${key}=${value}`;
  added.push(key);
}
if (added.length) {
  fs.writeFileSync(path, text.trimEnd() + '\n', { mode: 0o600 });
  fs.chmodSync(path, 0o600);
}
console.log(added.length ? `Configured ${added.join(', ')} in .env.local. Existing values were kept. No values printed.` : '.env.local already has all required keys. No changes.');
console.log('If your local MySQL password differs, edit MYSQL_PASSWORD in .env.local yourself. Do not paste it into chat. Restart the app after changing settings.');
