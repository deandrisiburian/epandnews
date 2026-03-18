import axios from 'axios';
import { Article } from '../db/database';

// ── GNews API Configuration ────────────────────────────────────────────────
const GNEWS_API_KEY = '85bebca5657bd184749731a70e9306d7';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

// CORS proxy options (tried in order)
const CORS_PROXIES = [
  '', // direct first
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export type ApiStatus = 'live' | 'error' | 'loading';

export const CATEGORIES = [
  { id: 'general',       label: 'Utama',      icon: '🏠' },
  { id: 'technology',    label: 'Teknologi',  icon: '💻' },
  { id: 'sports',        label: 'Olahraga',   icon: '⚽' },
  { id: 'business',      label: 'Bisnis',     icon: '📈' },
  { id: 'entertainment', label: 'Hiburan',    icon: '🎬' },
  { id: 'health',        label: 'Kesehatan',  icon: '🏥' },
  { id: 'science',       label: 'Sains',      icon: '🔬' },
  { id: 'nation',        label: 'Nasional',   icon: '🇮🇩' },
  { id: 'world',         label: 'Dunia',      icon: '🌍' },
];

// GNews topic mapping
const GNEWS_TOPIC_MAP: Record<string, string> = {
  general:       'breaking-news',
  technology:    'technology',
  sports:        'sports',
  business:      'business',
  entertainment: 'entertainment',
  health:        'health',
  science:       'science',
  nation:        'nation',
  world:         'world',
};

// Indonesian keyword queries per category for /search endpoint fallback
const CATEGORY_QUERIES: Record<string, string> = {
  general:       'berita indonesia terkini',
  technology:    'teknologi digital indonesia',
  sports:        'olahraga timnas indonesia',
  business:      'ekonomi bisnis indonesia',
  entertainment: 'hiburan film musik indonesia',
  health:        'kesehatan medis indonesia',
  science:       'sains penelitian ilmu',
  nation:        'berita nasional indonesia',
  world:         'berita dunia internasional',
};

// ── Cache layer ────────────────────────────────────────────────────────────
interface CacheEntry {
  data: Article[];
  timestamp: number;
  isLive: boolean;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(type: string, param: string, page: number) {
  return `${type}_${param}_${page}`;
}

function getFromCache(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(url: string): string {
  return btoa(encodeURIComponent(url || Math.random().toString()))
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 32);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mapGNewsArticle(item: any, category: string): Article {
  const title = item.title || 'Tanpa Judul';
  const imgSeed = hashCode(title) % 1000;
  return {
    articleId:   generateId(item.url || title + Math.random()),
    title,
    description: item.description || '',
    content:     item.content || item.description || '',
    url:         item.url || '',
    image:       item.image && item.image.startsWith('http')
                   ? item.image
                   : `https://picsum.photos/seed/${imgSeed}/800/450`,
    publishedAt: item.publishedAt || new Date().toISOString(),
    source:      item.source?.name || item.source || 'Unknown',
    category,
    author:      item.author || item.source?.name || 'Redaksi EpanDNews',
    tags:        [category, 'indonesia', 'terkini'],
    views:       Math.floor(Math.random() * 5000) + 200,
  };
}

// ── GNews fetcher with retry via proxies ──────────────────────────────────
async function fetchGNews(
  endpoint: 'top-headlines' | 'search',
  params: Record<string, any>
): Promise<{ articles: any[]; isLive: boolean }> {
  const baseParams = {
    token: GNEWS_API_KEY,
    lang: 'id',
    country: 'id',
    ...params,
  };

  // Try direct first, then proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    try {
      let response: any;

      if (proxy === '') {
        // Direct request
        response = await axios.get(`${GNEWS_BASE_URL}/${endpoint}`, {
          params: baseParams,
          timeout: 12000,
          headers: { 'Accept': 'application/json' },
        });
      } else {
        // Via CORS proxy
        const targetUrl = `${GNEWS_BASE_URL}/${endpoint}?${new URLSearchParams(
          Object.entries(baseParams).reduce((acc, [k, v]) => {
            acc[k] = String(v);
            return acc;
          }, {} as Record<string, string>)
        ).toString()}`;

        response = await axios.get(proxy + encodeURIComponent(targetUrl), {
          timeout: 15000,
          headers: { 'Accept': 'application/json' },
        });
      }

      const data = response.data;
      const articles = data?.articles || [];

      if (articles.length > 0) {
        console.log(`[GNews] ✅ LIVE data via ${proxy || 'direct'} — ${articles.length} articles`);
        return { articles, isLive: true };
      }

      console.warn(`[GNews] Empty response via ${proxy || 'direct'}`);
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0] || err?.response?.data || err.message;
      console.warn(`[GNews] ⚠️ Failed via ${proxy || 'direct'}:`, msg);
    }
  }

  return { articles: [], isLive: false };
}

// ── Public API ─────────────────────────────────────────────────────────────
export interface FetchResult {
  articles: Article[];
  isLive: boolean;
  totalArticles?: number;
}

export async function fetchNewsByCategory(
  category: string = 'general',
  page: number = 1,
  max: number = 10
): Promise<FetchResult> {
  const cacheKey = getCacheKey('cat', category, page);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`[GNews] 📦 From cache: ${cacheKey}`);
    return { articles: cached.data, isLive: cached.isLive };
  }

  const topic = GNEWS_TOPIC_MAP[category] || 'breaking-news';

  // Strategy 1: top-headlines with topic
  let result = await fetchGNews('top-headlines', { topic, max, page });

  // Strategy 2: search with Indonesian keywords if strategy 1 failed
  if (!result.isLive || result.articles.length === 0) {
    const q = CATEGORY_QUERIES[category] || 'berita indonesia';
    result = await fetchGNews('search', { q, max, page });
  }

  if (result.isLive && result.articles.length > 0) {
    const articles = result.articles.map((item) => mapGNewsArticle(item, category));
    cache.set(cacheKey, { data: articles, timestamp: Date.now(), isLive: true });
    return { articles, isLive: true, totalArticles: result.articles.length };
  }

  // Fallback to mock
  const mockData = getMockArticles(category, page);
  cache.set(cacheKey, { data: mockData, timestamp: Date.now() - CACHE_TTL + 60000, isLive: false });
  return { articles: mockData, isLive: false };
}

export async function searchNews(
  query: string,
  page: number = 1,
  max: number = 10
): Promise<FetchResult> {
  if (!query.trim()) return { articles: [], isLive: false };

  const cacheKey = getCacheKey('search', query, page);
  const cached = getFromCache(cacheKey);
  if (cached) return { articles: cached.data, isLive: cached.isLive };

  const result = await fetchGNews('search', { q: query, max, page });

  if (result.isLive && result.articles.length > 0) {
    const articles = result.articles.map((item) => mapGNewsArticle(item, 'search'));
    cache.set(cacheKey, { data: articles, timestamp: Date.now(), isLive: true });
    return { articles, isLive: true };
  }

  return { articles: getMockSearchResults(query, page), isLive: false };
}

export async function fetchBreakingNews(max: number = 8): Promise<FetchResult> {
  const cacheKey = getCacheKey('breaking', 'all', 1);
  const cached = getFromCache(cacheKey);
  if (cached) return { articles: cached.data, isLive: cached.isLive };

  const result = await fetchGNews('top-headlines', {
    topic: 'breaking-news',
    max,
    page: 1,
  });

  if (result.isLive && result.articles.length > 0) {
    const articles = result.articles.map((item) => mapGNewsArticle(item, 'general'));
    cache.set(cacheKey, { data: articles, timestamp: Date.now(), isLive: true });
    return { articles, isLive: true };
  }

  return { articles: getMockArticles('general', 1).slice(0, max), isLive: false };
}

export function clearCache() {
  cache.clear();
  console.log('[GNews] 🗑️ Cache cleared');
}

// ─── MOCK DATA (Fallback) ─────────────────────────────────────────────────
function getMockSearchResults(query: string, page: number): Article[] {
  const all = [
    ...getMockArticles('general', page),
    ...getMockArticles('technology', page),
    ...getMockArticles('sports', page),
    ...getMockArticles('business', page),
  ];
  const q = query.toLowerCase();
  const filtered = all.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q)
  );
  return filtered.length > 0 ? filtered.slice(0, 10) : all.slice(0, 10);
}

const mockImages = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
  'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
  'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80',
  'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&q=80',
  'https://images.unsplash.com/photo-1516996087931-5ae405802f9f?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&q=80',
  'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80',
];

const mockData: Record<string, { title: string; description: string; source: string; author: string }[]> = {
  general: [
    { title: 'Presiden Tegaskan Komitmen Indonesia dalam Forum G20 2025', description: 'Indonesia berkomitmen mendukung agenda pembangunan berkelanjutan dalam forum G20 tahun ini di bawah kepemimpinan Presiden Prabowo Subianto, menegaskan posisi strategis Indonesia di panggung global.', source: 'Kompas.id', author: 'Ahmad Fauzi' },
    { title: 'APBN 2025 Difokuskan pada Infrastruktur Digital dan Pendidikan', description: 'Pemerintah menetapkan prioritas anggaran pada pembangunan infrastruktur digital dan peningkatan kualitas pendidikan nasional untuk mendorong pertumbuhan ekonomi jangka panjang.', source: 'Tempo', author: 'Siti Rahayu' },
    { title: 'Indonesia Catat Pertumbuhan Ekonomi 5,2% pada Kuartal I 2025', description: 'BPS mengumumkan pertumbuhan ekonomi Indonesia sebesar 5,2% pada kuartal pertama tahun ini, melampaui proyeksi awal analis dan menjadi sinyal positif bagi investor asing.', source: 'CNBC Indonesia', author: 'Budi Santoso' },
    { title: 'Inflasi Nasional Terkendali di Level 2,8% Bulan Ini', description: 'Bank Indonesia melaporkan inflasi nasional berada pada level yang terkendali, didorong oleh stabilitas harga pangan dan energi serta kebijakan moneter yang tepat sasaran.', source: 'Bisnis Indonesia', author: 'Dewi Lestari' },
    { title: 'Pemerintah Luncurkan Program Subsidi Internet Gratis 2025', description: 'Kementerian Komunikasi meluncurkan program subsidi internet gratis bagi masyarakat kurang mampu di seluruh Indonesia, menargetkan 10 juta keluarga penerima manfaat.', source: 'Detik.com', author: 'Eko Prasetyo' },
    { title: 'KPK Tetapkan Tersangka Baru Kasus Korupsi Dana Infrastruktur', description: 'Komisi Pemberantasan Korupsi menetapkan dua tersangka baru terkait kasus penyelewengan dana infrastruktur senilai Rp 500 miliar di beberapa provinsi.', source: 'Republika', author: 'Farida Hanum' },
    { title: 'Harga BBM Non-Subsidi Turun, Pertamina Umumkan Kebijakan Baru', description: 'Pertamina mengumumkan penurunan harga bahan bakar non-subsidi sebagai respons penurunan harga minyak dunia yang memasuki level terendah dalam 18 bulan terakhir.', source: 'Kontan', author: 'Hendra Permana' },
    { title: 'Menkes Canangkan Indonesia Bebas Stunting Tahun 2030', description: 'Menteri Kesehatan menyatakan target Indonesia bebas stunting pada 2030 dengan program gizi nasional yang komprehensif dan anggaran khusus dari APBN yang diperbesar.', source: 'Kemenkes RI', author: 'Indah Sulistyo' },
    { title: 'Banjir Besar Landa Kalimantan, Ribuan Warga Mengungsi', description: 'Banjir besar melanda sejumlah kabupaten di Kalimantan Selatan akibat curah hujan ekstrem, ribuan warga terpaksa mengungsi ke tempat yang lebih aman dan posko darurat.', source: 'BNPB', author: 'Joko Santoso' },
    { title: 'Indonesia Raih Peringkat ke-32 dalam Global Innovation Index 2025', description: 'Indonesia naik 5 peringkat dalam Global Innovation Index 2025, mencerminkan kemajuan ekosistem inovasi dan teknologi yang semakin kompetitif di tingkat global.', source: 'Antara', author: 'Kurnia Dewi' },
  ],
  technology: [
    { title: 'Apple Umumkan iPhone 17 dengan Chip A19 Bionic Revolusioner', description: 'Apple resmi memperkenalkan iPhone 17 yang ditenagai chip A19 Bionic terbaru, menghadirkan peningkatan performa AI hingga 40% lebih cepat dari generasi sebelumnya.', source: 'iBox Indonesia', author: 'Kevin Teknologi' },
    { title: 'Starlink Perluas Jangkauan ke 500 Desa Terpencil Indonesia', description: 'SpaceX melalui Starlink mengumumkan ekspansi layanan internet satelit ke lebih dari 500 desa terpencil di Indonesia, memangkas kesenjangan digital nasional secara signifikan.', source: 'TechInAsia', author: 'Lina Digital' },
    { title: 'OpenAI Rilis GPT-5 dengan Kemampuan Multimodal Super Canggih', description: 'OpenAI resmi meluncurkan GPT-5 yang memiliki kemampuan memahami teks, gambar, audio, dan video secara bersamaan dengan akurasi yang jauh melampaui versi sebelumnya.', source: 'The Verge ID', author: 'Mira AI' },
    { title: 'Google DeepMind Kembangkan AI untuk Deteksi Kanker Stadium Dini', description: 'Tim riset Google DeepMind berhasil mengembangkan model kecerdasan buatan yang mampu mendeteksi kanker stadium awal dengan akurasi 95%, melampaui kemampuan dokter spesialis.', source: 'Nature Tech', author: 'Nadia Medtech' },
    { title: 'Samsung Galaxy S25 Ultra Hadir dengan Kamera 200MP dan AI Photography', description: 'Samsung memperkenalkan Galaxy S25 Ultra dengan sensor kamera 200 megapiksel, zoom 100x, dan fitur AI photography yang menghasilkan foto berkualitas profesional.', source: 'Gadget Indonesia', author: 'Oscar Mobile' },
    { title: 'Indonesia Lahirkan 3 Startup Unicorn Baru di Semester I 2025', description: 'Ekosistem startup Indonesia terus berkembang pesat, tiga startup baru mencapai valuasi unicorn pada semester pertama 2025, menambah daftar unicorn nasional menjadi 15 perusahaan.', source: 'DailySocial', author: 'Putri Startup' },
    { title: 'Quantum Computing IBM Melampaui 1000 Qubit, Era Baru Komputasi', description: 'IBM mengumumkan pencapaian bersejarah dengan prosesor quantum yang melampaui 1000 qubit, membuka era baru dalam komputasi ilmiah dan kriptografi tingkat tinggi.', source: 'IEEE Spectrum', author: 'Quantum Lab' },
    { title: 'Serangan Siber pada Infrastruktur Indonesia Naik 300%, BSSN Waspada', description: 'BSSN melaporkan peningkatan dramatis 300% serangan siber pada infrastruktur kritis Indonesia selama 2024, mendorong percepatan transformasi keamanan digital nasional.', source: 'BSSN', author: 'Rico Security' },
  ],
  sports: [
    { title: 'Timnas Indonesia Lolos ke Semifinal Piala Asia 2025, Sejarah Baru!', description: 'Tim nasional sepak bola Indonesia mencatatkan sejarah gemilang dengan lolos ke semifinal Piala Asia 2025, mengalahkan Korea Selatan 2-1 di pertandingan yang sangat dramatis.', source: 'PSSI', author: 'Sepakbola Indonesia' },
    { title: 'Indonesia Raih 3 Emas di Kejuaraan Bulu Tangkis Asia 2025', description: 'Atlet bulu tangkis Indonesia tampil gemilang di Kejuaraan Asia 2025, meraih 3 medali emas, 2 perak, dan 1 perunggu, mempertahankan dominasi di Asia dengan gemilang.', source: 'PBSI', author: 'Badminton ID' },
    { title: 'MotoGP Mandalika 2025 Siap Digelar, Tiket Habis Terjual dalam 48 Jam', description: 'Grand Prix Indonesia di Sirkuit Mandalika 2025 kembali menjadi magnet penggemar otomotif dunia, dengan seluruh tiket habis terjual hanya dalam 48 jam pertama penjualan.', source: 'MotoGP Indonesia', author: 'Circuit News' },
    { title: 'Real Madrid Juara Liga Champions dengan Drama Adu Penalti Sengit', description: 'Real Madrid mempertahankan mahkota Liga Champions setelah mengalahkan Manchester City melalui adu penalti dramatis 5-4, dengan Mbappé mencetak gol penentu kemenangan.', source: 'UEFA', author: 'Football Europe' },
    { title: 'Kevin Sanjaya Kembali Raih Gelar di All England 2025', description: 'Kevin Sanjaya sukanda berhasil meraih kembali gelar bergengsi di All England 2025, membuktikan konsistensinya sebagai ganda putra terbaik dunia bersama pasangannya.', source: 'BWF', author: 'Badminton World' },
  ],
  business: [
    { title: 'GoTo Group Cetak Laba Pertama Sejak IPO, Melampaui Ekspektasi', description: 'GoTo Group mengumumkan pencapaian bersejarah dengan laba bersih pertama kali sejak perusahaan melantai di bursa, melampaui ekspektasi analis dan mendongkrak harga saham.', source: 'Kontan', author: 'Bisnis Today' },
    { title: 'Nilai Ekspor Indonesia Naik 15%, Manufaktur Jadi Motor Pertumbuhan', description: 'Kementerian Perdagangan melaporkan peningkatan ekspor Indonesia 15% secara year-on-year, didorong sektor manufaktur otomotif dan elektronik yang terus berkembang.', source: 'Kemdag', author: 'Trade News' },
    { title: 'Bank Mandiri Luncurkan Platform AI Personal Finance Advisor', description: 'Bank Mandiri memperkenalkan platform digital terbaru dilengkapi AI personal finance advisor yang dapat menganalisis pola keuangan dan memberikan saran investasi yang personal.', source: 'Mandiri', author: 'Fintech Analyst' },
    { title: 'Investasi Asing Langsung ke Indonesia Capai Rekor US$50 Miliar', description: 'BKPM melaporkan investasi asing langsung ke Indonesia mencapai rekor tertinggi US$50 miliar sepanjang sejarah, didominasi sektor EV dan semikonduktor yang sedang booming.', source: 'BKPM', author: 'Investment Watch' },
    { title: 'BEI Catat Nilai Kapitalisasi Pasar Lampaui Rp 12.000 Triliun', description: 'Bursa Efek Indonesia mencatat nilai kapitalisasi pasar melampaui Rp 12.000 triliun untuk pertama kalinya, didorong kenaikan saham-saham sektor digital dan energi hijau.', source: 'IDX', author: 'Market Watch' },
  ],
  entertainment: [
    { title: 'Film "Laskar Pelangi 2" Tembus 10 Juta Penonton di Bioskop Indonesia', description: 'Sekuel film legenda Laskar Pelangi berhasil mencatatkan rekor baru penonton bioskop nasional, melampaui 10 juta penonton dalam 30 hari tayang perdana yang luar biasa.', source: 'Jawapos', author: 'Cinema ID' },
    { title: 'Blackpink World Tour Singgah di Jakarta, Tiket Ludes dalam Menit', description: 'Grup K-Pop fenomenal Blackpink mengkonfirmasi konser besar di Stadion GBK Jakarta sebagai bagian dari world tour 2025, dengan tiket habis terjual hanya dalam 15 menit.', source: 'Kpop News ID', author: 'Music Indonesia' },
    { title: 'Netflix Indonesia Produksi Series Original Bertema Mitologi Nusantara', description: 'Netflix mengumumkan produksi series original Indonesia bertema mitologi Nusantara dengan anggaran produksi US$20 juta, melibatkan 500 tenaga kerja kreatif lokal berbakat.', source: 'Netflix Indonesia', author: 'Streaming ID' },
    { title: 'Musisi Indonesia Pertama Masuk Nominasi Grammy Awards 2025', description: 'Musisi Indonesia berhasil menembus nominasi Grammy Awards 2025 dalam kategori World Music, menjadi tonggak bersejarah bagi industri musik Indonesia di panggung global.', source: 'Rolling Stone ID', author: 'Music Global' },
  ],
  health: [
    { title: 'Vaksin HIV Pertama Dunia Masuki Fase Uji Klinis III, Hasilkan Harapan', description: 'Ilmuwan dari berbagai negara mengumumkan vaksin HIV pertama di dunia berhasil memasuki uji klinis fase ketiga dengan hasil sangat menjanjikan, tingkat efektivitas 87%.', source: 'WHO Indonesia', author: 'Health Global' },
    { title: 'Kemenkes: Angka DBD Turun 40% Berkat Program Nyamuk Wolbachia', description: 'Program nyamuk ber-Wolbachia yang diluncurkan Kemenkes terbukti efektif menurunkan angka demam berdarah dengue sebesar 40% di kota-kota yang sudah mengimplementasikannya.', source: 'Kemenkes RI', author: 'Health Indonesia' },
    { title: 'Riset: Tidur 7-8 Jam Berkualitas Kurangi Risiko Alzheimer hingga 50%', description: 'Studi komprehensif dari Johns Hopkins University menunjukkan bahwa tidur berkualitas 7-8 jam setiap malam dapat mengurangi risiko Alzheimer dan demensia secara signifikan.', source: 'Medical Journal', author: 'Science Health' },
    { title: 'BPOM Setujui Obat Diabetes Baru Berbasis AI-Drug Discovery', description: 'Badan Pengawas Obat dan Makanan Indonesia menyetujui obat diabetes baru yang dikembangkan menggunakan teknologi AI-drug discovery, dengan efektivitas 30% lebih baik dari obat sebelumnya.', source: 'BPOM', author: 'Pharma Indonesia' },
  ],
  science: [
    { title: 'NASA Temukan Exoplanet Mirip Bumi di Sistem Bintang Proxima Centauri', description: 'Teleskop luar angkasa James Webb berhasil mengidentifikasi exoplanet baru dengan karakteristik sangat mirip Bumi di sistem bintang terdekat, Proxima Centauri, yang sangat menarik.', source: 'NASA Science', author: 'Space Science' },
    { title: 'Ilmuwan ITB Kembangkan Baterai Ramah Lingkungan dari Limbah Kelapa Sawit', description: 'Tim peneliti Institut Teknologi Bandung berhasil mengembangkan teknologi baterai revolusioner yang ramah lingkungan dari cangkang kelapa sawit, dengan kapasitas 3x lipat baterai konvensional.', source: 'ITB Research', author: 'Green Tech Indonesia' },
    { title: '15 Spesies Baru Ditemukan di Hutan Papua, Dunia Ilmiah Terkejut', description: 'Ekspedisi ilmiah multinasional di hutan Papua berhasil menemukan dan mendokumentasikan 15 spesies baru, termasuk mamalia kecil dan serangga unik yang belum pernah dikenal sains.', source: 'Nature Indonesia', author: 'Bio Science' },
  ],
  nation: [
    { title: 'Ibu Kota Nusantara Masuki Fase Pembangunan Pusat Pemerintahan', description: 'IKN resmi memasuki fase pembangunan pusat pemerintahan, dengan Istana Negara dan gedung DPR mulai beroperasi menerima kunjungan resmi pejabat negara pertama kalinya.', source: 'OIKN', author: 'IKN Reporter' },
    { title: 'Jembatan Batam-Bintan Mulai Dibangun, Mega Proyek Rp 30 Triliun', description: 'Mega proyek jembatan yang menghubungkan Pulau Batam dan Bintan resmi dimulai konstruksinya dengan nilai investasi Rp 30 triliun, dijadwalkan selesai dalam 5 tahun ke depan.', source: 'Kemen PUPR', author: 'Infrastruktur ID' },
    { title: 'Reforma Agraria: 5 Juta Hektar Tanah Resmi Dibagikan ke Rakyat', description: 'Pemerintah merampungkan program reforma agraria dengan membagikan sertifikat atas 5 juta hektar tanah kepada jutaan kepala keluarga di seluruh Indonesia secara merata.', source: 'BPN Indonesia', author: 'Agraria News' },
  ],
  world: [
    { title: 'PBB Gelar KTT Darurat Atasi Krisis Perubahan Iklim yang Memburuk', description: 'Perserikatan Bangsa-Bangsa menggelar konferensi darurat menyusul meningkatnya krisis perubahan iklim global yang mengancam keberadaan puluhan negara kepulauan kecil di dunia.', source: 'UN News', author: 'World Affairs' },
    { title: 'AS dan China Capai Kesepakatan Dagang Bersejarah Akhiri Konflik', description: 'Amerika Serikat dan China akhirnya mencapai kesepakatan perdagangan komprehensif yang diharapkan meredakan ketegangan ekonomi global dan menurunkan harga barang konsumen.', source: 'Reuters', author: 'Global Economy' },
    { title: 'Gencatan Senjata di Timur Tengah Berlaku, Babak Baru Perdamaian', description: 'Gencatan senjata yang dimediasi PBB dan didukung negara-negara Arab mulai berlaku di Timur Tengah, membuka peluang negosiasi perdamaian jangka panjang yang komprehensif.', source: 'Al Jazeera', author: 'Middle East Watch' },
  ],
};

export function getMockArticles(category: string, page: number = 1): Article[] {
  const data = mockData[category] || mockData.general;
  const perPage = 8;
  const result: Article[] = [];
  for (let i = 0; i < perPage; i++) {
    const item = data[i % data.length];
    const offset = (page - 1) * perPage + i;
    const imgIdx = (offset + (category.length % 5)) % mockImages.length;
    const hoursAgo = Math.floor(Math.random() * 24);
    const contentExtra = `

Laporan mendalam mengenai situasi ini terus berkembang dengan berbagai informasi terbaru yang kami himpun dari berbagai sumber terpercaya di lapangan.

Berbagai pihak terkait telah memberikan tanggapan resmi mereka mengenai perkembangan ini. Para pakar dan analis terkemuka turut memberikan perspektif mereka yang beragam namun saling melengkapi untuk memberikan gambaran yang lebih komprehensif.

Dari sisi dampak terhadap masyarakat, situasi ini diperkirakan akan membawa perubahan signifikan dalam jangka menengah dan panjang. Pemerintah dan lembaga terkait terus memantau perkembangan secara intensif dan melakukan koordinasi lintas sektor.

"Kami berkomitmen untuk terus memberikan informasi yang akurat dan bertanggung jawab kepada seluruh masyarakat Indonesia," ujar salah satu pejabat yang enggan disebutkan namanya kepada tim redaksi EpanDNews.

Langkah-langkah strategis telah disiapkan oleh berbagai pemangku kepentingan untuk menghadapi berbagai kemungkinan skenario yang dapat terjadi. Koordinasi antar lembaga terus diperkuat untuk memastikan respons yang tepat, cepat, dan efektif demi kepentingan masyarakat luas.

Kami akan terus memperbarui laporan ini seiring berkembangnya situasi di lapangan. Tetap ikuti EpanDNews untuk mendapatkan informasi terkini dan terpercaya.`;
    result.push({
      articleId: `mock_${category}_p${page}_i${i}`,
      title: item.title + (page > 1 ? ` – Pembaruan ${page}` : ''),
      description: item.description,
      content: item.description + contentExtra,
      url: `https://epandnews.id/${category}/artikel-${offset + 1}`,
      image: mockImages[imgIdx],
      publishedAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
      source: item.source,
      category,
      author: item.author,
      tags: [category, 'indonesia', 'terkini', item.source.toLowerCase()],
      views: Math.floor(Math.random() * 10000) + 500,
    });
  }
  return result;
}
