'use client';
import { useEffect, useState } from 'react';
const call = async (u, o) => {
  try { const r = await fetch(u, o); const d = await r.json().catch(() => ({ error: 'Server error. Check the terminal and database setup.' })); return { ok: r.ok, d }; }
  catch { return { ok: false, d: { error: 'Cannot reach the server. Check that it is running.' } }; }
};
const send = (u, method, b) => call(u, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const fmt = (ms) => `${Math.floor(ms / 60000)}:${((ms % 60000) / 1000).toFixed(3).padStart(6, '0')}`;
const EMPTY = { driver: '', car: '', pos: '', status: 'Finished', lap: '' };

export default function Home() {
  const [role, setRole] = useState(null), [tab, setTab] = useState('standings'), [msg, setMsg] = useState(null);
  const [meta, setMeta] = useState({ drivers: [], cars: [], races: [] });
  const [st, setSt] = useState({ drivers: [], teams: [] }), [res, setRes] = useState([]), [laps, setLaps] = useState([]), [dr, setDr] = useState([]);
  const [cred, setCred] = useState({ username: '', password: '' }), [race, setRace] = useState(1), [q, setQ] = useState('');
  const [form, setForm] = useState(EMPTY), [editing, setEditing] = useState(false);
  const note = (text, ok) => setMsg({ text, ok });
  const nameOf = (id) => meta.drivers.find(d => d.Driver_ID === id)?.Driver_Name || `Driver ${id}`;

  const loadStandings = async () => { const x = await call('/api/standings'); if (x.ok) setSt(x.d); else note(x.d.error); };
  const loadResults = async (r = race) => { const x = await call('/api/results?race_id=' + r); setRes(Array.isArray(x.d) ? x.d : []); };
  const login = async () => {
    const x = await send('/api/login', 'POST', cred);
    if (!x.ok) return note(x.d.error);
    setRole(x.d.role); setMsg(null);
    const m = await call('/api/meta');
    if (m.ok) { setMeta(m.d); setRace(m.d.races[0]?.Race_ID || 1); setTab('standings'); setLaps([]); loadResults(m.d.races[0]?.Race_ID || 1); }
    else note(m.d.error);
    loadStandings();
  };
  const logout = async () => { await send('/api/logout', 'POST', {}); setRole(null); };
  const pickRace = (r) => { setRace(r); loadResults(r); setForm(EMPTY); setEditing(false); setLaps([]); };
  const save = async () => {
    const x = await send('/api/results', editing ? 'PUT' : 'POST', { ...form, race });
    if (x.ok) { note(editing ? 'Result updated' : 'Result recorded', true); setForm(EMPTY); setEditing(false); loadResults(); loadStandings(); }
    else note(x.d.error);
  };
  const del = async (r) => {
    if (!confirm('Delete this result?')) return;
    const x = await call(`/api/results?driver=${r.Driver_ID}&race=${race}`, { method: 'DELETE' });
    x.ok ? (note('Result deleted', true), loadResults(), loadStandings()) : note(x.d.error);
  };
  const edit = (r) => { setEditing(true); setForm({ driver: r.Driver_ID, car: r.Car_Used, pos: r.Finishing_Position || '', status: r.Race_Status, lap: r.Fastest_Lap || '' }); };
  const search = async () => { const x = await call('/api/drivers?q=' + encodeURIComponent(q)); if (x.ok) setDr(x.d); else note(x.d.error); };
  const loadLaps = async () => { const x = await call('/api/laps?race_id=' + race); if (x.ok) setLaps(x.d); else note(x.d.error); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    let active = true;
    call('/api/meta').then(x => {
      if (!active || !x.ok) return;
      setMeta(x.d); setRole(x.d.role);
      const first = x.d.races[0]?.Race_ID || 1; setRace(first);
      loadStandings(); loadResults(first);
    });
    return () => { active = false; };
  }, []);

  if (!role) return (
    <div className="login">
      <div className="logo" style={{ fontSize: 30, marginBottom: 16 }}>F1 <b>RACING</b> DB</div>
      <div className="card">
        <input placeholder="Username" onChange={e => setCred({ ...cred, username: e.target.value })} />
        <input type="password" placeholder="Password" onChange={e => setCred({ ...cred, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && login()} />
        <button className="b" onClick={login}>Sign in</button>
        {msg && <div className="msg">{msg.text}</div>}
        <div className="hint">Demo: admin / admin123 &middot; viewer / viewer123</div>
      </div>
    </div>);

  const leader = st.drivers[0], topTeam = st.teams[0];
  const T = ({ id, children }) => <button className={'tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{children}</button>;
  return (<>
    <div className="top"><div className="logo">F1 <b>RACING</b> DB</div>
      <div className="row"><span className={'badge ' + role}>{role}</span><button className="g" onClick={logout}>Logout</button></div></div>
    <div className="wrap">
      <div className="tabs"><T id="standings">Standings</T><T id="results">Race Results</T><T id="telemetry">Lap Telemetry</T><T id="drivers">Drivers</T></div>
      {msg && <div className={'msg' + (msg.ok ? ' ok' : '')}>{msg.text}</div>}

      {tab === 'standings' && <>
        <div className="stats">
          <div className="stat"><small>Championship leader</small><div>{leader?.Driver_Name || '-'}</div></div>
          <div className="stat"><small>Leader points</small><div>{leader?.Total_Points ?? '-'}</div></div>
          <div className="stat"><small>Top constructor</small><div>{topTeam?.Team_Name || '-'}</div></div>
        </div>
        <div className="card"><h3>Drivers' Championship</h3><table><thead><tr><th>#</th><th>Driver</th><th>Wins</th><th>Races</th><th>Points</th></tr></thead>
          <tbody>{st.drivers.map((d, i) => <tr key={i}><td className="pos">{i + 1}</td><td>{d.Driver_Name}</td><td>{d.Wins}</td><td>{d.Races}</td><td><b>{d.Total_Points}</b></td></tr>)}</tbody></table></div>
        <div className="card"><h3>Constructors' Championship</h3><table><thead><tr><th>#</th><th>Team</th><th>Points</th></tr></thead>
          <tbody>{st.teams.map((t, i) => <tr key={i}><td className="pos">{i + 1}</td><td>{t.Team_Name}</td><td><b>{t.Points}</b></td></tr>)}</tbody></table></div></>}

      {tab === 'results' && <>
        <div className="card"><div className="row"><h3 style={{ margin: 0 }}>Race</h3>
          <select value={race} onChange={e => pickRace(e.target.value)}>{meta.races.map(r => <option key={r.Race_ID} value={r.Race_ID}>{r.Race_Name} {r.Year}</option>)}</select></div></div>
        <div className="card"><table><thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Status</th><th>Fastest lap</th><th>Pts</th>{role === 'admin' && <th></th>}</tr></thead>
          <tbody>{res.map(r => <tr key={r.Driver_ID}><td className="pos">{r.Finishing_Position || '-'}</td><td>{r.Driver_Name}</td><td>{r.Team_Name}</td>
            <td><span className={'badge ' + r.Race_Status}>{r.Race_Status}</span></td><td>{r.Fastest_Lap || '-'}</td><td><b>{r.Points}</b></td>
            {role === 'admin' && <td><button className="g" onClick={() => edit(r)}>Edit</button><button className="g" onClick={() => del(r)}>Delete</button></td>}</tr>)}</tbody></table>
          {!res.length && <div className="hint">No results recorded for this race yet.</div>}</div>
        {role === 'admin' && <div className="card"><h3>{editing ? 'Edit result' : 'Record result'}</h3><div className="row">
          <select value={form.driver} onChange={set('driver')} disabled={editing}><option value="">Driver</option>{meta.drivers.map(d => <option key={d.Driver_ID} value={d.Driver_ID}>{d.Driver_Name}</option>)}</select>
          <select value={form.car} onChange={set('car')} disabled={editing}><option value="">Car</option>{meta.cars.map(c => <option key={c.Car_ID} value={c.Car_ID}>{c.Team_Name} - {c.Car_Model}</option>)}</select>
          <input type="number" placeholder="Position" style={{ width: 100 }} value={form.pos} onChange={set('pos')} />
          <select value={form.status} onChange={set('status')}><option>Finished</option><option>DNF</option><option>DSQ</option></select>
          <input placeholder="Lap hh:mm:ss.sss" value={form.lap} onChange={set('lap')} />
          <button className="b" onClick={save}>{editing ? 'Update' : 'Save'}</button>
          {editing && <button className="g" onClick={() => { setEditing(false); setForm(EMPTY); }}>Cancel</button>}</div>
          <div className="hint" style={{ marginTop: 8 }}>Points are computed by a DB trigger. Wrong driver/car pairs are rejected by a stored procedure and rolled back.</div></div>}</>}

      {tab === 'telemetry' && <div className="card"><div className="row"><h3 style={{ margin: 0 }}>Lap statistics (MongoDB aggregation)</h3>
        <select value={race} onChange={e => pickRace(e.target.value)}>{meta.races.map(r => <option key={r.Race_ID} value={r.Race_ID}>{r.Race_Name}</option>)}</select>
        <button className="b" onClick={loadLaps}>Load</button></div>
        <table style={{ marginTop: 12 }}><thead><tr><th>Driver</th><th>Best lap</th><th>Average</th><th>Laps</th><th style={{ width: '25%' }}></th></tr></thead>
          <tbody>{laps.map((l, i) => <tr key={i}><td>{nameOf(l.driver_id)}</td><td><b>{fmt(l.best_ms)}</b></td><td>{fmt(l.avg_ms)}</td><td>{l.laps}</td>
            <td><div className="bar" style={{ width: (Math.max(5, Math.min(100, 100 - (l.avg_ms - laps[0].best_ms) / 20))) + '%' }} /></td></tr>)}</tbody></table></div>}

      {tab === 'drivers' && <div className="card"><div className="row"><h3 style={{ margin: 0 }}>Driver search (full-text)</h3>
        <input placeholder="e.g. lew" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} /><button className="b" onClick={search}>Search</button></div>
        <table style={{ marginTop: 12 }}><thead><tr><th>Name</th><th>Nationality</th><th>Born</th></tr></thead>
          <tbody>{(Array.isArray(dr) ? dr : []).map(d => <tr key={d.Driver_ID}><td>{d.Driver_Name}</td><td>{d.Nationality}</td><td>{String(d.Date_Of_Birth).slice(0, 10)}</td></tr>)}</tbody></table></div>}
    </div></>);
                                                    }
