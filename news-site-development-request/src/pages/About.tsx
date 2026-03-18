import { Link } from 'react-router-dom';
import {
  Newspaper, Globe, Shield, Zap, Heart, Code2, Star, ArrowRight,
  CheckCircle2, Target, Eye, Users, Award, TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: <Zap size={22} className="text-yellow-500" />,
    title: 'Berita Real-Time',
    desc: 'Didukung GNews API untuk berita terkini dari Indonesia dan dunia setiap saat.',
  },
  {
    icon: <Shield size={22} className="text-green-500" />,
    title: 'Terverifikasi & Akurat',
    desc: 'Setiap artikel dikurasi dari sumber-sumber jurnalistik terpercaya dan independen.',
  },
  {
    icon: <Globe size={22} className="text-apple-blue" />,
    title: 'Multi-Kategori',
    desc: 'Nasional, teknologi, olahraga, bisnis, dan banyak lagi dalam satu portal lengkap.',
  },
  {
    icon: <Heart size={22} className="text-red-500" />,
    title: 'Desain Modern',
    desc: 'UI terinspirasi Apple dengan dark mode, animasi halus, dan tampilan responsif.',
  },
  {
    icon: <Code2 size={22} className="text-purple-500" />,
    title: 'Database Lokal',
    desc: 'Simpan artikel, bookmark, dan komentar secara persisten di browser dengan IndexedDB.',
  },
  {
    icon: <Star size={22} className="text-orange-500" />,
    title: 'Infinite Scroll',
    desc: 'Terus baca tanpa batas dengan pagination otomatis yang mulus dan hemat data.',
  },
];

const milestones = [
  { year: '2020', event: 'EpanDNews didirikan dengan misi jurnalisme digital terpercaya dan independen' },
  { year: '2021', event: 'Mencapai 100.000 pembaca aktif bulanan dan peluncuran fitur dark mode' },
  { year: '2022', event: 'Peluncuran aplikasi mobile dan integrasi API berita nasional GNews' },
  { year: '2023', event: 'Penghargaan "Best Digital News Platform" dari AMSI (Asosiasi Media Siber Indonesia)' },
  { year: '2024', event: 'Ekspansi ke 34 provinsi dengan jaringan koresponden lokal yang kuat' },
  { year: '2025', event: 'Integrasi AI untuk personalisasi berita, fact-checking otomatis, dan komentar cerdas' },
];

const stats = [
  { icon: <Users size={20} />, value: '2.5 Juta+', label: 'Pembaca Aktif', color: 'text-blue-500' },
  { icon: <Eye size={20} />, value: '50 Juta+', label: 'Halaman Dibaca/Bulan', color: 'text-green-500' },
  { icon: <TrendingUp size={20} />, value: '500+', label: 'Artikel per Hari', color: 'text-orange-500' },
  { icon: <Award size={20} />, value: '15+', label: 'Penghargaan', color: 'text-purple-500' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="w-16 h-16 bg-apple-blue rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Newspaper size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tentang <span className="text-blue-300">EpanDNews</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            Portal berita digital terpercaya Indonesia yang menghadirkan informasi akurat, 
            cepat, dan mendalam dari seluruh penjuru nusantara dan dunia.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Newspaper size={16} />
              Baca Berita
            </Link>
            <Link
              to="/redaksi"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              <Users size={16} />
              Tim Redaksi
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 text-center shadow-sm border border-slate-100 dark:border-slate-800">
              <div className={`${s.color} flex justify-center mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-apple-blue" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Misi & Visi</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3">🎯 Misi</h3>
              <ul className="space-y-2">
                {[
                  'Menyajikan berita akurat, cepat, dan berimbang',
                  'Mendorong literasi media dan jurnalisme yang bertanggung jawab',
                  'Menghubungkan pembaca dengan informasi berkualitas',
                  'Menjaga independensi editorial dari tekanan apapun',
                ].map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-6 border border-blue-100 dark:border-blue-900">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3">🔭 Visi</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                Menjadi portal berita digital Indonesia yang paling terpercaya, inovatif, dan berpengaruh 
                pada tahun 2030, dengan standar jurnalisme yang diakui secara internasional dan pembaca 
                aktif melampaui 10 juta orang di seluruh Asia Tenggara.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Perjalanan Kami</h2>
          <div className="relative">
            <div className="absolute left-[28px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4 animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-14 h-14 rounded-full bg-apple-blue flex items-center justify-center flex-shrink-0 shadow-lg z-10">
                    <span className="text-white text-[10px] font-bold">{m.year}</span>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm mt-2">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial Standards */}
        <div className="mb-16 bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Standar Editorial</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            EpanDNews berkomitmen pada standar jurnalisme tertinggi. Setiap artikel melalui proses 
            verifikasi ketat sebelum dipublikasikan. Kami mengutamakan keakuratan fakta, 
            keberimbangan perspektif, dan independensi editorial.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {['Verifikasi Fakta', 'Berimbang', 'Independen', 'Transparan'].map((s) => (
              <div key={s} className="bg-white/10 rounded-xl p-3 text-center">
                <CheckCircle2 size={18} className="text-green-400 mx-auto mb-1" />
                <span className="text-xs font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Bergabung dengan Komunitas</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Jadilah bagian dari jutaan pembaca yang mempercayai EpanDNews sebagai sumber informasi utama.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-apple-blue text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
          >
            Mulai Membaca
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
