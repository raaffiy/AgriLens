import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../api';

const News = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news`)
      .then(res => res.json())
      .then(data => {
        // Mapping data dari struktur MySQL ke format yang dibutuhkan UI
        const mappedData = data.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          excerpt: item.long_desc.length > 100 ? item.long_desc.substring(0, 100) + '...' : item.long_desc,
          date: new Date(item.post_date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          }),
          img: item.image ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`) : 'https://placehold.co/400x400/1e293b/4ade80?text=No+Image',
          color: item.category === 'Harga Pasar' ? 'bg-green-600' :
          item.category === 'Cuaca & Iklim' ? 'bg-yellow-600' :
          item.category === 'Hama dan Penyakit' ? 'bg-red-600' :
          item.category === 'Teknologi' ? 'bg-blue-600' :
          'bg-gray-600',
        }));
        setNewsData(mappedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil berita:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container mx-auto px-6 py-12">
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="bg-black/40 backdrop-blur-xl p-12 rounded-3xl shadow-2xl">
          <h1 className="text-5xl font-bold text-white">📰 Berita Terbaru <span className="text-green-400">AgriLens</span></h1>
          <p className="mt-4 max-w-2xl mx-auto text-gray-300">
            Update informasi terbaru seputar pertanian, komoditas, teknologi, dan dunia agrikultur.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-center text-gray-400 col-span-full">Memuat berita...</p>
        ) : newsData.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">Belum ada berita.</p>
        ) : (
          newsData.map((news) => (
            <div
              key={news.id}
              className="bg-black/40 border border-green-500 shadow-lg rounded-2xl overflow-hidden hover:-translate-y-2 transition transform duration-300 backdrop-blur-xl"
            >
              <img src={news.img} className="w-full h-48 object-cover" alt={news.title} />

              <div className="p-6">
                <span className={`${news.color} text-white text-xs px-3 py-1 rounded-full`}>
                  {news.category}
                </span>

                <h3 className="text-xl font-bold mt-3 text-white">
                  {news.title}
                </h3>

                <p className="text-gray-300 text-sm mt-2">
                  {news.excerpt}
                </p>

                <p className="text-xs text-gray-500 mt-3">{news.date}</p>

                <Link to={`/news/${news.id}`} className="block mt-4 text-green-400 font-semibold hover:underline hover:text-green-300">
                  Baca Selengkapnya →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default News;
