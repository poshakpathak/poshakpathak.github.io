// Saves visitor counts by country (and by US state) from GoatCounter to
// visitors.json, which the site's Visitor map app reads. Needs a GoatCounter
// API token with "Read statistics" permission in the GOATCOUNTER_TOKEN secret.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const site = process.env.GOATCOUNTER_SITE || 'poshakpathak';
const token = process.env.GOATCOUNTER_TOKEN;
const out = 'visitors.json';
if (!token) {
  console.log('No GOATCOUNTER_TOKEN secret yet, skipping');
  process.exit(0);
}

const range = `start=2024-01-01T00:00:00Z&end=${new Date().toISOString().slice(0, 19)}Z`;
const get = async path => {
  const res = await fetch(`https://${site}.goatcounter.com/api/v0${path}`, {
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  });
  if (!res.ok) throw new Error(`GoatCounter ${path} returned ${res.status}: ${await res.text()}`);
  return res.json();
};
const all = async path => {
  const rows = [];
  for (let offset = 0; ; offset += 100) {
    const r = await get(`${path}?${range}&limit=100&offset=${offset}`);
    rows.push(...(r.stats || []));
    if (!r.more) return rows;
  }
};

const countries = (await all('/stats/locations'))
  .filter(s => /^[A-Z]{2}$/.test(s.id || '') && s.count > 0)
  .map(s => [s.id, s.name, s.count])
  .sort((a, b) => b[2] - a[2]);
const us = countries.some(c => c[0] === 'US')
  ? (await all('/stats/locations/US')).filter(s => s.name && s.count > 0 && !/unknown/i.test(s.name)).map(s => [s.name, s.count])
  : [];
const total = countries.reduce((s, c) => s + c[2], 0);

const old = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null;
if (old && JSON.stringify([old.countries, old.us]) === JSON.stringify([countries, us])) {
  console.log(`No change (${total} visits)`);
} else {
  writeFileSync(out, JSON.stringify({ updated: new Date().toISOString(), total, countries, us }, null, 1) + '\n');
  console.log(`Saved ${total} visits from ${countries.length} countries`);
}
