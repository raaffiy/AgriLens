import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const ModuleDetails = () => {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedModules, setRelatedModules] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/modules/${id}`);
        const data = await response.json();
        setModule(data);

        const relatedRes = await fetch(`http://localhost:5000/api/modules`);
        const allModules = await relatedRes.json();
        const filtered = allModules.filter(m => m.id !== parseInt(id)).slice(0, 3);
        setRelatedModules(filtered);
      } catch (err) {
        console.error("Gagal mengambil detail modul:", err);
      }
      setLoading(false);
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      <p className="animate-pulse font-semibold tracking-widest uppercase text-sm text-gray-400">Memuat modul...</p>
    </div>
  );

  if (!module) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-white p-6 text-center">
      <div className="text-8xl">🏜️</div>
      <h1 className="text-3xl font-bold">Modul Tidak Ditemukan</h1>
      <p className="text-gray-400">Maaf, panduan yang Anda cari tidak tersedia atau telah dihapus.</p>
      <Link to="/module" className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-2xl font-semibold transition">
        Kembali ke Edukasi
      </Link>
    </div>
  );

  // Helper deteksi YouTube (support youtu.be dan youtube.com)
  const isYouTube = (url) =>
    url && (url.includes('youtube.com') || url.includes('youtu.be'));

  // Konversi berbagai format YouTube URL ke embed URL
  const getYouTubeEmbedUrl = (url) => {
    try {
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (_) {}
    return url;
  };

  const imgSrc = module.image?.startsWith('http') ? module.image : `http://localhost:5000${module.image}`;
  const fallbackSrc = 'https://placehold.co/800x800/1e293b/4ade80?text=AgriLens';

  return (
    <>
      <style>{`
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fade-in-right 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.8s ease-out forwards; }
      `}</style>

      {/* HEADER IMAGE + TITLE */}
      <header className="relative bg-black/30 backdrop-blur-xl border-b-2 border-green-500/30">
        <div className="container mx-auto px-6 md:px-20 py-12 grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Title & Description */}
          <div className="text-center md:text-left animate-fade-in-right">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              Panduan Lengkap Membuat{' '}
              <span className="text-green-400 block">{module.title}</span>
            </h1>
            <p className="text-gray-300 mt-4 text-lg max-w-lg mx-auto md:mx-0">
              {module.short_desc}
            </p>
          </div>

          {/* Right: Image atau YouTube */}
          <div className="flex justify-center items-center animate-fade-in-left">
            <div className="relative w-full max-w-sm h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-green-500/30 group">

              {module.category === 'Panduan Membuat Pupuk' && isYouTube(module.image) ? (
                // Panduan Pupuk → tampilkan YouTube embed
                <iframe
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(module.image)}
                  title={module.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // Panduan Menanam → tampilkan gambar
                <>
                  <img
                    src={imgSrc}
                    alt={`Ilustrasi ${module.title}`}
                    className="w-full h-full object-cover transition duration-500 transform group-hover:scale-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackSrc; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  {module.category && (
                    <div className="absolute bottom-4 left-4 p-2 bg-black/50 backdrop-blur-lg rounded-xl">
                      <p className="text-sm text-white font-semibold">🌱 {module.category}</p>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-14">

        <div className="bg-black/40 backdrop-blur-xl border border-green-500/40 rounded-3xl p-10 shadow-2xl">

          {/* Deskripsi */}
          {module.long_desc && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-green-400">Deskripsi Panduan</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{module.long_desc}</p>
            </>
          )}

          {/* Manfaat / Bahan */}
          {module.benefits && (
            <>
              <h2 className="text-2xl font-bold mt-10 mb-4 text-green-400">
                {module.category === 'Panduan Membuat Pupuk' ? 'Bahan-bahan' : 'Manfaat'}
              </h2>
              <div className="border-green-500/20 p-6 rounded-xl">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{module.benefits}</p>
              </div>
            </>
          )}

          {/* Langkah Menanam */}
          {module.planting_steps && (
            <>
              <h2 className="text-2xl font-bold mt-10 mb-4 text-green-400">Langkah-langkah</h2>
              <div className="border-green-500/20 p-6 rounded-xl">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{module.planting_steps}</p>
              </div>
            </>
          )}

          {/* Tips Perawatan */}
          {module.care_tips && (
            <>
              <h2 className="text-2xl font-bold mt-10 mb-4 text-green-400">Tips Perawatan</h2>
              <div className="bg-gray-800/40 border border-green-500/20 p-6 rounded-xl">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{module.care_tips}</p>
              </div>
            </>
          )}

          {/* Back Button */}
          <div className="text-center mt-12">
            <Link
              to="/module"
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-semibold transition inline-block"
            >
              ← Kembali ke Daftar Modul
            </Link>
          </div>
        </div>

        {/* RELATED MODULES */}
        {relatedModules.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
              Modul <span className="text-green-400">Terkait</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedModules.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/module/${rel.id}`}
                  className="group relative rounded-3xl overflow-hidden shadow-lg border border-green-500/20 hover:border-green-500/60 transition duration-500"
                >
                  <img
                    src={rel.image?.startsWith('http') ? rel.image : `http://localhost:5000${rel.image}`}
                    alt={rel.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition duration-500 opacity-80"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e293b/4ade80?text=AgriLens'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 p-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition">{rel.title}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2">{rel.short_desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </>
  );
};

export default ModuleDetails;