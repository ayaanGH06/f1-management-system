'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Driver Form State
  const [driverId, setDriverId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [nationality, setNationality] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Race Result (Trigger Test) Form State
  const [resDriverId, setResDriverId] = useState('105');
  const [resRaceId, setResRaceId] = useState('1003');
  const [finishingPos, setFinishingPos] = useState('1');
  const [points, setPoints] = useState('25');
  const [resultStatus, setResultStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthenticated(true);
    } else {
      setLoginError(data.message || 'Authentication failed');
    }
  };

  // Handle Add Driver (SQL INSERT)
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    const res = await fetch('/api/admin/driver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: Number(driverId),
        driverName,
        nationality,
        dateOfBirth,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setFormStatus({ type: 'success', msg: data.message });
      setDriverId('');
      setDriverName('');
      setNationality('');
      setDateOfBirth('');
    } else {
      setFormStatus({ type: 'error', msg: data.error });
    }
  };

  // Handle Log Result (Tests MySQL Trigger Validation)
  const handleLogResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultStatus(null);
    const res = await fetch('/api/admin/race-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: Number(resDriverId),
        raceId: Number(resRaceId),
        finishingPosition: Number(finishingPos),
        points: Number(points),
        raceStatus: 'Finished',
        fastestLap: '01:21.456',
        carUsed: 10,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setResultStatus({ type: 'success', msg: data.message });
    } else {
      setResultStatus({ type: 'error', msg: `Database Trigger Violation: ${data.error}` });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2">Race Control Admin Portal</h1>
        <p className="text-slate-400 mb-8">Role-Based Access Control & Database Management</p>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Admin Authentication</h2>
            {loginError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors"
              >
                Login as Race Control Admin
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div>
                <span className="text-sm text-slate-400">Authenticated Session: </span>
                <span className="font-bold text-emerald-400">Race Director (Admin Role)</span>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded"
              >
                Logout
              </button>
            </div>

            {/* FORM 1: ADD DRIVER */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-white">Add New Driver (MySQL INSERT)</h2>
              
              {formStatus && (
                <div
                  className={`mb-4 p-3 rounded-md text-sm border ${
                    formStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {formStatus.msg}
                </div>
              )}

              <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver ID</label>
                  <input
                    type="number"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    placeholder="106"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Liam Lawson"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="New Zealander"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded transition-colors"
                  >
                    Execute INSERT Operation
                  </button>
                </div>
              </form>
            </div>

            {/* FORM 2: LOG RACE RESULT & TRIGGER TEST */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-1 text-white">Log Race Result (Trigger Validation Test)</h2>
              <p className="text-xs text-slate-400 mb-4">
                Test entering negative points to demonstrate MySQL <code className="text-red-400">trg_ValidateRacePoints</code> trigger enforcement.
              </p>

              {resultStatus && (
                <div
                  className={`mb-4 p-3 rounded-md text-sm border ${
                    resultStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {resultStatus.msg}
                </div>
              )}

              <form onSubmit={handleLogResult} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver ID</label>
                  <input
                    type="number"
                    value={resDriverId}
                    onChange={(e) => setResDriverId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Race ID</label>
                  <input
                    type="number"
                    value={resRaceId}
                    onChange={(e) => setResRaceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Finishing Position</label>
                  <input
                    type="number"
                    value={finishingPos}
                    onChange={(e) => setFinishingPos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Points Earned</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="-10 to test trigger rejection"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition-colors"
                  >
                    Log Result / Test Trigger
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
