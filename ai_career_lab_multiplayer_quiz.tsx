import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import {
  Trophy,
  Users,
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  BarChart3,
  Download,
  LogOut,
  Sparkles,
  QrCode,
  UserCheck,
  UserX,
  Pause,
  FastForward,
  RotateCcw,
  Search,
  Eye,
  FileText,
  Award,
  Crown,
  ChevronRight,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  HelpCircle,
  BookOpen,
  History,
  Settings,
  AlertTriangle,
  Wifi,
  WifiOff,
  FileSpreadsheet,
  Code2,
} from 'lucide-react';

// ============================================================================
// 1. FIREBASE INITIALIZATION (STRICTLY FOLLOWING ENVIRONMENT RULES)
// ============================================================================
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ai-career-lab-quiz';

// ============================================================================
// 2. 20 SOAL PILIHAN GANDA (A, B, C, D, E) — KUNCI JAWABAN ACAK SEIMBANG
//    Distribusi Kunci Jawaban: A = 4, B = 4, C = 4, D = 4, E = 4
// ============================================================================
const INITIAL_20_QUESTIONS = [
  {
    id: 'q1',
    order: 1,
    questionText:
      'Dalam proses rekrutmen modern, perusahaan lebih mengutamakan Skill Inventory dibandingkan Degree Bias. Apa implikasi utama dari prinsip tersebut?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'A',
    originalKey: 'C',
    topic: 'Skill Inventory vs Degree Bias',
    options: [
      {
        label: 'A',
        text: 'Perusahaan menilai kapabilitas teknis dan interpersonal yang terbukti mampu menyelesaikan tantangan bisnis.',
      },
      {
        label: 'B',
        text: 'Perusahaan mengutamakan kesesuaian jurusan dengan posisi pekerjaan.',
      },
      {
        label: 'C',
        text: 'Perusahaan hanya mempertimbangkan nilai akademik dan IPK pelamar.',
      },
      {
        label: 'D',
        text: 'Perusahaan lebih mengutamakan pengalaman kerja dibandingkan seluruh bentuk pendidikan.',
      },
      {
        label: 'E',
        text: 'Perusahaan hanya merekrut kandidat yang memiliki sertifikasi profesional.',
      },
    ],
  },
  {
    id: 'q2',
    order: 2,
    questionText:
      'Seorang mahasiswa mencantumkan kemampuan digital marketing dalam CV. Namun, ia tidak memiliki proyek, portofolio, atau hasil pekerjaan yang dapat membuktikan kemampuan tersebut. Prinsip fundamental karier apa yang belum diterapkan?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'E',
    originalKey: 'B',
    topic: 'Evidence-Based Profile',
    options: [
      { label: 'A', text: 'Degree Bias.' },
      { label: 'B', text: 'Skill Inventory.' },
      { label: 'C', text: 'Career Alignment.' },
      { label: 'D', text: 'Industry Mapping.' },
      { label: 'E', text: 'Evidence-Based Profile.' },
    ],
  },
  {
    id: 'q3',
    order: 3,
    questionText:
      'Seorang mahasiswa ingin melamar sebagai Social Media Specialist. Ia memiliki pengalaman organisasi, tetapi sebagian besar deskripsi pengalamannya tidak berkaitan dengan kebutuhan posisi tersebut. Langkah paling tepat berdasarkan prinsip keselarasan karier adalah ...',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'B',
    originalKey: 'C',
    topic: 'Career Alignment',
    options: [
      {
        label: 'A',
        text: 'Memasukkan seluruh pengalaman organisasi tanpa mempertimbangkan relevansinya.',
      },
      {
        label: 'B',
        text: 'Menyesuaikan profil dan menonjolkan kompetensi yang relevan dengan kebutuhan industri serta posisi yang dilamar.',
      },
      {
        label: 'C',
        text: 'Menghapus seluruh pengalaman organisasi dan hanya mencantumkan pendidikan.',
      },
      {
        label: 'D',
        text: 'Mengutamakan pengalaman yang memiliki jabatan tertinggi meskipun tidak relevan.',
      },
      {
        label: 'E',
        text: 'Menambahkan sebanyak mungkin keterampilan populer agar CV terlihat unggul.',
      },
    ],
  },
  {
    id: 'q4',
    order: 4,
    questionText:
      'Apa fungsi utama Applicant Tracking System (ATS) dalam proses rekrutmen modern?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'D',
    originalKey: 'D',
    topic: 'Applicant Tracking System (ATS)',
    options: [
      {
        label: 'A',
        text: 'Melakukan wawancara otomatis dan menentukan kepribadian kandidat.',
      },
      {
        label: 'B',
        text: 'Menggantikan seluruh tugas HRD dalam proses seleksi karyawan.',
      },
      {
        label: 'C',
        text: 'Menilai kemampuan komunikasi kandidat melalui rekaman suara.',
      },
      {
        label: 'D',
        text: 'Menyaring CV secara otomatis sebelum dokumen dibaca oleh HRD.',
      },
      {
        label: 'E',
        text: 'Menentukan besaran gaji berdasarkan pengalaman kandidat.',
      },
    ],
  },
  {
    id: 'q5',
    order: 5,
    questionText:
      'Seorang pelamar membuat CV dengan desain dua kolom, banyak ikon, grafik kemampuan, dan elemen visual. Mengapa format tersebut berpotensi kurang optimal untuk sistem ATS berdasarkan rekomendasi materi?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'C',
    originalKey: 'C',
    topic: 'Format CV ATS-Friendly',
    options: [
      {
        label: 'A',
        text: 'ATS hanya dapat membaca CV yang menggunakan format PDF.',
      },
      {
        label: 'B',
        text: 'Elemen visual selalu menyebabkan kandidat didiskualifikasi.',
      },
      {
        label: 'C',
        text: 'Format tersebut berpotensi mengganggu keterbacaan struktur informasi, sehingga format satu kolom lebih direkomendasikan.',
      },
      {
        label: 'D',
        text: 'HRD tidak diperbolehkan membaca CV dengan desain visual.',
      },
      {
        label: 'E',
        text: 'ATS hanya menerima CV yang dibuat menggunakan Microsoft Word.',
      },
    ],
  },
  {
    id: 'q6',
    order: 6,
    questionText:
      'Dalam menyusun CV ATS-Friendly, seorang kandidat menggunakan heading kreatif seperti My Journey, What I Can Do, dan My Story untuk menggantikan bagian pengalaman, keterampilan, dan pendidikan. Apa kelemahan utama pendekatan tersebut?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'A',
    originalKey: 'B',
    topic: 'Struktur Heading ATS',
    options: [
      {
        label: 'A',
        text: 'Heading tersebut berpotensi menyulitkan sistem mengenali kategori informasi karena tidak menggunakan heading standar.',
      },
      { label: 'B', text: 'Heading kreatif membuat CV terlalu panjang.' },
      {
        label: 'C',
        text: 'Heading kreatif menyebabkan seluruh kata kunci dalam CV terhapus.',
      },
      {
        label: 'D',
        text: 'Heading tersebut membuat kandidat dianggap tidak memiliki pengalaman kerja.',
      },
      {
        label: 'E',
        text: 'Heading kreatif hanya dapat digunakan oleh kandidat profesional.',
      },
    ],
  },
  {
    id: 'q7',
    order: 7,
    questionText:
      'Seorang kandidat memiliki pengalaman yang relevan dengan posisi pekerjaan, tetapi CV-nya tidak menggunakan istilah atau kata kunci yang sesuai dengan deskripsi lowongan. Strategi perbaikan yang paling tepat adalah ...',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'E',
    originalKey: 'C',
    topic: 'Optimasi Kata Kunci CV',
    options: [
      {
        label: 'A',
        text: 'Menambahkan seluruh kata kunci populer tanpa mempertimbangkan pengalaman.',
      },
      {
        label: 'B',
        text: 'Mengganti seluruh isi CV dengan deskripsi pekerjaan dari perusahaan.',
      },
      {
        label: 'C',
        text: 'Menghapus pengalaman yang tidak memiliki kata kunci identik dengan lowongan.',
      },
      {
        label: 'D',
        text: 'Menggunakan istilah teknis sebanyak mungkin agar CV terlihat profesional.',
      },
      {
        label: 'E',
        text: 'Melakukan penyesuaian kata kunci berdasarkan deskripsi lowongan dengan tetap mempertahankan kebenaran pengalaman.',
      },
    ],
  },
  {
    id: 'q8',
    order: 8,
    questionText:
      'Apa perbedaan mendasar antara penggunaan Gemini AI Career Coach dan penyusunan CV secara manual tanpa bantuan AI?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'D',
    originalKey: 'C',
    topic: 'Gemini AI Career Coach',
    options: [
      {
        label: 'A',
        text: 'Gemini dapat menjamin kandidat diterima kerja tanpa melalui seleksi.',
      },
      {
        label: 'B',
        text: 'Gemini dapat menggantikan pengalaman kerja yang belum dimiliki kandidat.',
      },
      {
        label: 'C',
        text: 'Gemini menentukan seluruh kompetensi yang wajib dimiliki kandidat berdasarkan IPK.',
      },
      {
        label: 'D',
        text: 'Gemini membantu menstrukturkan gagasan dan menemukan sudut pandang terbaik tanpa mengarang pengalaman fiktif.',
      },
      {
        label: 'E',
        text: 'Gemini secara otomatis mengubah seluruh pengalaman mahasiswa menjadi pengalaman profesional.',
      },
    ],
  },
  {
    id: 'q9',
    order: 9,
    questionText:
      'Seorang mahasiswa meminta Gemini membuatkan pengalaman kerja selama satu tahun di perusahaan ternama, padahal ia belum pernah bekerja di sana. Berdasarkan prinsip penggunaan Gemini AI Career Coach, tindakan yang paling tepat adalah ...',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'A',
    originalKey: 'D',
    topic: 'Etika & Kebenaran Data CV',
    options: [
      {
        label: 'A',
        text: 'Mengarahkan Gemini untuk mengembangkan pengalaman nyata dari organisasi, proyek kelas, atau kompetisi yang pernah diikuti.',
      },
      {
        label: 'B',
        text: 'Mempertahankan pengalaman tersebut selama sesuai dengan posisi yang dilamar.',
      },
      {
        label: 'C',
        text: 'Menggunakan pengalaman fiktif tersebut sebagai gambaran kemampuan profesional.',
      },
      {
        label: 'D',
        text: 'Menggunakan hasil tersebut karena AI dapat meningkatkan daya saing CV.',
      },
      {
        label: 'E',
        text: 'Membiarkan Gemini menentukan pengalaman yang paling menarik bagi HRD.',
      },
    ],
  },
  {
    id: 'q10',
    order: 10,
    questionText:
      'Apa keunggulan utama Gemini Canvas dibandingkan interaksi biasa dengan chatbot ketika melakukan penyuntingan CV?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'B',
    originalKey: 'B',
    topic: 'Keunggulan Gemini Canvas',
    options: [
      {
        label: 'A',
        text: 'Dapat menjamin seluruh isi CV sesuai dengan standar setiap perusahaan.',
      },
      {
        label: 'B',
        text: 'Memungkinkan penyuntingan interaktif secara berdampingan, termasuk menyorot bagian tertentu dan menyesuaikan gaya bahasa tanpa mengulang prompt dari awal.',
      },
      {
        label: 'C',
        text: 'Secara otomatis mengirimkan CV kepada perusahaan yang sedang membuka lowongan.',
      },
      {
        label: 'D',
        text: 'Mengubah seluruh pengalaman menjadi data kuantitatif tanpa membutuhkan informasi pengguna.',
      },
      {
        label: 'E',
        text: 'Menggantikan proses evaluasi dan verifikasi CV oleh manusia.',
      },
    ],
  },
  {
    id: 'q11',
    order: 11,
    questionText:
      'Dalam penggunaan Gemini Canvas, pengguna ingin memperbaiki satu kalimat pengalaman kerja yang terlalu panjang tanpa mengubah bagian CV lainnya. Fitur yang paling sesuai dengan kebutuhan tersebut adalah ...',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'E',
    originalKey: 'C',
    topic: 'Penyuntingan Granular Gemini Canvas',
    options: [
      { label: 'A', text: 'Mengulang seluruh percakapan dari awal.' },
      {
        label: 'B',
        text: 'Menghapus seluruh dokumen dan membuat dokumen baru.',
      },
      {
        label: 'C',
        text: 'Mengganti seluruh isi dokumen menggunakan satu prompt umum.',
      },
      {
        label: 'D',
        text: 'Mengubah format dokumen menjadi gambar agar tidak dapat diedit.',
      },
      {
        label: 'E',
        text: 'Mengedit dan menyorot bagian tertentu serta mengatur panjang kalimat secara granular.',
      },
    ],
  },
  {
    id: 'q12',
    order: 12,
    questionText:
      'Dalam praktik CV Audit & Job Matching, pengguna memasukkan deskripsi lowongan dan draf pengalaman ke Gemini Canvas. Mengapa kedua informasi tersebut perlu diberikan secara bersamaan?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'C',
    originalKey: 'B',
    topic: 'CV Audit & Job Matching',
    options: [
      {
        label: 'A',
        text: 'Agar Gemini dapat menentukan perusahaan yang paling terkenal.',
      },
      {
        label: 'B',
        text: 'Agar Gemini dapat membuat pengalaman kerja baru berdasarkan deskripsi perusahaan.',
      },
      {
        label: 'C',
        text: 'Agar Gemini dapat membandingkan kebutuhan posisi dengan pengalaman kandidat dan menemukan kesenjangan kata kunci.',
      },
      {
        label: 'D',
        text: 'Agar Gemini dapat menentukan gaji yang harus diminta kandidat.',
      },
      {
        label: 'E',
        text: 'Agar Gemini dapat menghilangkan seluruh pengalaman yang tidak menghasilkan angka.',
      },
    ],
  },
  {
    id: 'q13',
    order: 13,
    questionText:
      'Dalam formula XYZ yang digunakan pada materi, unsur yang membentuk penulisan ulang poin pengalaman adalah ...',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'A',
    originalKey: 'C',
    topic: 'Formula XYZ pada CV',
    options: [
      { label: 'A', text: 'Action Verb + Context + Quantifiable Metric.' },
      { label: 'B', text: 'Expertise + Youth + Achievement.' },
      { label: 'C', text: 'Experience + Year + Job Description.' },
      { label: 'D', text: 'Action Verb + Job Title + Company Name.' },
      { label: 'E', text: 'Objective + Experience + Certification.' },
    ],
  },
  {
    id: 'q14',
    order: 14,
    questionText:
      'Perhatikan dua deskripsi pengalaman berikut.\nDeskripsi 1: Bertanggung jawab mengelola media sosial organisasi.\nDeskripsi 2: Mengembangkan strategi konten media sosial organisasi selama tiga bulan untuk meningkatkan jangkauan audiens sebesar 30%.\nMengapa deskripsi kedua lebih kuat dalam konteks penyusunan CV berbasis bukti?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'D',
    originalKey: 'B',
    topic: 'Implementasi Bukti Kuantitatif',
    options: [
      {
        label: 'A',
        text: 'Menggunakan kalimat lebih panjang dan istilah profesional.',
      },
      {
        label: 'B',
        text: 'Menggunakan lebih banyak kata kunci yang bersifat umum.',
      },
      {
        label: 'C',
        text: 'Menghilangkan tanggung jawab kandidat dan berfokus pada organisasi.',
      },
      {
        label: 'D',
        text: 'Menunjukkan tindakan, konteks pekerjaan, serta hasil yang dapat diukur.',
      },
      {
        label: 'E',
        text: 'Menggunakan angka untuk menggantikan seluruh penjelasan pengalaman.',
      },
    ],
  },
  {
    id: 'q15',
    order: 15,
    questionText:
      'Seorang mahasiswa memiliki pengalaman menjadi ketua pelaksana kegiatan kampus, tetapi kesulitan menjelaskan relevansinya dengan posisi Project Management Intern. Bagaimana Gemini Canvas dapat dimanfaatkan secara tepat?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'B',
    originalKey: 'C',
    topic: 'Reframing Pengalaman Organisasi',
    options: [
      {
        label: 'A',
        text: 'Meminta Gemini mengubah jabatan ketua pelaksana menjadi manajer proyek profesional.',
      },
      {
        label: 'B',
        text: 'Meminta Gemini mengidentifikasi kompetensi yang relevan, menyusun ulang poin pengalaman dengan formula XYZ, dan memprediksi pertanyaan seleksi HRD.',
      },
      {
        label: 'C',
        text: 'Meminta Gemini menghapus pengalaman organisasi karena bukan pengalaman perusahaan.',
      },
      {
        label: 'D',
        text: 'Meminta Gemini menambahkan tanggung jawab yang biasanya dimiliki seorang manajer proyek.',
      },
      {
        label: 'E',
        text: 'Meminta Gemini membuat sertifikat pengalaman kerja berdasarkan kegiatan tersebut.',
      },
    ],
  },
  {
    id: 'q16',
    order: 16,
    questionText:
      'Apa karakteristik utama Gemini Live yang membuatnya relevan untuk simulasi wawancara kerja?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'E',
    originalKey: 'B',
    topic: 'Karakteristik Gemini Live',
    options: [
      {
        label: 'A',
        text: 'Menghasilkan CV secara otomatis melalui perintah suara.',
      },
      {
        label: 'B',
        text: 'Mengubah jawaban wawancara menjadi sertifikat kompetensi.',
      },
      {
        label: 'C',
        text: 'Menggantikan HRD dalam menentukan kelulusan wawancara.',
      },
      {
        label: 'D',
        text: 'Menghasilkan daftar pertanyaan wawancara tanpa memungkinkan interaksi langsung.',
      },
      {
        label: 'E',
        text: 'Menghadirkan percakapan audio dua arah secara alami tanpa jeda mengetik.',
      },
    ],
  },
  {
    id: 'q17',
    order: 17,
    questionText:
      'Mengapa latihan mock interview menggunakan Gemini Live dapat membantu mahasiswa mempersiapkan wawancara kerja?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'C',
    originalKey: 'C',
    topic: 'Manfaat Mock Interview Gemini Live',
    options: [
      {
        label: 'A',
        text: 'Karena Gemini Live dapat menjamin jawaban kandidat selalu benar.',
      },
      {
        label: 'B',
        text: 'Karena latihan tersebut membuat kandidat tidak perlu mempelajari profil perusahaan.',
      },
      {
        label: 'C',
        text: 'Karena kandidat dapat melatih mental, intonasi, dan kelancaran artikulasi melalui percakapan audio dua arah.',
      },
      {
        label: 'D',
        text: 'Karena Gemini Live dapat menggantikan seluruh proses wawancara dengan HRD.',
      },
      {
        label: 'E',
        text: 'Karena Gemini Live secara otomatis menentukan kompetensi kandidat berdasarkan suara.',
      },
    ],
  },
  {
    id: 'q18',
    order: 18,
    questionText:
      'Dalam wawancara kerja, seorang kandidat ditanya mengenai pengalaman menyelesaikan konflik dalam organisasi. Ia menjawab dengan menceritakan situasi, tugas yang menjadi tanggung jawabnya, tindakan yang dilakukan, dan hasil yang diperoleh. Metode penyusunan jawaban yang paling sesuai adalah ...',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'D',
    originalKey: 'C',
    topic: 'Metode Wawancara STAR',
    options: [
      { label: 'A', text: 'SMART Method.' },
      { label: 'B', text: 'SWOT Analysis.' },
      { label: 'C', text: 'XYZ Formula.' },
      { label: 'D', text: 'STAR Method.' },
      { label: 'E', text: 'Skill Inventory.' },
    ],
  },
  {
    id: 'q19',
    order: 19,
    questionText:
      'Seorang kandidat menjawab pertanyaan wawancara dengan menceritakan situasi dan tanggung jawabnya secara panjang lebar, tetapi tidak menjelaskan tindakan yang dilakukan maupun hasil akhirnya. Apa kelemahan utama jawaban tersebut jika menggunakan STAR Method?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'B',
    originalKey: 'B',
    topic: 'Evaluasi Jawaban STAR Method',
    options: [
      {
        label: 'A',
        text: 'Tidak menunjukkan latar belakang pendidikan kandidat.',
      },
      {
        label: 'B',
        text: 'Tidak memperlihatkan kontribusi nyata kandidat dan hasil dari tindakan yang dilakukan.',
      },
      { label: 'C', text: 'Terlalu banyak menggunakan kata kerja aktif.' },
      {
        label: 'D',
        text: 'Tidak menyebutkan nama perusahaan secara berulang.',
      },
      {
        label: 'E',
        text: 'Tidak menjelaskan seluruh pengalaman organisasi kandidat.',
      },
    ],
  },
  {
    id: 'q20',
    order: 20,
    questionText:
      'Seorang mahasiswa menggunakan Gemini untuk menyusun CV, melakukan audit kata kunci, memperbaiki deskripsi pengalaman, dan berlatih wawancara. Namun, seluruh hasil AI langsung digunakan tanpa diperiksa kembali. Apa risiko terbesar dari perilaku tersebut?',
    timeLimit: 25,
    maxPoints: 1000,
    correctOption: 'C',
    originalKey: 'C',
    topic: 'Verifikasi Manusia (Human-in-the-Loop)',
    options: [
      {
        label: 'A',
        text: 'Proses rekrutmen menjadi lebih cepat daripada seharusnya.',
      },
      { label: 'B', text: 'CV menjadi terlalu sederhana untuk dibaca HRD.' },
      {
        label: 'C',
        text: 'Informasi yang tidak akurat atau tidak sesuai pengalaman nyata dapat masuk ke dalam CV maupun jawaban wawancara.',
      },
      {
        label: 'D',
        text: 'ATS tidak dapat mengenali kandidat yang menggunakan AI.',
      },
      {
        label: 'E',
        text: 'Kandidat kehilangan seluruh pengalaman yang pernah dimiliki.',
      },
    ],
  },
];

// Warna Opsi A, B, C, D, E sesuai spesifikasi desain game edukasi modern
const OPTION_THEMES = {
  A: {
    bg: 'bg-rose-600 hover:bg-rose-500 border-rose-800 text-white',
    badge: 'bg-rose-900/60 text-rose-100',
    light: 'bg-rose-500/20 border-rose-400 text-rose-200',
    name: 'Merah',
  },
  B: {
    bg: 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white',
    badge: 'bg-blue-900/60 text-blue-100',
    light: 'bg-blue-500/20 border-blue-400 text-blue-200',
    name: 'Biru',
  },
  C: {
    bg: 'bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-950',
    badge: 'bg-amber-950/30 text-slate-950',
    light: 'bg-amber-500/20 border-amber-400 text-amber-200',
    name: 'Kuning',
  },
  D: {
    bg: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white',
    badge: 'bg-emerald-900/60 text-emerald-100',
    light: 'bg-emerald-500/20 border-emerald-400 text-emerald-200',
    name: 'Hijau',
  },
  E: {
    bg: 'bg-purple-600 hover:bg-purple-500 border-purple-800 text-white',
    badge: 'bg-purple-900/60 text-purple-100',
    light: 'bg-purple-500/20 border-purple-400 text-purple-200',
    name: 'Ungu',
  },
};

const AVATAR_LIST = [
  '🚀',
  '🦊',
  '🐼',
  '🦁',
  '🐯',
  '🐸',
  '🦄',
  '🐙',
  '🦉',
  '🦋',
  '⚡',
  '👑',
];

// ============================================================================
// 3. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Firebase Auth State
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Navigation & Access Role State
  // Screens: 'HOME' | 'OWNER_LOGIN' | 'OWNER_DASHBOARD' | 'PLAYER_ARENA'
  const [screen, setScreen] = useState('HOME');
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);

  // Brute-force Protection for Owner Login (Code: Adhnan)
  const [ownerCodeInput, setOwnerCodeInput] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  // Public Player Join Form State
  const [joinPinInput, setJoinPinInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_LIST[0]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [myParticipantId, setMyParticipantId] = useState(null);

  // Real-Time Firestore Collections State
  const [rooms, setRooms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [customQuestions, setCustomQuestions] = useState(INITIAL_20_QUESTIONS);

  // Host Dashboard Navigation & Filters
  const [ownerTab, setOwnerTab] = useState('LOBBY_CONTROL');
  // Tabs: 'OVERVIEW' | 'LOBBY_CONTROL' | 'LIVE_MONITOR' | 'QUESTIONS_BANK' | 'PARTICIPANT_RECAP' | 'GAME_HISTORY' | 'ANALYTICS' | 'SOURCE_DOWNLOAD'
  const [selectedHostRoomId, setSelectedHostRoomId] = useState(null);
  const [recapSearch, setRecapSearch] = useState('');
  const [recapPinFilter, setRecapPinFilter] = useState('ALL');
  const [inspectedParticipantId, setInspectedParticipantId] = useState(null);
  const [isFullScreenLobby, setIsFullScreenLobby] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Synchronized Gameplay Timer State
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Helper to show non-blocking custom notification toast
  const showNotification = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // --------------------------------------------------------------------------
  // STEP 1: FIREBASE AUTHENTICATION (RULE 3)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // STEP 2: REAL-TIME FIRESTORE LISTENERS (GUARDED BY `if (!user) return;`)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const roomsRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms'
    );
    const participantsRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participants'
    );
    const answersRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participant_answers'
    );
    const historyRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_history'
    );

    const unsubRooms = onSnapshot(
      roomsRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRooms(list);
      },
      (err) => console.error('Rooms listener error:', err)
    );

    const unsubParticipants = onSnapshot(
      participantsRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setParticipants(list);
      },
      (err) => console.error('Participants listener error:', err)
    );

    const unsubAnswers = onSnapshot(
      answersRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAnswers(list);
      },
      (err) => console.error('Answers listener error:', err)
    );

    const unsubHistory = onSnapshot(
      historyRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
        setGameHistory(list);
      },
      (err) => console.error('History listener error:', err)
    );

    return () => {
      unsubRooms();
      unsubParticipants();
      unsubAnswers();
      unsubHistory();
    };
  }, [user]);

  // --------------------------------------------------------------------------
  // STEP 3: GLOBAL HIGH-PRECISION SYNCHRONIZED CLOCK (100ms tick)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Heartbeat for active player connection status
  useEffect(() => {
    if (!user || !myParticipantId || screen !== 'PLAYER_ARENA') return;
    const heartbeat = setInterval(async () => {
      try {
        const pRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'participants',
          myParticipantId
        );
        await updateDoc(pRef, {
          connectionStatus: 'ONLINE',
          lastSeenAt: Date.now(),
        });
      } catch (e) {
        // ignore transient error
      }
    }, 8000);
    return () => clearInterval(heartbeat);
  }, [user, myParticipantId, screen]);

  // --------------------------------------------------------------------------
  // DERIVED ROOM, PARTICIPANTS, & GAMEPLAY DATA
  // --------------------------------------------------------------------------
  const currentHostRoom = useMemo(() => {
    if (selectedHostRoomId) {
      return rooms.find((r) => r.id === selectedHostRoomId) || rooms[0] || null;
    }
    return rooms[0] || null;
  }, [rooms, selectedHostRoomId]);

  const currentPlayerRoom = useMemo(() => {
    if (!activeRoomId) return null;
    return rooms.find((r) => r.id === activeRoomId) || null;
  }, [rooms, activeRoomId]);

  const myParticipant = useMemo(() => {
    if (!myParticipantId) return null;
    return participants.find((p) => p.id === myParticipantId) || null;
  }, [participants, myParticipantId]);

  // Helper to sort participants for leaderboard:
  // 1. Highest Total Score, 2. Highest Correct Count, 3. Fastest Total Response Time
  const getRoomParticipantsSorted = (roomId) => {
    if (!roomId) return [];
    return participants
      .filter((p) => p.roomId === roomId && !p.isRemoved)
      .sort((a, b) => {
        if ((b.totalScore || 0) !== (a.totalScore || 0)) {
          return (b.totalScore || 0) - (a.totalScore || 0);
        }
        if ((b.correctCount || 0) !== (a.correctCount || 0)) {
          return (b.correctCount || 0) - (a.correctCount || 0);
        }
        return (a.totalResponseTimeMs || 0) - (b.totalResponseTimeMs || 0);
      });
  };

  const hostRoomParticipants = useMemo(
    () => getRoomParticipantsSorted(currentHostRoom?.id),
    [participants, currentHostRoom?.id]
  );

  const playerRoomParticipants = useMemo(
    () => getRoomParticipantsSorted(currentPlayerRoom?.id),
    [participants, currentPlayerRoom?.id]
  );

  // Automatic Question Timer Expiry Check (When Host is monitoring or Automatic transition is active)
  useEffect(() => {
    if (!isOwnerAuthenticated || !currentHostRoom) return;
    if (currentHostRoom.status !== 'PLAYING') return;

    const endMs = currentHostRoom.questionEndTime || 0;
    if (endMs > 0 && nowTimestamp >= endMs + 400) {
      handleHostLockQuestionAndShowResult(currentHostRoom);
    }
  }, [nowTimestamp, isOwnerAuthenticated, currentHostRoom]);

  // --------------------------------------------------------------------------
  // OWNER AUTHENTICATION HANDLER (ACCESS CODE: Adhnan)
  // --------------------------------------------------------------------------
  const handleOwnerLogin = (e) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const waitSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      showNotification(
        `Terlalu banyak percobaan gagal! Coba lagi dalam ${waitSec} detik.`,
        'error'
      );
      return;
    }

    // Strict verification of Owner Code: "Adhnan"
    if (ownerCodeInput.trim() === 'Adhnan') {
      setIsOwnerAuthenticated(true);
      setLoginAttempts(0);
      setLockoutUntil(null);
      setOwnerCodeInput('');
      setScreen('OWNER_DASHBOARD');
      showNotification(
        'Selamat datang, Owner Adhnan! Akses penuh diaktifkan.',
        'success'
      );
    } else {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutUntil(Date.now() + 60 * 1000); // 1 minute lockout
        showNotification(
          'Batas percobaan login terlampaui! Akses dikunci sementara (60 detik).',
          'error'
        );
      } else {
        showNotification(
          `Kode akses pemilik salah! Sisa percobaan: ${5 - nextAttempts}`,
          'error'
        );
      }
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    setScreen('HOME');
    showNotification('Sesi Host / Owner telah keluar.', 'info');
  };

  // --------------------------------------------------------------------------
  // HOST ROOM & GAMEPLAY CONTROLLERS
  // --------------------------------------------------------------------------
  const handleCreateRoom = async (transitionMode = 'HOST_CONTROLLED') => {
    if (!user) return;
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const roomId = `room_${pin}_${Date.now()}`;
    const roomRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms',
      roomId
    );

    const newRoom = {
      pin,
      quizTitle: 'AI CAREER LAB: FROM CV TO INTERVIEW WITH GEMINI',
      hostName: 'Adhnan',
      status: 'WAITING', // WAITING | PLAYING | QUESTION_RESULT | PAUSED | FINISHED | CLOSED
      isLocked: false,
      allowLateJoin: false,
      transitionMode, // HOST_CONTROLLED | AUTOMATIC
      currentQuestionIndex: 0,
      totalQuestions: customQuestions.length,
      questionStartTime: null,
      questionEndTime: null,
      pausedRemainingMs: null,
      createdAt: Date.now(),
      finishedAt: null,
    };

    await setDoc(roomRef, newRoom);
    setSelectedHostRoomId(roomId);
    setOwnerTab('LOBBY_CONTROL');
    showNotification(
      `Room baru berhasil dibuat! PIN Permainan: ${pin}`,
      'success'
    );
  };

  const handleToggleLockRoom = async (room) => {
    if (!user || !room) return;
    const roomRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms',
      room.id
    );
    await updateDoc(roomRef, { isLocked: !room.isLocked });
    showNotification(
      !room.isLocked
        ? 'Room dikunci. Peserta baru tidak dapat bergabung.'
        : 'Kunci Room dibuka kembali.',
      'info'
    );
  };

  const handleToggleLateJoin = async (room) => {
    if (!user || !room) return;
    const roomRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms',
      room.id
    );
    await updateDoc(roomRef, { allowLateJoin: !room.allowLateJoin });
  };

  const handleRemoveParticipant = async (participant) => {
    if (!user || !participant) return;
    const pRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participants',
      participant.id
    );
    await updateDoc(pRef, { isRemoved: true, connectionStatus: 'DISCONNECTED' });
    showNotification(
      `Peserta "${participant.nickname}" telah dikeluarkan dari Room.`,
      'info'
    );
  };

  const executeSynchronizedStartQuestion = async (room, questionIdx) => {
    if (!user || !room) return;
    const q = customQuestions[questionIdx];
    if (!q) return;

    const now = Date.now();
    const startTime = now + 3500; // 3.5 detik Countdown 3-2-1-GO! serentak
    const endTime = startTime + (q.timeLimit || 25) * 1000;

    const roomRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms',
      room.id
    );
    await updateDoc(roomRef, {
      status: 'PLAYING',
      currentQuestionIndex: questionIdx,
      questionStartTime: startTime,
      questionEndTime: endTime,
      pausedRemainingMs: null,
    });
  };

  const handleHostStartGame = (room) => {
    if (!room) return;
    const roomPlayers = getRoomParticipantsSorted(room.id);
    if (roomPlayers.length === 0) {
      showNotification(
        'Belum ada peserta di dalam Room! Bagikan PIN terlebih dahulu.',
        'error'
      );
      return;
    }

    const notReadyPlayers = roomPlayers.filter(
      (p) => p.readyStatus !== 'READY'
    );
    if (notReadyPlayers.length > 0) {
      setConfirmModal({
        title: 'Peringatan Kesiapan Peserta',
        message: `Masih ada ${notReadyPlayers.length} dari ${roomPlayers.length} peserta yang belum menekan tombol SIAP (${notReadyPlayers
          .map((p) => p.nickname)
          .join(', ')}). Apakah Anda tetap ingin memulai kuis secara serentak sekarang?`,
        confirmLabel: 'Ya, Mulai Serentak Sekarang',
        onConfirm: async () => {
          setConfirmModal(null);
          await executeSynchronizedStartQuestion(room, 0);
          showNotification(
            'Hitung mundur 3-2-1-GO dimulai di seluruh perangkat peserta!',
            'success'
          );
        },
      });
    } else {
      executeSynchronizedStartQuestion(room, 0);
      showNotification(
        'Seluruh peserta SIAP! Memulai hitung mundur 3-2-1-GO serentak!',
        'success'
      );
    }
  };

  const handleHostLockQuestionAndShowResult = async (room) => {
    if (!user || !room || room.status === 'QUESTION_RESULT') return;

    // Update previousRank & currentRank for all participants in room
    const sorted = getRoomParticipantsSorted(room.id);
    await Promise.all(
      sorted.map((p, index) => {
        const pRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'participants',
          p.id
        );
        return updateDoc(pRef, {
          previousRank: p.currentRank || index + 1,
          currentRank: index + 1,
        });
      })
    );

    const roomRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms',
      room.id
    );
    await updateDoc(roomRef, {
      status: 'QUESTION_RESULT',
      questionEndTime: Date.now(),
    });
  };

  const handleHostPauseOrResume = async (room) => {
    if (!user || !room) return;
    const roomRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'game_rooms',
      room.id
    );

    if (room.status === 'PLAYING') {
      const remainingMs = Math.max(0, (room.questionEndTime || 0) - Date.now());
      await updateDoc(roomRef, {
        status: 'PAUSED',
        pausedRemainingMs: remainingMs,
      });
      showNotification('Permainan dijeda (Paused). Timer dihentikan.', 'info');
    } else if (room.status === 'PAUSED') {
      const remainingMs = room.pausedRemainingMs || 10000;
      const now = Date.now();
      await updateDoc(roomRef, {
        status: 'PLAYING',
        questionStartTime: now - 1000,
        questionEndTime: now + remainingMs,
        pausedRemainingMs: null,
      });
      showNotification('Permainan dilanjutkan kembali!', 'success');
    }
  };

  const handleHostNextQuestionOrFinish = async (room) => {
    if (!user || !room) return;
    const nextIdx = (room.currentQuestionIndex || 0) + 1;

    if (nextIdx >= customQuestions.length) {
      // Finish Game & Archive to Game History
      const sorted = getRoomParticipantsSorted(room.id);
      const finishedAt = Date.now();

      const roomRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'game_rooms',
        room.id
      );
      await updateDoc(roomRef, {
        status: 'FINISHED',
        finishedAt,
      });

      // Save permanent snapshot to game_history
      const totalPlayers = sorted.length;
      const avgScore =
        totalPlayers > 0
          ? Math.round(
              sorted.reduce((acc, p) => acc + (p.totalScore || 0), 0) /
                totalPlayers
            )
          : 0;
      const avgAccuracy =
        totalPlayers > 0
          ? Number(
              (
                sorted.reduce(
                  (acc, p) =>
                    acc +
                    ((p.correctCount || 0) / customQuestions.length) * 100,
                  0
                ) / totalPlayers
              ).toFixed(1)
            )
          : 0;

      const historyRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'game_history',
        `hist_${room.id}`
      );
      await setDoc(historyRef, {
        roomId: room.id,
        pin: room.pin,
        quizTitle: room.quizTitle,
        createdAt: room.createdAt,
        finishedAt,
        totalParticipants: totalPlayers,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
        topThree: sorted.slice(0, 3).map((p, i) => ({
          rank: i + 1,
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.totalScore || 0,
        })),
        leaderboardSnapshot: JSON.stringify(
          sorted.map((p, i) => ({
            rank: i + 1,
            id: p.id,
            nickname: p.nickname,
            avatar: p.avatar,
            totalScore: p.totalScore || 0,
            correctCount: p.correctCount || 0,
            wrongCount: p.wrongCount || 0,
          }))
        ),
      });

      showNotification(
        'Seluruh 20 pertanyaan selesai! Menampilkan Podium Juara 1, 2, 3 & Top 10.',
        'success'
      );
    } else {
      await executeSynchronizedStartQuestion(room, nextIdx);
      showNotification(
        `Memulai Pertanyaan #${nextIdx + 1} secara serentak!`,
        'info'
      );
    }
  };

  // --------------------------------------------------------------------------
  // PLAYER JOIN, RECONNECT, READY, & ANSWER SUBMISSION HANDLERS
  // --------------------------------------------------------------------------
  const handlePlayerJoinRoom = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Menghubungkan ke server, mohon tunggu...', 'info');
      return;
    }

    const cleanPin = joinPinInput.trim();
    const cleanName = nicknameInput.trim();

    if (!cleanPin || !cleanName) {
      showNotification('PIN Permainan dan Nickname wajib diisi!', 'error');
      return;
    }

    const targetRoom = rooms.find((r) => r.pin === cleanPin);
    if (!targetRoom) {
      showNotification(
        `PIN "${cleanPin}" tidak ditemukan! Pastikan Host sudah membuat Room.`,
        'error'
      );
      return;
    }

    if (targetRoom.status === 'CLOSED' || targetRoom.status === 'FINISHED') {
      showNotification(
        'Room ini sudah selesai atau telah ditutup oleh Host.',
        'error'
      );
      return;
    }

    // Check if player is RECONNECTING with same nickname & browser user UID in this room
    const existingPlayer = participants.find(
      (p) =>
        p.roomId === targetRoom.id &&
        p.nickname.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingPlayer) {
      if (existingPlayer.isRemoved) {
        showNotification(
          'Anda telah dikeluarkan dari Room ini oleh Host.',
          'error'
        );
        return;
      }

      // If same user UID, allow seamless Reconnect!
      if (existingPlayer.userUid === user.uid) {
        const pRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'participants',
          existingPlayer.id
        );
        await updateDoc(pRef, {
          connectionStatus: 'ONLINE',
          lastSeenAt: Date.now(),
        });
        setActiveRoomId(targetRoom.id);
        setMyParticipantId(existingPlayer.id);
        setScreen('PLAYER_ARENA');
        showNotification(
          `Berhasil terhubung kembali (Reconnected) sebagai ${existingPlayer.nickname}! Skor tetap aman.`,
          'success'
        );
        return;
      } else {
        // Duplicate nickname from another person
        showNotification(
          `Nickname "${cleanName}" sudah digunakan peserta lain di Room ini! Gunakan nama unik.`,
          'error'
        );
        return;
      }
    }

    // Validate Room Lock & Late Join for new player
    if (targetRoom.isLocked) {
      showNotification('Room ini sedang dikunci oleh Host.', 'error');
      return;
    }

    if (targetRoom.status !== 'WAITING' && !targetRoom.allowLateJoin) {
      showNotification(
        'Permainan sedang berlangsung dan fitur Late Join dinonaktifkan oleh Host.',
        'error'
      );
      return;
    }

    // Create new participant in Room
    const newParticipantId = `player_${targetRoom.pin}_${user.uid}_${Date.now()}`;
    const pRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participants',
      newParticipantId
    );

    const currentRankPosition =
      getRoomParticipantsSorted(targetRoom.id).length + 1;

    await setDoc(pRef, {
      roomId: targetRoom.id,
      pin: targetRoom.pin,
      userUid: user.uid,
      nickname: cleanName,
      avatar: selectedAvatar,
      connectionStatus: 'ONLINE',
      readyStatus: 'WAITING', // WAITING | READY
      isRemoved: false,
      totalScore: 0,
      correctCount: 0,
      wrongCount: 0,
      totalResponseTimeMs: 0,
      currentRank: currentRankPosition,
      previousRank: currentRankPosition,
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
    });

    setActiveRoomId(targetRoom.id);
    setMyParticipantId(newParticipantId);
    setScreen('PLAYER_ARENA');
    showNotification(
      `Berhasil masuk ke Lobby Room ${targetRoom.pin}! Tekan tombol SIAP untuk memulai.`,
      'success'
    );
  };

  const handlePlayerToggleReady = async () => {
    if (!user || !myParticipant) return;
    const nextReady =
      myParticipant.readyStatus === 'READY' ? 'WAITING' : 'READY';
    const pRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participants',
      myParticipant.id
    );
    await updateDoc(pRef, {
      readyStatus: nextReady,
      lastSeenAt: Date.now(),
    });
  };

  const handlePlayerSubmitAnswer = async (optionLabel) => {
    if (!user || !currentPlayerRoom || !myParticipant) return;
    if (currentPlayerRoom.status !== 'PLAYING') return;

    const qIdx = currentPlayerRoom.currentQuestionIndex || 0;
    const currentQ = customQuestions[qIdx];
    if (!currentQ) return;

    // Prevent duplicate submission for the same question
    const answerDocId = `ans_${currentPlayerRoom.id}_${myParticipant.id}_${currentQ.id}`;
    const alreadySubmitted = answers.some((a) => a.id === answerDocId);
    if (alreadySubmitted) return;

    const now = Date.now();
    const startMs = currentPlayerRoom.questionStartTime || now;
    const endMs = currentPlayerRoom.questionEndTime || now;

    if (now < startMs) return; // Still in 3-2-1 countdown
    if (now > endMs + 500) {
      showNotification('Waktu menjawab sudah habis!', 'error');
      return;
    }

    const totalDurationMs = Math.max(1000, endMs - startMs);
    const clampedNow = Math.max(startMs, Math.min(now, endMs));
    const remainingMs = Math.max(0, endMs - clampedNow);
    const responseTimeMs = clampedNow - startMs;

    const isCorrect = optionLabel === currentQ.correctOption;
    // Official Scoring Formula: Score = 500 + (500 * remainingTime / totalTime)
    const pointsAwarded = isCorrect
      ? Math.round(500 + 500 * (remainingMs / totalDurationMs))
      : 0;

    const ansRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participant_answers',
      answerDocId
    );

    await setDoc(ansRef, {
      roomId: currentPlayerRoom.id,
      pin: currentPlayerRoom.pin,
      participantId: myParticipant.id,
      nickname: myParticipant.nickname,
      avatar: myParticipant.avatar,
      questionId: currentQ.id,
      questionOrder: currentQ.order,
      selectedOption: optionLabel,
      correctOption: currentQ.correctOption,
      isCorrect,
      pointsAwarded,
      responseTimeMs,
      submittedAt: now,
    });

    // Update participant cumulative score
    const pRef = doc(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'participants',
      myParticipant.id
    );
    await updateDoc(pRef, {
      totalScore: (myParticipant.totalScore || 0) + pointsAwarded,
      correctCount: (myParticipant.correctCount || 0) + (isCorrect ? 1 : 0),
      wrongCount: (myParticipant.wrongCount || 0) + (isCorrect ? 0 : 1),
      totalResponseTimeMs:
        (myParticipant.totalResponseTimeMs || 0) + responseTimeMs,
      lastSeenAt: now,
    });
  };

  // --------------------------------------------------------------------------
  // EXPORT CSV / EXCEL & PRINT PDF REPORTS (OWNER DASHBOARD)
  // --------------------------------------------------------------------------
  const handleExportCSV = () => {
    const validParticipants = participants.filter((p) => !p.isRemoved);
    if (validParticipants.length === 0) {
      showNotification('Belum ada data peserta untuk diekspor.', 'error');
      return;
    }

    const headers = [
      'No',
      'Nickname',
      'ID Peserta',
      'PIN Room',
      'Total Skor',
      'Peringkat',
      'Jawaban Benar',
      'Jawaban Salah',
      'Tidak Dijawab',
      'Persentase Akurasi (%)',
      'Rata-Rata Waktu Jawab (detik)',
      'Detail Jawaban (Soal 1-20)',
      'Waktu Bergabung',
    ];

    const rows = validParticipants.map((p, idx) => {
      const pAnswers = answers
        .filter((a) => a.participantId === p.id)
        .sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0));

      const answeredCount = (p.correctCount || 0) + (p.wrongCount || 0);
      const unansweredCount = Math.max(
        0,
        customQuestions.length - answeredCount
      );
      const accuracy = (
        ((p.correctCount || 0) / customQuestions.length) *
        100
      ).toFixed(1);
      const avgTime =
        answeredCount > 0
          ? ((p.totalResponseTimeMs || 0) / answeredCount / 1000).toFixed(2)
          : '0.00';

      const detailString = customQuestions
        .map((q) => {
          const found = pAnswers.find((a) => a.questionOrder === q.order);
          if (!found) return `Q${q.order}:-(0)`;
          return `Q${q.order}:${found.selectedOption}[${
            found.isCorrect ? 'B' : 'S'
          }+${found.pointsAwarded}]`;
        })
        .join(' | ');

      return [
        idx + 1,
        `"${p.nickname}"`,
        p.id,
        p.pin || '-',
        p.totalScore || 0,
        p.currentRank || idx + 1,
        p.correctCount || 0,
        p.wrongCount || 0,
        unansweredCount,
        `${accuracy}%`,
        `${avgTime}s`,
        `"${detailString}"`,
        `"${new Date(p.joinedAt || Date.now()).toLocaleString('id-ID')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Laporan_Rekap_Peserta_AI_Career_Lab_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(
      'Laporan CSV / Excel berhasil diunduh ke perangkat Anda!',
      'success'
    );
  };

  const handleDownloadSQLBundle = () => {
    const sqlStatements = `-- ============================================================================
-- FULL SQL DATABASE & 20 SOAL ACAK SEIMBANG: AI CAREER LAB WITH GEMINI
-- Distribusi Kunci Jawaban: A=4, B=4, C=4, D=4, E=4
-- ============================================================================

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(50) PRIMARY KEY,
  question_order INT NOT NULL,
  question_text TEXT NOT NULL,
  time_limit_seconds INT DEFAULT 25,
  max_points INT DEFAULT 1000,
  correct_option CHAR(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS answer_options (
  question_id VARCHAR(50) REFERENCES questions(id),
  option_label CHAR(1) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL
);

${customQuestions
  .map(
    (q) => `
-- SOAL ${q.order} (Kunci Jawaban: ${q.correctOption})
INSERT INTO questions (id, question_order, question_text, time_limit_seconds, max_points, correct_option)
VALUES ('${q.id}', ${q.order}, '${q.questionText.replace(/'/g, "''")}', ${
      q.timeLimit
    }, 1000, '${q.correctOption}');
${q.options
  .map(
    (opt) =>
      `INSERT INTO answer_options (question_id, option_label, option_text, is_correct) VALUES ('${
        q.id
      }', '${opt.label}', '${opt.text.replace(/'/g, "''")}', ${
        opt.label === q.correctOption ? 'TRUE' : 'FALSE'
      });`
  )
  .join('\n')}`
  )
  .join('\n')}
`;

    const blob = new Blob([sqlStatements], {
      type: 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      'AI_Career_Lab_20_Questions_Randomized_Schema.sql'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(
      'File SQL Database + 20 Soal dengan Kunci Acak berhasil diunduh!',
      'success'
    );
  };

  // ==========================================================================
  // RENDER HELPERS FOR SPECIFIC SCREENS
  // ==========================================================================

  // 1. PLAYER ARENA RENDERER
  const renderPlayerArena = () => {
    if (!currentPlayerRoom || !myParticipant) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
          <h2 className="text-2xl font-black mb-2">
            Sesi Permainan Tidak Ditemukan
          </h2>
          <p className="text-slate-400 mb-6">
            Room mungkin telah ditutup oleh Host atau koneksi sedang dimuat.
          </p>
          <button
            onClick={() => setScreen('HOME')}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      );
    }

    if (myParticipant.isRemoved) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <UserX className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-2xl font-black mb-2">
            Anda Dikeluarkan dari Room
          </h2>
          <p className="text-slate-400 mb-6">
            Host telah menghapus akses Anda dari sesi permainan ini.
          </p>
          <button
            onClick={() => setScreen('HOME')}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold"
          >
            Keluar
          </button>
        </div>
      );
    }

    const qIdx = currentPlayerRoom.currentQuestionIndex || 0;
    const currentQ = customQuestions[qIdx] || customQuestions[0];
    const startMs = currentPlayerRoom.questionStartTime || 0;
    const endMs = currentPlayerRoom.questionEndTime || 0;

    const isCountdownPhase =
      currentPlayerRoom.status === 'PLAYING' && nowTimestamp < startMs;
    const countdownSec = isCountdownPhase
      ? Math.max(0, Math.ceil((startMs - nowTimestamp) / 1000))
      : 0;
    const remainingQuestionSec =
      currentPlayerRoom.status === 'PLAYING' && nowTimestamp >= startMs
        ? Math.max(0, Math.ceil((endMs - nowTimestamp) / 1000))
        : 0;

    // Find my answer for current question
    const myCurrentAnswer = answers.find(
      (a) =>
        a.roomId === currentPlayerRoom.id &&
        a.participantId === myParticipant.id &&
        a.questionId === currentQ?.id
    );

    const readyPlayersCount = playerRoomParticipants.filter(
      (p) => p.readyStatus === 'READY'
    ).length;

    const myPersonalAnswersList = answers
      .filter(
        (a) =>
          a.roomId === currentPlayerRoom.id &&
          a.participantId === myParticipant.id
      )
      .sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0));

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white flex flex-col">
        {/* TOP PLAYER STATUS BAR */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-2xl">
              {myParticipant.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base md:text-lg">
                  {myParticipant.nickname}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  <Wifi className="w-3 h-3" /> Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Room PIN:{' '}
                <strong className="text-amber-400 font-mono">
                  {currentPlayerRoom.pin}
                </strong>{' '}
                • Peringkat Saat Ini:{' '}
                <strong className="text-white">
                  #{myParticipant.currentRank || 1}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-purple-300">
                Total Skor Anda
              </p>
              <p className="text-xl font-black text-amber-400">
                {(myParticipant.totalScore || 0).toLocaleString()} pts
              </p>
            </div>
            <button
              onClick={() => setScreen('HOME')}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl font-semibold text-slate-300"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* PHASE 1: WAITING ROOM LOBBY & LIVE PARTICIPANT LIST */}
        {currentPlayerRoom.status === 'WAITING' && (
          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" /> ROOM LOBBY LIVE
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-amber-400 tracking-widest font-mono my-2">
                {currentPlayerRoom.pin}
              </h1>
              <p className="text-base md:text-lg font-bold text-white/90">
                {currentPlayerRoom.quizTitle}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-sm">
                <span className="bg-white/10 px-4 py-1.5 rounded-full font-bold">
                  👥 {playerRoomParticipants.length} PLAYERS JOINED
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full font-bold">
                  ✓ {readyPlayersCount}/{playerRoomParticipants.length} PLAYERS
                  READY
                </span>
              </div>

              {/* PLAYER READY BUTTON */}
              <div className="mt-8">
                <button
                  onClick={handlePlayerToggleReady}
                  className={`px-8 md:px-12 py-4 rounded-2xl font-black text-lg md:text-xl transition-all transform active:scale-95 shadow-xl ${
                    myParticipant.readyStatus === 'READY'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/30'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 animate-pulse ring-4 ring-amber-400/30'
                  }`}
                >
                  {myParticipant.readyStatus === 'READY'
                    ? '✓ SAYA SIAP / READY (Menunggu Host Start)'
                    : "TEKAN TOMBOL INI: SAYA SIAP / I'M READY"}
                </button>
                <p className="text-xs text-slate-400 mt-3">
                  Hanya Host yang dapat memulai permainan. Ketika Host menekan
                  START, kuis akan berjalan serentak di semua layar.
                </p>
              </div>
            </div>

            {/* LIVE PARTICIPANT LIST IN THE SAME ROOM */}
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  DAFTAR PESERTA DI ROOM INI ({playerRoomParticipants.length})
                </h2>
                <span className="text-xs text-emerald-400 font-semibold">
                  ● Sinkronisasi Real-Time Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {playerRoomParticipants.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
                      p.id === myParticipant.id
                        ? 'bg-indigo-600/30 border-indigo-400'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{p.avatar}</span>
                      <div className="truncate">
                        <p className="font-bold text-sm truncate">
                          {p.nickname}{' '}
                          {p.id === myParticipant.id && (
                            <span className="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded text-white">
                              Anda
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-emerald-400">
                          {p.connectionStatus || 'ONLINE'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${
                        p.readyStatus === 'READY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.readyStatus === 'READY' ? 'Ready' : 'Waiting'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* PHASE 2: SYNCHRONIZED 3-2-1-GO COUNTDOWN */}
        {isCountdownPhase && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm md:text-base uppercase tracking-widest text-indigo-400 font-bold mb-2">
              PERTANYAAN #{qIdx + 1} DARI {customQuestions.length}
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
              Bersiap Mengerjakan Serentak!
            </h2>
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-7xl md:text-8xl font-black shadow-2xl animate-bounce">
              {countdownSec > 0 ? countdownSec : 'GO!'}
            </div>
          </div>
        )}

        {/* PHASE 3: SYNCHRONIZED QUESTION & TIMER (5 OPTIONS: A, B, C, D, E) */}
        {(currentPlayerRoom.status === 'PLAYING' ||
          currentPlayerRoom.status === 'PAUSED') &&
          !isCountdownPhase &&
          currentQ && (
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col justify-between space-y-6">
              {currentPlayerRoom.status === 'PAUSED' && (
                <div className="bg-amber-500/20 border border-amber-400 rounded-2xl p-4 text-center">
                  <p className="font-black text-amber-300 text-lg">
                    ⏸ PERMAINAN SEDANG DIJEDA OLEH HOST
                  </p>
                  <p className="text-xs text-amber-100">
                    Mohon tunggu hingga Host melanjutkan permainan.
                  </p>
                </div>
              )}

              {/* Question Top Bar & Synchronized Timer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900/90 px-5 py-3.5 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                      PERTANYAAN {String(currentQ.order).padStart(2, '0')} /{' '}
                      {customQuestions.length}
                    </span>
                    <p className="text-xs text-slate-400">{currentQ.topic}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span
                      className={`text-2xl md:text-3xl font-black px-4 py-1 rounded-xl font-mono ${
                        remainingQuestionSec <= 5
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {remainingQuestionSec}s
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      remainingQuestionSec <= 5
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-emerald-400 to-indigo-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (remainingQuestionSec / (currentQ.timeLimit || 25)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border-b-8 border-slate-300">
                <p className="text-lg md:text-2xl font-extrabold leading-relaxed whitespace-pre-line">
                  {currentQ.questionText}
                </p>
              </div>

              {/* 5 Multiple Choice Options: A (Red), B (Blue), C (Yellow), D (Green), E (Purple) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentQ.options.map((opt) => {
                  const theme = OPTION_THEMES[opt.label] || OPTION_THEMES.A;
                  const isMyChoice =
                    myCurrentAnswer?.selectedOption === opt.label;
                  const isLocked =
                    !!myCurrentAnswer ||
                    remainingQuestionSec <= 0 ||
                    currentPlayerRoom.status === 'PAUSED';

                  return (
                    <button
                      key={opt.label}
                      disabled={isLocked}
                      onClick={() => handlePlayerSubmitAnswer(opt.label)}
                      className={`${
                        theme.bg
                      } p-4 md:p-5 rounded-2xl border-b-8 text-left transition-all flex items-start gap-4 shadow-lg ${
                        opt.label === 'E' ? 'md:col-span-2' : ''
                      } ${
                        myCurrentAnswer && !isMyChoice
                          ? 'opacity-35 scale-[0.98]'
                          : 'hover:scale-[1.01] active:scale-95'
                      } ${isMyChoice ? 'ring-4 ring-white' : ''}`}
                    >
                      <span
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${theme.badge} flex items-center justify-center text-xl font-black shrink-0`}
                      >
                        {opt.label}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm md:text-base font-bold leading-snug block">
                          {opt.text}
                        </span>
                        {isMyChoice && (
                          <span className="inline-block mt-2 text-xs font-black uppercase bg-black/30 text-white px-2.5 py-0.5 rounded-full">
                            ✓ Jawaban Anda Terkunci
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {myCurrentAnswer && (
                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-center">
                  <p className="font-bold text-emerald-300 text-sm md:text-base">
                    ✓ Jawaban Opsi {myCurrentAnswer.selectedOption} berhasil
                    dikirim ({(myCurrentAnswer.responseTimeMs / 1000).toFixed(1)}
                    s)! Menunggu seluruh peserta / timer selesai...
                  </p>
                </div>
              )}
            </main>
          )}

        {/* PHASE 4: QUESTION RESULT & LIVE TOP 10 LEADERBOARD */}
        {currentPlayerRoom.status === 'QUESTION_RESULT' && currentQ && (
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
            {/* Personal Feedback Banner */}
            <div
              className={`p-6 rounded-3xl border text-center shadow-2xl ${
                myCurrentAnswer?.isCorrect
                  ? 'bg-emerald-600/25 border-emerald-400'
                  : 'bg-rose-600/25 border-rose-400'
              }`}
            >
              <div className="flex justify-center mb-2">
                {myCurrentAnswer?.isCorrect ? (
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                ) : (
                  <XCircle className="w-14 h-14 text-rose-400" />
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black">
                {myCurrentAnswer?.isCorrect
                  ? `JAWABAN BENAR! +${myCurrentAnswer.pointsAwarded} POIN`
                  : myCurrentAnswer
                  ? `JAWABAN KURANG TEPAT (+0 POIN)`
                  : `WAKTU HABIS / TIDAK MENJAWAB (+0 POIN)`}
              </h2>
              <p className="text-sm text-white/90 mt-2">
                Kunci Jawaban Benar:{' '}
                <strong className="bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-lg font-black">
                  Opsi {currentQ.correctOption}
                </strong>{' '}
                —{' '}
                {
                  currentQ.options.find(
                    (o) => o.label === currentQ.correctOption
                  )?.text
                }
              </p>
            </div>

            {/* Live Top 10 Leaderboard */}
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-black text-amber-400 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> LIVE LEADERBOARD (TOP 10)
                </h3>
                <span className="text-xs text-slate-400">
                  Setelah Soal #{currentQ.order}
                </span>
              </div>

              <div className="space-y-2.5">
                {playerRoomParticipants.slice(0, 10).map((p, idx) => {
                  const rank = idx + 1;
                  const delta = p.previousRank ? p.previousRank - rank : 0;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
                        p.id === myParticipant.id
                          ? 'bg-indigo-600/40 border-amber-400'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 font-black text-amber-400 text-base">
                          #{rank}
                        </span>
                        <span className="text-2xl">{p.avatar}</span>
                        <div>
                          <p className="font-bold text-sm md:text-base">
                            {p.nickname}{' '}
                            {p.id === myParticipant.id && (
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full ml-1">
                                ANDA
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Benar: {p.correctCount || 0} soal
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {delta > 0 && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            ▲ +{delta}
                          </span>
                        )}
                        {delta < 0 && (
                          <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                            ▼ {delta}
                          </span>
                        )}
                        <span className="font-black text-base md:text-lg text-amber-400">
                          {(p.totalScore || 0).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">
                Menunggu Host menekan tombol NEXT QUESTION...
              </p>
            </div>
          </main>
        )}

        {/* PHASE 5: FINAL PODIUM (1st, 2nd, 3rd), TOP 4-10, & PERSONAL RECAP */}
        {currentPlayerRoom.status === 'FINISHED' && (
          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                🎉 KUIS SELESAI — HASIL AKHIR RESMI 🎉
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white">
                PODIUM JUARA AI CAREER LAB
              </h1>
            </div>

            {/* PODIUM JUARA 1, 2, 3 */}
            <div className="flex items-end justify-center gap-3 md:gap-8 pt-6">
              {/* JUARA 2 (KIRI - PERAK) */}
              {playerRoomParticipants[1] && (
                <div className="flex flex-col items-center w-28 sm:w-36 md:w-44">
                  <span className="text-3xl md:text-4xl mb-1">
                    {playerRoomParticipants[1].avatar}
                  </span>
                  <p className="font-bold text-sm md:text-base truncate max-w-full">
                    {playerRoomParticipants[1].nickname}
                  </p>
                  <p className="text-xs text-slate-300 font-bold mb-2">
                    {(playerRoomParticipants[1].totalScore || 0).toLocaleString()}{' '}
                    pts
                  </p>
                  <div className="w-full h-32 md:h-36 bg-gradient-to-t from-slate-500 to-slate-300 text-slate-950 rounded-t-3xl flex flex-col items-center justify-center font-black shadow-xl border-2 border-slate-200">
                    <span className="text-2xl md:text-3xl">🥈</span>
                    <span className="text-sm md:text-lg">JUARA 2</span>
                  </div>
                </div>
              )}

              {/* JUARA 1 (TENGAH - EMAS TERTINGGI) */}
              {playerRoomParticipants[0] && (
                <div className="flex flex-col items-center w-32 sm:w-40 md:w-52">
                  <Crown className="w-8 h-8 text-amber-400 animate-bounce mb-1" />
                  <span className="text-4xl md:text-5xl mb-1">
                    {playerRoomParticipants[0].avatar}
                  </span>
                  <p className="font-black text-base md:text-xl text-amber-300 truncate max-w-full">
                    {playerRoomParticipants[0].nickname}
                  </p>
                  <p className="text-xs md:text-sm text-amber-200 font-bold mb-2">
                    {(playerRoomParticipants[0].totalScore || 0).toLocaleString()}{' '}
                    pts
                  </p>
                  <div className="w-full h-44 md:h-52 bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 text-slate-950 rounded-t-3xl flex flex-col items-center justify-center font-black shadow-2xl border-2 border-white">
                    <span className="text-3xl md:text-4xl">🏆</span>
                    <span className="text-lg md:text-2xl">JUARA 1</span>
                  </div>
                </div>
              )}

              {/* JUARA 3 (KANAN - PERUNGGU) */}
              {playerRoomParticipants[2] && (
                <div className="flex flex-col items-center w-28 sm:w-36 md:w-44">
                  <span className="text-3xl md:text-4xl mb-1">
                    {playerRoomParticipants[2].avatar}
                  </span>
                  <p className="font-bold text-sm md:text-base truncate max-w-full">
                    {playerRoomParticipants[2].nickname}
                  </p>
                  <p className="text-xs text-amber-400 font-bold mb-2">
                    {(playerRoomParticipants[2].totalScore || 0).toLocaleString()}{' '}
                    pts
                  </p>
                  <div className="w-full h-24 md:h-28 bg-gradient-to-t from-amber-900 to-amber-600 text-white rounded-t-3xl flex flex-col items-center justify-center font-black shadow-xl border-2 border-amber-400">
                    <span className="text-2xl md:text-3xl">🥉</span>
                    <span className="text-sm md:text-lg">JUARA 3</span>
                  </div>
                </div>
              )}
            </div>

            {/* PERINGKAT 4 - 10 BESAR */}
            {playerRoomParticipants.length > 3 && (
              <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6">
                <h3 className="font-black text-base md:text-lg text-indigo-300 mb-3">
                  Daftar Peringkat 4 – 10 Besar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {playerRoomParticipants.slice(3, 10).map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-white/10"
                    >
                      <span className="font-bold text-sm">
                        #{idx + 4} {p.avatar} {p.nickname}
                      </span>
                      <span className="font-black text-amber-400">
                        {(p.totalScore || 0).toLocaleString()} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PERSONAL RESULT RECAP (ONLY FOR THIS PLAYER) */}
            <div className="bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-amber-400">
                    📋 Rapor & Detail Jawaban Pribadi Anda
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hanya Anda yang dapat melihat rincian jawaban pribadi ini.
                  </p>
                </div>
                <span className="bg-indigo-600 px-4 py-1.5 rounded-full text-xs font-black">
                  Peringkat Akhir: #
                  {playerRoomParticipants.findIndex(
                    (p) => p.id === myParticipant.id
                  ) + 1}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400">Total Skor</p>
                  <p className="text-xl font-black text-amber-400">
                    {(myParticipant.totalScore || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400">Jawaban Benar</p>
                  <p className="text-xl font-black text-emerald-400">
                    {myParticipant.correctCount || 0}
                  </p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400">Jawaban Salah</p>
                  <p className="text-xl font-black text-rose-400">
                    {myParticipant.wrongCount || 0}
                  </p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400">Tidak Dijawab</p>
                  <p className="text-xl font-black text-slate-300">
                    {Math.max(
                      0,
                      customQuestions.length -
                        ((myParticipant.correctCount || 0) +
                          (myParticipant.wrongCount || 0))
                    )}
                  </p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-400">Akurasi</p>
                  <p className="text-xl font-black text-indigo-300">
                    {(
                      ((myParticipant.correctCount || 0) /
                        customQuestions.length) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>

              {/* Personal Answer Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-white/15 text-slate-400 uppercase">
                      <th className="py-2.5 px-3">No.</th>
                      <th className="py-2.5 px-3">Topik Soal</th>
                      <th className="py-2.5 px-3">Jawaban Anda</th>
                      <th className="py-2.5 px-3">Hasil</th>
                      <th className="py-2.5 px-3 text-right">Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customQuestions.map((q) => {
                      const ans = myPersonalAnswersList.find(
                        (a) => a.questionOrder === q.order
                      );
                      return (
                        <tr
                          key={q.id}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="py-2.5 px-3 font-bold">#{q.order}</td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {q.topic}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {ans ? `Opsi ${ans.selectedOption}` : 'Tidak Dijawab'}
                          </td>
                          <td className="py-2.5 px-3">
                            {ans?.isCorrect ? (
                              <span className="text-emerald-400 font-bold">
                                ✓ Benar
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold">
                                ✗ Salah (Kunci: {q.correctOption})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-amber-400">
                            +{ans ? ans.pointsAwarded : 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}
      </div>
    );
  };

  // 2. PRIVATE OWNER DASHBOARD RENDERER (PROTECTED BY CODE: Adhnan)
  const renderOwnerDashboard = () => {
    if (!isOwnerAuthenticated) {
      setScreen('OWNER_LOGIN');
      return null;
    }

    const activePlayersInHostRoom = hostRoomParticipants;
    const readyCountInHostRoom = activePlayersInHostRoom.filter(
      (p) => p.readyStatus === 'READY'
    ).length;

    const currentHostQIdx = currentHostRoom?.currentQuestionIndex || 0;
    const currentHostQ =
      customQuestions[currentHostQIdx] || customQuestions[0];

    const hostQuestionRemainingSec =
      currentHostRoom?.status === 'PLAYING' && currentHostRoom?.questionEndTime
        ? Math.max(
            0,
            Math.ceil((currentHostRoom.questionEndTime - nowTimestamp) / 1000)
          )
        : 0;

    const currentQuestionAnswers = answers.filter(
      (a) =>
        a.roomId === currentHostRoom?.id &&
        a.questionId === currentHostQ?.id
    );

    const inspectedParticipant = participants.find(
      (p) => p.id === inspectedParticipantId
    );

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
        {/* SIDEBAR NAVIGATION */}
        {!isFullScreenLobby && (
          <aside className="w-full lg:w-72 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    OWNER ACCESS: ADHNAN
                  </span>
                  <h1 className="text-xl font-black text-white mt-1">
                    AI Career Lab Host
                  </h1>
                </div>
                <button
                  onClick={handleOwnerLogout}
                  className="lg:hidden text-xs bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg font-bold"
                >
                  Logout
                </button>
              </div>

              <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5">
                {[
                  {
                    id: 'LOBBY_CONTROL',
                    label: 'Host Lobby & Kontrol',
                    icon: Play,
                  },
                  {
                    id: 'OVERVIEW',
                    label: 'Overview Statistik',
                    icon: BarChart3,
                  },
                  {
                    id: 'LIVE_MONITOR',
                    label: 'Live Monitoring',
                    icon: Eye,
                  },
                  {
                    id: 'PARTICIPANT_RECAP',
                    label: 'Rekap & Detail Peserta',
                    icon: Users,
                  },
                  {
                    id: 'QUESTIONS_BANK',
                    label: '20 Soal & Kunci Acak',
                    icon: BookOpen,
                  },
                  {
                    id: 'GAME_HISTORY',
                    label: 'Game History',
                    icon: History,
                  },
                  {
                    id: 'ANALYTICS',
                    label: 'Analytics & Akurasi',
                    icon: Award,
                  },
                  {
                    id: 'SOURCE_DOWNLOAD',
                    label: 'Export & Unduh SQL',
                    icon: Download,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = ownerTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setOwnerTab(item.id)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-slate-800">
              <button
                onClick={handleExportCSV}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Laporan CSV /
                Excel
              </button>
              <button
                onClick={() => setScreen('HOME')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs"
              >
                Lihat Layar Publik (Join)
              </button>
              <button
                onClick={handleOwnerLogout}
                className="w-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout Owner
              </button>
            </div>
          </aside>
        )}

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          {/* TOP ROOM SELECTOR & CREATE ROOM BAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Sesi Room Aktif:
              </span>
              <select
                value={currentHostRoom?.id || ''}
                onChange={(e) => setSelectedHostRoomId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400"
              >
                {rooms.length === 0 && (
                  <option value="">Belum ada Room dibuat</option>
                )}
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    PIN: {r.pin} — Status: {r.status}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleCreateRoom('HOST_CONTROLLED')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
              >
                + CREATE NEW ROOM (Generate PIN)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreenLobby(!isFullScreenLobby)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {isFullScreenLobby ? (
                  <>
                    <Minimize2 className="w-4 h-4" /> Keluar Layar Proyektor
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" /> Mode Proyektor Kelas
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: HOST LOBBY & SYNCHRONIZED GAMEPLAY CONTROLLER */}
          {ownerTab === 'LOBBY_CONTROL' && (
            <div className="space-y-6">
              {!currentHostRoom ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
                  <h2 className="text-2xl font-black">
                    Siap Memulai Kuis Multiplayer AI Career Lab?
                  </h2>
                  <p className="text-slate-400 max-w-lg mx-auto text-sm">
                    Tekan tombol <strong>CREATE NEW ROOM</strong> untuk
                    menghasilkan PIN unik 6 digit dan QR Code agar peserta dapat
                    bergabung ke Lobby secara real-time.
                  </p>
                  <button
                    onClick={() => handleCreateRoom('HOST_CONTROLLED')}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-4 rounded-2xl text-lg shadow-xl"
                  >
                    + BUAT ROOM SEKARANG
                  </button>
                </div>
              ) : (
                <>
                  {/* GIANT PIN, QR CODE & GAMEPLAY CONTROL BANNER */}
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                      {/* Left: PIN & Copy */}
                      <div className="space-y-2 text-center lg:text-left">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full">
                          PIN PERMAINAN RESMI
                        </span>
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                          <h2 className="text-5xl md:text-7xl font-black text-amber-400 font-mono tracking-wider">
                            {currentHostRoom.pin}
                          </h2>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                currentHostRoom.pin
                              );
                              setCopiedPin(true);
                              setTimeout(() => setCopiedPin(false), 2000);
                            }}
                            className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl text-white"
                            title="Salin PIN"
                          >
                            {copiedPin ? (
                              <Check className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <Copy className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-bold text-slate-300">
                          {currentHostRoom.quizTitle} (20 Soal Acak Seimbang)
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                          <button
                            onClick={() =>
                              handleToggleLockRoom(currentHostRoom)
                            }
                            className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 ${
                              currentHostRoom.isLocked
                                ? 'bg-rose-600 text-white'
                                : 'bg-white/10 text-slate-200 hover:bg-white/20'
                            }`}
                          >
                            {currentHostRoom.isLocked ? (
                              <>
                                <Lock className="w-3.5 h-3.5" /> Room Terkunci
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> Lock Room:
                                OFF
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleToggleLateJoin(currentHostRoom)
                            }
                            className={`text-xs font-bold px-3.5 py-2 rounded-xl ${
                              currentHostRoom.allowLateJoin
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            Late Join:{' '}
                            {currentHostRoom.allowLateJoin ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>

                      {/* Center: Live Readiness Counter & QR Code */}
                      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex items-center justify-around gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-400 uppercase font-bold">
                            Peserta Bergabung
                          </p>
                          <p className="text-4xl font-black text-white my-1">
                            {activePlayersInHostRoom.length}
                          </p>
                          <span className="text-xs font-bold text-emerald-400">
                            {readyCountInHostRoom}/
                            {activePlayersInHostRoom.length} PLAYERS READY
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl text-slate-950 flex flex-col items-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=PIN:${currentHostRoom.pin}`}
                            alt="QR Join"
                            className="w-20 h-20"
                          />
                          <span className="text-[10px] font-black mt-1">
                            PIN: {currentHostRoom.pin}
                          </span>
                        </div>
                      </div>

                      {/* Right: Primary Host Action Buttons */}
                      <div className="flex flex-col gap-3">
                        {currentHostRoom.status === 'WAITING' && (
                          <button
                            onClick={() => handleHostStartGame(currentHostRoom)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                          >
                            <Play className="w-6 h-6 fill-current" /> START GAME
                            SERENTAK
                          </button>
                        )}

                        {(currentHostRoom.status === 'PLAYING' ||
                          currentHostRoom.status === 'PAUSED') && (
                          <>
                            <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-white/10">
                              <span className="text-xs font-bold text-indigo-300">
                                Soal #{currentHostQIdx + 1}/20 • Masuk:{' '}
                                {currentQuestionAnswers.length}/
                                {activePlayersInHostRoom.length}
                              </span>
                              <span className="text-xl font-black text-amber-400 font-mono">
                                {hostQuestionRemainingSec}s
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() =>
                                  handleHostPauseOrResume(currentHostRoom)
                                }
                                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5"
                              >
                                <Pause className="w-4 h-4" />
                                {currentHostRoom.status === 'PAUSED'
                                  ? 'RESUME GAME'
                                  : 'PAUSE GAME'}
                              </button>

                              <button
                                onClick={() =>
                                  handleHostLockQuestionAndShowResult(
                                    currentHostRoom
                                  )
                                }
                                className="bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" /> TAMPILKAN
                                HASIL
                              </button>
                            </div>
                          </>
                        )}

                        {currentHostRoom.status === 'QUESTION_RESULT' && (
                          <button
                            onClick={() =>
                              handleHostNextQuestionOrFinish(currentHostRoom)
                            }
                            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 px-6 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-2"
                          >
                            <FastForward className="w-6 h-6" />
                            {currentHostQIdx + 1 >= customQuestions.length
                              ? 'TAMPILKAN PODIUM AKHIR 🏆'
                              : `NEXT QUESTION (SOAL #${currentHostQIdx + 2})`}
                          </button>
                        )}

                        {currentHostRoom.status === 'FINISHED' && (
                          <div className="bg-emerald-500/20 border border-emerald-400 rounded-2xl p-3 text-center">
                            <p className="font-black text-emerald-300 text-sm">
                              ✓ Permainan Selesai & Tersimpan di Riwayat
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE QUESTION LIVE MONITOR CARD (IF PLAYING OR RESULT) */}
                  {currentHostRoom.status !== 'WAITING' && currentHostQ && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                          SOAL AKTIF #{currentHostQ.order} / 20 —{' '}
                          {currentHostQ.topic}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          Kunci Jawaban Server: Opsi{' '}
                          {currentHostQ.correctOption}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white whitespace-pre-line">
                        {currentHostQ.questionText}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                        {currentHostQ.options.map((o) => {
                          const countPicked = currentQuestionAnswers.filter(
                            (a) => a.selectedOption === o.label
                          ).length;
                          const isCorrect =
                            o.label === currentHostQ.correctOption;
                          return (
                            <div
                              key={o.label}
                              className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                                isCorrect
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div>
                                <span className="font-black text-sm">
                                  Opsi {o.label} {isCorrect && '✓'}
                                </span>
                                <p className="mt-1 line-clamp-3">{o.text}</p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between font-bold">
                                <span>Dipilih:</span>
                                <span>{countPicked} peserta</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* LIVE PARTICIPANT LIST IN LOBBY / LEADERBOARD */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        DAFTAR PESERTA REAL-TIME (
                        {activePlayersInHostRoom.length} Peserta)
                      </h3>
                      <span className="text-xs text-slate-400">
                        Status koneksi, kesiapan (Ready), dan skor diperbarui
                        otomatis
                      </span>
                    </div>

                    {activePlayersInHostRoom.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        Belum ada peserta yang bergabung ke PIN{' '}
                        <strong className="text-amber-400">
                          {currentHostRoom.pin}
                        </strong>
                        .
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activePlayersInHostRoom.map((p, index) => (
                          <div
                            key={p.id}
                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-7 text-xs font-black text-amber-400">
                                #{index + 1}
                              </span>
                              <span className="text-2xl">{p.avatar}</span>
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate">
                                  {p.nickname}
                                </p>
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="text-emerald-400 font-semibold">
                                    ● {p.connectionStatus || 'ONLINE'}
                                  </span>
                                  <span>—</span>
                                  <span
                                    className={
                                      p.readyStatus === 'READY'
                                        ? 'text-emerald-300 font-bold'
                                        : 'text-amber-400 font-bold'
                                    }
                                  >
                                    {p.readyStatus}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-sm text-amber-400">
                                {(p.totalScore || 0).toLocaleString()} pts
                              </span>
                              <button
                                onClick={() => handleRemoveParticipant(p)}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                                title="Keluarkan Peserta (Remove Player)"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: OVERVIEW DASHBOARD */}
          {ownerTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">
                Overview Statistik Platform
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400">Total Soal Aktif</p>
                  <p className="text-3xl font-black text-indigo-400 mt-1">
                    {customQuestions.length} Soal
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400">Total Sesi Room</p>
                  <p className="text-3xl font-black text-amber-400 mt-1">
                    {rooms.length}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400">Total Peserta</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">
                    {participants.filter((p) => !p.isRemoved).length}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400">Total Jawaban Masuk</p>
                  <p className="text-3xl font-black text-purple-400 mt-1">
                    {answers.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE MONITORING */}
          {ownerTab === 'LIVE_MONITOR' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-xl font-black">
                Live Monitoring Seluruh Room & Aktivitas Jawaban
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((r) => {
                  const rPlayers = getRoomParticipantsSorted(r.id);
                  return (
                    <div
                      key={r.id}
                      className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-2xl font-black text-amber-400">
                          PIN: {r.pin}
                        </span>
                        <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Peserta: {rPlayers.length} orang • Soal Aktif: #
                        {(r.currentQuestionIndex || 0) + 1} / 20
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PARTICIPANT RECAP & INDIVIDUAL ANSWER HISTORY */}
          {ownerTab === 'PARTICIPANT_RECAP' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    Rekap Seluruh Peserta & Detail Jawaban (Soal 1–20)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Klik tombol &quot;Lihat Detail Jawaban&quot; pada peserta
                    untuk memeriksa setiap opsi A/B/C/D/E yang dipilih.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari nama / PIN..."
                      value={recapSearch}
                      onChange={(e) => setRecapSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs"
                    />
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Unduh CSV / Excel
                  </button>
                </div>
              </div>

              {/* Inspected Participant Detail Modal / Card */}
              {inspectedParticipant && (
                <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {inspectedParticipant.avatar}
                      </span>
                      <div>
                        <h3 className="text-lg font-black">
                          Detail Jawaban: {inspectedParticipant.nickname} (PIN:{' '}
                          {inspectedParticipant.pin})
                        </h3>
                        <p className="text-xs text-slate-400">
                          Total Skor:{' '}
                          <strong className="text-amber-400">
                            {inspectedParticipant.totalScore || 0} pts
                          </strong>{' '}
                          • Benar: {inspectedParticipant.correctCount || 0} •
                          Salah: {inspectedParticipant.wrongCount || 0}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectedParticipantId(null)}
                      className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      Tutup Detail
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-2">No</th>
                          <th className="py-2 px-2">Topik Pertanyaan</th>
                          <th className="py-2 px-2">Jawaban Peserta</th>
                          <th className="py-2 px-2">Kunci Benar</th>
                          <th className="py-2 px-2">Waktu Jawab</th>
                          <th className="py-2 px-2 text-right">Poin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customQuestions.map((q) => {
                          const found = answers.find(
                            (a) =>
                              a.participantId === inspectedParticipant.id &&
                              a.questionOrder === q.order
                          );
                          return (
                            <tr
                              key={q.id}
                              className="border-b border-slate-800/60"
                            >
                              <td className="py-2 px-2 font-bold">
                                #{q.order}
                              </td>
                              <td className="py-2 px-2">{q.topic}</td>
                              <td className="py-2 px-2 font-bold">
                                {found
                                  ? `Opsi ${found.selectedOption}`
                                  : 'Tidak Menjawab'}
                              </td>
                              <td className="py-2 px-2 font-bold text-emerald-400">
                                Opsi {q.correctOption}
                              </td>
                              <td className="py-2 px-2">
                                {found
                                  ? `${(found.responseTimeMs / 1000).toFixed(
                                      1
                                    )}s`
                                  : '-'}
                              </td>
                              <td className="py-2 px-2 text-right font-black text-amber-400">
                                +{found ? found.pointsAwarded : 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Full Participant Recap Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-800/70 text-slate-300 uppercase text-xs">
                      <th className="p-4">Peserta</th>
                      <th className="p-4">PIN Room</th>
                      <th className="p-4">Total Skor</th>
                      <th className="p-4">Benar / Salah / Kosong</th>
                      <th className="p-4">Akurasi</th>
                      <th className="p-4">Rata-Rata Waktu</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants
                      .filter(
                        (p) =>
                          !p.isRemoved &&
                          (p.nickname
                            ?.toLowerCase()
                            .includes(recapSearch.toLowerCase()) ||
                            p.pin?.includes(recapSearch))
                      )
                      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                      .map((p) => {
                        const ansCount =
                          (p.correctCount || 0) + (p.wrongCount || 0);
                        const emptyCount = Math.max(
                          0,
                          customQuestions.length - ansCount
                        );
                        const acc = (
                          ((p.correctCount || 0) / customQuestions.length) *
                          100
                        ).toFixed(1);
                        const avgSec =
                          ansCount > 0
                            ? (
                                (p.totalResponseTimeMs || 0) /
                                ansCount /
                                1000
                              ).toFixed(1)
                            : '0.0';
                        return (
                          <tr
                            key={p.id}
                            className="border-t border-slate-800 hover:bg-slate-800/40"
                          >
                            <td className="p-4 font-bold">
                              {p.avatar} {p.nickname}
                            </td>
                            <td className="p-4 font-mono text-amber-400">
                              {p.pin}
                            </td>
                            <td className="p-4 font-black text-emerald-400">
                              {(p.totalScore || 0).toLocaleString()} pts
                            </td>
                            <td className="p-4">
                              <span className="text-emerald-400 font-bold">
                                {p.correctCount || 0}B
                              </span>{' '}
                              /{' '}
                              <span className="text-rose-400 font-bold">
                                {p.wrongCount || 0}S
                              </span>{' '}
                              /{' '}
                              <span className="text-slate-400">
                                {emptyCount}K
                              </span>
                            </td>
                            <td className="p-4 font-bold">{acc}%</td>
                            <td className="p-4">{avgSec}s</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setInspectedParticipantId(p.id)}
                                className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                              >
                                Lihat Detail Jawaban
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: 20 QUESTIONS BANK & BALANCED RANDOMIZED KEYS */}
          {ownerTab === 'QUESTIONS_BANK' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Bank 20 Soal Pilihan Ganda (A, B, C, D, E) — Kunci Jawaban
                    Acak Seimbang
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Distribusi Kunci Jawaban telah diacak secara proporsional
                    agar tidak menumpuk di B/C/D: <strong>A = 4 soal</strong>,{' '}
                    <strong>B = 4 soal</strong>, <strong>C = 4 soal</strong>,{' '}
                    <strong>D = 4 soal</strong>, <strong>E = 4 soal</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                    const count = customQuestions.filter(
                      (q) => q.correctOption === letter
                    ).length;
                    return (
                      <div
                        key={letter}
                        className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-center"
                      >
                        <p className="text-[10px] text-slate-400">
                          Kunci {letter}
                        </p>
                        <p className="text-base font-black text-amber-400">
                          {count} Soal
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                        SOAL #{q.order} • {q.topic}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">
                          Kunci Asli: {q.originalKey}
                        </span>
                        <span>→</span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full font-black">
                          Kunci Baru (Acak): Opsi {q.correctOption}
                        </span>
                      </div>
                    </div>

                    <p className="font-bold text-sm md:text-base text-white whitespace-pre-line">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt) => {
                        const isCorrect = opt.label === q.correctOption;
                        return (
                          <div
                            key={opt.label}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                              isCorrect
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-black">{opt.label}.</span>
                            <span className="flex-1">{opt.text}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GAME HISTORY */}
          {ownerTab === 'GAME_HISTORY' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black">
                Riwayat Permainan Selesai (Game History)
              </h2>
              {gameHistory.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  Belum ada riwayat permainan yang diselesaikan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameHistory.map((h) => (
                    <div
                      key={h.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xl font-black text-amber-400">
                          PIN: {h.pin}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(h.finishedAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm font-bold">{h.quizTitle}</p>
                      <p className="text-xs text-slate-400">
                        Total Peserta: {h.totalParticipants} • Rata-rata Skor:{' '}
                        {h.averageScore} pts • Akurasi: {h.averageAccuracy}%
                      </p>
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
                        {(h.topThree || []).map((winner) => (
                          <span
                            key={winner.rank}
                            className="text-xs bg-white/5 px-3 py-1 rounded-full font-bold"
                          >
                            Juara {winner.rank}: {winner.avatar}{' '}
                            {winner.nickname} ({winner.score} pts)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ANALYTICS PER QUESTION */}
          {ownerTab === 'ANALYTICS' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">
                Analitik Performa Soal (Pertanyaan Termudah & Tersulit)
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                {customQuestions.map((q) => {
                  const qAnswers = answers.filter(
                    (a) => a.questionOrder === q.order
                  );
                  const correctAns = qAnswers.filter((a) => a.isCorrect).length;
                  const accuracyPct =
                    qAnswers.length > 0
                      ? Math.round((correctAns / qAnswers.length) * 100)
                      : 0;
                  return (
                    <div key={q.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>
                          Soal #{q.order}: {q.topic} (Kunci: {q.correctOption})
                        </span>
                        <span className="text-amber-400">
                          {correctAns}/{qAnswers.length} Benar ({accuracyPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${accuracyPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: EXPORT CSV & DOWNLOAD SQL / SOURCE BUNDLE */}
          {ownerTab === 'SOURCE_DOWNLOAD' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-black">
                Pusat Unduhan Laporan & Skrip Database (Siap Pakai)
              </h2>
              <p className="text-sm text-slate-300">
                Anda dapat mengunduh rekap nilai seluruh peserta dalam format
                CSV/Excel, mencetak laporan layar ke PDF, maupun mengunduh
                skrip SQL 20 soal yang kunci jawabannya telah diacak seimbang.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-500 p-6 rounded-2xl text-left space-y-2 shadow-xl"
                >
                  <FileSpreadsheet className="w-8 h-8 text-white" />
                  <h3 className="font-black text-lg">
                    Unduh Rekap Peserta (.CSV / Excel)
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Memuat skor akhir, peringkat, akurasi, dan rincian jawaban
                    soal 1–20 setiap peserta.
                  </p>
                </button>

                <button
                  onClick={handleDownloadSQLBundle}
                  className="bg-indigo-600 hover:bg-indigo-500 p-6 rounded-2xl text-left space-y-2 shadow-xl"
                >
                  <Code2 className="w-8 h-8 text-white" />
                  <h3 className="font-black text-lg">
                    Unduh Database & 20 Soal (.SQL)
                  </h3>
                  <p className="text-xs text-indigo-100">
                    Skrip SQL lengkap dengan 20 soal pilihan ganda A–E yang
                    kunci jawabannya sudah diacak seimbang.
                  </p>
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-6 rounded-2xl text-left space-y-2 shadow-xl"
                >
                  <FileText className="w-8 h-8 text-slate-950" />
                  <h3 className="font-black text-lg">
                    Cetak / Simpan Laporan PDF
                  </h3>
                  <p className="text-xs text-slate-900">
                    Cetak halaman rekapitulasi dan leaderboard langsung menjadi
                    dokumen PDF resmi.
                  </p>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  // ==========================================================================
  // MAIN SCREEN SWITCHER
  // ==========================================================================
  return (
    <div className="min-h-screen font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* NON-BLOCKING CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm ${
              toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/95 border-indigo-500 text-indigo-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL (NO BROWSER ALERT/CONFIRM) */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-lg font-black">{confirmModal.title}</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black"
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 1: PUBLIC LANDING & JOIN GAME */}
      {screen === 'HOME' && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-white flex flex-col justify-between p-4 md:p-8">
          {/* Top Navigation */}
          <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
                AI
              </div>
              <div>
                <h1 className="font-black text-base md:text-lg tracking-tight">
                  AI CAREER LAB: WITH GEMINI
                </h1>
                <p className="text-xs text-indigo-300">
                  Live Multiplayer Quiz Platform • 20 Soal Pilihan Ganda (A–E)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDownloadSQLBundle}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-amber-400" /> Unduh SQL 20
                Soal Acak
              </button>
              <button
                onClick={() =>
                  setScreen(
                    isOwnerAuthenticated ? 'OWNER_DASHBOARD' : 'OWNER_LOGIN'
                  )
                }
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg"
              >
                <Lock className="w-3.5 h-3.5" />{' '}
                {isOwnerAuthenticated ? 'Buka Host Dashboard' : 'Owner / Host Login'}
              </button>
            </div>
          </header>

          {/* Center Join Game Card */}
          <main className="max-w-md w-full mx-auto my-8">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> JOIN LIVE ROOM
                </span>
                <h2 className="text-2xl md:text-3xl font-black">
                  Masuk ke Ruang Kuis
                </h2>
                <p className="text-xs text-slate-400">
                  Masukkan 6 digit PIN dari layar Host dan pilih avatar Anda
                </p>
              </div>

              <form onSubmit={handlePlayerJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-indigo-300 mb-1.5">
                    PIN Permainan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 482910"
                    value={joinPinInput}
                    onChange={(e) => setJoinPinInput(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-indigo-500/40 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-center text-2xl font-black tracking-widest text-amber-400 placeholder:text-slate-600 focus:outline-none"
                  />
                  {/* Quick Active Room Pill if a room is already open */}
                  {rooms.filter((r) => r.status === 'WAITING').length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">
                        Room Aktif:
                      </span>
                      {rooms
                        .filter((r) => r.status === 'WAITING')
                        .slice(0, 3)
                        .map((r) => (
                          <button
                            type="button"
                            key={r.id}
                            onClick={() => setJoinPinInput(r.pin)}
                            className="text-[11px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold"
                          >
                            PIN: {r.pin} (Klik isi)
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-indigo-300 mb-1.5">
                    Nickname Peserta
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="Masukkan nama panggilan Anda..."
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-2xl px-4 py-3 text-base font-bold text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-indigo-300 mb-1.5">
                    Pilih Avatar Anda
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_LIST.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setSelectedAvatar(av)}
                        className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                          selectedAvatar === av
                            ? 'bg-amber-400 text-slate-950 scale-110 font-bold shadow-lg'
                            : 'bg-slate-950 hover:bg-slate-800 border border-white/10'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-lg py-4 rounded-2xl shadow-xl transition-transform active:scale-95"
                >
                  JOIN GAME SEKARANG →
                </button>
              </form>
            </div>
          </main>

          {/* Footer Summary */}
          <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 space-y-1">
            <p>
              AI Career Lab: From CV to Interview with Gemini • Synchronized
              Multiplayer Gameplay • 20 Soal Pilihan Ganda (Distribusi Kunci
              Seimbang A, B, C, D, E)
            </p>
          </footer>
        </div>
      )}

      {/* SCREEN 2: OWNER LOGIN SCREEN (ACCESS CODE: Adhnan) */}
      {screen === 'OWNER_LOGIN' && (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black">Private Owner Login</h2>
              <p className="text-xs text-slate-400">
                Halaman ini khusus untuk Host / Pemilik aplikasi. Masukkan kode
                akses rahasia untuk membuka kontrol Room dan rekap peserta.
              </p>
            </div>

            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Kode Akses Pemilik
                </label>
                <input
                  type="password"
                  placeholder="Masukkan kode pemilik..."
                  value={ownerCodeInput}
                  onChange={(e) => setOwnerCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-center font-bold tracking-wider text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-lg"
              >
                VERIFIKASI & MASUK DASHBOARD
              </button>
            </form>

            <button
              onClick={() => setScreen('HOME')}
              className="w-full text-xs text-slate-400 hover:text-white font-semibold text-center block"
            >
              ← Kembali ke Halaman Join Peserta
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: OWNER DASHBOARD */}
      {screen === 'OWNER_DASHBOARD' && renderOwnerDashboard()}

      {/* SCREEN 4: PLAYER ARENA */}
      {screen === 'PLAYER_ARENA' && renderPlayerArena()}
    </div>
  );
}