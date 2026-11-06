'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface TelemetryData {
  driver_id: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  total_pit_stops: number;
  avg_pit_duration: number | null;
}

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/telemetry?raceId=1001')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTelemetry(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold mb-2">Monaco GP Live Telemetry Analytics</h1>
        <p className="text-slate-400 mb-8">Calculated via MongoDB Aggregation Pipeline</p>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading telemetry data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {telemetry.map((driver) => (
              <div key={driver.driver_id} className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-200">Driver #{driver.driver_id}</h2>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                    Monaco GP
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Speed:</span>
                    <span className="font-semibold text-white">{driver.avg_speed_kmh} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Top Speed:</span>
                    <span className="font-semibold text-emerald-400">{driver.max_speed_kmh} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pit Stops Executed:</span>
                    <span className="font-semibold text-white">{driver.total_pit_stops}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Pit Stop Duration:</span>
                    <span className="font-semibold text-yellow-400">
                      {driver.avg_pit_duration ? `${driver.avg_pit_duration}s` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}