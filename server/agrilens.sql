-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2026 at 09:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `agrilens`
--

-- --------------------------------------------------------

--
-- Table structure for table `discussions`
--

CREATE TABLE `discussions` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `answer` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discussions`
--

INSERT INTO `discussions` (`id`, `content`, `answer`, `created_at`) VALUES
(1, 'topik', 'jawaban', '2026-05-29 06:53:34'),
(2, 'sample 2', 'yes?', '2026-05-29 08:59:07'),
(3, 'sample 3', NULL, '2026-05-29 09:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(10) UNSIGNED NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `short_desc` text DEFAULT NULL,
  `long_desc` text DEFAULT NULL,
  `benefits` text DEFAULT NULL,
  `planting_steps` text DEFAULT NULL,
  `care_tips` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `userId`, `image`, `title`, `category`, `short_desc`, `long_desc`, `benefits`, `planting_steps`, `care_tips`, `created_at`) VALUES
(6, 6, '/admin/uploads/modules/img_1780051235867_sdlq2vl27x9.png', 'Cabai', 'Panduan Menanam', 'Dari biji hingga panen melimpah. Kuasai semua langkah penting untuk menumbuhkan cabai yang sehat dan produktif di kebun Anda.', 'Cabai merupakan tanaman buah yang banyak digunakan sebagai bumbu masakan di Indonesia. Cabai memiliki tingkat nilai ekonomi tinggi dan cocok ditanam di pekarangan, polybag, maupun lahan.', 'Berikut beberapa manfaat utama jagung:\r\n•	Sumber karbohidrat yang baik. \r\n•	Mengandung serat yang membantu pencernaan. \r\n•	Kaya vitamin B dan antioksidan. \r\n•	Digunakan sebagai pakan ternak. \r\n•	Menjadi bahan baku berbagai produk makanan dan industri.', 'Berikut langkah-langkah budidaya jagung yang dapat dilakukan:\r\n1.	Pilih benih jagung berkualitas. \r\n2.	Olah tanah dan buat bedengan jika diperlukan. \r\n3.	Tanam benih dengan jarak tanam yang sesuai. \r\n4.	Lakukan penyiraman secara rutin. \r\n5.	Berikan pupuk dasar dan pupuk susulan. \r\n6.	Kendalikan gulma dan hama secara berkala. \r\n7.	Panen saat tongkol matang dan biji mengeras.', 'Hindari penyiraman berlebih karena tanah terlalu basah bisa menyebabkan akar membusuk. Letakkan tanaman di tempat yang mendapat sinar matahari 6–8 jam sehari untuk hasil terbaik.', '2026-05-29 09:26:11'),
(8, 6, '/admin/uploads/modules/img_1780051873665_r7alnsodm1k.png', 'Pisang', 'Panduan Menanam', 'Jagung adalah tanaman pangan yang menghasilkan biji sebagai sumber karbohidrat, pakan ternak, dan bahan baku industri.', 'Jagung merupakan salah satu komoditas pertanian penting di Indonesia. Tanaman ini dapat tumbuh pada berbagai jenis tanah dan memiliki masa panen relatif singkat, sekitar 90–120 hari setelah tanam. Selain digunakan sebagai bahan makanan pokok di beberapa daerah, jagung juga dimanfaatkan sebagai bahan baku industri makanan, pakan ternak, dan bioenergi.', 'Berikut beberapa manfaat utama jagung:\r\n•	Sumber karbohidrat yang baik.\r\n•	Mengandung serat yang membantu pencernaan.\r\n•	Kaya vitamin B dan antioksidan.\r\n•	Digunakan sebagai pakan ternak.\r\n•	Menjadi bahan baku berbagai produk makanan dan industri.', 'Berikut langkah-langkah budidaya jagung yang dapat dilakukan:\r\n1.	Pilih benih jagung berkualitas.\r\n2.	Olah tanah dan buat bedengan jika diperlukan.\r\n3.	Tanam benih dengan jarak tanam yang sesuai.\r\n4.	Lakukan penyiraman secara rutin.\r\n5.	Berikan pupuk dasar dan pupuk susulan.\r\n6.	Kendalikan gulma dan hama secara berkala.\r\n7.	Panen saat tongkol matang dan biji mengeras.', 'Untuk mendapatkan hasil panen jagung yang optimal, tanaman perlu dirawat secara rutin sejak masa pertumbuhan awal hingga panen. Pastikan tanaman memperoleh sinar matahari yang cukup karena jagung membutuhkan cahaya penuh untuk tumbuh dengan baik. Penyiraman perlu dilakukan secara teratur, terutama pada fase perkecambahan dan pembentukan tongkol, namun hindari genangan air yang dapat menyebabkan akar membusuk.', '2026-05-29 10:51:13'),
(9, 6, '/admin/uploads/modules/img_1780051905652_3wlnjb6rrb2.png', 'Jagung', 'Panduan Menanam', 'Jagung adalah tanaman pangan yang menghasilkan biji sebagai sumber karbohidrat, pakan ternak, dan bahan baku industri.', 'Jagung merupakan salah satu komoditas pertanian penting di Indonesia. Tanaman ini dapat tumbuh pada berbagai jenis tanah dan memiliki masa panen relatif singkat, sekitar 90–120 hari setelah tanam. Selain digunakan sebagai bahan makanan pokok di beberapa daerah, jagung juga dimanfaatkan sebagai bahan baku industri makanan, pakan ternak, dan bioenergi.', 'Berikut beberapa manfaat utama jagung:\r\n•	Sumber karbohidrat yang baik.\r\n•	Mengandung serat yang membantu pencernaan.\r\n•	Kaya vitamin B dan antioksidan.\r\n•	Digunakan sebagai pakan ternak.\r\n•	Menjadi bahan baku berbagai produk makanan dan industri.', 'Berikut langkah-langkah budidaya jagung yang dapat dilakukan:\r\n1.	Pilih benih jagung berkualitas.\r\n2.	Olah tanah dan buat bedengan jika diperlukan.\r\n3.	Tanam benih dengan jarak tanam yang sesuai.\r\n4.	Lakukan penyiraman secara rutin.\r\n5.	Berikan pupuk dasar dan pupuk susulan.\r\n6.	Kendalikan gulma dan hama secara berkala.\r\n7.	Panen saat tongkol matang dan biji mengeras.\r\n', 'Untuk mendapatkan hasil panen jagung yang optimal, tanaman perlu dirawat secara rutin sejak masa pertumbuhan awal hingga panen. Pastikan tanaman memperoleh sinar matahari yang cukup karena jagung membutuhkan cahaya penuh untuk tumbuh dengan baik.', '2026-05-29 10:51:45'),
(10, 6, 'https://youtu.be/YRHcpHWtf6A?si=4cMn3_I4v7X6EzbJ', 'Pupuk Kompos dari Daun Kering', 'Panduan Membuat Pupuk', '', 'Pupuk kompos dari daun kering merupakan pupuk organik yang dibuat melalui proses penguraian bahan-bahan alami oleh mikroorganisme. Kompos ini bermanfaat untuk meningkatkan kesuburan tanah, memperbaiki struktur tanah, meningkatkan daya serap air, serta menyediakan unsur hara yang dibutuhkan tanaman. Pembuatan pupuk kompos dari daun kering juga membantu mengurangi limbah organik di lingkungan dan mendukung pertanian yang ramah lingkungan.', 'Ingredients (Bahan-bahan)\r\n•	5 kg daun kering \r\n•	1 kg tanah humus atau kompos jadi (sebagai starter) \r\n•	500 ml larutan EM4 \r\n•	500 gram gula merah yang telah dilarutkan dalam 5 liter air \r\n•	Air secukupnya untuk menjaga kelembapan \r\n•	Sisa sayuran atau sampah organik dapur (opsional) ', 'Making Steps (Langkah Pembuatan)\r\n1.	Kumpulkan daun kering dan cacah menjadi ukuran yang lebih kecil agar proses penguraian lebih cepat. \r\n2.	Campurkan daun kering dengan tanah humus atau kompos jadi sebagai sumber mikroorganisme. \r\n3.	Larutkan gula merah ke dalam air, kemudian campurkan dengan EM4 hingga merata. \r\n4.	Siram larutan EM4 ke campuran daun secara perlahan sambil diaduk hingga kelembapannya cukup (tidak terlalu basah dan tidak terlalu kering). \r\n5.	Masukkan campuran ke dalam ember atau tong komposter. \r\n6.	Tutup wadah menggunakan terpal atau penutup yang masih memungkinkan sirkulasi udara. \r\n7.	Aduk kompos setiap 3–5 hari sekali untuk menjaga pasokan oksigen dan mempercepat proses fermentasi. \r\n8.	Jaga kelembapan kompos dengan menambahkan sedikit air jika terlalu kering. \r\n9.	Setelah 4–8 minggu, kompos akan berubah warna menjadi cokelat kehitaman, bertekstur remah, dan tidak berbau menyengat. \r\n10.	Pupuk kompos siap digunakan untuk menyuburkan tanaman dan lahan pertanian. ', 'Tools (Alat yang Dibutuhkan)\r\n•	Ember atau tong komposter \r\n•	Sekop kecil \r\n•	Sarung tangan \r\n•	Pisau atau gunting untuk mencacah daun \r\n•	Sprayer atau alat penyiram \r\n•	Terpal atau penutup komposter \r\n•	Pengaduk kayu', '2026-05-30 03:52:59'),
(11, 6, 'https://youtu.be/wAhJvDH5b4k?si=jepz2cfmxSPNWXXm', 'Pupuk Organik Cair', 'Panduan Membuat Pupuk', '', 'Pupuk Organik Cair (POC) adalah pupuk yang dibuat dari bahan-bahan organik yang difermentasi sehingga menghasilkan larutan kaya unsur hara. Pupuk ini mudah diserap oleh tanaman karena diaplikasikan langsung pada daun atau tanah. Penggunaan POC dapat meningkatkan pertumbuhan tanaman, memperbaiki kesuburan tanah, meningkatkan hasil panen, serta mengurangi ketergantungan pada pupuk kimia. Pembuatan POC juga membantu memanfaatkan limbah organik rumah tangga menjadi produk yang bernilai guna.', 'Ingredients (Bahan-bahan)\r\n•	2 kg sisa sayuran dan buah-buahan \r\n•	1 liter air cucian beras \r\n•	200 ml EM4 \r\n•	250 gram gula merah \r\n•	5 liter air bersih \r\n•	500 gram daun hijau (opsional)', 'Making Steps (Langkah Pembuatan)\r\n1.	Potong kecil-kecil sisa sayuran, buah-buahan, dan daun hijau agar proses fermentasi lebih cepat. \r\n2.	Larutkan gula merah ke dalam air bersih hingga tercampur merata. \r\n3.	Masukkan bahan organik yang telah dicacah ke dalam ember atau jerigen. \r\n4.	Tambahkan air cucian beras dan larutan gula merah ke dalam wadah. \r\n5.	Tuangkan EM4 lalu aduk seluruh bahan hingga tercampur rata. \r\n6.	Tutup rapat wadah, tetapi buka sebentar setiap 2–3 hari untuk mengeluarkan gas hasil fermentasi. \r\n7.	Simpan wadah di tempat teduh selama 10–14 hari. \r\n8.	Setelah fermentasi selesai, saring larutan untuk memisahkan ampas dan cairan pupuk. \r\n9.	Masukkan pupuk cair ke dalam botol penyimpanan yang bersih. \r\n10.	Sebelum digunakan, encerkan pupuk dengan perbandingan 1:10 (1 bagian pupuk dan 10 bagian air), lalu semprotkan ke tanaman atau siramkan ke media tanam.\r\n\r\n', 'Tools (Alat yang Dibutuhkan)\r\n•	Ember atau jerigen bertutup \r\n•	Pisau atau gunting \r\n•	Pengaduk kayu \r\n•	Corong \r\n•	Saringan kain \r\n•	Botol penyimpanan \r\n•	Sarung tangan', '2026-05-30 04:16:22'),
(12, 6, 'https://youtu.be/70Mzo4LppLI?si=4pxT-MBN-hw3KwgO', 'Pupuk Organik dari Kotoran Kambing', 'Panduan Membuat Pupuk', '', 'Pupuk organik hasil olahan kotoran kambing merupakan pupuk alami yang dibuat melalui proses fermentasi atau pengomposan kotoran kambing sehingga aman dan kaya akan unsur hara bagi tanaman. Pupuk ini mengandung nitrogen (N), fosfor (P), dan kalium (K) yang membantu pertumbuhan akar, batang, daun, serta meningkatkan produktivitas tanaman. Selain ramah lingkungan, penggunaan pupuk organik dari kotoran kambing juga dapat memperbaiki struktur tanah, meningkatkan aktivitas mikroorganisme tanah, dan mengurangi ketergantungan pada pupuk kimia.', 'Ingredients (Bahan-bahan)\r\n•	10 kg kotoran kambing kering \r\n•	2 kg sekam padi atau serbuk gergaji \r\n•	1 kg dedak halus \r\n•	200 ml EM4 \r\n•	250 gram gula merah \r\n•	10 liter air bersih \r\n•	1 kg daun kering (opsional)', 'Making Steps (Langkah Pembuatan)\r\n1.	Siapkan kotoran kambing yang sudah cukup kering dan bebas dari sampah anorganik. \r\n2.	Campurkan kotoran kambing dengan sekam padi, dedak halus, dan daun kering hingga merata. \r\n3.	Larutkan gula merah ke dalam air, kemudian tambahkan EM4 dan aduk hingga tercampur sempurna. \r\n4.	Siram larutan EM4 ke campuran bahan secara perlahan sambil diaduk hingga kelembapannya cukup (sekitar 30–40%). \r\n5.	Tumpuk atau masukkan campuran ke dalam wadah fermentasi. \r\n6.	Tutup menggunakan terpal agar proses fermentasi berjalan optimal. \r\n7.	Lakukan pembalikan atau pengadukan setiap 3–4 hari sekali untuk menjaga sirkulasi udara dan mempercepat proses penguraian. \r\n8.	Fermentasikan selama 2–4 minggu hingga warna pupuk menjadi lebih gelap, tidak berbau menyengat, dan teksturnya remah. \r\n9.	Jemur pupuk yang telah matang hingga kadar air berkurang. \r\n10.	Pupuk organik dari kotoran kambing siap digunakan pada tanaman dengan cara ditaburkan di sekitar area perakaran atau dicampurkan ke media tanam. ', 'Tools (Alat yang Dibutuhkan)\r\n•	Ember atau drum fermentasi \r\n•	Sekop \r\n•	Sarung tangan \r\n•	Terpal atau plastik penutup \r\n•	Pengaduk kayu \r\n•	Timbangan \r\n•	Sprayer atau alat penyiram ', '2026-05-30 04:21:18');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(10) UNSIGNED NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `post_date` date DEFAULT NULL,
  `long_desc` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `userId`, `image`, `title`, `category`, `post_date`, `long_desc`, `created_at`) VALUES
(5, 6, '/admin/uploads/news/img_1780115526128_40r2poumqxk.jpg', 'Teknologi AI dan Drone Tingkatkan Produktivitas Pertanian Indonesia', 'Teknologi', '2026-05-30', 'Perkembangan teknologi kecerdasan buatan (Artificial Intelligence/AI) dan drone semakin memberikan dampak positif bagi sektor pertanian Indonesia. Berbagai perusahaan agritech dan institusi penelitian mulai mengembangkan solusi digital yang mampu membantu petani dalam memantau kondisi lahan secara real-time, mendeteksi serangan hama lebih cepat, serta mengoptimalkan penggunaan pupuk dan air.\r\n\r\nPenggunaan drone pertanian memungkinkan pemetaan lahan yang lebih akurat melalui citra udara beresolusi tinggi. Data yang diperoleh kemudian dianalisis menggunakan teknologi AI untuk mengidentifikasi tingkat kesehatan tanaman, kebutuhan nutrisi, dan potensi risiko gagal panen. Dengan pendekatan ini, petani dapat mengambil keputusan yang lebih tepat dan efisien.\r\n\r\nSelain itu, teknologi Internet of Things (IoT) juga mulai diterapkan melalui sensor tanah yang mampu mengukur kelembapan, suhu, dan kandungan unsur hara. Informasi tersebut dapat diakses langsung melalui aplikasi mobile sehingga petani dapat memantau kondisi lahan kapan saja dan di mana saja.\r\n\r\nPara ahli menilai bahwa integrasi AI, drone, dan IoT berpotensi meningkatkan produktivitas pertanian hingga puluhan persen, sekaligus mengurangi biaya operasional. Teknologi ini diharapkan dapat menjadi solusi untuk menghadapi tantangan pertanian modern seperti perubahan iklim, keterbatasan lahan, dan meningkatnya kebutuhan pangan nasional.\r\n\r\nPemerintah dan berbagai pihak terkait terus mendorong adopsi teknologi digital di sektor agrikultur guna menciptakan sistem pertanian yang lebih cerdas, berkelanjutan, dan mampu meningkatkan kesejahteraan petani Indonesia.', '2026-05-30 04:32:06'),
(6, 6, '/admin/uploads/news/img_1780115782713_mdfwbo7ie8m.jpg', 'Harga Cabai Merah Naik 15% Akibat Cuaca Ekstrem di Sejumlah Daerah', 'Harga Pasar', '2026-05-30', 'Harga cabai merah di berbagai pasar tradisional mengalami kenaikan hingga 15% dalam dua pekan terakhir. Kenaikan harga ini dipicu oleh curah hujan tinggi yang menyebabkan penurunan hasil panen di sejumlah sentra produksi cabai di Indonesia.\r\n\r\nBerdasarkan laporan pedagang dan petani, pasokan cabai dari daerah penghasil utama mengalami penurunan akibat meningkatnya serangan penyakit tanaman serta terganggunya proses distribusi. Kondisi tersebut menyebabkan stok di pasar menjadi lebih terbatas dibandingkan permintaan masyarakat yang tetap tinggi.\r\n\r\nSaat ini harga cabai merah di beberapa wilayah berkisar antara Rp55.000 hingga Rp75.000 per kilogram, tergantung kualitas dan lokasi penjualan. Para petani berharap kondisi cuaca membaik dalam beberapa minggu ke depan agar produksi dapat kembali normal dan harga menjadi lebih stabil.\r\n\r\nPemerintah daerah bersama dinas pertanian terus melakukan pemantauan terhadap perkembangan harga komoditas hortikultura serta memberikan pendampingan kepada petani untuk mengurangi dampak perubahan cuaca terhadap hasil panen. Langkah ini diharapkan dapat menjaga kestabilan pasokan dan harga cabai di pasar.\r\n\r\nAnalis agribisnis memprediksi harga cabai akan mulai stabil ketika musim panen berikutnya tiba dan distribusi antarwilayah kembali berjalan lancar. Masyarakat diimbau untuk berbelanja secara bijak dan tidak melakukan pembelian berlebihan yang dapat memicu lonjakan harga lebih lanjut.', '2026-05-30 04:36:22'),
(7, 6, '/admin/uploads/news/img_1780116218336_lqeo34fvfq.jpg', 'Memasuki Musim Kemarau Basah, Petani Diimbau Atur Strategi Pola Tanam', 'Cuaca & Iklim', '2026-05-30', 'Fenomena kemarau basah yang diprediksi akan melanda sebagian besar wilayah sentra pangan di Indonesia menuntut para pelaku sektor agrikultur untuk lebih sigap dalam melakukan adaptasi lapangan. Kemarau basah, yang ditandai dengan intensitas hujan yang tetap tinggi meskipun telah memasuki periode musim kering, membawa tantangan ganda: risiko serangan hama penyakit yang menyukai kelembapan tinggi serta potensi kerusakan fisik pada tanaman akibat curah hujan ekstrem yang tidak terduga.\r\n\r\nGuna mengantisipasi risiko gagal panen, pemerintah melalui dinas terkait mengimbau para petani untuk segera merombak strategi dan pola tanam tradisional. Langkah mitigasi yang direkomendasikan meliputi peralihan ke varietas benih yang lebih tahan terhadap genangan air, perbaikan sistem drainase lahan agar tidak terjadi pembusukan akar, serta diversifikasi komoditas yang adaptif. Pengaturan manajemen air yang ketat menjadi kunci utama agar tanaman tetap mendapatkan nutrisi optimal tanpa terganggu oleh anomali iklim yang terjadi.', '2026-05-30 04:43:38'),
(9, 6, '/admin/uploads/news/img_1780299778542_xoe3942ydhe.jpeg', 'sample ', 'Teknologi', '1010-10-10', 'sample ', '2026-06-01 07:42:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `password`) VALUES
(6, 'rapi', 'mraafi122@gmail.com', '$2b$12$e.OmpBXh1M2snpb2vLIaZOoRFzLlGn8PLT7Hj6MnadRUhZ5m0U/l6');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `discussions`
--
ALTER TABLE `discussions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_modules_user` (`userId`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_news_user` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `discussions`
--
ALTER TABLE `discussions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `fk_modules_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `news`
--
ALTER TABLE `news`
  ADD CONSTRAINT `fk_news_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
