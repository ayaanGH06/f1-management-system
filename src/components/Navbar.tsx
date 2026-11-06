import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-red-600">🏎️ F1</span>
        <span className="text-xl font-bold tracking-wide">Management System</span>
      </div>
      <div className="flex space-x-6 text-sm font-medium">
        <Link href="/" className="hover:text-red-500 transition-colors">Dashboard</Link>
        <Link href="/telemetry" className="hover:text-red-500 transition-colors">Live Telemetry</Link>
        <Link href="/admin" className="hover:text-red-500 transition-colors bg-red-600 px-3 py-1 rounded-md">Admin Portal</Link>
      </div>
    </nav>
  );
}