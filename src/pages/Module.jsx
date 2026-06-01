import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../api';

const getYouTubeThumbnail = (url) => {
  try {
    if (url?.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    if (url?.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch (_) {}
  return 'https://placehold.co/400x600/1e293b/4ade80?text=Module';
};

const Module = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/modules`)
      .then(res => res.json())
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil modul:", err);
        setLoading(false);
      });
  }, []);

  const tananam = modules.filter(m => m.category === 'Panduan Menanam');
  const pupuk = modules.filter(m => m.category === 'Panduan Membuat Pupuk');

  const ModuleCard = ({ module }) => {
    const isPupuk = module.category === 'Panduan Membuat Pupuk';

    const imgSrc = isPupuk
      ? getYouTubeThumbnail(module.image)
      : module.image?.startsWith('http')
        ? module.image
        : `${API_BASE_URL}${module.image}`;

    return (
      <Link
        to={`/module/${module.id}`}
        className="group relative overflow-hidden rounded-3xl shadow-2xl border border-green-400/20 hover:border-green-400/60 transition duration-500"
      >
        <img
          src={imgSrc}
          alt={module.title}
          className="w-full h-56 object-cover transition duration-500 group-hover:scale-110 opacity-80"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x600/1e293b/4ade80?text=Module';
          }}
        />
        {/* Badge YouTube untuk pupuk */}
        {isPupuk && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            ▶ Video
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-green-400 transition line-clamp-1">
            {module.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2">{module.short_desc || module.long_desc}</p>
        </div>
      </Link>
    );
  };

  const ModuleGrid = ({ list }) => {
    if (loading) return <p className="text-center text-gray-400 col-span-full">Memuat modul...</p>;
    if (list.length === 0) return <p className="text-center text-gray-400 col-span-full">Belum ada modul.</p>;
    return list.map(module => <ModuleCard key={module.id} module={module} />);
  };

  return (
    <main className="container mx-auto px-6 py-12">

      {/* Hero */}
      <div className="bg-black/40 backdrop-blur-xl p-12 rounded-3xl shadow-2xl mb-12 text-center">
        <h1 className="text-5xl font-bold text-white">Module Edukasi Pertanian</h1>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
          Pelajari teknik menanam berbagai jenis tanaman pangan dengan panduan ahli dari AgriLens.
        </p>
      </div>

      {/* Panduan Menanam */}
      <h2 className="text-4xl font-bold text-center text-white mb-10">
        Pilih <span className="text-green-400">Panduan Menanam</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
        <ModuleGrid list={tananam} />
      </div>

      {/* Panduan Membuat Pupuk */}
      <h2 className="text-4xl font-bold text-center text-white mb-10 mt-20">
        Pilih <span className="text-green-400">Panduan Membuat Pupuk</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
        <ModuleGrid list={pupuk} />
      </div>

    </main>
  );
};

export default Module;