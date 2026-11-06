'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface Standing {
  Team_ID: number;
  Team_Name: string;
  Team_Principal: string;
  Total_Constructor_Points: string;
  Races_Participated: number;
}

export default function HomePage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/standings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStandings(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2">Constructor Championship Standings</h1>
        <p className="text-slate-400 mb-8">Aggregated live from MySQL Database View</p>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading standings...</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-300 text-sm font-semibold border-b border-slate-800">
                  <th className="p-4">Pos</th>
                  <th className="p-4">Team</th>
                  <th className="p-4">Team Principal</th>
                  <th className="p-4 text-center">Races</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {standings.map((item, index) => (
                  <tr key={item.Team_ID} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-red-500">{index + 1}</td>
                    <td className="p-4 font-semibold text-white">{item.Team_Name}</td>
                    <td className="p-4 text-slate-400">{item.Team_Principal}</td>
                    <td className="p-4 text-center text-slate-300">{item.Races_Participated}</td>
                    <td className="p-4 text-right font-bold text-emerald-400">
                      {parseFloat(item.Total_Constructor_Points).toFixed(0)} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}