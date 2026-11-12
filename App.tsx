import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Home,
  Compass,
  Heart,
  Briefcase,
  User,
  Bell,
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  SlidersHorizontal,
  ArrowUpDown,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  Plane,
  Hotel,
  Bus,
  Utensils,
  Camera,
  Share2,
  FileText,
  HelpCircle,
  Building2,
  Plus,
  Minus,
  X,
  Loader2,
  Copy,
  Award,
  Headphones,
  Wallet,
  Tag,
  LogOut,
  Settings,
  Check
} from 'lucide-react';

// ============================================================================
// 1. TYPESCRIPT INTERFACES & DATA MODELS
// ============================================================================

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  meals?: string[];
  accommodation?: string;
}

export interface PackageOptionTier {
  id: string;
  name: string;
  description: string;
  priceDelta: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface TravelPackage {
  id: string;
  slug: string;
  name: string;
  description: string;
  destination: string;
  destinationId: string;
  category: string;
  images: string[];
  duration: string;
  durationDays: number;
  price: number;
  discountPrice?: number;
  childPriceMultiplier: number;
  infantPriceMultiplier: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  packageOptions: PackageOptionTier[];
  departureDates: string[];
  meetingPoint: string;
  departureLocation: string;
  travelSchedule: string;
  accommodationSummary: string;
  transportationSummary: string;
  itinerary: ItineraryItem[];
  inclusions: string[];
  exclusions: string[];
  importantNotes: string[];
  cancellationPolicy: string[];
  reviews: ReviewItem[];
  availability: number;
  minTravelers: number;
  maxTravelers: number;
  featured?: boolean;
  recommended?: boolean;
  specialOffer?: boolean;
}

export interface DestinationInfo {
  id: string;
  name: string;
  country: string;
  region: string;
  category: string;
  tagline: string;
  description: string;
  heroImage: string;
  gallery: string[];
  bestTimeToVisit: string;
  language: string;
  currency: string;
  timezone: string;
  featured?: boolean;
  popularAttractions: {
    name: string;
    description: string;
    category: string;
  }[];
}

export interface Traveler {
  id: string;
  type: 'Adult' | 'Child' | 'Infant';
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | '';
  identityNumber: string;
  specialRequirements: string;
}

export interface BookingDraft {
  packageId: string;
  optionId: string;
  departureDate: string;
  adults: number;
  children: number;
  infants: number;
  travelers: Traveler[];
  promoCode: string;
  specialRequest: string;
}

export interface GuestInformation {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface PaymentChannelOption {
  id: string;
  name: string;
  type: 'gateway_pending' | 'manual_verification' | 'pay_at_office';
  description: string;
  statusLabel: string;
  available: boolean;
}

export interface Booking {
  bookingReference: string;
  createdAt: string;
  packageId: string;
  packageName: string;
  optionName: string;
  destination: string;
  duration: string;
  packageImage: string;
  guest: GuestInformation;
  travelers: Traveler[];
  departureDate: string;
  meetingPoint: string;
  departureLocation: string;
  adults: number;
  children: number;
  infants: number;
  subtotal: number;
  discountTotal: number;
  promoDiscount: number;
  promoCodeApplied?: string;
  serviceFee: number;
  totalAmount: number;
  specialRequest?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  tripCategory: 'upcoming' | 'completed' | 'cancelled';
  bookingStatus:
    | 'Menunggu Verifikasi Pembayaran'
    | 'Terkonfirmasi - Slot Ditahan'
    | 'Selesai'
    | 'Dibatalkan';
  paymentStatus: 'Belum Dibayar - Menunggu Pembayaran' | 'Lunas (Terverifikasi)' | 'Dibatalkan';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

type MainTab = 'home' | 'explore' | 'wishlist' | 'bookings' | 'profile';
type StandaloneView =
  | null
  | { type: 'destination'; destinationId: string }
  | { type: 'package'; packageId: string }
  | { type: 'booking'; packageId: string }
  | { type: 'checkout' }
  | { type: 'confirmation'; bookingReference: string }
  | { type: 'bookingDetail'; bookingReference: string }
  | { type: 'infoPage'; page: 'about' | 'contact' | 'help' | 'terms' | 'privacy' };

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// ============================================================================
// 2. CURATED TRAVEL DATA (ASRIVA TRAVEL & TOURS)
// ============================================================================

const TRAVEL_CATEGORIES = [
  'Semua',
  'Tur Domestik',
  'Tur Internasional',
  'Petualangan',
  'Liburan Keluarga',
  'Honeymoon',
  'Private Trip',
  'Tur Grup'
];

const PROMO_CODES: Record<string, { label: string; amount: number; minSpend: number }> = {
  ASRIVA250: { label: 'Promo Sambutan ASRIVA Diskon Rp 250.000', amount: 250000, minSpend: 3000000 },
  BEYOND500: { label: 'Promo Travel Beyond Diskon Rp 500.000', amount: 500000, minSpend: 8000000 }
};

const DESTINATIONS_DATA: DestinationInfo[] = [
  {
    id: 'dest-bali',
    name: 'Bali & Nusa Penida',
    country: 'Indonesia',
    region: 'Kepulauan Nusa Tenggara',
    category: 'Tur Domestik',
    tagline: 'Pulau Dewata, Terasering Hijau & Laguna Tebing',
    description:
      'Bali memadukan arsitektur pura yang sakral, dataran tinggi vulkanik, terasering sawah Ubud yang asri, serta tebing kapur dramatis di Nusa Penida. Ideal untuk retret tenang, wisata budaya, dan eksplorasi pesisir.',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'April – Oktober (Musim Kemarau)',
    language: 'Bahasa Indonesia, Bali, Inggris',
    currency: 'IDR (Rupiah Indonesia)',
    timezone: 'WITA (UTC+8)',
    featured: true,
    popularAttractions: [
      {
        name: 'Tebing Kelingking & Pantai Diamond',
        description: 'Teluk biru kehijauan ikonik yang diapit formasi tebing kapur menjulang di Nusa Penida.',
        category: 'Alam Pesisir'
      },
      {
        name: 'Tegalalang & Dataran Tinggi Ubud',
        description: 'Sistem irigasi subak warisan UNESCO, desa pengrajin seni, dan resor kesehatan di tengah hutan.',
        category: 'Budaya & Warisan'
      },
      {
        name: 'Pura Luhur Uluwatu',
        description: 'Pura di atas tebing yang menghadap Samudra Hindia dengan pertunjukan tari Kecak saat matahari terbenam.',
        category: 'Ikon Wisata'
      }
    ]
  },
  {
    id: 'dest-labuan-bajo',
    name: 'Labuan Bajo & Komodo',
    country: 'Indonesia',
    region: 'Nusa Tenggara Timur',
    category: 'Tur Domestik',
    tagline: 'Pelayaran Kepulauan, Pasir Merah Muda & Naga Purba',
    description:
      'Gerbang menuju Taman Nasional Komodo, Labuan Bajo menawarkan pelayaran kapal Phinisi, pendakian panorama Pulau Padar, terumbu karang eksotis, serta pertemuan langsung dengan komodo di habitat aslinya.',
    heroImage: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'April – November',
    language: 'Bahasa Indonesia, Manggarai, Inggris',
    currency: 'IDR (Rupiah Indonesia)',
    timezone: 'WITA (UTC+8)',
    featured: true,
    popularAttractions: [
      {
        name: 'Puncak Matahari Terbit Pulau Padar',
        description: 'Tiga teluk melengkung dengan pasir putih, hitam, dan merah muda dari puncak bukit vulkanik.',
        category: 'Trekking Petualangan'
      },
      {
        name: 'Taman Nasional Komodo',
        description: 'Jelajah satwa liar dipandu ranger resmi di habitat alami kadal terbesar di dunia.',
        category: 'Satwa Liar'
      },
      {
        name: 'Manta Point & Taka Makassar',
        description: 'Hamparan pasir timbul jernih dan snorkeling berdampingan dengan ikan pari manta yang anggun.',
        category: 'Bahari'
      }
    ]
  },
  {
    id: 'dest-kyoto-tokyo',
    name: 'Tokyo & Kyoto',
    country: 'Jepang',
    region: 'Kanto & Kansai',
    category: 'Tur Internasional',
    tagline: 'Kuil Zen Bersejarah & Metropolis Modern',
    description:
      'Nikmati perpaduan harmonis antara distrik futuristik Tokyo dan jalanan kayu bersejarah Kyoto, hutan bambu, serta kuil kuno yang terhubung oleh kereta cepat Shinkansen.',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'Maret – Mei & Oktober – November',
    language: 'Bahasa Jepang, Inggris (Area Wisata)',
    currency: 'JPY (Yen Jepang)',
    timezone: 'JST (UTC+9)',
    featured: true,
    popularAttractions: [
      {
        name: 'Fushimi Inari & Arashiyama',
        description: 'Ribuan gerbang torii merah menyala dan jalur hutan bambu yang menenangkan di Kyoto.',
        category: 'Warisan Budaya'
      },
      {
        name: 'Gunung Fuji & Lembah Hakone',
        description: 'Pelayaran danau vulkanik dengan pemandangan ikonik puncak tertinggi di Jepang.',
        category: 'Panorama Alam'
      },
      {
        name: 'Asakusa & Shibuya Tokyo',
        description: 'Dari lampion bersejarah Kuil Senso-ji hingga pusat kuliner dan arsitektur modern.',
        category: 'Eksplorasi Kota'
      }
    ]
  },
  {
    id: 'dest-swiss',
    name: 'Pegunungan Alpen Swiss & Lucerne',
    country: 'Swiss',
    region: 'Eropa Tengah',
    category: 'Tur Internasional',
    tagline: 'Gletser Alpen, Kereta Panorama & Desa Tepi Danau',
    description:
      'Jelajahi puncak Alpen bersalju, danau gletser jernih, dan desa-desa Swiss bak negeri dongeng menaiki kereta pegunungan panorama kelas dunia.',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'Mei – September & Desember – Maret',
    language: 'Jerman, Prancis, Italia, Inggris',
    currency: 'CHF (Franc Swiss)',
    timezone: 'CET (UTC+1)',
    featured: false,
    popularAttractions: [
      {
        name: 'Jungfraujoch – Puncak Eropa',
        description: 'Perjalanan kereta bergerigi menuju stasiun kereta tertinggi di Eropa dan Gletser Aletsch.',
        category: 'Kereta Alpen'
      },
      {
        name: 'Danau Lucerne & Gunung Pilatus',
        description: 'Pelayaran kapal melintasi danau Alpen yang jernih dipadukan panorama puncak Pilatus.',
        category: 'Danau Panorama'
      }
    ]
  },
  {
    id: 'dest-bromo',
    name: 'Bromo & Tumpak Sewu',
    country: 'Indonesia',
    region: 'Jawa Timur',
    category: 'Petualangan',
    tagline: 'Kaldera Matahari Terbit & Air Terjun Tirai',
    description:
      'Saksikan matahari terbit keemasan di atas Kaldera Tengger dengan jip 4WD dan telusuri amfiteater hijau Air Terjun Tumpak Sewu di Jawa Timur.',
    heroImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
    ],
    bestTimeToVisit: 'Mei – Oktober',
    language: 'Bahasa Indonesia, Jawa, Inggris',
    currency: 'IDR (Rupiah Indonesia)',
    timezone: 'WIB (UTC+7)',
    featured: false,
    popularAttractions: [
      {
        name: 'Titik Pandang Sunrise Penanjakan',
        description: 'Panorama fajar spektakuler menghadap Gunung Bromo, Batok, dan Semeru.',
        category: 'Gunung Berapi'
      },
      {
        name: 'Air Terjun Tumpak Sewu',
        description: 'Air terjun bertingkat menyerupai tirai raksasa yang dikelilingi tebing tropis Lumajang.',
        category: 'Petualangan'
      }
    ]
  }
];

const PACKAGES_DATA: TravelPackage[] = [
  {
    id: 'pkg-bali-ubud-4d3n',
    slug: 'bali-ubud-nusa-penida-escape-4d3n',
    name: 'Bali Ubud & Nusa Penida Signature Escape',
    description:
      'Perjalanan kurasi 4 hari yang memadukan ketenangan resor Ubud, pura mata air suci, serta ekspedisi kapal cepat privat menyusuri tebing ikonik bagian barat dan timur Nusa Penida.',
    destination: 'Bali & Nusa Penida',
    destinationId: 'dest-bali',
    category: 'Honeymoon',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '4 Hari 3 Malam',
    durationDays: 4,
    price: 5450000,
    discountPrice: 4690000,
    childPriceMultiplier: 0.75,
    infantPriceMultiplier: 0.15,
    rating: 4.9,
    reviewCount: 142,
    highlights: [
      'Penyeberangan fast boat VIP pulang-pergi & tur privat tebing barat Nusa Penida',
      'Menginap di resor Ubud yang asri & hotel butik pesisir Seminyak',
      'Kunjungan wisata budaya ke Tirta Empul & Terasering Sawah Tegalalang',
      'Kendaraan MPV ber-AC privat dengan pengemudi sekaligus pemandu berpengalaman'
    ],
    packageOptions: [
      {
        id: 'opt-4star',
        name: 'Paket Butik Bintang 4 Signature',
        description: 'Resor Bintang 4 Ubud & Hotel Seminyak (Kamar Twin/Double)',
        priceDelta: 0
      },
      {
        id: 'opt-5star-villa',
        name: 'Upgrade Vila Kolam Renang Privat',
        description: 'Private Pool Villa di Ubud + Suite Tepi Pantai Bintang 5 Seminyak',
        priceDelta: 2450000
      }
    ],
    departureDates: ['2026-11-20', '2026-11-27', '2026-12-04', '2026-12-18', '2027-01-08'],
    meetingPoint: 'Pintu Kedatangan Bandara Internasional Ngurah Rai (DPS) / Hotel Bali Selatan',
    departureLocation: 'Denpasar, Bali',
    travelSchedule: 'Hari 1 Tiba sebelum 13:00 WITA • Hari 4 Kepulangan setelah 15:00 WITA',
    accommodationSummary: '2 Malam Resor Ubud Bintang 4 + 1 Malam Hotel Butik Seminyak',
    transportationSummary: 'MPV Privat Ber-AC + Fast Boat VIP PP Sanur–Nusa Penida',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan di Bali & Penyambutan Budaya Ubud',
        description:
          'Penjemputan privat di bandara oleh tim ASRIVA. Perjalanan menuju Ubud, kunjungan sore ke Terasering Tegalalang, dan makan malam khas Bali.',
        meals: ['Makan Malam'],
        accommodation: 'Resor Butik Ubud (Bintang 4)'
      },
      {
        day: 2,
        title: 'Pura Tirta Empul & Panorama Kaldera Kintamani',
        description:
          'Kunjungan pagi ke mata air suci Tirta Empul, mencicipi kopi agrowisata, dan makan siang menghadap panorama Gunung Batur.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Resor Butik Ubud (Bintang 4)'
      },
      {
        day: 3,
        title: 'Ekspedisi Pesisir Nusa Penida',
        description:
          'Penyeberangan fast boat pagi dari Sanur ke Nusa Penida. Jelajahi Tebing Kelingking, Broken Beach, dan Angel’s Billabong dengan mobil privat dan makan siang lokal.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Pesisir Seminyak (Bintang 4)'
      },
      {
        day: 4,
        title: 'Tebing Uluwatu & Pengantaran Bandara',
        description:
          'Sarapan santai, singgah belanja oleh-oleh di Seminyak, kunjungan tebing Uluwatu, dan pengantaran tepat waktu ke Bandara Ngurah Rai.',
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Akomodasi 3 malam (sekamar berdua) termasuk sarapan harian',
      'Kendaraan privat ber-AC & pengemudi merangkap pemandu wisata',
      'Tiket fast boat pulang-pergi Sanur – Nusa Penida – Sanur',
      'Seluruh tiket masuk objek wisata & retribusi pulau Nusa Penida',
      'Konsumsi sesuai jadwal (3x Sarapan, 2x Makan Siang, 1x Makan Malam)',
      'Air mineral selama perjalanan & perlindungan asuransi perjalanan'
    ],
    exclusions: [
      'Tiket pesawat domestik atau internasional dari/ke Bali (DPS)',
      'Pengeluaran pribadi, laundry, minibar, dan layanan spa opsional',
      'Tipping untuk pemandu dan pengemudi (sukarela)'
    ],
    importantNotes: [
      'Medan wisata Nusa Penida memiliki anak tangga batu kapur; disarankan memakai alas kaki yang nyaman.',
      'Harap informasikan alergi makanan atau pantangan diet minimal 48 jam sebelum keberangkatan.'
    ],
    cancellationPolicy: [
      'Perubahan tanggal gratis hingga 14 hari sebelum keberangkatan.',
      'Pengembalian dana 50% untuk pembatalan 7–13 hari sebelum keberangkatan.',
      'Tidak dapat di-refund dalam kurun waktu 6 hari sebelum keberangkatan.'
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Nadia Kartika',
        date: 'Okt 2026',
        rating: 5,
        comment:
          'Ritme perjalanan sangat nyaman dan tidak terburu-buru! Driver selalu datang lebih awal dan penyeberangan ke Nusa Penida sangat lancar.'
      },
      {
        id: 'r2',
        author: 'Dimas Wijaya',
        date: 'Sep 2026',
        rating: 5,
        comment:
          'Memilih opsi upgrade Private Pool Villa untuk ulang tahun pernikahan kami dan pelayanannya luar biasa memuaskan.'
      }
    ],
    availability: 10,
    minTravelers: 2,
    maxTravelers: 12,
    featured: true,
    recommended: true,
    specialOffer: true
  },
  {
    id: 'pkg-komodo-phinisi-3d2n',
    slug: 'komodo-luxury-phinisi-sailing-3d2n',
    name: 'Pelayaran Phinisi Komodo & Pulau Padar',
    description:
      'Berlayar melintasi selat biru kehijauan Taman Nasional Komodo di atas kapal Phinisi kayu mewah. Mendaki Pulau Padar saat matahari terbit, bertemu komodo, dan snorkeling bersama pari manta.',
    destination: 'Labuan Bajo & Komodo',
    destinationId: 'dest-labuan-bajo',
    category: 'Tur Domestik',
    images: [
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '3 Hari 2 Malam',
    durationDays: 3,
    price: 6200000,
    discountPrice: 5590000,
    childPriceMultiplier: 0.8,
    infantPriceMultiplier: 0.1,
    rating: 4.9,
    reviewCount: 98,
    highlights: [
      'Pelayaran liveaboard 3H2M di atas kapal Phinisi kayu deluxe ber-AC',
      'Pendakian matahari terbit di Pulau Padar menghadap tiga teluk berwarna',
      'Jelajah satwa komodo bersama ranger & snorkeling bersama ikan pari manta',
      'Sajian makanan lengkap di atas kapal & antar-jemput bandara–pelabuhan'
    ],
    packageOptions: [
      {
        id: 'opt-deluxe-cabin',
        name: 'Kabin Ensuite Dek Bawah',
        description: 'Kabin privat ber-AC dengan kamar mandi dalam (Twin/Double)',
        priceDelta: 0
      },
      {
        id: 'opt-master-ocean',
        name: 'Master Suite Ocean-View Dek Atas',
        description: 'Kabin panorama laut luas dengan akses balkon privat',
        priceDelta: 1650000
      }
    ],
    departureDates: ['2026-11-21', '2026-11-28', '2026-12-05', '2026-12-19', '2027-01-15'],
    meetingPoint: 'Bandara Komodo (LBJ) atau Dermaga Pelabuhan Labuan Bajo',
    departureLocation: 'Labuan Bajo, Flores',
    travelSchedule: 'Hari 1 Boarding 10:30 WITA • Hari 3 Sandar Kembali 12:30 WITA',
    accommodationSummary: '2 Malam Kabin Ber-AC Kamar Mandi Dalam di Kapal Phinisi Deluxe',
    transportationSummary: 'Kapal Phinisi Deluxe + Sekoci Cepat + Antar-Jemput Bandara',
    itinerary: [
      {
        day: 1,
        title: 'Pulau Kelor, Manjarite & Matahari Terbenam Kalong',
        description:
          'Penjemputan bandara dan boarding kapal. Mendaki bukit Pulau Kelor, snorkeling di taman karang Manjarite, dan menikmati senja ribuan kelelawar di Pulau Kalong.',
        meals: ['Makan Siang', 'Makan Malam'],
        accommodation: 'Kabin Ensuite Phinisi Deluxe'
      },
      {
        day: 2,
        title: 'Sunrise Padar, Pink Beach, Komodo & Manta Point',
        description:
          'Trekking fajar di Pulau Padar, berenang di Long Pink Beach, trekking bersama ranger di Pulau Komodo, dan snorkeling pari manta di Taka Makassar.',
        meals: ['Sarapan', 'Makan Siang', 'Makan Malam'],
        accommodation: 'Kabin Ensuite Phinisi Deluxe'
      },
      {
        day: 3,
        title: 'Terumbu Karang Sebayur & Kembali ke Labuan Bajo',
        description:
          'Snorkeling pagi di Pulau Sebayur, sarapan santai di dek kapal, berlayar kembali ke pelabuhan Labuan Bajo, dan pengantaran ke bandara.',
        meals: ['Sarapan', 'Makan Siang']
      }
    ],
    inclusions: [
      '2 malam menginap di kabin ber-AC dengan kamar mandi dalam',
      'Makan lengkap selama pelayaran (7x makan utama + camilan sore)',
      'Perlengkapan snorkeling (masker, snorkel, fin) dan pelampung keselamatan',
      'Antar-jemput bandara–pelabuhan Labuan Bajo & tour leader bersertifikat'
    ],
    exclusions: [
      'Tiket masuk Taman Nasional Komodo & jasa ranger (dibayar di lokasi sesuai tarif resmi)',
      'Tiket pesawat dari/ke Bandara Komodo (LBJ)',
      'Minuman beralkohol dan pengeluaran pribadi'
    ],
    importantNotes: [
      'Rute pelayaran dapat menyesuaikan secara dinamis demi keselamatan sesuai arahan Syahbandar.',
      'Disarankan membawa tabir surya ramah terumbu karang, kacamata hitam, dan obat pribadi.'
    ],
    cancellationPolicy: [
      'Penjadwalan ulang diperbolehkan hingga 14 hari sebelum tanggal berlayar.',
      'Penutupan pelabuhan akibat cuaca berhak atas voucher kredit penuh atau jadwal ulang.'
    ],
    reviews: [
      {
        id: 'r3',
        author: 'Rendra Pratama',
        date: 'Okt 2026',
        rating: 5,
        comment:
          'Kru kapal Phinisi sangat ramah dan profesional. Makan malam hidangan laut segar di bawah bintang sungguh tak terlupakan.'
      }
    ],
    availability: 8,
    minTravelers: 1,
    maxTravelers: 10,
    featured: true,
    recommended: true
  },
  {
    id: 'pkg-japan-golden-7d6n',
    slug: 'japan-golden-route-tokyo-fuji-kyoto-7d6n',
    name: 'Rute Emas Jepang: Tokyo, Gunung Fuji & Kyoto',
    description:
      'Jelajahi jantung budaya Jepang dan ikon modern dalam 7 hari yang tertata nyaman. Termasuk pengalaman kereta cepat Shinkansen, panorama Gunung Fuji, dan tur kuil bersejarah Kyoto.',
    destination: 'Tokyo & Kyoto',
    destinationId: 'dest-kyoto-tokyo',
    category: 'Tur Internasional',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '7 Hari 6 Malam',
    durationDays: 7,
    price: 21800000,
    discountPrice: 19950000,
    childPriceMultiplier: 0.85,
    infantPriceMultiplier: 0.2,
    rating: 4.8,
    reviewCount: 76,
    highlights: [
      'Tiket kereta cepat Tokaido Shinkansen terpesan dari Odawara ke Kyoto',
      '1 malam menginap di resor pemandian air panas Hakone Onsen + makan malam Kaiseki',
      'Eksplorasi terpandu Fushimi Inari, Hutan Bambu Arashiyama & Kinkaku-ji',
      'Wisata Gunung Fuji Stasiun ke-5 & Danau Kawaguchiko'
    ],
    packageOptions: [
      {
        id: 'opt-standard-japan',
        name: 'Hotel Kota Bintang 4 Standar',
        description: 'Hotel bintang 4 strategis dekat stasiun transportasi utama',
        priceDelta: 0
      },
      {
        id: 'opt-premium-japan',
        name: 'Hotel Deluxe Pusat Kota Premier',
        description: 'Upgrade kamar lebih luas di jantung Shinjuku & Pusat Kota Kyoto',
        priceDelta: 3800000
      }
    ],
    departureDates: ['2026-12-02', '2026-12-16', '2027-01-20', '2027-03-24'],
    meetingPoint: 'Aula Kedatangan Terminal 1 Bandara Internasional Narita (NRT)',
    departureLocation: 'Tokyo (NRT) / Kepulangan Osaka (KIX)',
    travelSchedule: 'Hari 1 Tiba di Tokyo • Hari 7 Kepulangan Bandara Internasional Kansai',
    accommodationSummary: '3 Malam Hotel Tokyo + 1 Malam Resor Hakone Onsen + 2 Malam Hotel Kyoto',
    transportationSummary: 'Bus Wisata Privat + Tiket Kereta Cepat Shinkansen',
    itinerary: [
      {
        day: 1,
        title: 'Tiba di Tokyo & Orientasi Malam Shinjuku',
        description: 'Bertemu koordinator tur ASRIVA di Bandara Narita, transfer ke hotel pusat Tokyo, dan jalan santai malam di distrik Shinjuku.',
        meals: ['Makan Malam'],
        accommodation: 'Shinjuku Granbell atau setaraf (Bintang 4)'
      },
      {
        day: 2,
        title: 'Asakusa Senso-ji, Kuil Meiji & Shibuya',
        description: 'Tur kota Tokyo seharian mengunjungi Kuil Senso-ji, Nakamise Street, Kuil hutan Meiji Jingu, dan persimpangan Shibuya.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Shinjuku Granbell atau setaraf (Bintang 4)'
      },
      {
        day: 3,
        title: 'Gunung Fuji Stasiun ke-5 & Danau Kawaguchiko',
        description: 'Perjalanan ke Stasiun ke-5 Gunung Fuji (menyesuaikan cuaca), mata air Oshino Hakkai, dan makan malam Kaiseki di Hakone.',
        meals: ['Sarapan', 'Makan Siang', 'Makan Malam'],
        accommodation: 'Resor Ryokan Hakone Onsen'
      },
      {
        day: 4,
        title: 'Kereta Cepat Shinkansen ke Kyoto & Fushimi Inari',
        description: 'Menaiki kereta peluru Shinkansen ke Kyoto, menjelajahi gerbang merah Fushimi Inari Taisha dan distrik bersejarah Gion.',
        meals: ['Sarapan', 'Makan Malam'],
        accommodation: 'Hotel Butik Kyoto (Bintang 4)'
      },
      {
        day: 5,
        title: 'Hutan Bambu Arashiyama & Paviliun Emas Kinkaku-ji',
        description: 'Jalan pagi menyusuri Hutan Bambu Sagano, taman Tenryu-ji, dan kuil keemasan Kinkaku-ji.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Butik Kyoto (Bintang 4)'
      },
      {
        day: 6,
        title: 'Taman Rusa Nara & Wisata Kuliner Osaka Dotonbori',
        description: 'Kunjungan ke Kuil Todai-ji di Nara dilanjutkan wisata kuliner jalanan di kawasan Osaka Dotonbori.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Butik Kyoto (Bintang 4)'
      },
      {
        day: 7,
        title: 'Kepulangan Bandara Internasional Kansai',
        description: 'Sarapan di hotel dan pengantaran terjadwal menuju Bandara Internasional Kansai (KIX) untuk penerbangan pulang.',
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Akomodasi 6 malam bintang 4 termasuk 1 malam di Hakone Onsen',
      'Tiket kereta cepat Shinkansen terpesan (Odawara – Kyoto)',
      'Bus wisata privat & pemandu wisata berlisensi berbahasa Indonesia/Inggris',
      'Sarapan harian + 4x makan siang + 3x makan malam'
    ],
    exclusions: [
      'Tiket pesawat internasional dan biaya pengurusan Visa / Visa Waiver Jepang',
      'Asuransi perjalanan (wajib untuk keberangkatan internasional)',
      'Belanja pribadi dan aktivitas opsional'
    ],
    importantNotes: [
      'Paspor wajib memiliki masa berlaku minimal 6 bulan dari tanggal kepulangan.',
      'Koper besar dikirim terpisah pada hari perjalanan Shinkansen; siapkan tas kecil untuk menginap 1 malam di Hakone.'
    ],
    cancellationPolicy: [
      'Pembatalan 21+ hari sebelumnya: pengembalian 85% dikurangi deposit tiket kereta/ryokan.',
      'Pembatalan dalam 20 hari: mengikuti ketentuan retensi mitra hotel dan transportasi.'
    ],
    reviews: [
      {
        id: 'r4',
        author: 'Siti Rahmawati',
        date: 'Sep 2026',
        rating: 5,
        comment:
          'Jadwal sangat pas untuk keluarga kami berempat. Naik Shinkansen dan menginap di Hakone Onsen menjadi pengalaman terbaik.'
      }
    ],
    availability: 14,
    minTravelers: 2,
    maxTravelers: 16,
    featured: true,
    specialOffer: true
  },
  {
    id: 'pkg-bromo-sewu-3d2n',
    slug: 'bromo-sunrise-tumpak-sewu-expedition-3d2n',
    name: 'Ekspedisi Privat Sunrise Bromo & Tumpak Sewu',
    description:
      'Petualangan dataran tinggi Jawa Timur yang dirancang bagi pencinta alam dan fotografi. Taklukkan lautan pasir Bromo dengan jip 4WD dan jelajahi ngarai eksotis Air Terjun Tumpak Sewu.',
    destination: 'Bromo & Tumpak Sewu',
    destinationId: 'dest-bromo',
    category: 'Petualangan',
    images: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '3 Hari 2 Malam',
    durationDays: 3,
    price: 3350000,
    discountPrice: 2890000,
    childPriceMultiplier: 0.85,
    infantPriceMultiplier: 0.1,
    rating: 4.8,
    reviewCount: 119,
    highlights: [
      'Tur sunrise jip Toyota Land Cruiser 4WD privat menuju Bukit King Kong',
      'Trekking ngarai terpandu ke dasar Air Terjun Tumpak Sewu & Goa Tetes',
      'Transportasi darat privat Innova Reborn dari Surabaya atau Malang',
      '2 malam menginap di penginapan pegunungan & hotel area kawah Bromo'
    ],
    packageOptions: [
      {
        id: 'opt-private-standard',
        name: 'Ekspedisi Privat (Penginapan Nyaman)',
        description: 'Jip 4WD Privat + Akomodasi Pegunungan Pilihan',
        priceDelta: 0
      },
      {
        id: 'opt-private-jiwajawa',
        name: 'Ekspedisi Privat (Resor Jiwa Jawa)',
        description: 'Upgrade menginap di Jiwa Jawa Resort Bromo + Pemandu Fotografi',
        priceDelta: 1150000
      }
    ],
    departureDates: ['2026-11-20', '2026-11-27', '2026-12-11', '2026-12-25', '2027-01-09'],
    meetingPoint: 'Bandara Internasional Juanda (SUB) / Stasiun Surabaya Gubeng',
    departureLocation: 'Surabaya / Malang, Jawa Timur',
    travelSchedule: 'Hari 1 Penjemputan 09:00 WIB • Hari 3 Pengantaran Surabaya 16:00 WIB',
    accommodationSummary: '1 Malam Eco-Lodge Tumpak Sewu + 1 Malam Hotel Kawasan Bromo',
    transportationSummary: 'Toyota Innova Reborn Privat + Jip Hardtop 4WD',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan Surabaya & Perjalanan ke Dataran Tinggi Lumajang',
        description: 'Penjemputan di Surabaya, perjalanan melintasi pegunungan Malang menuju desa Pronojiwo di dekat Tumpak Sewu.',
        meals: ['Makan Siang', 'Makan Malam'],
        accommodation: 'Penginapan Pegunungan Pronojiwo'
      },
      {
        day: 2,
        title: 'Trekking Air Terjun Tumpak Sewu & Menuju Bromo',
        description: 'Turun ke dasar air terjun Tumpak Sewu bersama pemandu lokal, eksplorasi Goa Tetes, dan perjalanan sore ke Cemoro Lawang Bromo.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Bromo Lava View / Jiwa Jawa Resort'
      },
      {
        day: 3,
        title: 'Sunrise Bromo 4WD, Kawah Bromo & Kepulangan',
        description: '03:00 WIB berangkat dengan jip 4WD ke Bukit King Kong, melintasi Lautan Pasir, mendaki tangga kawah Bromo, sarapan, dan kembali ke Surabaya.',
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Kendaraan privat, BBM, tol, dan pengemudi berpengalaman rute pegunungan',
      'Sewa Jip 4WD privat untuk tur matahari terbit Bromo',
      '2 malam akomodasi pegunungan termasuk sarapan',
      'Pemandu trekking lokal air terjun & seluruh tiket masuk taman nasional'
    ],
    exclusions: [
      'Sewa kuda di Lautan Pasir Gunung Bromo',
      'Tiket pesawat atau kereta api dari/ke Surabaya',
      'Perlengkapan pakaian dingin pribadi dan tipping'
    ],
    importantNotes: [
      'Suhu pagi hari di Bromo berkisar antara 5°C–10°C; harap membawa jaket tebal tahan angin.',
      'Rute Tumpak Sewu melewati aliran sungai dan tangga bambu; wajib mengenakan sandal gunung atau sepatu anti-selip.'
    ],
    cancellationPolicy: [
      'Perubahan jadwal gratis hingga 7 hari sebelum keberangkatan.',
      'Biaya pembatalan 50% dalam kurun waktu 3–6 hari sebelum keberangkatan.'
    ],
    reviews: [
      {
        id: 'r5',
        author: 'Bagus Setiawan',
        date: 'Okt 2026',
        rating: 5,
        comment:
          'Cuaca di Tumpak Sewu dan Bromo sangat cerah. Dengan jip privat, perjalanan kami jauh lebih fleksibel tanpa menunggu rombongan lain.'
      }
    ],
    availability: 6,
    minTravelers: 2,
    maxTravelers: 8,
    recommended: true
  },
  {
    id: 'pkg-swiss-alpine-6d5n',
    slug: 'swiss-alps-scenic-rail-lucerne-jungfrau-6d5n',
    name: 'Kereta Panorama Alpen Swiss: Zurich, Lucerne & Jungfrau',
    description:
      'Lintasi danau ikonik dan puncak bersalju Swiss dengan konektivitas Swiss Travel Pass, perjalanan Gunung Pilatus, dan ekskursi tak terlupakan ke puncak Jungfraujoch.',
    destination: 'Pegunungan Alpen Swiss & Lucerne',
    destinationId: 'dest-swiss',
    category: 'Liburan Keluarga',
    images: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '6 Hari 5 Malam',
    durationDays: 6,
    price: 34500000,
    childPriceMultiplier: 0.7,
    infantPriceMultiplier: 0.15,
    rating: 5.0,
    reviewCount: 41,
    highlights: [
      'Swiss Travel Pass 6 hari berturut-turut untuk kereta, kapal danau & bus',
      'Ekskursi Jungfraujoch – Top of Europe melalui gondola Eiger Express',
      'Perjalanan Golden Round Trip Gunung Pilatus melintasi Danau Lucerne',
      '2 malam hotel tepi danau Lucerne & 3 malam hotel Alpen Interlaken'
    ],
    packageOptions: [
      {
        id: 'opt-swiss-2nd',
        name: 'Kereta Swiss Kelas 2 + Hotel Bintang 4',
        description: 'Swiss Travel Pass Kelas 2 (6 Hari) + Akomodasi Bintang 4',
        priceDelta: 0
      },
      {
        id: 'opt-swiss-1st',
        name: 'Upgrade Kereta Panorama Kelas 1',
        description: 'Gerbong Panorama Kelas 1 + Kamar Pemandangan Danau',
        priceDelta: 4900000
      }
    ],
    departureDates: ['2026-12-10', '2027-01-14', '2027-02-18', '2027-05-12'],
    meetingPoint: 'Stasiun Kereta Bandara Zurich (ZRH)',
    departureLocation: 'Zurich, Swiss',
    travelSchedule: 'Hari 1 Tiba di Zurich • Hari 6 Kereta Kembali ke Bandara Zurich',
    accommodationSummary: '2 Malam Hotel Tepi Danau Lucerne + 3 Malam Hotel Alpen Interlaken',
    transportationSummary: 'Swiss Travel Pass + Gondola Eiger Express & Kereta Bergerigi',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan Zurich & Kereta Panorama ke Lucerne',
        description: 'Perjalanan kereta langsung dari Bandara Zurich menuju Lucerne. Jalan santai melewati Jembatan Kapel dan Kota Tua.',
        meals: ['Makan Malam'],
        accommodation: 'Hotel des Balances atau setaraf (Bintang 4)'
      },
      {
        day: 2,
        title: 'Golden Round Trip Gunung Pilatus',
        description: 'Pelayaran kapal uap di Danau Lucerne, kereta bergerigi tercuram di dunia menuju Pilatus Kulm, dan turun dengan kereta gantung.',
        meals: ['Sarapan'],
        accommodation: 'Hotel des Balances atau setaraf (Bintang 4)'
      },
      {
        day: 3,
        title: 'Kereta Panorama Lucerne–Interlaken Express',
        description: 'Menaiki kereta panorama melintasi jalur Brünig Pass melewati lima danau Alpen menuju Interlaken.',
        meals: ['Sarapan'],
        accommodation: 'Hotel Butik Alpen Interlaken (Bintang 4)'
      },
      {
        day: 4,
        title: 'Ekskursi Jungfraujoch – Top of Europe',
        description: 'Naik melalui gondola Eiger Express dan kereta Jungfrau menuju Istana Es dan Observatorium Sphinx di ketinggian 3.454 mdpl.',
        meals: ['Sarapan', 'Makan Siang'],
        accommodation: 'Hotel Butik Alpen Interlaken (Bintang 4)'
      },
      {
        day: 5,
        title: 'Lembah Lauterbrunnen & Pelayaran Danau Brienz',
        description: 'Menjelajahi lembah 72 air terjun Lauterbrunnen dan menikmati pelayaran sore di Danau Brienz yang jernih.',
        meals: ['Sarapan'],
        accommodation: 'Hotel Butik Alpen Interlaken (Bintang 4)'
      },
      {
        day: 6,
        title: 'Kepulangan Menuju Bandara Zurich',
        description: 'Sarapan di hotel dan koneksi kereta langsung menuju Bandara Zurich untuk penerbangan internasional pulang.',
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Akomodasi 5 malam hotel bintang 4 di Swiss termasuk sarapan prasmanan harian',
      'Swiss Travel Pass 6 hari berturut-turut (jaringan kereta, bus & kapal)',
      'Tiket reservasi pulang-pergi ekskursi gunung ke Jungfraujoch & Gunung Pilatus',
      'Makan malam penyambutan di Lucerne & makan siang Alpen di Jungfraujoch'
    ],
    exclusions: [
      'Tiket penerbangan internasional dari/ke Zurich (ZRH)',
      'Biaya pengurusan Visa Schengen & asuransi perjalanan wajib',
      'Pajak turis kota (sekitar CHF 3,50–4,50 per orang/malam dibayar saat check-in hotel)'
    ],
    importantNotes: [
      'Pemegang paspor Indonesia wajib memiliki Visa Schengen yang masih berlaku.',
      'Kacamata hitam dan pakaian hangat berlapis sangat diperlukan di Jungfraujoch sepanjang tahun.'
    ],
    cancellationPolicy: [
      'Tiket kereta pegunungan tidak dapat di-refund setelah diterbitkan.',
      'Komponen hotel mengikuti ketentuan pembatalan minimal 21 hari sebelumnya.'
    ],
    reviews: [
      {
        id: 'r6',
        author: 'Hendro & Keluarga',
        date: 'Agu 2026',
        rating: 5,
        comment:
          'Ketepatan waktu kereta Swiss dipadukan dengan voucher digital dari ASRIVA membuat perjalanan bersama anak-anak sangat praktis.'
      }
    ],
    availability: 8,
    minTravelers: 2,
    maxTravelers: 10,
    featured: true
  },
  {
    id: 'pkg-bali-group-corporate-3d2n',
    slug: 'bali-south-coast-cultural-group-tour-3d2n',
    name: 'Tur Grup Eksplorasi Budaya & Pesisir Bali',
    description:
      'Paket tur grup 3 hari bernilai hemat mencakup wisata bahari Tanjung Benoa, Taman Budaya Garuda Wisnu Kencana, makan malam hidangan laut Jimbaran, dan Pura Tanah Lot.',
    destination: 'Bali & Nusa Penida',
    destinationId: 'dest-bali',
    category: 'Tur Grup',
    images: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80'
    ],
    duration: '3 Hari 2 Malam',
    durationDays: 3,
    price: 2950000,
    discountPrice: 2490000,
    childPriceMultiplier: 0.75,
    infantPriceMultiplier: 0.1,
    rating: 4.7,
    reviewCount: 205,
    highlights: [
      'Gratis 1x permainan Banana Boat di Pantai Tanjung Benoa',
      'Makan malam hidangan laut bakar tepi pantai saat matahari terbenam di Jimbaran',
      'Kunjungan terpandu ke Taman Budaya GWK, Pura Ulun Danu Bedugul & Tanah Lot',
      'Bus pariwisata ber-AC yang nyaman bersama pemandu berlisensi HPI'
    ],
    packageOptions: [
      {
        id: 'opt-group-twin',
        name: 'Kamar Berbagi Twin / Triple',
        description: 'Hotel Bintang 4 Area Kuta/Nusa Dua (2–3 peserta per kamar)',
        priceDelta: 0
      },
      {
        id: 'opt-group-single',
        name: 'Kamar Single (1 Orang / Kamar)',
        description: 'Kamar privat sendiri selama tur 3H2M berlangsung',
        priceDelta: 850000
      }
    ],
    departureDates: ['2026-11-22', '2026-11-29', '2026-12-06', '2026-12-20'],
    meetingPoint: 'Bandara Internasional Ngurah Rai (DPS)',
    departureLocation: 'Kuta / Nusa Dua, Bali',
    travelSchedule: 'Hari 1 Tiba sebelum 12:00 WITA • Hari 3 Kepulangan setelah 14:00 WITA',
    accommodationSummary: '2 Malam Resor Kuta / Nusa Dua Bintang 4',
    transportationSummary: 'Bus Pariwisata Eksekutif / Hiace Commuter + Pemandu Berlisensi',
    itinerary: [
      {
        day: 1,
        title: 'Kedatangan, Taman Budaya GWK & Makan Malam Jimbaran',
        description: 'Penyambutan bandara, kunjungan patung Garuda Wisnu Kencana, Pantai Pandawa, dan makan malam seafood tepi pantai Jimbaran.',
        meals: ['Makan Malam'],
        accommodation: 'Hotel Bintang 4 Kuta / Nusa Dua'
      },
      {
        day: 2,
        title: 'Tanjung Benoa, Ulun Danu Bedugul & Tanah Lot',
        description: 'Permainan banana boat pagi di Tanjung Benoa, kunjungan pura danau Ulun Danu Beratan, serta panorama senja di Tanah Lot.',
        meals: ['Sarapan', 'Makan Siang', 'Makan Malam'],
        accommodation: 'Hotel Bintang 4 Kuta / Nusa Dua'
      },
      {
        day: 3,
        title: 'Pusat Oleh-Oleh Krisna & Pengantaran Bandara',
        description: 'Check-out hotel, belanja kerajinan khas Bali, dan pengantaran menuju bandara.',
        meals: ['Sarapan']
      }
    ],
    inclusions: [
      'Menginap 2 malam di hotel termasuk sarapan harian',
      'Bus grup ber-AC & pemandu wisata berlisensi HPI',
      'Gratis 1x aktivitas Banana Boat di Tanjung Benoa',
      'Seluruh tiket masuk wisata dan konsumsi sesuai jadwal'
    ],
    exclusions: [
      'Tiket pesawat & permainan olahraga air tambahan',
      'Tipping standar pemandu & pengemudi'
    ],
    importantNotes: [
      'Keberangkatan grup beroperasi sesuai tanggal terjadwal bersama peserta ASRIVA lainnya.'
    ],
    cancellationPolicy: [
      'Perubahan jadwal diperbolehkan hingga 10 hari sebelum keberangkatan.'
    ],
    reviews: [
      {
        id: 'r7',
        author: 'Ayu Lestari',
        date: 'Okt 2026',
        rating: 5,
        comment: 'Harga sangat terjangkau dan terorganisir dengan rapi! Cocok untuk liburan pertama kali ke Bali.'
      }
    ],
    availability: 18,
    minTravelers: 1,
    maxTravelers: 25,
    recommended: true,
    specialOffer: true
  }
];

const PAYMENT_CHANNELS: PaymentChannelOption[] = [
  {
    id: 'bank_transfer_verified',
    name: 'Transfer Bank (Verifikasi Manual)',
    type: 'manual_verification',
    description:
      'Kirim reservasi Anda sekarang dan selesaikan transfer dengan mencantumkan Kode Booking. Status pembayaran tetap Belum Dibayar hingga diverifikasi oleh tim Keuangan ASRIVA.',
    statusLabel: 'Tersedia — Verifikasi Manual',
    available: true
  },
  {
    id: 'office_settlement',
    name: 'Bayar di Kantor / Konter Resmi ASRIVA',
    type: 'pay_at_office',
    description:
      'Amankan slot reservasi Anda dan lakukan pelunasan langsung di konter layanan tur kami dengan menunjukkan Kode Booking.',
    statusLabel: 'Tersedia — Reservasi Slot',
    available: true
  },
  {
    id: 'online_gateway',
    name: 'Payment Gateway Otomatis (VA / QRIS / Kartu)',
    type: 'gateway_pending',
    description:
      'Integrasi payment gateway otomatis belum terhubung pada lingkungan aplikasi storefront ini.',
    statusLabel: 'Integrasi Belum Tersedia',
    available: false
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Kode Promo Musiman Tersedia',
    message: 'Gunakan kode ASRIVA250 saat pemesanan untuk potongan Rp 250.000 dengan minimum transaksi Rp 3.000.000.',
    time: 'Hari ini',
    unread: true
  },
  {
    id: 'n2',
    title: 'Fitur Guest Checkout Aktif',
    message: 'Pesan paket wisata domestik maupun internasional tanpa perlu mendaftar atau login akun.',
    time: '2 hari lalu',
    unread: false
  }
];

// ============================================================================
// 3. UTILITY FUNCTIONS
// ============================================================================

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDateReadable(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(dateObj.getTime())) return isoDate;
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function calculateReturnDate(departureIso: string, durationDays: number): string {
  if (!departureIso) return '-';
  const parts = departureIso.split('-');
  if (parts.length !== 3) return '-';
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(dateObj.getTime())) return '-';
  dateObj.setDate(dateObj.getDate() + Math.max(0, durationDays - 1));
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return formatDateReadable(`${y}-${m}-${d}`);
}

function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const now = new Date();
  const ym = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `ASR-${ym}-${suffix}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()+]/g, '');
  return /^\d{8,15}$/.test(digits);
}

interface PricingBreakdown {
  optionDelta: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  infantUnitPrice: number;
  adultsTotal: number;
  childrenTotal: number;
  infantsTotal: number;
  baseSubtotal: number;
  packageDiscountTotal: number;
  subtotalAfterPackageDiscount: number;
  promoDiscount: number;
  promoCodeValid: boolean;
  promoLabel?: string;
  serviceFee: number;
  totalAmount: number;
  totalTravelers: number;
}

function calculateBookingPricing(
  pkg: TravelPackage,
  optionId: string,
  adults: number,
  children: number,
  infants: number,
  promoCodeInput: string
): PricingBreakdown {
  const selectedOption = pkg.packageOptions.find((o) => o.id === optionId) || pkg.packageOptions[0];
  const optionDelta = selectedOption ? selectedOption.priceDelta : 0;

  const unitBasePrice = pkg.price + optionDelta;
  const unitEffectivePrice = (pkg.discountPrice ?? pkg.price) + optionDelta;

  const adultBase = unitBasePrice;
  const childBase = Math.round(unitBasePrice * pkg.childPriceMultiplier);
  const infantBase = Math.round(unitBasePrice * pkg.infantPriceMultiplier);

  const adultUnitPrice = unitEffectivePrice;
  const childUnitPrice = Math.round(unitEffectivePrice * pkg.childPriceMultiplier);
  const infantUnitPrice = Math.round(unitEffectivePrice * pkg.infantPriceMultiplier);

  const baseSubtotal = adults * adultBase + children * childBase + infants * infantBase;
  const adultsTotal = adults * adultUnitPrice;
  const childrenTotal = children * childUnitPrice;
  const infantsTotal = infants * infantUnitPrice;

  const subtotalAfterPackageDiscount = adultsTotal + childrenTotal + infantsTotal;
  const packageDiscountTotal = Math.max(0, baseSubtotal - subtotalAfterPackageDiscount);

  const normalizedPromo = promoCodeInput.trim().toUpperCase();
  const promoRule = PROMO_CODES[normalizedPromo];
  const promoCodeValid = Boolean(promoRule && subtotalAfterPackageDiscount >= promoRule.minSpend);
  const promoDiscount = promoCodeValid ? promoRule.amount : 0;

  const serviceFee = subtotalAfterPackageDiscount > 0 ? 50000 : 0;
  const totalAmount = Math.max(0, subtotalAfterPackageDiscount - promoDiscount + serviceFee);
  const totalTravelers = adults + children + infants;

  return {
    optionDelta,
    adultUnitPrice,
    childUnitPrice,
    infantUnitPrice,
    adultsTotal,
    childrenTotal,
    infantsTotal,
    baseSubtotal,
    packageDiscountTotal,
    subtotalAfterPackageDiscount,
    promoDiscount,
    promoCodeValid,
    promoLabel: promoCodeValid ? promoRule.label : undefined,
    serviceFee,
    totalAmount,
    totalTravelers
  };
}

function reconcileTravelers(
  existing: Traveler[],
  adults: number,
  children: number,
  infants: number
): Traveler[] {
  const desiredTypes: ('Adult' | 'Child' | 'Infant')[] = [
    ...Array(adults).fill('Adult'),
    ...Array(children).fill('Child'),
    ...Array(infants).fill('Infant')
  ];

  return desiredTypes.map((type, index) => {
    const prev = existing[index];
    if (prev) {
      return {
        ...prev,
        type
      };
    }
    return {
      id: `trav-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      fullName: '',
      dateOfBirth: '',
      gender: '',
      identityNumber: '',
      specialRequirements: ''
    };
  });
}

// ============================================================================
// 4. GLOBAL STYLES (DEEP NAVY & OCEAN BLUE DESIGN SYSTEM)
// ============================================================================

const GLOBAL_STYLES = `
:root {
  --color-navy: #0B2545;
  --color-navy-dark: #06172D;
  --color-ocean: #136F99;
  --color-ocean-light: #E7F3F8;
  --color-accent: #D97706;
  --color-accent-light: #FEF3C7;
  --color-bg: #F4F6F9;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text: #111827;
  --color-text-secondary: #4B5563;
  --color-text-muted: #9CA3AF;
  --radius-md: 14px;
  --radius-lg: 20px;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
  background-color: #E2E8F0;
  color: var(--color-text);
}

#root {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: var(--color-bg);
  box-shadow: 0 0 40px rgba(11, 37, 69, 0.14);
}

.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg);
}

.app-header {
  flex-shrink: 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding-top: env(safe-area-inset-top, 0px);
  z-index: 20;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.bottom-nav {
  flex-shrink: 0;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 20;
}

.bottom-action-bar {
  flex-shrink: 0;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -4px 16px rgba(11, 37, 69, 0.06);
  z-index: 20;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0.6;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.18s ease-out forwards;
}
`;

// ============================================================================
// 5. REUSABLE UI COMPONENTS
// ============================================================================

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'navy' | 'ocean' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}> = ({ children, variant = 'ocean', className = '' }) => {
  const styles: Record<string, string> = {
    navy: 'bg-[#0B2545] text-white',
    ocean: 'bg-[#E7F3F8] text-[#136F99]',
    accent: 'bg-[#FEF3C7] text-[#B45309]',
    success: 'bg-[#ECFDF5] text-[#047857]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    error: 'bg-[#FEF2F2] text-[#B91C1C]',
    neutral: 'bg-slate-100 text-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const AlertBanner: React.FC<{
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ type = 'info', title, children, className = '' }) => {
  const config = {
    info: {
      bg: 'bg-[#E7F3F8] border-[#BAE6FD] text-[#0B2545]',
      icon: <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#136F99]" />
    },
    warning: {
      bg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
      icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
    },
    error: {
      bg: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
    },
    success: {
      bg: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]',
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" />
    }
  }[type];

  return (
    <div className={`rounded-xl border p-3 text-xs leading-relaxed flex gap-2.5 ${config.bg} ${className}`}>
      {config.icon}
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold mb-0.5">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
    <div className="w-12 h-12 rounded-2xl bg-[#E7F3F8] text-[#136F99] flex items-center justify-center mb-3">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mb-4">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-semibold active:scale-[0.98] transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const ModalDialog: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-[440px] max-h-[82%] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-xs text-slate-600 leading-relaxed">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

const BottomSheet: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 bg-slate-900/50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-h-[85%] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

const PackageCard: React.FC<{
  pkg: TravelPackage;
  onSelect: (pkgId: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (pkgId: string) => void;
  compact?: boolean;
}> = ({ pkg, onSelect, isWishlisted, onToggleWishlist, compact = false }) => {
  const effectivePrice = pkg.discountPrice ?? pkg.price;
  const hasDiscount = typeof pkg.discountPrice === 'number' && pkg.discountPrice < pkg.price;
  const discountPercent = hasDiscount
    ? Math.round(((pkg.price - pkg.discountPrice!) / pkg.price) * 100)
    : 0;

  if (compact) {
    return (
      <div
        onClick={() => onSelect(pkg.id)}
        className="w-[248px] shrink-0 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs active:scale-[0.99] transition cursor-pointer flex flex-col"
      >
        <div className="relative h-32 w-full bg-slate-200">
          <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" loading="lazy" />
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B2545]/85 text-white backdrop-blur-xs">
            {pkg.category}
          </span>
          <button
            type="button"
            aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(pkg.id);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-xs active:scale-90 transition"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
          </button>
          {hasDiscount && (
            <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D97706] text-white">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1">
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-[#136F99] shrink-0" />
                <span className="truncate">{pkg.destination}</span>
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-slate-700 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {pkg.rating.toFixed(1)}
              </span>
            </div>
            <h4 className="text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5">{pkg.name}</h4>
            <div className="text-[11px] text-slate-500 flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {pkg.duration}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">Sisa {pkg.availability} kursi</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              {hasDiscount && (
                <div className="text-[10px] text-slate-400 line-through">{formatIDR(pkg.price)}</div>
              )}
              <div className="text-sm font-extrabold text-[#0B2545]">{formatIDR(effectivePrice)}</div>
              <div className="text-[10px] text-slate-400">per dewasa</div>
            </div>
            <span className="px-2.5 py-1.5 rounded-lg bg-[#E7F3F8] text-[#136F99] text-[11px] font-bold">
              Detail
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(pkg.id)}
      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs active:scale-[0.99] transition cursor-pointer"
    >
      <div className="relative h-44 w-full bg-slate-200">
        <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#0B2545] shadow-xs">
            {pkg.category}
          </span>
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D97706] text-white shadow-xs">
              Hemat {discountPercent}%
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(pkg.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shadow-xs active:scale-90 transition"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            {pkg.destination}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {pkg.rating.toFixed(1)} ({pkg.reviewCount})
            </span>
            <span className="inline-flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {pkg.duration}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1.5">{pkg.name}</h3>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
          <span className="inline-flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#136F99] shrink-0" />
            <span className="truncate">
              Jadwal terdekat: <strong className="text-slate-700">{formatDateReadable(pkg.departureDates[0])}</strong>
            </span>
          </span>
          <Badge variant="success" className="shrink-0">
            Tersedia {pkg.availability} kursi
          </Badge>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Mulai dari</div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through leading-tight">{formatIDR(pkg.price)}</div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(effectivePrice)}</span>
              <span className="text-[11px] text-slate-500">/ pax</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(pkg.id);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold shadow-xs hover:bg-[#06172D] active:scale-[0.98] transition inline-flex items-center gap-1"
          >
            <span>Lihat Detail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. MAIN APPLICATION COMPONENT (SINGLE APP.TSX)
// ============================================================================

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [standalone, setStandalone] = useState<StandaloneView>(null);

  // Storefront Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under5m' | '5mto15m' | 'above15m'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | '1to3' | '4to5' | '6plus'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating_desc'>('recommended');
  const [filterSheetOpen, setFilterSheetOpen] = useState<boolean>(false);

  // Wishlist & Notifications State
  const [wishlistIds, setWishlistIds] = useState<string[]>(['pkg-bali-ubud-4d3n']);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false);

  // Package Detail Gallery State
  const [galleryIndex, setGalleryIndex] = useState<number>(0);

  // Booking Draft & Checkout State
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    packageId: PACKAGES_DATA[0].id,
    optionId: PACKAGES_DATA[0].packageOptions[0].id,
    departureDate: PACKAGES_DATA[0].departureDates[0] || '',
    adults: 2,
    children: 0,
    infants: 0,
    travelers: reconcileTravelers([], 2, 0, 0),
    promoCode: '',
    specialRequest: ''
  });

  const [guestInfo, setGuestInfo] = useState<GuestInformation>({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: ''
  });
  const [sameWhatsappAsPhone, setSameWhatsappAsPhone] = useState<boolean>(true);
  const [contactIsMainTraveler, setContactIsMainTraveler] = useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('bank_transfer_verified');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Bookings Store & My Trips Filter State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tripSubTab, setTripSubTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [lookupRef, setLookupRef] = useState<string>('');
  const [lookupContact, setLookupContact] = useState<string>('');
  const [lookupError, setLookupError] = useState<string>('');
  const [verifiedBookingRefs, setVerifiedBookingRefs] = useState<string[]>([]);

  // Global Modals & Toasts
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const toggleWishlist = useCallback(
    (pkgId: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(pkgId);
        if (exists) {
          showToast('Dihapus dari Wishlist.', 'info');
          return prev.filter((id) => id !== pkgId);
        } else {
          showToast('Disimpan ke Wishlist.', 'success');
          return [...prev, pkgId];
        }
      });
    },
    [showToast]
  );

  // Sync WhatsApp when checkbox active
  useEffect(() => {
    if (sameWhatsappAsPhone) {
      setGuestInfo((prev) => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [sameWhatsappAsPhone, guestInfo.phone]);

  // Sync Main Traveler when "Contact Person is the Main Traveler" is toggled
  useEffect(() => {
    if (contactIsMainTraveler) {
      setBookingDraft((prev) => {
        if (prev.travelers.length === 0) return prev;
        const updated = [...prev.travelers];
        updated[0] = {
          ...updated[0],
          fullName: guestInfo.fullName
        };
        return { ...prev, travelers: updated };
      });
    }
  }, [contactIsMainTraveler, guestInfo.fullName]);

  const activeBookingPackage = useMemo(() => {
    return PACKAGES_DATA.find((p) => p.id === bookingDraft.packageId) || PACKAGES_DATA[0];
  }, [bookingDraft.packageId]);

  const activePricing = useMemo(() => {
    return calculateBookingPricing(
      activeBookingPackage,
      bookingDraft.optionId,
      bookingDraft.adults,
      bookingDraft.children,
      bookingDraft.infants,
      bookingDraft.promoCode
    );
  }, [
    activeBookingPackage,
    bookingDraft.optionId,
    bookingDraft.adults,
    bookingDraft.children,
    bookingDraft.infants,
    bookingDraft.promoCode
  ]);

  const filteredPackages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PACKAGES_DATA.filter((pkg) => {
      if (q) {
        const matchName = pkg.name.toLowerCase().includes(q);
        const matchDest = pkg.destination.toLowerCase().includes(q);
        const matchCat = pkg.category.toLowerCase().includes(q);
        const matchDesc = pkg.description.toLowerCase().includes(q);
        if (!matchName && !matchDest && !matchCat && !matchDesc) return false;
      }
      if (selectedCategory !== 'Semua' && pkg.category !== selectedCategory) return false;
      if (selectedDestinationFilter !== 'All' && pkg.destinationId !== selectedDestinationFilter) return false;

      const effPrice = pkg.discountPrice ?? pkg.price;
      if (priceFilter === 'under5m' && effPrice >= 5000000) return false;
      if (priceFilter === '5mto15m' && (effPrice < 5000000 || effPrice > 15000000)) return false;
      if (priceFilter === 'above15m' && effPrice <= 15000000) return false;

      if (durationFilter === '1to3' && pkg.durationDays > 3) return false;
      if (durationFilter === '4to5' && (pkg.durationDays < 4 || pkg.durationDays > 5)) return false;
      if (durationFilter === '6plus' && pkg.durationDays < 6) return false;

      return true;
    });

    return [...list].sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, selectedDestinationFilter, priceFilter, durationFilter, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Semua') count++;
    if (selectedDestinationFilter !== 'All') count++;
    if (priceFilter !== 'all') count++;
    if (durationFilter !== 'all') count++;
    return count;
  }, [selectedCategory, selectedDestinationFilter, priceFilter, durationFilter]);

  // Navigation Helpers
  const openPackageDetail = (packageId: string) => {
    setGalleryIndex(0);
    setStandalone({ type: 'package', packageId });
  };

  const openDestinationDetail = (destinationId: string) => {
    setStandalone({ type: 'destination', destinationId });
  };

  const startBookingForPackage = (packageId: string) => {
    const pkg = PACKAGES_DATA.find((p) => p.id === packageId);
    if (!pkg) {
      showToast('Paket wisata yang dipilih tidak ditemukan.', 'error');
      return;
    }

    setBookingDraft((prev) => {
      const isSamePkg = prev.packageId === pkg.id;
      const defaultAdults = Math.max(pkg.minTravelers, isSamePkg ? prev.adults : 2);
      const validAdults = Math.min(defaultAdults, pkg.maxTravelers);
      const validChildren = isSamePkg && validAdults + prev.children <= pkg.maxTravelers ? prev.children : 0;
      const validInfants = isSamePkg ? prev.infants : 0;
      const validDate =
        isSamePkg && pkg.departureDates.includes(prev.departureDate)
          ? prev.departureDate
          : pkg.departureDates[0] || '';
      const validOption =
        isSamePkg && pkg.packageOptions.some((o) => o.id === prev.optionId)
          ? prev.optionId
          : pkg.packageOptions[0].id;

      return {
        packageId: pkg.id,
        optionId: validOption,
        departureDate: validDate,
        adults: validAdults,
        children: validChildren,
        infants: validInfants,
        travelers: reconcileTravelers(isSamePkg ? prev.travelers : [], validAdults, validChildren, validInfants),
        promoCode: isSamePkg ? prev.promoCode : '',
        specialRequest: isSamePkg ? prev.specialRequest : ''
      };
    });
    setFormErrors({});
    setStandalone({ type: 'booking', packageId: pkg.id });
  };

  const updateTravelerCounts = (newAdults: number, newChildren: number, newInfants: number) => {
    const pkg = activeBookingPackage;
    const totalSeats = newAdults + newChildren;
    if (newAdults < 1) {
      showToast('Minimal 1 peserta dewasa diperlukan.', 'warning');
      return;
    }
    if (totalSeats > pkg.maxTravelers) {
      showToast(`Maksimal ${pkg.maxTravelers} peserta diperbolehkan untuk paket ini.`, 'warning');
      return;
    }
    if (newInfants > newAdults) {
      showToast('Jumlah bayi tidak boleh melebihi peserta dewasa.', 'warning');
      return;
    }

    setBookingDraft((prev) => {
      const nextTravelers = reconcileTravelers(prev.travelers, newAdults, newChildren, newInfants);
      if (contactIsMainTraveler && nextTravelers.length > 0) {
        nextTravelers[0] = { ...nextTravelers[0], fullName: guestInfo.fullName };
      }
      return {
        ...prev,
        adults: newAdults,
        children: newChildren,
        infants: newInfants,
        travelers: nextTravelers
      };
    });
  };

  const handleProceedToCheckout = () => {
    const pkg = activeBookingPackage;
    const totalSeats = bookingDraft.adults + bookingDraft.children;
    if (!bookingDraft.departureDate) {
      showToast('Silakan pilih tanggal keberangkatan terlebih dahulu.', 'error');
      return;
    }
    if (totalSeats < pkg.minTravelers) {
      showToast(`Paket ini mensyaratkan minimal ${pkg.minTravelers} peserta.`, 'error');
      return;
    }
    if (totalSeats > pkg.maxTravelers) {
      showToast(`Maksimal ${pkg.maxTravelers} peserta diperbolehkan.`, 'error');
      return;
    }
    setFormErrors({});
    setStandalone({ type: 'checkout' });
  };

  const validateCheckoutForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!bookingDraft.packageId) errors.package = 'Belum ada paket wisata yang dipilih.';
    if (!bookingDraft.departureDate) errors.departureDate = 'Tanggal keberangkatan wajib dipilih.';

    if (!guestInfo.fullName.trim() || guestInfo.fullName.trim().length < 3) {
      errors.guestFullName = 'Masukkan nama lengkap pemesan (minimal 3 karakter).';
    }
    if (!guestInfo.email.trim() || !isValidEmail(guestInfo.email)) {
      errors.guestEmail = 'Masukkan alamat email yang valid untuk konfirmasi pemesanan.';
    }
    if (!guestInfo.phone.trim() || !isValidPhone(guestInfo.phone)) {
      errors.guestPhone = 'Masukkan nomor telepon yang valid (8–15 digit).';
    }
    const effectiveWa = sameWhatsappAsPhone ? guestInfo.phone : guestInfo.whatsapp;
    if (effectiveWa && !isValidPhone(effectiveWa)) {
      errors.guestWhatsapp = 'Masukkan nomor WhatsApp yang valid.';
    }

    bookingDraft.travelers.forEach((t, idx) => {
      if (!t.fullName.trim() || t.fullName.trim().length < 2) {
        errors[`traveler_${idx}_name`] = `Nama lengkap Peserta #${idx + 1} wajib diisi.`;
      }
      if (!t.gender) {
        errors[`traveler_${idx}_gender`] = `Pilih jenis kelamin untuk Peserta #${idx + 1}.`;
      }
    });

    const chosenPayment = PAYMENT_CHANNELS.find((c) => c.id === selectedPaymentId);
    if (!chosenPayment || !chosenPayment.available) {
      errors.paymentMethod = 'Silakan pilih metode penyelesaian pembayaran yang tersedia.';
    }

    if (!agreedTerms) {
      errors.terms = 'Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = async () => {
    if (isSubmittingBooking) return;
    if (!validateCheckoutForm()) {
      showToast('Mohon lengkapi seluruh kolom wajib yang ditandai merah.', 'error');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 850));

      const chosenPayment = PAYMENT_CHANNELS.find((c) => c.id === selectedPaymentId)!;
      const chosenOption =
        activeBookingPackage.packageOptions.find((o) => o.id === bookingDraft.optionId) ||
        activeBookingPackage.packageOptions[0];
      const reference = generateBookingReference();
      const effectiveWhatsapp = sameWhatsappAsPhone ? guestInfo.phone.trim() : guestInfo.whatsapp.trim();

      const newBooking: Booking = {
        bookingReference: reference,
        createdAt: new Date().toISOString(),
        packageId: activeBookingPackage.id,
        packageName: activeBookingPackage.name,
        optionName: chosenOption.name,
        destination: activeBookingPackage.destination,
        duration: activeBookingPackage.duration,
        packageImage: activeBookingPackage.images[0],
        guest: {
          fullName: guestInfo.fullName.trim(),
          email: guestInfo.email.trim(),
          phone: guestInfo.phone.trim(),
          whatsapp: effectiveWhatsapp
        },
        travelers: bookingDraft.travelers.map((t) => ({
          ...t,
          fullName: t.fullName.trim(),
          identityNumber: t.identityNumber.trim(),
          specialRequirements: t.specialRequirements.trim()
        })),
        departureDate: bookingDraft.departureDate,
        meetingPoint: activeBookingPackage.meetingPoint,
        departureLocation: activeBookingPackage.departureLocation,
        adults: bookingDraft.adults,
        children: bookingDraft.children,
        infants: bookingDraft.infants,
        subtotal: activePricing.baseSubtotal,
        discountTotal: activePricing.packageDiscountTotal,
        promoDiscount: activePricing.promoDiscount,
        promoCodeApplied: activePricing.promoCodeValid ? bookingDraft.promoCode.trim().toUpperCase() : undefined,
        serviceFee: activePricing.serviceFee,
        totalAmount: activePricing.totalAmount,
        specialRequest: bookingDraft.specialRequest.trim(),
        paymentMethodId: chosenPayment.id,
        paymentMethodName: chosenPayment.name,
        tripCategory: 'upcoming',
        bookingStatus:
          chosenPayment.type === 'pay_at_office'
            ? 'Terkonfirmasi - Slot Ditahan'
            : 'Menunggu Verifikasi Pembayaran',
        paymentStatus: 'Belum Dibayar - Menunggu Pembayaran'
      };

      setBookings((prev) => [newBooking, ...prev]);
      setVerifiedBookingRefs((prev) => (prev.includes(reference) ? prev : [reference, ...prev]));
      setLookupRef(reference);
      setLookupContact(guestInfo.email.trim());
      setStandalone({ type: 'confirmation', bookingReference: reference });
      showToast(`Pemesanan ${reference} berhasil dibuat.`, 'success');
    } catch {
      showToast('Gagal memproses permintaan pemesanan. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelBooking = (bookingReference: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingReference === bookingReference
          ? {
              ...b,
              tripCategory: 'cancelled',
              bookingStatus: 'Dibatalkan',
              paymentStatus: 'Dibatalkan'
            }
          : b
      )
    );
    showToast(`Pemesanan ${bookingReference} telah dibatalkan.`, 'info');
  };

  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const refInput = lookupRef.trim().toUpperCase();
    const contactInput = lookupContact.trim().toLowerCase();

    if (!refInput || !contactInput) {
      setLookupError('Masukkan Kode Booking serta Email atau Nomor Telepon yang terdaftar.');
      return;
    }

    const found = bookings.find((b) => {
      const refMatches = b.bookingReference.toUpperCase() === refInput;
      const emailMatches = b.guest.email.toLowerCase() === contactInput;
      const phoneClean = b.guest.phone.replace(/[\s\-()+]/g, '');
      const inputPhoneClean = contactInput.replace(/[\s\-()+]/g, '');
      const phoneMatches = inputPhoneClean.length >= 6 && phoneClean === inputPhoneClean;
      return refMatches && (emailMatches || phoneMatches);
    });

    if (!found) {
      setLookupError(
        'Data pemesanan tidak ditemukan. Periksa kembali Kode Booking dan Email atau Nomor Telepon yang digunakan saat checkout.'
      );
      return;
    }

    setVerifiedBookingRefs((prev) =>
      prev.includes(found.bookingReference) ? prev : [found.bookingReference, ...prev]
    );
    setTripSubTab(found.tripCategory);
    showToast('Pemesanan berhasil diverifikasi.', 'success');
  };

  const formatTravelerTypeLabel = (type: Traveler['type']) => {
    if (type === 'Adult') return 'Dewasa';
    if (type === 'Child') return 'Anak';
    return 'Bayi';
  };

  // ============================================================================
  // 7. STANDALONE PAGES RENDERERS
  // ============================================================================

  const renderStandaloneHeader = (title: string, onBack: () => void, rightSlot?: React.ReactNode) => (
    <header className="app-header px-3.5 py-3 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali"
        className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h1 className="text-[15px] font-bold text-slate-900 truncate flex-1 text-center">{title}</h1>
      <div className="min-w-[36px] flex justify-end shrink-0">{rightSlot}</div>
    </header>
  );

  // DESTINATION DETAIL PAGE
  const renderDestinationPage = (destinationId: string) => {
    const dest = DESTINATIONS_DATA.find((d) => d.id === destinationId);
    if (!dest) {
      return (
        <div className="app-shell">
          {renderStandaloneHeader('Destinasi', () => setStandalone(null))}
          <div className="app-content p-4">
            <EmptyState
              icon={<MapPin className="w-6 h-6" />}
              title="Destinasi Tidak Ditemukan"
              description="Destinasi yang Anda minta tidak dapat dimuat."
              actionLabel="Kembali ke Eksplorasi"
              onAction={() => {
                setStandalone(null);
                setActiveTab('explore');
              }}
            />
          </div>
        </div>
      );
    }

    const relatedPackages = PACKAGES_DATA.filter((p) => p.destinationId === dest.id);
    const otherDestinations = DESTINATIONS_DATA.filter((d) => d.id !== dest.id);

    return (
      <div className="app-shell">
        {renderStandaloneHeader(dest.name, () => setStandalone(null))}
        <div className="app-content pb-8">
          <div className="relative h-56 w-full bg-slate-800">
            <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <Badge variant="accent" className="mb-1.5">
                {dest.country} • {dest.region}
              </Badge>
              <h2 className="text-xl font-extrabold leading-tight">{dest.name}</h2>
              <p className="text-xs text-slate-200 mt-0.5">{dest.tagline}</p>
            </div>
          </div>

          <div className="p-4 space-y-5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Tentang {dest.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{dest.description}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Informasi Penting Perjalanan</h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Waktu Terbaik</div>
                  <div className="font-bold text-slate-800 mt-0.5">{dest.bestTimeToVisit}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Mata Uang</div>
                  <div className="font-bold text-slate-800 mt-0.5">{dest.currency}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Bahasa</div>
                  <div className="font-bold text-slate-800 mt-0.5">{dest.language}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Zona Waktu</div>
                  <div className="font-bold text-slate-800 mt-0.5">{dest.timezone}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2.5">Galeri Destinasi</h3>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                {dest.gallery.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`Foto ${dest.name} ${idx + 1}`}
                    className="w-40 h-28 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Daya Tarik Populer</h3>
              {dest.popularAttractions.map((attr, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{attr.name}</span>
                    <Badge variant="ocean">{attr.category}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{attr.description}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2.5">
                Paket Wisata Tersedia ({relatedPackages.length})
              </h3>
              <div className="space-y-3">
                {relatedPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onSelect={openPackageDetail}
                    isWishlisted={wishlistIds.includes(pkg.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2.5">Jelajahi Destinasi Lainnya</h3>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                {otherDestinations.map((other) => (
                  <button
                    key={other.id}
                    type="button"
                    onClick={() => openDestinationDetail(other.id)}
                    className="w-36 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200 text-left shadow-xs"
                  >
                    <img src={other.heroImage} alt={other.name} className="w-full h-20 object-cover" />
                    <div className="p-2">
                      <div className="text-xs font-bold text-slate-900 truncate">{other.name}</div>
                      <div className="text-[10px] text-slate-500">{other.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // TOUR DETAILS PAGE
  const renderPackageDetailPage = (packageId: string) => {
    const pkg = PACKAGES_DATA.find((p) => p.id === packageId);
    if (!pkg) {
      return (
        <div className="app-shell">
          {renderStandaloneHeader('Detail Paket', () => setStandalone(null))}
          <div className="app-content p-4">
            <EmptyState
              icon={<Briefcase className="w-6 h-6" />}
              title="Paket Wisata Tidak Ditemukan"
              description="Paket perjalanan ini tidak tersedia atau telah dihapus."
              actionLabel="Jelajahi Paket Lain"
              onAction={() => {
                setStandalone(null);
                setActiveTab('explore');
              }}
            />
          </div>
        </div>
      );
    }

    const effectivePrice = pkg.discountPrice ?? pkg.price;
    const hasDiscount = typeof pkg.discountPrice === 'number' && pkg.discountPrice < pkg.price;
    const safeImgIdx = Math.min(galleryIndex, pkg.images.length - 1);
    const isWishlisted = wishlistIds.includes(pkg.id);

    return (
      <div className="app-shell">
        {renderStandaloneHeader(
          'Detail Paket Wisata',
          () => setStandalone(null),
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleWishlist(pkg.id)}
              aria-label="Simpan ke wishlist"
              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => showToast('Tautan paket berhasil disalin.', 'success')}
              aria-label="Bagikan paket"
              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="app-content pb-6">
          {/* Image Gallery */}
          <div className="relative h-60 w-full bg-slate-900">
            <img
              src={pkg.images[safeImgIdx]}
              alt={`${pkg.name} ${safeImgIdx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex gap-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
                {pkg.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    aria-label={`Lihat foto ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === safeImgIdx ? 'w-5 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold">
                {safeImgIdx + 1} / {pkg.images.length}
              </span>
            </div>
          </div>

          {pkg.images.length > 1 && (
            <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
              {pkg.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGalleryIndex(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    i === safeImgIdx ? 'border-[#0B2545]' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Title, Destination, Rating, Description */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <Badge variant="ocean">{pkg.category}</Badge>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{pkg.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({pkg.reviewCount} ulasan)</span>
                </div>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 leading-snug mb-1.5">{pkg.name}</h2>

              <button
                type="button"
                onClick={() => openDestinationDetail(pkg.destinationId)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#136F99] mb-3"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{pkg.destination}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

              <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3.5 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E7F3F8] text-[#136F99] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Durasi</div>
                    <div className="font-bold text-slate-800">{pkg.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E7F3F8] text-[#136F99] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Ketersediaan</div>
                    <div className="font-bold text-emerald-700">Sisa {pkg.availability} Kursi</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2.5">Keunggulan Pengalaman</h3>
              <ul className="space-y-2">
                {pkg.highlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meeting Point & Departure Dates */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#136F99]" />
                <span>Jadwal Keberangkatan & Titik Kumpul</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {pkg.departureDates.map((dateStr) => (
                  <span
                    key={dateStr}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    {formatDateReadable(dateStr)}
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <strong className="text-slate-700">Lokasi Keberangkatan:</strong> {pkg.departureLocation}
                </div>
                <div>
                  <strong className="text-slate-700">Titik Kumpul:</strong> {pkg.meetingPoint}
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Rencana Perjalanan (Itinerary)</h3>
              <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7F3F8]">
                {pkg.itinerary.map((item) => (
                  <div key={item.day} className="relative pl-8">
                    <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#0B2545] text-white text-[11px] font-bold flex items-center justify-center">
                      {item.day}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mb-1">
                      Hari {item.day}: {item.title}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{item.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.meals && item.meals.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                          <Utensils className="w-2.5 h-2.5" />
                          {item.meals.join(', ')}
                        </span>
                      )}
                      {item.accommodation && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          <Hotel className="w-2.5 h-2.5" />
                          {item.accommodation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included & Excluded Services */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Layanan Termasuk</h3>
                <ul className="space-y-1.5">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Layanan Tidak Termasuk</h3>
                <ul className="space-y-1.5">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Important Information & Cancellation Policy */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Catatan Penting</h3>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                  {pkg.importantNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Kebijakan Pembatalan</h3>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                  {pkg.cancellationPolicy.map((pol, i) => (
                    <li key={i}>{pol}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Ulasan Pelanggan</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B2545]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {pkg.rating.toFixed(1)} ({pkg.reviewCount})
                </span>
              </div>
              <div className="space-y-2.5">
                {pkg.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{rev.author}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400 mb-1.5">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Booking CTA */}
        <div className="bottom-action-bar flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Harga per dewasa</div>
            {hasDiscount && (
              <div className="text-[11px] text-slate-400 line-through leading-none">{formatIDR(pkg.price)}</div>
            )}
            <div className="text-base font-extrabold text-[#0B2545]">{formatIDR(effectivePrice)}</div>
          </div>
          <button
            type="button"
            onClick={() => startBookingForPackage(pkg.id)}
            className="px-6 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-md hover:bg-[#06172D] active:scale-[0.98] transition"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    );
  };

  // BOOKING SYSTEM PAGE
  const renderBookingPage = (packageId: string) => {
    const pkg = PACKAGES_DATA.find((p) => p.id === packageId) || activeBookingPackage;
    const totalSeats = bookingDraft.adults + bookingDraft.children;
    const isCountValid =
      totalSeats >= pkg.minTravelers && totalSeats <= pkg.maxTravelers && Boolean(bookingDraft.departureDate);

    return (
      <div className="app-shell">
        {renderStandaloneHeader('Atur Pemesanan', () =>
          setStandalone({ type: 'package', packageId: pkg.id })
        )}

        <div className="app-content p-4 space-y-4 pb-8">
          {/* Selected Package Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex gap-3">
            <img src={pkg.images[0]} alt={pkg.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <Badge variant="ocean" className="mb-1">
                {pkg.category}
              </Badge>
              <h2 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{pkg.name}</h2>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>{pkg.destination}</span>
                <span>•</span>
                <span>{pkg.duration}</span>
              </div>
            </div>
          </div>

          {/* Select Package Options */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">Pilih Opsi Paket</h3>
            {pkg.packageOptions.map((opt) => {
              const selected = bookingDraft.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBookingDraft((prev) => ({ ...prev, optionId: opt.id }))}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                    selected
                      ? 'border-[#136F99] bg-[#E7F3F8]/70'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.description}</div>
                    <div className="text-[11px] font-bold text-[#136F99] mt-1">
                      {opt.priceDelta === 0 ? 'Termasuk dalam harga dasar' : `+${formatIDR(opt.priceDelta)} / dewasa`}
                    </div>
                  </div>
                  {selected && <CheckCircle2 className="w-4 h-4 text-[#136F99] shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Departure Date Selector */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Pilih Tanggal Keberangkatan <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">Pilih jadwal keberangkatan yang tersedia.</p>
            <div className="grid grid-cols-2 gap-2">
              {pkg.departureDates.map((dateStr) => {
                const isSelected = bookingDraft.departureDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setBookingDraft((prev) => ({ ...prev, departureDate: dateStr }))}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{formatDateReadable(dateStr)}</div>
                      <div className="text-[10px] opacity-75">
                        Selesai {calculateReturnDate(dateStr, pkg.durationDays)}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#136F99] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Participant Counters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jumlah Peserta</h3>
                <p className="text-[11px] text-slate-500">
                  Min. {pkg.minTravelers} – Maks. {pkg.maxTravelers} kursi per pemesanan
                </p>
              </div>
              <Badge variant="neutral">{activePricing.totalTravelers} Pax</Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Dewasa (12+ thn)</div>
                <div className="text-[11px] text-[#136F99] font-semibold">
                  {formatIDR(activePricing.adultUnitPrice)} / pax
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateTravelerCounts(bookingDraft.adults - 1, bookingDraft.children, bookingDraft.infants)
                  }
                  disabled={bookingDraft.adults <= 1}
                  aria-label="Kurangi peserta dewasa"
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-900">{bookingDraft.adults}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateTravelerCounts(bookingDraft.adults + 1, bookingDraft.children, bookingDraft.infants)
                  }
                  disabled={bookingDraft.adults + bookingDraft.children >= pkg.maxTravelers}
                  aria-label="Tambah peserta dewasa"
                  className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Anak-anak (2–11 thn)</div>
                <div className="text-[11px] text-[#136F99] font-semibold">
                  {formatIDR(activePricing.childUnitPrice)} / pax
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateTravelerCounts(bookingDraft.adults, bookingDraft.children - 1, bookingDraft.infants)
                  }
                  disabled={bookingDraft.children <= 0}
                  aria-label="Kurangi peserta anak"
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-900">{bookingDraft.children}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateTravelerCounts(bookingDraft.adults, bookingDraft.children + 1, bookingDraft.infants)
                  }
                  disabled={bookingDraft.adults + bookingDraft.children >= pkg.maxTravelers}
                  aria-label="Tambah peserta anak"
                  className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Bayi (Di bawah 2 thn)</div>
                <div className="text-[11px] text-[#136F99] font-semibold">
                  {formatIDR(activePricing.infantUnitPrice)} / pax
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateTravelerCounts(bookingDraft.adults, bookingDraft.children, bookingDraft.infants - 1)
                  }
                  disabled={bookingDraft.infants <= 0}
                  aria-label="Kurangi bayi"
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-900">{bookingDraft.infants}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateTravelerCounts(bookingDraft.adults, bookingDraft.children, bookingDraft.infants + 1)
                  }
                  disabled={bookingDraft.infants >= bookingDraft.adults}
                  aria-label="Tambah bayi"
                  className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {totalSeats < pkg.minTravelers && (
              <AlertBanner type="warning">
                Paket ini mensyaratkan minimal <strong>{pkg.minTravelers} peserta</strong> (Dewasa + Anak).
                Silakan tambahkan {pkg.minTravelers - totalSeats} peserta lagi.
              </AlertBanner>
            )}
          </div>

          {/* Apply Discount Code */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
            <label htmlFor="booking-promo" className="block text-sm font-bold text-slate-900">
              Kode Promo / Diskon
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="booking-promo"
                  type="text"
                  value={bookingDraft.promoCode}
                  onChange={(e) => setBookingDraft((prev) => ({ ...prev, promoCode: e.target.value.toUpperCase() }))}
                  placeholder="Coba ASRIVA250 atau BEYOND500"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-semibold uppercase text-slate-900 focus:outline-none focus:border-[#136F99]"
                />
              </div>
              {bookingDraft.promoCode && (
                <button
                  type="button"
                  onClick={() => setBookingDraft((prev) => ({ ...prev, promoCode: '' }))}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600"
                >
                  Hapus
                </button>
              )}
            </div>
            {bookingDraft.promoCode.trim() !== '' && (
              <p
                className={`text-[11px] font-semibold ${
                  activePricing.promoCodeValid ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {activePricing.promoCodeValid
                  ? `Diterapkan: ${activePricing.promoLabel}`
                  : 'Kode memerlukan minimum transaksi atau tidak dikenali (Tersedia: ASRIVA250, BEYOND500).'}
              </p>
            )}
          </div>

          {/* Special Request */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <label htmlFor="booking-special-req" className="block text-sm font-bold text-slate-900 mb-1">
              Permintaan Khusus (Opsional)
            </label>
            <textarea
              id="booking-special-req"
              rows={2}
              value={bookingDraft.specialRequest}
              onChange={(e) => setBookingDraft((prev) => ({ ...prev, specialRequest: e.target.value }))}
              placeholder="Preferensi makanan, pengaturan tempat tidur kamar, atau bantuan aksesibilitas..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#136F99]"
            />
          </div>

          {/* Booking Price Summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Ringkasan Biaya Pemesanan</h3>
            <div className="flex justify-between text-slate-600">
              <span>
                Dewasa ({bookingDraft.adults} × {formatIDR(activePricing.adultUnitPrice)})
              </span>
              <span className="font-semibold text-slate-900">{formatIDR(activePricing.adultsTotal)}</span>
            </div>
            {bookingDraft.children > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>
                  Anak ({bookingDraft.children} × {formatIDR(activePricing.childUnitPrice)})
                </span>
                <span className="font-semibold text-slate-900">{formatIDR(activePricing.childrenTotal)}</span>
              </div>
            )}
            {bookingDraft.infants > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>
                  Bayi ({bookingDraft.infants} × {formatIDR(activePricing.infantUnitPrice)})
                </span>
                <span className="font-semibold text-slate-900">{formatIDR(activePricing.infantsTotal)}</span>
              </div>
            )}
            {activePricing.packageDiscountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Hemat Promo Paket</span>
                <span className="font-semibold">-{formatIDR(activePricing.packageDiscountTotal)}</span>
              </div>
            )}
            {activePricing.promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Kode Promo ({bookingDraft.promoCode.trim().toUpperCase()})</span>
                <span className="font-semibold">-{formatIDR(activePricing.promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan & Administrasi</span>
              <span className="font-semibold text-slate-900">{formatIDR(activePricing.serviceFee)}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
              <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="bottom-action-bar flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">
              Total ({activePricing.totalTravelers} Pax)
            </div>
            <div className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</div>
          </div>
          <button
            type="button"
            disabled={!isCountValid}
            onClick={handleProceedToCheckout}
            className="px-6 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-md hover:bg-[#06172D] disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] transition inline-flex items-center gap-1.5"
          >
            <span>Lanjutkan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // GUEST CHECKOUT PAGE
  const renderCheckoutPage = () => {
    const pkg = activeBookingPackage;
    const chosenOption =
      pkg.packageOptions.find((o) => o.id === bookingDraft.optionId) || pkg.packageOptions[0];
    const returnDate = calculateReturnDate(bookingDraft.departureDate, pkg.durationDays);

    return (
      <div className="app-shell">
        {renderStandaloneHeader(
          'Guest Checkout',
          () => setStandalone({ type: 'booking', packageId: pkg.id }),
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tanpa Login
          </span>
        )}

        <div className="app-content p-4 space-y-4 pb-8">
          <AlertBanner type="info" title="Pemesanan Tanpa Akun & Tanpa Login">
            Selesaikan reservasi Anda secara langsung sebagai tamu. Kode Booking dan konfirmasi rencana perjalanan
            akan diterbitkan segera setelah pemesanan dikirim.
          </AlertBanner>

          {/* Booking Summary */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ringkasan Pemesanan</h2>
            <div className="flex gap-3 pb-3 border-b border-slate-100">
              <img src={pkg.images[0]} alt={pkg.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 leading-snug">{pkg.name}</div>
                <div className="text-[11px] font-semibold text-[#136F99] mt-0.5">{chosenOption.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{pkg.destination}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Berangkat</div>
                <div className="font-bold text-slate-800">{formatDateReadable(bookingDraft.departureDate)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Kembali</div>
                <div className="font-bold text-slate-800">{returnDate}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Peserta</div>
                <div className="font-bold text-slate-800">
                  {bookingDraft.adults} Dws
                  {bookingDraft.children > 0 ? `, ${bookingDraft.children} Ank` : ''}
                  {bookingDraft.infants > 0 ? `, ${bookingDraft.infants} Byi` : ''}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Person (Guest Information) */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Informasi Pemesan (Kontak Utama)</h2>
              <p className="text-xs text-slate-500">
                Digunakan untuk pengiriman konfirmasi pemesanan dan verifikasi di menu Perjalanan Saya.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={guestInfo.fullName}
                onChange={(e) => {
                  setGuestInfo((prev) => ({ ...prev, fullName: e.target.value }));
                  if (formErrors.guestFullName) setFormErrors((prev) => ({ ...prev, guestFullName: '' }));
                }}
                placeholder="Contoh: Budi Santoso"
                className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-900 focus:outline-none ${
                  formErrors.guestFullName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-[#136F99]'
                }`}
              />
              {formErrors.guestFullName && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestFullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={guestInfo.email}
                onChange={(e) => {
                  setGuestInfo((prev) => ({ ...prev, email: e.target.value }));
                  if (formErrors.guestEmail) setFormErrors((prev) => ({ ...prev, guestEmail: '' }));
                }}
                placeholder="nama@email.com"
                className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-900 focus:outline-none ${
                  formErrors.guestEmail ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-[#136F99]'
                }`}
              />
              {formErrors.guestEmail && <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestEmail}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => {
                  setGuestInfo((prev) => ({ ...prev, phone: e.target.value }));
                  if (formErrors.guestPhone) setFormErrors((prev) => ({ ...prev, guestPhone: '' }));
                }}
                placeholder="Contoh: 081234567890"
                className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-900 focus:outline-none ${
                  formErrors.guestPhone ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-[#136F99]'
                }`}
              />
              {formErrors.guestPhone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestPhone}</p>}
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={sameWhatsappAsPhone}
                  onChange={(e) => setSameWhatsappAsPhone(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#0B2545]"
                />
                <span>Nomor WhatsApp sama dengan Nomor Telepon</span>
              </label>

              {!sameWhatsappAsPhone && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={guestInfo.whatsapp}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
                  />
                  {formErrors.guestWhatsapp && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestWhatsapp}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Traveler Information */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Data Peserta Perjalanan ({bookingDraft.travelers.length} Peserta)
              </h2>
              <p className="text-xs text-slate-500">Isi nama peserta sesuai dengan KTP atau Paspor yang berlaku.</p>
            </div>

            {bookingDraft.travelers.length > 0 && bookingDraft.travelers[0].type === 'Adult' && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#E7F3F8]/80 border border-[#BAE6FD] text-xs font-semibold text-[#0B2545] cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactIsMainTraveler}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setContactIsMainTraveler(checked);
                    if (checked) {
                      setBookingDraft((prev) => {
                        const copy = [...prev.travelers];
                        if (copy[0]) copy[0] = { ...copy[0], fullName: guestInfo.fullName };
                        return { ...prev, travelers: copy };
                      });
                    }
                  }}
                  className="w-4 h-4 rounded accent-[#0B2545]"
                />
                <span>Pemesan adalah Peserta Utama</span>
              </label>
            )}

            <div className="space-y-3">
              {bookingDraft.travelers.map((traveler, index) => {
                const isLockedByContact = index === 0 && contactIsMainTraveler;
                const nameErr = formErrors[`traveler_${index}_name`];
                const genderErr = formErrors[`traveler_${index}_gender`];

                return (
                  <div key={traveler.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Peserta #{index + 1} ({formatTravelerTypeLabel(traveler.type)})
                      </span>
                      {index === 0 && <Badge variant="navy">Peserta Utama</Badge>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={traveler.fullName}
                        disabled={isLockedByContact}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBookingDraft((prev) => {
                            const updated = [...prev.travelers];
                            updated[index] = { ...updated[index], fullName: val };
                            return { ...prev, travelers: updated };
                          });
                          if (nameErr) setFormErrors((prev) => ({ ...prev, [`traveler_${index}_name`]: '' }));
                        }}
                        placeholder="Nama lengkap sesuai identitas"
                        className={`w-full rounded-xl border px-3 py-2 text-xs bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:outline-none ${
                          nameErr ? 'border-rose-500' : 'border-slate-200 focus:border-[#136F99]'
                        }`}
                      />
                      {nameErr && <p className="text-[11px] text-rose-600 mt-0.5">{nameErr}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Jenis Kelamin <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={traveler.gender}
                          onChange={(e) => {
                            const val = e.target.value as 'Male' | 'Female' | '';
                            setBookingDraft((prev) => {
                              const updated = [...prev.travelers];
                              updated[index] = { ...updated[index], gender: val };
                              return { ...prev, travelers: updated };
                            });
                            if (genderErr) setFormErrors((prev) => ({ ...prev, [`traveler_${index}_gender`]: '' }));
                          }}
                          className={`w-full rounded-xl border px-2.5 py-2 text-xs bg-white text-slate-900 focus:outline-none ${
                            genderErr ? 'border-rose-500' : 'border-slate-200 focus:border-[#136F99]'
                          }`}
                        >
                          <option value="">Pilih</option>
                          <option value="Male">Laki-laki</option>
                          <option value="Female">Perempuan</option>
                        </select>
                        {genderErr && <p className="text-[11px] text-rose-600 mt-0.5">{genderErr}</p>}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={traveler.dateOfBirth}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBookingDraft((prev) => {
                              const updated = [...prev.travelers];
                              updated[index] = { ...updated[index], dateOfBirth: val };
                              return { ...prev, travelers: updated };
                            });
                          }}
                          className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#136F99]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nomor KTP / Paspor (Opsional)
                      </label>
                      <input
                        type="text"
                        value={traveler.identityNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBookingDraft((prev) => {
                            const updated = [...prev.travelers];
                            updated[index] = { ...updated[index], identityNumber: val };
                            return { ...prev, travelers: updated };
                          });
                        }}
                        placeholder="Nomor identitas atau paspor"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#136F99]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment Method Selection */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Metode & Penyelesaian Pembayaran</h2>
              <p className="text-xs text-slate-500">
                Pilih metode penyelesaian reservasi Anda. Status pemesanan tetap Belum Dibayar hingga diverifikasi.
              </p>
            </div>

            <div className="space-y-2.5">
              {PAYMENT_CHANNELS.map((channel) => {
                const isSelected = selectedPaymentId === channel.id;
                return (
                  <div
                    key={channel.id}
                    onClick={() => {
                      if (!channel.available) {
                        showToast('Payment gateway otomatis belum terhubung pada aplikasi ini.', 'warning');
                        return;
                      }
                      setSelectedPaymentId(channel.id);
                    }}
                    className={`p-3.5 rounded-xl border transition ${
                      !channel.available
                        ? 'border-slate-200 bg-slate-50 opacity-75 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#136F99] bg-[#E7F3F8]/70 cursor-pointer'
                        : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected && channel.available ? 'border-[#136F99]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && channel.available && (
                            <div className="w-2 h-2 rounded-full bg-[#136F99]" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{channel.name}</span>
                      </div>
                      <Badge variant={channel.available ? 'warning' : 'neutral'}>{channel.statusLabel}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-6">{channel.description}</p>
                  </div>
                );
              })}
            </div>
            {formErrors.paymentMethod && <p className="text-[11px] text-rose-600">{formErrors.paymentMethod}</p>}
          </section>

          {/* Price Breakdown */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Rincian Harga</h2>
            <div className="flex justify-between text-slate-600">
              <span>Harga Dasar Paket ({activePricing.totalTravelers} Peserta)</span>
              <span className="font-semibold text-slate-900">{formatIDR(activePricing.baseSubtotal)}</span>
            </div>
            {activePricing.packageDiscountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon Paket</span>
                <span className="font-semibold">-{formatIDR(activePricing.packageDiscountTotal)}</span>
              </div>
            )}
            {activePricing.promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Kode Promo ({bookingDraft.promoCode.trim().toUpperCase()})</span>
                <span className="font-semibold">-{formatIDR(activePricing.promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan & Administrasi</span>
              <span className="font-semibold text-slate-900">{formatIDR(activePricing.serviceFee)}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
              <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</span>
            </div>
          </section>

          {/* Terms Agreement */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  if (formErrors.terms) setFormErrors((prev) => ({ ...prev, terms: '' }));
                }}
                className="w-4 h-4 mt-0.5 rounded accent-[#0B2545] shrink-0"
              />
              <span className="leading-relaxed">
                Saya menyetujui{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('terms');
                  }}
                  className="font-bold text-[#136F99] underline"
                >
                  Syarat & Ketentuan
                </button>{' '}
                serta{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLegalModal('privacy');
                  }}
                  className="font-bold text-[#136F99] underline"
                >
                  Kebijakan Privasi
                </button>{' '}
                ASRIVA Travel & Tours.
              </span>
            </label>
            {formErrors.terms && <p className="text-[11px] text-rose-600 mt-1.5">{formErrors.terms}</p>}
          </section>
        </div>

        {/* Sticky Bottom Action */}
        <div className="bottom-action-bar flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Total Pembayaran</div>
            <div className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</div>
          </div>
          <button
            type="button"
            disabled={isSubmittingBooking}
            onClick={handleConfirmBooking}
            className="px-5 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-md hover:bg-[#06172D] disabled:opacity-50 active:scale-[0.98] transition inline-flex items-center gap-2"
          >
            {isSubmittingBooking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Konfirmasi Pemesanan</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  // BOOKING CONFIRMATION & BOOKING DETAIL PAGE
  const renderBookingResultPage = (bookingReference: string, isConfirmationScreen: boolean) => {
    const booking = bookings.find((b) => b.bookingReference === bookingReference);
    if (!booking) {
      return (
        <div className="app-shell">
          {renderStandaloneHeader('Detail Pemesanan', () => setStandalone(null))}
          <div className="app-content p-4">
            <EmptyState
              icon={<Briefcase className="w-6 h-6" />}
              title="Data Pemesanan Tidak Tersedia"
              description="Kami tidak dapat menemukan data pemesanan ini pada sesi Anda."
              actionLabel="Ke Perjalanan Saya"
              onAction={() => {
                setStandalone(null);
                setActiveTab('bookings');
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="app-shell">
        {renderStandaloneHeader(
          isConfirmationScreen ? 'Konfirmasi Pemesanan' : 'Detail Perjalanan',
          () => setStandalone(null)
        )}

        <div className="app-content p-4 space-y-4 pb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <Badge
              variant={booking.tripCategory === 'cancelled' ? 'error' : 'success'}
              className="mb-1.5"
            >
              {booking.bookingStatus}
            </Badge>
            <h2 className="text-lg font-extrabold text-slate-900">
              {isConfirmationScreen ? 'Reservasi Berhasil Dicatat' : 'Rincian Reservasi'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Simpan Kode Booking di bawah ini untuk melihat atau mengelola reservasi Anda kapan saja di menu Perjalanan Saya.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-dashed border-[#136F99]/40 flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Kode Booking</div>
                <div className="text-base font-extrabold tracking-wider text-[#0B2545]">
                  {booking.bookingReference}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(booking.bookingReference);
                  showToast('Kode Booking berhasil disalin!', 'success');
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1 active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin
              </button>
            </div>
          </div>

          <AlertBanner
            type={booking.tripCategory === 'cancelled' ? 'error' : 'warning'}
            title={`Status Pembayaran: ${booking.paymentStatus}`}
          >
            Metode penyelesaian: <strong>{booking.paymentMethodName}</strong>. Cantumkan kode{' '}
            <strong>{booking.bookingReference}</strong> saat menyelesaikan pembayaran bersama ASRIVA Travel & Tours.
          </AlertBanner>

          {/* Package & Departure Summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Informasi Paket & Keberangkatan</h3>
            <div className="flex gap-3 pb-3 border-b border-slate-100">
              <img
                src={booking.packageImage}
                alt={booking.packageName}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">{booking.packageName}</div>
                <div className="text-[11px] font-semibold text-[#136F99] mt-0.5">{booking.optionName}</div>
                <div className="text-slate-500 mt-0.5">
                  {booking.destination} • {booking.duration}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal Keberangkatan</span>
              <span className="font-bold text-slate-900">{formatDateReadable(booking.departureDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jumlah Peserta</span>
              <span className="font-bold text-slate-900">
                {booking.adults} Dewasa
                {booking.children > 0 ? `, ${booking.children} Anak` : ''}
                {booking.infants > 0 ? `, ${booking.infants} Bayi` : ''}
              </span>
            </div>
            <div>
              <div className="text-slate-500">Titik Kumpul</div>
              <div className="font-semibold text-slate-800 mt-0.5">{booking.meetingPoint}</div>
            </div>
          </div>

          {/* Guest & Travelers */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Pemesan & Daftar Peserta</h3>
            <div className="p-2.5 rounded-xl bg-slate-50 space-y-1">
              <div className="font-bold text-slate-900">{booking.guest.fullName}</div>
              <div className="text-slate-600">{booking.guest.email}</div>
              <div className="text-slate-600">Telepon: {booking.guest.phone}</div>
            </div>
            <div className="space-y-1.5 pt-1">
              {booking.travelers.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="font-semibold text-slate-800">
                    {idx + 1}. {t.fullName}
                  </span>
                  <span className="text-slate-500">
                    {formatTravelerTypeLabel(t.type)} • {t.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatIDR(booking.subtotal)}</span>
            </div>
            {booking.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon Paket</span>
                <span>-{formatIDR(booking.discountTotal)}</span>
              </div>
            )}
            {booking.promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promo ({booking.promoCodeApplied})</span>
                <span>-{formatIDR(booking.promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan</span>
              <span>{formatIDR(booking.serviceFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
              <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(booking.totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {isConfirmationScreen && (
              <button
                type="button"
                onClick={() => setStandalone({ type: 'bookingDetail', bookingReference: booking.bookingReference })}
                className="w-full py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-xs"
              >
                Lihat Detail Pemesanan
              </button>
            )}
            {booking.tripCategory === 'upcoming' && (
              <button
                type="button"
                onClick={() => handleCancelBooking(booking.bookingReference)}
                className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
              >
                Batalkan Reservasi
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStandalone(null);
                setActiveTab('home');
              }}
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  };

  // INFO PAGES
  const renderInfoPage = (page: 'about' | 'contact' | 'help' | 'terms' | 'privacy') => {
    const titles: Record<typeof page, string> = {
      about: 'Tentang ASRIVA Travel & Tours',
      contact: 'Hubungi Kami',
      help: 'Pusat Bantuan & FAQ',
      terms: 'Syarat & Ketentuan',
      privacy: 'Kebijakan Privasi'
    };

    return (
      <div className="app-shell">
        {renderStandaloneHeader(titles[page], () => setStandalone(null))}
        <div className="app-content p-4 space-y-4 pb-8 text-xs text-slate-600 leading-relaxed">
          {page === 'about' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center">
                <Plane className="w-6 h-6" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">ASRIVA TRAVEL & TOURS</h2>
              <p className="font-semibold text-[#136F99]">Discover More. Travel Beyond.</p>
              <p>
                ASRIVA Travel & Tours adalah platform pemesanan perjalanan digital modern yang dikurasi untuk
                menghadirkan pengalaman wisata domestik dan internasional terbaik—mulai dari liburan pulau privat,
                ekspedisi Phinisi, hingga perjalanan kereta panorama dunia.
              </p>
            </div>
          )}

          {page === 'contact' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <h2 className="text-base font-extrabold text-slate-900">Konsultasi & Dukungan Perjalanan</h2>
              <p>Hubungi tim layanan pelanggan kami untuk pertanyaan paket, penawaran grup, atau verifikasi pemesanan.</p>
              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#136F99]" />
                  <div>
                    <div className="font-bold text-slate-900">Layanan Telepon</div>
                    <div>+62 21 5098 4410 (Sen–Sab, 08:30–18:00 WIB)</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-[#136F99]" />
                  <div>
                    <div className="font-bold text-slate-900">WhatsApp Concierge</div>
                    <div>+62 811 9088 2210</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#136F99]" />
                  <div>
                    <div className="font-bold text-slate-900">Email Reservasi</div>
                    <div>reservations@asrivatravel.co.id</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === 'help' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Apakah saya harus membuat akun untuk memesan paket wisata?',
                  a: 'Tidak perlu. ASRIVA Travel & Tours mendukung penuh Guest Checkout. Anda cukup mengisi data pemesan dan peserta saat checkout.'
                },
                {
                  q: 'Bagaimana cara mengecek status pemesanan saya setelah checkout?',
                  a: 'Buka tab Perjalanan di navigasi bawah, lalu masukkan Kode Booking beserta Email atau Nomor Telepon yang digunakan saat pemesanan.'
                },
                {
                  q: 'Kapan status pembayaran saya berubah menjadi Lunas?',
                  a: 'Setelah transfer atau pelunasan di konter diverifikasi oleh tim Keuangan ASRIVA menggunakan Kode Booking Anda, status pembayaran akan diperbarui.'
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="font-bold text-slate-900 text-sm mb-1">{faq.q}</div>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          )}

          {page === 'terms' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h2 className="text-sm font-bold text-slate-900">1. Reservasi Tamu & Masa Berlaku</h2>
              <p>
                Setiap pemesanan yang dikirim melalui ASRIVA Travel & Tours menghasilkan Kode Booking unik. Ketersediaan
                kursi ditahan sesuai batas waktu penyelesaian pembayaran yang tertera.
              </p>
              <h2 className="text-sm font-bold text-slate-900">2. Harga & Layanan Termasuk</h2>
              <p>
                Seluruh harga tercantum dalam mata uang Rupiah (IDR) dan mencakup layanan yang disebutkan secara eksplisit
                pada bagian Layanan Termasuk di masing-masing paket.
              </p>
            </div>
          )}

          {page === 'privacy' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h2 className="text-sm font-bold text-slate-900">1. Pengumpulan Data Guest Checkout</h2>
              <p>
                Kami mengumpulkan informasi kontak pemesan (nama, email, nomor telepon/WhatsApp) serta data peserta
                semata-mata untuk keperluan reservasi tur, check-in hotel, manifes transportasi, dan asuransi perjalanan.
              </p>
              <h2 className="text-sm font-bold text-slate-900">2. Verifikasi & Keamanan Akses</h2>
              <p>
                Pencarian pemesanan memerlukan kombinasi Kode Booking serta Email atau Nomor Telepon terdaftar guna
                melindungi privasi pelanggan.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // 8. MAIN TAB PAGES (INSIDE APP SHELL)
  // ============================================================================

  // HOME STOREFRONT
  const renderHomePage = () => {
    const featuredPackages = PACKAGES_DATA.filter((p) => p.featured);
    const recommendedPackages = PACKAGES_DATA.filter((p) => p.recommended);
    const specialOffers = PACKAGES_DATA.filter((p) => p.specialOffer);

    return (
      <div className="p-4 space-y-6 pb-8">
        {/* Tagline & Search Destination */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-[#136F99]">Discover More. Travel Beyond.</p>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Mau liburan ke mana berikutnya?
            </h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveTab('explore');
            }}
            className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi, Bali, Komodo, Jepang..."
              className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#0B2545] text-white text-[11px] font-bold shrink-0"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Hero Promotional Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0B2545] text-white p-4 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=70"
            alt="Perjalanan unggulan"
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
          />
          <div className="relative z-10 max-w-[85%]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              Koleksi Pilihan ASRIVA
            </span>
            <h3 className="text-base font-extrabold leading-snug mb-1">
              Perjalanan Terkurasi di Indonesia & Mancanegara
            </h3>
            <p className="text-[11px] text-slate-200 leading-relaxed mb-3">
              Pesan langsung tanpa akun dengan rincian harga IDR transparan dan pemandu terpercaya.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Semua');
                setActiveTab('explore');
              }}
              className="px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-extrabold shadow-xs active:scale-95 transition"
            >
              Jelajahi Paket
            </button>
          </div>
        </div>

        {/* Travel Categories */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Kategori Perjalanan</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TRAVEL_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveTab('explore');
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 whitespace-nowrap shadow-2xs hover:border-[#136F99] hover:text-[#136F99] active:scale-95 transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Destinasi Populer</h3>
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-[#136F99]"
            >
              Lihat semua
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {DESTINATIONS_DATA.map((dest) => (
              <div
                key={dest.id}
                onClick={() => openDestinationDetail(dest.id)}
                className="relative w-36 h-44 rounded-2xl overflow-hidden shrink-0 bg-slate-800 shadow-xs cursor-pointer active:scale-[0.98] transition"
              >
                <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[10px] text-amber-300 font-semibold">{dest.country}</div>
                  <div className="text-xs font-bold leading-tight">{dest.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Tour Packages */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Paket Wisata Unggulan</h3>
              <p className="text-[11px] text-slate-500">Rencana perjalanan pilihan terbaik</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-[#136F99]"
            >
              Lihat semua
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {featuredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={openPackageDetail}
                isWishlisted={wishlistIds.includes(pkg.id)}
                onToggleWishlist={toggleWishlist}
                compact
              />
            ))}
          </div>
        </div>

        {/* Special Offers */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Penawaran Spesial</h3>
              <p className="text-[11px] text-slate-500">Harga promo & hemat musiman</p>
            </div>
          </div>
          <div className="space-y-3">
            {specialOffers.slice(0, 2).map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={openPackageDetail}
                isWishlisted={wishlistIds.includes(pkg.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>

        {/* Recommended Experiences */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Rekomendasi Pengalaman</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {recommendedPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={openPackageDetail}
                isWishlisted={wishlistIds.includes(pkg.id)}
                onToggleWishlist={toggleWishlist}
                compact
              />
            ))}
          </div>
        </div>

        {/* Customer Testimonials */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Testimoni Pelanggan</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {[
              {
                name: 'Nadia Kartika',
                trip: 'Bali Ubud & Nusa Penida Escape',
                quote:
                  'Pemesanan tanpa perlu buat akun sangat praktis. Driver kami di Ubud dan penyeberangan fast boat sangat tepat waktu.'
              },
              {
                name: 'Rendra Pratama',
                trip: 'Pelayaran Phinisi Komodo',
                quote:
                  'Rincian biaya jelas dari awal sampai akhir. Matahari terbit di Pulau Padar melampaui semua ekspektasi kami.'
              },
              {
                name: 'Siti Rahmawati',
                trip: 'Rute Emas Jepang 7H6M',
                quote:
                  'Pesan untuk keluarga berempat sangat mudah. Cek kode booking di menu Perjalanan juga cepat.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="w-64 shrink-0 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">"{item.quote}"</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.trip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Card */}
        <footer className="bg-[#0B2545] text-white rounded-2xl p-4 space-y-3 text-xs">
          <div>
            <div className="font-extrabold text-sm tracking-tight">ASRIVA TRAVEL & TOURS</div>
            <div className="text-[11px] text-sky-200 mt-0.5">Discover More. Travel Beyond.</div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-200">
            <button
              type="button"
              onClick={() => setStandalone({ type: 'infoPage', page: 'about' })}
              className="text-left hover:text-white"
            >
              Tentang ASRIVA
            </button>
            <button
              type="button"
              onClick={() => setStandalone({ type: 'infoPage', page: 'contact' })}
              className="text-left hover:text-white"
            >
              Hubungi Concierge
            </button>
            <button
              type="button"
              onClick={() => setStandalone({ type: 'infoPage', page: 'help' })}
              className="text-left hover:text-white"
            >
              Pusat Bantuan & FAQ
            </button>
            <button
              type="button"
              onClick={() => setStandalone({ type: 'infoPage', page: 'terms' })}
              className="text-left hover:text-white"
            >
              Syarat & Privasi
            </button>
          </div>
        </footer>
      </div>
    );
  };

  // EXPLORE DESTINATIONS & TOUR PACKAGES PAGE
  const renderExplorePage = () => {
    const featuredDestinations = DESTINATIONS_DATA.filter((d) => d.featured);

    return (
      <div className="p-4 space-y-4 pb-8">
        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi atau paket wisata..."
              className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="relative px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#136F99]" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0B2545] text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {TRAVEL_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-[#0B2545] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured Destinations Strip */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Destinasi Unggulan
            </h3>
            {selectedDestinationFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedDestinationFilter('All')}
                className="text-[11px] font-bold text-[#136F99]"
              >
                Tampilkan Semua
              </button>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {featuredDestinations.map((dest) => {
              const isFiltered = selectedDestinationFilter === dest.id;
              return (
                <div
                  key={dest.id}
                  onClick={() => openDestinationDetail(dest.id)}
                  className={`w-44 shrink-0 rounded-2xl overflow-hidden bg-white border transition cursor-pointer ${
                    isFiltered ? 'border-[#136F99] ring-2 ring-[#136F99]/20' : 'border-slate-200/80'
                  }`}
                >
                  <div className="relative h-24">
                    <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <div className="text-xs font-bold leading-tight truncate">{dest.name}</div>
                      <div className="text-[10px] text-slate-200">{dest.country}</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#136F99]">Panduan Destinasi</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#136F99]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedDestinationFilter('All')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
              selectedDestinationFilter === 'All'
                ? 'bg-[#E7F3F8] text-[#136F99] border border-[#136F99]/30'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Semua Destinasi
          </button>
          {DESTINATIONS_DATA.map((dest) => {
            const active = selectedDestinationFilter === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSelectedDestinationFilter(dest.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                  active
                    ? 'bg-[#E7F3F8] text-[#136F99] border border-[#136F99]/30'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {dest.name}
              </button>
            );
          })}
        </div>

        {/* Count & Sort */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-600">
            Menampilkan <strong className="text-slate-900">{filteredPackages.length}</strong> paket wisata
          </span>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Urutkan paket"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
            >
              <option value="recommended">Rekomendasi</option>
              <option value="price_asc">Harga: Terendah</option>
              <option value="price_desc">Harga: Tertinggi</option>
              <option value="rating_desc">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Tour Package Cards */}
        {filteredPackages.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-6 h-6" />}
            title="Paket Wisata Tidak Ditemukan"
            description="Coba ubah kata kunci pencarian, destinasi, rentang harga, atau filter durasi Anda."
            actionLabel="Atur Ulang Filter"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setSelectedDestinationFilter('All');
              setPriceFilter('all');
              setDurationFilter('all');
            }}
          />
        ) : (
          <div className="space-y-3.5">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={openPackageDetail}
                isWishlisted={wishlistIds.includes(pkg.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // WISHLIST PAGE
  const renderWishlistPage = () => {
    const wishlistedPackages = PACKAGES_DATA.filter((p) => wishlistIds.includes(p.id));

    return (
      <div className="p-4 space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Wishlist Tersimpan</h2>
            <p className="text-xs text-slate-500">Bandingkan dan pesan paket wisata favorit Anda</p>
          </div>
          <Badge variant="ocean">{wishlistedPackages.length} Tersimpan</Badge>
        </div>

        {wishlistedPackages.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-6 h-6" />}
            title="Wishlist Anda Masih Kosong"
            description="Ketuk ikon hati pada kartu paket wisata mana pun untuk menyimpannya di sini."
            actionLabel="Jelajahi Paket"
            onAction={() => setActiveTab('explore')}
          />
        ) : (
          <div className="space-y-3.5">
            {wishlistedPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={openPackageDetail}
                isWishlisted={true}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // MY TRIPS PAGE (UPCOMING, COMPLETED, CANCELLED + VERIFIED LOOKUP)
  const renderMyTripsPage = () => {
    const unlockedBookings = bookings.filter((b) => verifiedBookingRefs.includes(b.bookingReference));
    const filteredTrips = unlockedBookings.filter((b) => b.tripCategory === tripSubTab);

    const tripTabLabels: Record<'upcoming' | 'completed' | 'cancelled', string> = {
      upcoming: 'Akan Datang',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };

    return (
      <div className="p-4 space-y-4 pb-8">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Perjalanan Saya</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola reservasi atau cari pemesanan tamu menggunakan Kode Booking Anda.
          </p>
        </div>

        {/* Trip Category Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/70">
          {(
            [
              { id: 'upcoming', label: 'Akan Datang' },
              { id: 'completed', label: 'Selesai' },
              { id: 'cancelled', label: 'Dibatalkan' }
            ] as const
          ).map((tab) => {
            const count = unlockedBookings.filter((b) => b.tripCategory === tab.id).length;
            const active = tripSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTripSubTab(tab.id)}
                className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition ${
                  active ? 'bg-white text-[#0B2545] shadow-2xs' : 'text-slate-600'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Verified Trips List */}
        {filteredTrips.length > 0 ? (
          <div className="space-y-3">
            {filteredTrips.map((b) => (
              <div
                key={b.bookingReference}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#0B2545]">{b.bookingReference}</span>
                  <Badge
                    variant={
                      b.tripCategory === 'cancelled'
                        ? 'error'
                        : b.tripCategory === 'completed'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {b.bookingStatus}
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <img
                    src={b.packageImage}
                    alt={b.packageName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 leading-snug">{b.packageName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.destination}</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Pembayaran: <strong>{b.paymentStatus}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Keberangkatan</div>
                    <div className="font-bold text-slate-800">{formatDateReadable(b.departureDate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Total Pembayaran</div>
                    <div className="font-bold text-[#0B2545]">{formatIDR(b.totalAmount)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStandalone({ type: 'bookingDetail', bookingReference: b.bookingReference })}
                  className="w-full py-2.5 rounded-xl bg-[#E7F3F8] text-[#136F99] text-xs font-bold"
                >
                  Lihat Detail Pemesanan
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title={`Belum Ada Perjalanan ${tripTabLabels[tripSubTab]}`}
            description={
              tripSubTab === 'upcoming'
                ? 'Pesan paket perjalanan atau cari reservasi yang sudah ada di bawah ini menggunakan Kode Booking.'
                : `Anda tidak memiliki riwayat perjalanan berstatus ${tripTabLabels[tripSubTab].toLowerCase()}.`
            }
            actionLabel={tripSubTab === 'upcoming' ? 'Jelajahi Paket' : undefined}
            onAction={tripSubTab === 'upcoming' ? () => setActiveTab('explore') : undefined}
          />
        )}

        {/* Guest Booking Lookup Form */}
        <form
          onSubmit={handleLookupBooking}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cari Pemesanan Tamu</h3>
            <p className="text-[11px] text-slate-500">
              Masukkan Kode Booking beserta Email atau Nomor Telepon yang digunakan saat checkout.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kode Booking</label>
            <input
              type="text"
              value={lookupRef}
              onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
              placeholder="Contoh: ASR-2611-XXXXXX"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-900 focus:outline-none focus:border-[#136F99]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email atau Nomor Telepon</label>
            <input
              type="text"
              value={lookupContact}
              onChange={(e) => setLookupContact(e.target.value)}
              placeholder="Masukkan email atau nomor telepon saat pemesanan"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
            />
          </div>

          {lookupError && <AlertBanner type="error">{lookupError}</AlertBanner>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold shadow-xs hover:bg-[#06172D] active:scale-[0.99] transition"
          >
            Cari & Verifikasi Pemesanan
          </button>
        </form>
      </div>
    );
  };

  // USER PROFILE PAGE
  const renderProfilePage = () => (
    <div className="p-4 space-y-4 pb-8">
      {/* Profile Photo & Guest Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 font-extrabold text-lg">
          {guestInfo.fullName.trim()
            ? guestInfo.fullName.trim().slice(0, 2).toUpperCase()
            : 'AS'}
        </div>
        <div className="min-w-0 flex-1">
          <Badge variant="ocean" className="mb-1">
            Profil Wisatawan Tamu
          </Badge>
          <h2 className="text-base font-extrabold text-slate-900 truncate">
            {guestInfo.fullName.trim() || 'Penjelajah Tamu ASRIVA'}
          </h2>
          <p className="text-xs text-slate-500 truncate">
            {guestInfo.email.trim() || 'Tidak memerlukan pendaftaran akun'}
          </p>
        </div>
      </div>

      {/* Personal & Contact Information */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Informasi Pribadi & Kontak</h3>
          <p className="text-[11px] text-slate-500">Otomatis mengisi formulir guest checkout Anda</p>
        </div>
        <div className="space-y-2.5">
          <input
            type="text"
            value={guestInfo.fullName}
            onChange={(e) => setGuestInfo((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Nama Lengkap"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
          />
          <input
            type="email"
            value={guestInfo.email}
            onChange={(e) => setGuestInfo((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Alamat Email"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
          />
          <input
            type="tel"
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Nomor Telepon / WhatsApp"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
          />
        </div>
      </div>

      {/* Quick Shortcuts: Wishlist & Booking History */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left active:scale-[0.98] transition"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <Heart className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900">Wishlist</div>
          <div className="text-[11px] text-slate-500">{wishlistIds.length} paket tersimpan</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left active:scale-[0.98] transition"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E7F3F8] text-[#136F99] flex items-center justify-center mb-2">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900">Riwayat Pemesanan</div>
          <div className="text-[11px] text-slate-500">{verifiedBookingRefs.length} perjalanan</div>
        </button>
      </div>

      {/* Settings, Support & Reset Session */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {[
          { label: 'Pusat Bantuan & FAQ', icon: <HelpCircle className="w-4 h-4" />, page: 'help' as const },
          { label: 'Hubungi Kami', icon: <Headphones className="w-4 h-4" />, page: 'contact' as const },
          { label: 'Tentang ASRIVA Travel & Tours', icon: <Building2 className="w-4 h-4" />, page: 'about' as const },
          { label: 'Syarat & Ketentuan', icon: <FileText className="w-4 h-4" />, page: 'terms' as const },
          { label: 'Kebijakan Privasi', icon: <ShieldCheck className="w-4 h-4" />, page: 'privacy' as const }
        ].map((item) => (
          <button
            key={item.page}
            type="button"
            onClick={() => setStandalone({ type: 'infoPage', page: item.page })}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-[#136F99]">{item.icon}</span>
              <span className="text-xs font-semibold text-slate-800">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setGuestInfo({ fullName: '', email: '', phone: '', whatsapp: '' });
            setVerifiedBookingRefs([]);
            showToast('Data sesi tamu telah dibersihkan.', 'info');
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50/50 transition text-rose-600"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold">Bersihkan Sesi Tamu / Keluar</span>
          </div>
          <Settings className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // 9. ROOT RENDER (APP SHELL vs STANDALONE PAGES + GLOBAL OVERLAYS)
  // ============================================================================

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  const renderMainContent = () => {
    if (standalone) {
      if (standalone.type === 'destination') return renderDestinationPage(standalone.destinationId);
      if (standalone.type === 'package') return renderPackageDetailPage(standalone.packageId);
      if (standalone.type === 'booking') return renderBookingPage(standalone.packageId);
      if (standalone.type === 'checkout') return renderCheckoutPage();
      if (standalone.type === 'confirmation') return renderBookingResultPage(standalone.bookingReference, true);
      if (standalone.type === 'bookingDetail') return renderBookingResultPage(standalone.bookingReference, false);
      if (standalone.type === 'infoPage') return renderInfoPage(standalone.page);
    }

    return (
      <div className="app-shell">
        {/* Brand Header with Notification & Profile Shortcuts */}
        <header className="app-header px-4 py-3 flex items-center justify-between">
          <div onClick={() => setActiveTab('home')} className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shadow-xs">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-[#0B2545] leading-none">ASRIVA</div>
              <div className="text-[10px] font-bold tracking-widest text-[#136F99] mt-0.5">TRAVEL & TOURS</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifikasi"
              onClick={() => {
                setNotificationModalOpen(true);
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
              }}
              className="relative w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D97706]" />
              )}
            </button>

            <button
              type="button"
              aria-label="Pintasan profil"
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-xl bg-[#E7F3F8] text-[#0B2545] flex items-center justify-center font-bold text-xs"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Active Page Content */}
        <main className="app-content">
          {activeTab === 'home' && renderHomePage()}
          {activeTab === 'explore' && renderExplorePage()}
          {activeTab === 'wishlist' && renderWishlistPage()}
          {activeTab === 'bookings' && renderMyTripsPage()}
          {activeTab === 'profile' && renderProfilePage()}
        </main>

        {/* 5-Menu Mobile Bottom Navigation */}
        <nav className="bottom-nav px-1.5 py-1.5 grid grid-cols-5" aria-label="Navigasi utama">
          {(
            [
              { id: 'home', label: 'Beranda', icon: Home },
              { id: 'explore', label: 'Eksplorasi', icon: Compass },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'bookings', label: 'Perjalanan', icon: Briefcase },
              { id: 'profile', label: 'Profil', icon: User }
            ] as const
          ).map((navItem) => {
            const IconComponent = navItem.icon;
            const isActive = activeTab === navItem.id;
            return (
              <button
                key={navItem.id}
                type="button"
                onClick={() => setActiveTab(navItem.id)}
                className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                  isActive ? 'text-[#0B2545] font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition ${
                    isActive ? 'bg-[#E7F3F8] text-[#136F99]' : 'bg-transparent'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-none">{navItem.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {renderMainContent()}

      {/* Explore Filter BottomSheet */}
      <BottomSheet open={filterSheetOpen} title="Filter Paket Wisata" onClose={() => setFilterSheetOpen(false)}>
        <div className="space-y-4 text-xs">
          <div>
            <div className="font-bold text-slate-900 mb-2">Rentang Harga (per dewasa)</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'Semua Harga' },
                { id: 'under5m', label: 'Di bawah Rp 5 Jt' },
                { id: '5mto15m', label: 'Rp 5 Jt – 15 Jt' },
                { id: 'above15m', label: 'Di atas Rp 15 Jt' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriceFilter(opt.id as typeof priceFilter)}
                  className={`py-2.5 px-3 rounded-xl border font-semibold ${
                    priceFilter === opt.id
                      ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-2">Durasi Perjalanan</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'Semua Durasi' },
                { id: '1to3', label: '1 – 3 Hari' },
                { id: '4to5', label: '4 – 5 Hari' },
                { id: '6plus', label: '6+ Hari' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDurationFilter(opt.id as typeof durationFilter)}
                  className={`py-2.5 px-3 rounded-xl border font-semibold ${
                    durationFilter === opt.id
                      ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Semua');
                setSelectedDestinationFilter('All');
                setPriceFilter('all');
                setDurationFilter('all');
              }}
              className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-700"
            >
              Atur Ulang
            </button>
            <button
              type="button"
              onClick={() => setFilterSheetOpen(false)}
              className="flex-1 py-3 rounded-xl bg-[#0B2545] text-white font-bold"
            >
              Terapkan ({filteredPackages.length})
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Notifications Modal */}
      <ModalDialog
        open={notificationModalOpen}
        title="Notifikasi & Pembaruan"
        onClose={() => setNotificationModalOpen(false)}
      >
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{n.title}</span>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-slate-600">{n.message}</p>
            </div>
          ))}
        </div>
      </ModalDialog>

      {/* Legal Documents Modal */}
      <ModalDialog
        open={legalModal !== null}
        title={legalModal === 'terms' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
        onClose={() => setLegalModal(null)}
        footer={
          <button
            type="button"
            onClick={() => {
              setAgreedTerms(true);
              setLegalModal(null);
            }}
            className="w-full py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold"
          >
            Setujui & Tutup
          </button>
        }
      >
        {legalModal === 'terms' ? (
          <div className="space-y-2.5">
            <p>
              <strong>1. Kebijakan Reservasi Tamu:</strong> Pemesanan yang dikirim melalui ASRIVA Travel & Tours
              menghasilkan catatan reservasi yang diidentifikasi melalui Kode Booking unik Anda.
            </p>
            <p>
              <strong>2. Pembayaran & Verifikasi:</strong> Reservasi berstatus Belum Dibayar / Menunggu Verifikasi
              hingga pelunasan diverifikasi oleh tim Keuangan ASRIVA.
            </p>
            <p>
              <strong>3. Dokumen Peserta:</strong> Peserta bertanggung jawab memastikan identitas resmi yang sah (KTP
              atau Paspor dengan masa berlaku minimal 6 bulan untuk paket internasional).
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p>
              <strong>1. Tujuan Pengumpulan Data:</strong> Data pemesan dan peserta digunakan semata-mata untuk
              memproses reservasi perjalanan, penerbitan voucher, serta koordinasi logistik tur.
            </p>
            <p>
              <strong>2. Keamanan Pencarian Pemesanan:</strong> Akses rincian pemesanan memerlukan kombinasi Kode Booking
              serta verifikasi Email atau Nomor Telepon yang sesuai.
            </p>
          </div>
        )}
      </ModalDialog>

      {/* Global Toast Stack */}
      <div className="pointer-events-none absolute top-14 left-3 right-3 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const styles = {
            success: 'bg-emerald-900 text-white',
            error: 'bg-rose-900 text-white',
            warning: 'bg-amber-900 text-white',
            info: 'bg-[#0B2545] text-white'
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`px-3.5 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-fade-in ${styles}`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span className="flex-1">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
