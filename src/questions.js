// ==============================================================================
// BANK SOAL GAME EDUKASI: "Super Spreadsheet & Scratch Bros"
// Kurikulum Informatika SMP Kelas 8 (Excel & Scratch)
// ==============================================================================

export const WORLDS_CONFIG = [
  {
    id: 1,
    code: "WORLD 1-1",
    name: "Grassland Plains: Dasar Excel & Statistik",
    bg: "#5c94fc",
    skyColor: "#5c94fc",
    accentColor: "#43B047",
    description: "Kuasai fungsi dasar sel, alamat kolom baris, perkalian/pembagian, serta formula statistik SUM, AVERAGE, MIN, dan MAX!",
    subtopic: "Pengenalan Sel, Operator Matematika, dan Statistik Dasar"
  },
  {
    id: 2,
    code: "WORLD 2-1",
    name: "Underground Pipes: Format Data, Sort & Filter",
    bg: "#101018",
    skyColor: "#101018",
    accentColor: "#22B14C",
    description: "Hindari kesalahan ketik manual 'Rp'! Rapikan data dengan Accounting, All Borders, Sort A-Z, dan Filter Corong Data.",
    subtopic: "Format Angka Mata Uang, Pengelompokan & Penyaringan Data"
  },
  {
    id: 3,
    code: "WORLD 3-1",
    name: "Lava Bridge: VLOOKUP & Pengunci Sel Absolut ($)",
    bg: "#3b1008",
    skyColor: "#3b1008",
    accentColor: "#E52521",
    description: "Gunakan tanda dollar ($) atau tombol sakti F4 untuk mengunci tabel master referensi dari eror #N/A dan jalankan =VLOOKUP().",
    subtopic: "Alamat Sel Relatif vs Absolut ($), dan Rumus Pencarian VLOOKUP"
  },
  {
    id: 4,
    code: "WORLD 4-1",
    name: "Bowser's Castle: Gerbang Logika IF & Scratch",
    bg: "#1e0b2e",
    skyColor: "#1e0b2e",
    accentColor: "#FBD000",
    description: "Runtuhkan pertahanan Bowser dengan formula keputusan =IF() serta balok perulangan, rotasi, dan bouncing di Scratch!",
    subtopic: "Fungsi Logika Keputusan IF dan Algoritma Blok Visual Scratch"
  }
];

export const GAME_QUESTIONS = {
  1: [
    {
      q: "Setiap kali mau mengetik rumus atau fungsi di Excel, tanda apa yang WAJIB diketik paling pertama?",
      options: [": (Titik Dua)", "= (Sama Dengan)", "$ (Dollar)", "# (Pagar)"],
      answer: 1,
      hint: "Tanda ini ada di sebelah tombol backspace!"
    },
    {
      q: "Kotak tempat kita mengetik data di Excel adalah pertemuan kolom dan baris. Kotak ini disebut...",
      options: ["Cell (Sel)", "Range", "Sheet", "Ribbon"],
      answer: 0,
      hint: "Contoh namanya: A1, B3, C5."
    },
    {
      q: "Simbol pada keyboard yang digunakan komputer untuk melakukan operasi perkalian adalah...",
      options: ["x", "* (Bintang)", "^", "%"],
      answer: 1,
      hint: "Kombinasi tombol Shift + 8."
    },
    {
      q: "Jika Mario ingin membagi koin emas secara rata, operator matematika yang digunakan di Excel adalah...",
      options: [":", "/ (Garis Miring)", "\\", "div"],
      answer: 1,
      hint: "Tombol yang sama dengan tanda tanya (?) tanpa shift."
    },
    {
      q: "Rumus yang paling tepat untuk menjumlahkan seluruh total nilai koin dari sel A1 sampai A10 adalah...",
      options: ["=TOTAL(A1:A10)", "=SUM(A1:A10)", "=PLUS(A1:A10)", "=COUNT(A1:A10)"],
      answer: 1,
      hint: "Kata bahasa Inggris untuk penjumlahan adalah Sum."
    },
    {
      q: "Mario ingin menghitung nilai rata-rata ujian kelasnya. Rumus yang tepat digunakan adalah...",
      options: ["=MEAN()", "=AVERAGE()", "=MEDIAN()", "=SUMIF()"],
      answer: 1,
      hint: "Kata bahasa Inggris untuk rata-rata."
    },
    {
      q: "Untuk mencari nilai perolehan skor koin tertinggi/terbesar, kita menggunakan rumus...",
      options: ["=MAX()", "=TOP()", "=HIGH()", "=BIGGEST()"],
      answer: 0,
      hint: "Singkatan dari Maksimum."
    },
    {
      q: "Sebaliknya, untuk melihat harga barang paling murah (nilai terendah), rumus yang digunakan adalah...",
      options: ["=LOW()", "=LEAST()", "=MIN()", "=SMALL()"],
      answer: 2,
      hint: "Singkatan dari Minimum."
    },
    {
      q: "Titik kotak hitam kecil di pojok kanan bawah sel yang bisa ditarik untuk menyalin rumus otomatis disebut...",
      options: ["AutoFill Handle", "Copy Paste", "Quick Fill", "Drag Pointer"],
      answer: 0,
      hint: "Namanya berawalan kata 'Auto'."
    },
    {
      q: "Kotak kecil di sebelah kiri Formula Bar yang menampilkan alamat sel aktif (misal: B3) bernama...",
      options: ["Formula Bar", "Name Box", "Status Bar", "Title Bar"],
      answer: 1,
      hint: "Kotak yang menunjukkan 'Nama' sel."
    }
  ],
  2: [
    {
      q: "Agar data angka otomatis memiliki simbol 'Rp' yang rapi tanpa merusak rumus, format sel diubah ke...",
      options: ["Accounting / Currency", "Text", "General", "Scientific"],
      answer: 0,
      hint: "Menu format keuangan/akuntansi."
    },
    {
      q: "Mengapa kita tidak boleh mengetik tulisan 'Rp 5.000' secara manual langsung di dalam sel Excel?",
      options: ["Warnanya berubah merah", "Komputer menganggapnya teks biasa sehingga rumusnya eror", "Layar monitor tertutup", "Hurufnya jadi miring"],
      answer: 1,
      hint: "Komputer tidak bisa menghitung huruf!"
    },
    {
      q: "Fitur yang digunakan untuk menyatukan beberapa kotak sel menjadi satu kotak besar di tengah adalah...",
      options: ["Wrap Text", "Merge & Center", "Split Cell", "Group Cells"],
      answer: 1,
      hint: "Merge artinya menggabungkan."
    },
    {
      q: "Garis kisi-kisi abu-abu Excel tidak akan tercetak di kertas. Untuk memberi garis batas nyata tabel, pilih...",
      options: ["Page Border", "All Borders", "Draw Table", "Outline"],
      answer: 1,
      hint: "Borders artinya batas/garis tepi."
    },
    {
      q: "Jika kamu ingin menyaring tabel agar HANYA memunculkan data musuh berjenis 'Koopa', gunakan fitur...",
      options: ["Sort", "Filter", "Find", "Replace"],
      answer: 1,
      hint: "Ikonnya berbentuk seperti corong penyaring."
    },
    {
      q: "Perintah untuk mengurutkan nama siswa dari abjad A sampai Z secara teratur adalah...",
      options: ["Sort A to Z", "Filter", "Align Left", "Wrap Text"],
      answer: 0,
      hint: "Sort artinya mengurutkan."
    },
    {
      q: "Jenis diagram yang paling pas digunakan untuk membandingkan jumlah perolehan koin antartim adalah...",
      options: ["Pie Chart", "Column / Bar Chart (Batang)", "Line Chart", "Radar Chart"],
      answer: 1,
      hint: "Bentuknya seperti balok atau gedung berdampingan."
    },
    {
      q: "Grafik lingkaran yang bentuknya seperti potongan kue pizza paling cocok dipakai untuk menunjukkan...",
      options: ["Persentase proporsi bagian", "Perubahan suhu harian", "Operasi perkalian kasir", "Alur program"],
      answer: 0,
      hint: "Pie artinya kue pai/pizza bundar."
    },
    {
      q: "Untuk melihat tren perkembangan nilai ulangan secara berkala dari waktu ke waktu, grafik yang tepat adalah...",
      options: ["Pie Chart", "Line Chart (Grafik Garis)", "Bar Chart", "Doughnut Chart"],
      answer: 1,
      hint: "Grafik berupa garis naik-turun."
    },
    {
      q: "Keterangan angka nilai yang dimunculkan tepat di atas batang grafik agar mudah dibaca disebut...",
      options: ["Chart Title", "Legend", "Data Labels", "Axis Title"],
      answer: 2,
      hint: "Label untuk data angka."
    }
  ],
  3: [
    {
      q: "Huruf depan 'V' pada rumus =VLOOKUP() merupakan singkatan dari kata apa?",
      options: ["Variable", "Vertical (Tegak lurus)", "Visual", "Vector"],
      answer: 1,
      hint: "Lawan kata dari horizontal (mendatar)."
    },
    {
      q: "Jika tabel master referensi tersusun secara mendatar ke samping (baris), rumus yang kita gunakan adalah...",
      options: ["=HLOOKUP()", "=VLOOKUP()", "=LOOKUP()", "=ROWLOOKUP()"],
      answer: 0,
      hint: "Huruf depannya H (Horizontal)."
    },
    {
      q: "Tanda sakti yang disematkan di alamat sel (misal: $G$3:$I$6) agar posisinya terkunci rapat adalah...",
      options: ["Dollar ($)", "Pagar (#)", "Tanya (?)", "Bintang (*)"],
      answer: 0,
      hint: "Simbol mata uang Amerika."
    },
    {
      q: "Tombol sakti pada keyboard yang ditekan untuk langsung memunculkan tanda pengunci dollar ($) adalah...",
      options: ["F2", "F4", "F12", "Ctrl + K"],
      answer: 1,
      hint: "Tombol fungsi di jajaran paling atas keyboard."
    },
    {
      q: "Apa akibatnya jika saat membuat VLOOKUP kamu lupa mengunci tabel master dengan F4 lalu rumusnya ditarik ke bawah?",
      options: ["Tabel ikut bergeser turun dan muncul eror #N/A", "Nilai data terhapus permanen", "Hasil rumus tetap benar", "Komputer restart"],
      answer: 0,
      hint: "Kotak tabel master ikut bergeser turun."
    },
    {
      q: "Pada rumus =VLOOKUP(B3; $G$3:$I$8; 2; 0), angka 2 di dalam rumus tersebut artinya...",
      options: ["Mengalikan dengan 2", "Mengambil data dari kolom ke-2 pada tabel master", "Mengulang rumus 2 kali", "Mencari baris ke-2"],
      answer: 1,
      hint: "Nomor urut kolom di tabel master."
    },
    {
      q: "Mengapa di bagian paling akhir rumus VLOOKUP kita wajib mengetikkan angka 0 atau kata FALSE?",
      options: ["Agar nilainya jadi nol", "Supaya hasil pencarian datanya cocok persis 100% (Exact Match)", "Untuk menghapus tabel", "Agar layar tidak kedip"],
      answer: 1,
      hint: "Exact match artinya cocok persis tanpa kira-kira."
    },
    {
      q: "Ketika suatu sel di Excel menampilkan deretan tanda pagar rapat '#####', itu tandanya...",
      options: ["Rumus salah total", "Ukuran lebar kolom sel terlalu sempit", "Komputer terkena virus", "Data terhapus"],
      answer: 1,
      hint: "Tarik batas garis kolomnya ke kanan!"
    },
    {
      q: "Pesan galat #N/A pada hasil rumus VLOOKUP biasanya terjadi karena...",
      options: ["Kode barang yang dicari tidak ditemukan di tabel master", "Baterai komputer habis", "Kurang spasi", "Huruf terlalu kecil"],
      answer: 0,
      hint: "Not Available artinya tidak ada datanya."
    },
    {
      q: "Pada formula =VLOOKUP(A2; $D$2:$F$10; 3; 0), bagian A2 berkedudukan sebagai...",
      options: ["Lookup Value (Kode Acuan)", "Tabel Master", "Nomor Kolom", "Pesan Eror"],
      answer: 0,
      hint: "Nilai kunci yang mau dicari."
    }
  ],
  4: [
    {
      q: "Rumus di Excel yang digunakan untuk mengambil keputusan otomatis berdasarkan kondisi logika adalah...",
      options: ["=SUM()", "=IF()", "=COUNT()", "=CHECK()"],
      answer: 1,
      hint: "Kata bahasa Inggris untuk 'Jika'."
    },
    {
      q: "Mengapa kata 'LULUS' pada rumus =IF(C2>=75; \"LULUS\"; \"REMIDI\") harus diapit tanda petik dua?",
      options: ["Agar hurufnya tebal", "Memberitahu Excel bahwa nilai tersebut berupa teks", "Sebagai hiasan", "Biar bisa dihitung"],
      answer: 1,
      hint: "Setiap teks di dalam rumus wajib memakai petik dua."
    },
    {
      q: "Jika Mario ingin menghitung berapa banyak siswa yang mendapat nilai 'A', rumus yang tepat adalah...",
      options: ["=SUMIF()", "=COUNTIF()", "=COUNT()", "=AVERAGEIF()"],
      answer: 1,
      hint: "Gabungan kata COUNT (hitung) dan IF (jika)."
    },
    {
      q: "Pada aplikasi pemrograman Scratch, karakter animasi yang bisa diprogram bergerak disebut...",
      options: ["Backdrop", "Sprite", "Stage", "Script"],
      answer: 1,
      hint: "Nama karakter default-nya adalah kucing oranye."
    },
    {
      q: "Panggung latar tempat karakter Sprite beraksi dan menampilkan animasi dinamakan...",
      options: ["Stage", "Block Palette", "Sound Tab", "Toolbar"],
      answer: 0,
      hint: "Bahasa Inggris dari panggung pertunjukan."
    },
    {
      q: "Balok kode berwarna kuning di Scratch bertuliskan 'when green flag clicked' berfungsi untuk...",
      options: ["Menjalankan program saat bendera hijau diklik", "Menghentikan seluruh program", "Menghapus Sprite", "Mengganti kostum"],
      answer: 0,
      hint: "Pemicu mulainya sebuah game di Scratch."
    },
    {
      q: "Apa perbedaan balok 'forever' dengan 'repeat [10]' pada balok Control di Scratch?",
      options: ["forever berulang terus tanpa henti, repeat hanya 10 kali", "repeat berulang selamanya, forever cuma 1 kali", "Sama saja tidak ada beda", "forever untuk efek suara"],
      answer: 0,
      hint: "Forever artinya selamanya."
    },
    {
      q: "Agar karakter Sprite tidak meluncur keluar batas layar panggung saat berjalan, pasangkan balok...",
      options: ["if on edge, bounce", "move 10 steps", "next costume", "turn 15 degrees"],
      answer: 0,
      hint: "Bounce artinya memantul kembali."
    },
    {
      q: "Saat memantul dari dinding layar, kepala Sprite terlihat terbalik ke bawah! Balok apa yang bisa memperbaikinya?",
      options: ["set rotation style [left-right]", "hide", "change size by 10", "glide 1 secs"],
      answer: 0,
      hint: "Kunci rotasinya hanya ke kiri dan ke kanan."
    },
    {
      q: "Balok Looks bertuliskan 'next costume' biasanya dipasang di dalam perulangan jalan agar karakter Sprite...",
      options: ["Memiliki animasi langkah kaki yang tampak hidup", "Berubah menjadi karakter lain", "Menghilang perlahan", "Membesar ukurannya"],
      answer: 0,
      hint: "Mengganti pose gambar karakter berikutnya."
    }
  ]
};

// Ambil 1 soal acak berdasarkan nomor World yang aktif
export function getRandomQuestion(worldNumber) {
  const worldList = GAME_QUESTIONS[worldNumber] || GAME_QUESTIONS[1];
  const randomIndex = Math.floor(Math.random() * worldList.length);
  return { ...worldList[randomIndex], worldNumber };
}
