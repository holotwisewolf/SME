import React from 'react';
import {
  Database,
  Star,
  Tags,
  Share2,
  GitMerge,
  Users,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#696969] text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* --- Hero Section --- */}
        <section className="text-center space-y-6 pt-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#FFD1D1]/50 bg-[#FFD1D1]/10 text-[#FFD1D1] text-sm font-bold tracking-widest mb-4 uppercase">
            About
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-lg">
            Spotify Music Explorer
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium">
            A robust discovery platform designed to bridge the gap between music streaming and community interaction.
            Featuring advanced <span className="text-[#FFD1D1] font-bold">tagging</span>, <span className="text-[#FFD1D1] font-bold">global ratings</span>, and a custom <span className="text-[#FFD1D1] font-bold">graph-based recommendation engine</span>.
          </p>
        </section>

        {/* --- Features Section (Project Goals) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard
            icon={<Star className="w-8 h-8 text-[#FFD1D1]" />}
            title="Granular Ratings"
            desc="Moving beyond the simple 'Like' button. Rate Tracks, Albums, and Playlists on a 1-5 scale to create a nuanced personal library."
          />
          <InfoCard
            icon={<Tags className="w-8 h-8 text-[#FFD1D1]" />}
            title="Deep Organization"
            desc="The ultimate tagging system. Categorize music by Mood, Vibe, or Custom Tags, allowing for powerful filtering and search."
          />
          <InfoCard
            icon={<GitMerge className="w-8 h-8 text-[#FFD1D1]" />}
            title="Graph Discovery"
            desc="Our 'For You' page uses a graph traversal algorithm, connecting nodes (artists, genres, tags) to find similar content based on user preferences."
          />
        </div>

        {/* --- Technical Architecture Section --- */}
        <section className="bg-black/20 rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden backdrop-blur-sm">
          {/* Decorative Background Element (Pink Glow) */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD1D1]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white">
            <Database className="text-[#FFD1D1]" /> System Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#FFD1D1]">Core Stack</h3>
              <ul className="space-y-4">
                <TechItem label="Frontend" value="React + TypeScript + Vite" />
                <TechItem label="Styling" value="Tailwind CSS" />
                <TechItem label="Backend" value="Supabase (PostgreSQL)" />
                <TechItem label="Data Source" value="Spotify Web API" />
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-[#FFD1D1]">Advanced Implementation</h3>
              <ul className="space-y-4">
                <FeatureItem icon={<Zap size={18} />} text="Real-time updates via Supabase Subscriptions" />
                <FeatureItem icon={<ShieldCheck size={18} />} text="Secure Auth & Row Level Security (RLS)" />
                <FeatureItem icon={<Share2 size={18} />} text="Edge Functions for Playlist Export & OAuth" />
                <FeatureItem icon={<Users size={18} />} text="Community-driven Trending Algorithms" />
              </ul>
            </div>
          </div>
        </section>

        {/* --- Development Stats --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <StatBox value="6" label="Weeks Development" />
          <StatBox value="5" label="Team Members" />
          <StatBox value="v1.0" label="Current Version" />
        </section>

        {/* --- Information Section (Data & Access Notices) --- */}
        <section className="pt-10 border-t border-white/10">
          <div className="flex items-center gap-2 mb-6 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={14} /> Data & Access Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Login Restriction Info */}
            <div className="bg-black/10 border border-white/5 p-5 rounded-xl flex items-start gap-4 transition-colors hover:bg-black/20">
              <div className="p-2.5 bg-white/5 rounded-lg shrink-0 border border-white/5">
                <AlertTriangle className="w-5 h-5 text-[#FFD1D1]" />
              </div>
              <div>
                <h4 className="text-md font-bold text-white/90 mb-1">Spotify Login Restricted</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Currently in <span className="text-[#FFD1D1]">Developer Mode</span>. Only authorized developer accounts can log in via Spotify. Please use <strong>Email Sign Up</strong> to access the platform.
                </p>
              </div>
            </div>

            {/* Retention Policy Info */}
            <div className="bg-black/10 border border-white/5 p-5 rounded-xl flex items-start gap-4 transition-colors hover:bg-black/20">
              <div className="p-2.5 bg-white/5 rounded-lg shrink-0 border border-white/5">
                <Clock className="w-5 h-5 text-[#FFD1D1]" />
              </div>
              <div>
                <h4 className="text-md font-bold text-white/90 mb-1">Data Retention Policy</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  To maintain server performance, inactive accounts are automatically deleted after <span className="text-[#FFD1D1] font-bold">60 days</span>. All personal ratings and tags will be wiped.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="border-t border-white/20 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Music Explorer Team. Built for the Web.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span>Powered by</span>
            <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" className="h-6 opacity-80" />
            <span className="mx-2">|</span>
            <span className="flex items-center gap-1"><Database size={14} /> Supabase</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

// --- Sub-components ---

function InfoCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-black/20 p-8 rounded-2xl border border-white/10 hover:bg-black/30 transition-all duration-300 hover:border-[#FFD1D1]/50 hover:-translate-y-1 group backdrop-blur-sm">
      <div className="mb-6 bg-white/10 w-fit p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-white/80 leading-relaxed text-lg font-medium">
        {desc}
      </p>
    </div>
  );
}

function TechItem({ label, value }: { label: string, value: string }) {
  return (
    <li className="flex justify-between items-center border-b border-white/10 pb-2">
      <span className="text-white/70 font-medium">{label}</span>
      <span className="text-white font-mono text-sm bg-black/30 px-2 py-1 rounded border border-white/5">{value}</span>
    </li>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <li className="flex items-start gap-3 text-white/90 font-medium">
      <span className="mt-1 text-[#FFD1D1]">{icon}</span>
      <span>{text}</span>
    </li>
  );
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="bg-black/20 p-6 rounded-xl border border-white/10 backdrop-blur-sm hover:border-[#FFD1D1]/30 transition-colors">
      <div className="text-4xl font-bold text-[#FFD1D1] mb-2 drop-shadow-md">{value}</div>
      <div className="text-white/70 text-sm font-bold uppercase tracking-wider">{label}</div>
    </div>
  );
}