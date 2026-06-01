import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 md:py-32 text-center">
        <div className="bg-black/40 backdrop-blur-xl p-10 rounded-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Masa Depan Pertanian Dimulai di Sini
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Menggabungkan Teknologi Cerdas dan Kearifan Lokal untuk Komunitas Pertanian yang Mandiri dan Berkelanjutan.
          </p>
          <div className="mt-10">
            <Link to="/lens-ai" className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 text-lg">
              AgriLens - AI
            </Link>
          </div>
        </div>
      </main>

      {/* Content Sections */}
      <div className="py-20 bg-black/20">
        <div className="container mx-auto px-6 space-y-20">

          {/* Latar Belakang */}
          <section id="latar-belakang" className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2 bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                <span className="text-green-400">Latar Belakang</span> AgriLens
              </h2>
              <p className="text-gray-300 leading-relaxed">
                AgriLens lahir dari kebutuhan masyarakat dan petani untuk memiliki akses terhadap teknologi pertanian modern yang dapat membantu meningkatkan kualitas produksi, efisiensi kerja, serta memberikan edukasi pertanian yang mudah dipahami. Minimnya pemahaman masyarakat terhadap lingkungan dan pertanian berkelanjutan juga menjadi alasan utama dibuatnya platform ini. Dengan menggabungkan teknologi digital, edukasi, dan pemberdayaan komunitas, AgriLens hadir sebagai solusi untuk menciptakan sistem pertanian yang lebih cerdas dan ramah lingkungan.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <img src="/assets/latarbelakang.png" alt="Smart Farming" className="rounded-2xl shadow-2xl object-cover h-full w-full" />
            </div>
          </section>

          {/* Tujuan */}
          <section id="tujuan" className="text-center">
            <h2 className="text-4xl font-bold text-white mb-12">
              Tujuan <span className="text-green-400">Kami</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500">
                <h3 className="text-2xl font-semibold text-green-400 mb-3">Literasi Pertanian</h3>
                <p className="text-gray-300">Meningkatkan literasi pertanian bagi masyarakat umum melalui modul interaktif dan gamifikasi.</p>
              </div>
              {/* Card 2 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500">
                <h3 className="text-2xl font-semibold text-green-400 mb-3">Monitoring Cerdas</h3>
                <p className="text-gray-300">Membantu petani memonitor kondisi tanah dan tanaman menggunakan teknologi digital secara real-time.</p>
              </div>
              {/* Card 3 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500">
                <h3 className="text-2xl font-semibold text-green-400 mb-3">Ekosistem Kolaboratif</h3>
                <p className="text-gray-300">Membangun forum komunikasi antara masyarakat, petani, dan pihak terkait untuk ekosistem yang solid.</p>
              </div>
            </div>
          </section>

          {/* Manfaat */}
          <section id="manfaat" className="text-center">
            <h2 className="text-4xl font-bold text-white mb-12">
              Manfaat <span className="text-green-400">AgriLens</span>
            </h2>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Benefit 1 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500 flex items-start space-x-4">
                <div className="text-green-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.205 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.795 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.795 5 16.5 5c1.705 0 3.332.477 4.5 1.253v13C19.832 18.477 18.205 18 16.5 18c-1.705 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-xl text-white mb-2">Edukasi Modern</h4>
                  <p className="text-gray-300">Menyediakan materi edukasi pertanian yang mudah diakses dan dipahami oleh semua kalangan, dari pemula hingga ahli.</p>
                </div>
              </div>
              {/* Benefit 2 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500 flex items-start space-x-4">
                <div className="text-green-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-xl text-white mb-2">Analisis Data Akurat</h4>
                  <p className="text-gray-300">Mempermudah petani dalam melakukan analisis tanah, jadwal tanam, dan pencatatan hasil panen berbasis data yang akurat.</p>
                </div>
              </div>
              {/* Benefit 3 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500 flex items-start space-x-4">
                <div className="text-green-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-xl text-white mb-2">Pusat Informasi Komunitas</h4>
                  <p className="text-gray-300">Menjadi hub informasi pertanian terpusat di tingkat RT/RW, memfasilitasi pertukaran pengetahuan dan pengalaman.</p>
                </div>
              </div>
              {/* Benefit 4 */}
              <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl transform hover:-translate-y-2 transition duration-500 flex items-start space-x-4">
                <div className="text-green-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-xl text-white mb-2">Peningkatan Produktivitas</h4>
                  <p className="text-gray-300">Meningkatkan hasil panen dan efisiensi pertanian melalui penerapan teknologi dan data yang tepat dan terarah.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Galeri Dokumentasi */}
      <section id="galeri" className="text-center mt-20">
        <h2 className="text-4xl font-bold text-white mb-12">
          Galeri <span className="text-green-400">Dokumentasi</span>
        </h2>
    
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="group relative overflow-hidden rounded-2xl shadow-xl bg-black/30 backdrop-blur-xl">
              <img src="/assets/dokumentasi/pertemuanPertama.jpg" alt={`Galeri ${item}`}
                className="w-full h-56 object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                <p className="text-white text-lg font-semibold">Meeting-{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
