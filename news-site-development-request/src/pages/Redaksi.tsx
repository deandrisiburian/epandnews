import { Mail, Globe, Instagram, Twitter, Linkedin, Award, Users, FileText, Shield, Phone } from 'lucide-react';

const team = [
  {
    name: 'Epand Mahardhika',
    role: 'Pemimpin Redaksi',
    bio: 'Jurnalis berpengalaman 15 tahun di bidang berita digital dan media online Indonesia. Lulusan Universitas Indonesia jurusan Ilmu Komunikasi.',
    avatar: 'https://ui-avatars.com/api/?name=Epand+Mahardhika&background=007AFF&color=fff&size=200',
    email: 'epand@epandnews.id',
    badge: '⭐ Founder',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Siti Rahayu',
    role: 'Redaktur Politik & Hukum',
    bio: 'Spesialis liputan parlemen dan kebijakan pemerintah selama 10 tahun. Aktif meliput sidang DPR dan kebijakan nasional.',
    avatar: 'https://ui-avatars.com/api/?name=Siti+Rahayu&background=0284C7&color=fff&size=200',
    email: 'siti@epandnews.id',
    badge: '🏛️ Politik',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Budi Santoso',
    role: 'Redaktur Ekonomi & Bisnis',
    bio: 'Analis ekonomi dan pasar modal yang telah meliput bursa saham Indonesia selama 8 tahun. Kontributor Bloomberg Indonesia.',
    avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=059669&color=fff&size=200',
    email: 'budi@epandnews.id',
    badge: '📈 Ekonomi',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Dewi Lestari',
    role: 'Redaktur Teknologi',
    bio: 'Tech journalist yang mengkhususkan diri pada AI, startup, dan inovasi digital Indonesia. Pembicara reguler di konferensi teknologi.',
    avatar: 'https://ui-avatars.com/api/?name=Dewi+Lestari&background=7C3AED&color=fff&size=200',
    email: 'dewi@epandnews.id',
    badge: '💻 Teknologi',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Reporter Investigatif',
    bio: 'Reporter investigatif yang berfokus pada isu sosial, korupsi, dan lingkungan. Pemenang Anugerah Jurnalistik AJI 2023.',
    avatar: 'https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=D97706&color=fff&size=200',
    email: 'ahmad@epandnews.id',
    badge: '🔍 Investigasi',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Indah Sulistyo',
    role: 'Reporter Kesehatan & Sains',
    bio: 'Jurnalis sains dengan latar belakang biologi molekuler dari Universitas Indonesia. Aktif meliput dunia medis dan penelitian ilmiah.',
    avatar: 'https://ui-avatars.com/api/?name=Indah+Sulistyo&background=DB2777&color=fff&size=200',
    email: 'indah@epandnews.id',
    badge: '🏥 Kesehatan',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Reza Pratama',
    role: 'Reporter Olahraga',
    bio: 'Mantan atlet nasional yang kini menjadi jurnalis olahraga. Meliput Piala Dunia, Olimpiade, dan kompetisi domestik Indonesia.',
    avatar: 'https://ui-avatars.com/api/?name=Reza+Pratama&background=DC2626&color=fff&size=200',
    email: 'reza@epandnews.id',
    badge: '⚽ Olahraga',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    name: 'Maya Pertiwi',
    role: 'Editor Foto & Multimedia',
    bio: 'Fotografer dokumenter dan editor foto berpengalaman. Karyanya telah dipublikasikan di Reuters, AP, dan media internasional.',
    avatar: 'https://ui-avatars.com/api/?name=Maya+Pertiwi&background=0891B2&color=fff&size=200',
    email: 'maya@epandnews.id',
    badge: '📸 Foto',
    social: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
];

const values = [
  { icon: <Shield size={20} className="text-green-500" />, title: 'Integritas', desc: 'Kami menjunjung tinggi kejujuran dan etika dalam setiap liputan.' },
  { icon: <Award size={20} className="text-yellow-500" />, title: 'Profesionalisme', desc: 'Standar jurnalistik tertinggi dalam setiap karya yang kami publikasikan.' },
  { icon: <Users size={20} className="text-blue-500" />, title: 'Keberagaman', desc: 'Tim yang beragam mencerminkan masyarakat Indonesia yang majemuk.' },
  { icon: <FileText size={20} className="text-purple-500" />, title: 'Akuntabilitas', desc: 'Kami bertanggung jawab atas setiap informasi yang kami sebarkan.' },
];

export default function Redaksi() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6 border border-white/20">
            <Users size={14} />
            Tim Profesional
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Redaksi EpanDNews</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Tim jurnalis, editor, dan fotografer berpengalaman yang berdedikasi 
            menghadirkan berita berkualitas tinggi untuk Anda.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {values.map((v, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className="flex justify-center mb-3">{v.icon}</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{v.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Team Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Kenali Tim Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-md group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-2 -right-2 text-xs bg-white dark:bg-slate-800 rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 dark:border-slate-700">
                      {member.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-4 text-sm leading-tight">{member.name}</h3>
                  <p className="text-xs text-apple-blue font-medium mt-0.5">{member.role}</p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center mb-4">
                  {member.bio}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-apple-blue transition-colors"
                  >
                    <Mail size={11} />
                    <span className="truncate">{member.email}</span>
                  </a>
                  <div className="flex justify-center gap-3 pt-1">
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors text-slate-500">
                      <Twitter size={11} />
                    </a>
                    <a href={member.social.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-100 hover:text-pink-500 dark:hover:bg-pink-950 dark:hover:text-pink-400 transition-colors text-slate-500">
                      <Instagram size={11} />
                    </a>
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors text-slate-500">
                      <Linkedin size={11} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Hubungi Redaksi</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
            Punya informasi, klarifikasi, atau ingin berkontribusi? Kami siap mendengar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Mail size={20} className="text-apple-blue" />,
                label: 'Email Redaksi',
                value: 'redaksi@epandnews.id',
                href: 'mailto:redaksi@epandnews.id',
              },
              {
                icon: <Phone size={20} className="text-green-500" />,
                label: 'Telepon',
                value: '+62 21 1234-5678',
                href: 'tel:+622112345678',
              },
              {
                icon: <Globe size={20} className="text-purple-500" />,
                label: 'Website',
                value: 'www.epandnews.id',
                href: 'https://epandnews.id',
              },
            ].map((c, i) => (
              <a
                key={i}
                href={c.href}
                className="flex flex-col items-center gap-2 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-apple-blue border border-transparent transition-all text-center"
              >
                {c.icon}
                <span className="text-xs text-slate-500 dark:text-slate-400">{c.label}</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.value}</span>
              </a>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center leading-relaxed">
              <strong>Pengaduan & Hak Jawab:</strong> Silakan kirim surat resmi ke{' '}
              <a href="mailto:hak.jawab@epandnews.id" className="underline font-medium">hak.jawab@epandnews.id</a>.
              {' '}Kami berkomitmen merespons dalam 3×24 jam sesuai kode etik jurnalistik PWI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
