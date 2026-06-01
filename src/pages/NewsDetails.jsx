import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_BASE_URL from '../api';

const NewsDetails = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/news/${id}`);
        const data = await res.json();
        setNews(data);

        const allRes = await fetch(`${API_BASE_URL}/api/news`);
        const allNews = await allRes.json();
        const filtered = allNews.filter(n => n.id !== parseInt(id)).slice(0, 2);
        setRelatedNews(filtered);
      } catch (err) {
        console.error("Gagal mengambil berita:", err);
      }
      setLoading(false);
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [id]);

  const categoryColor = (category) => {
    if (category === 'Harga Pasar') return 'bg-green-600';
    if (category === 'Cuaca & Iklim') return 'bg-yellow-600';
    if (category === 'Hama dan Penyakit') return 'bg-red-600';
    if (category === 'Teknologi') return 'bg-blue-600';
    return 'bg-gray-600';
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

  const imgSrc = (image) =>
    image
      ? image.startsWith('http') ? image : `${API_BASE_URL}${image}`
      : 'https://placehold.co/400x400/1e293b/4ade80?text=No+Image';

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      <p className="animate-pulse font-semibold tracking-widest uppercase text-sm text-gray-400">Memuat berita...</p>
    </div>
  );

  if (!news) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-white p-6 text-center">
      <div className="text-8xl">📭</div>
      <h1 className="text-3xl font-bold">Berita Tidak Ditemukan</h1>
      <p className="text-gray-400">Maaf, berita yang Anda cari tidak tersedia atau telah dihapus.</p>
      <Link to="/news" className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-2xl font-semibold transition">
        Kembali ke Daftar Berita
      </Link>
    </div>
  );

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">

      {/* Article Card */}
      <div className="bg-black/40 backdrop-blur-xl border border-green-600 rounded-3xl shadow-xl overflow-hidden">
        {/* Image */}
        <img
          src={imgSrc(news.image)}
          className="w-full h-96 object-cover"
          alt={news.title}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x400/1e293b/4ade80?text=No+Image'; }}
        />

        {/* Content */}
        <div className="p-8">
          <span className={`${categoryColor(news.category)} text-white text-xs px-3 py-1 rounded-full`}>
            {news.category}
          </span>

          <h1 className="text-4xl font-bold mt-4 text-white leading-snug">
            {news.title}
          </h1>

          <p className="text-sm text-gray-400 mt-2">{formatDate(news.post_date)}</p>

          {/* Article Body */}
          <div className="mt-6 text-gray-300 leading-relaxed space-y-4">
            {news.long_desc?.split('\n').filter(p => p.trim() !== '').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <Link
              to="/news"
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-semibold transition inline-block"
            >
              ← Kembali ke Daftar Berita
            </Link>
          </div>
        </div>
      </div>

      {/* RELATED NEWS */}
      {relatedNews.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-white">Berita Terkait</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedNews.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="bg-black/40 border border-green-600 rounded-xl overflow-hidden hover:-translate-y-1 transition transform backdrop-blur-xl shadow-lg"
              >
                <img
                  src={imgSrc(item.image)}
                  className="w-full h-40 object-cover"
                  alt={item.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/1e293b/4ade80?text=No+Image'; }}
                />
                <div className="p-5">
                  <span className={`${categoryColor(item.category)} text-white text-xs px-2 py-1 rounded-full`}>
                    {item.category}
                  </span>
                  <h3 className="font-bold text-lg text-white mt-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.long_desc}</p>
                  <p className="text-xs text-gray-500 mt-3">{formatDate(item.post_date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
};

export default NewsDetails;