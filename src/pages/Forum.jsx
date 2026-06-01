import { useState, useEffect } from 'react';
import API_BASE_URL from '../api';

const Forum = () => {
  const [discussions, setDiscussions] = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [openAnswers, setOpenAnswers] = useState({});
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  // State form — hanya kolom yang benar-benar ada di tabel discussions
  // Skema DB: id, content, answer, likes, created_at
  const [newPost, setNewPost] = useState({ content: '' });

  // ----------------------------------------------------------------
  // Fetch semua diskusi dari backend
  // ----------------------------------------------------------------
  const fetchDiscussions = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/discussions`)
      .then(res => res.json())
      .then(data => {
        setDiscussions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const toggleAnswer = (id) => {
    setOpenAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ----------------------------------------------------------------
  // handleSubmit — hanya kirim field 'content' yang ada di DB
  // FIX: sebelumnya mengirim title/author/category yang tidak ada
  //      di tabel sehingga INSERT gagal dan result.success undefined
  // ----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPost.content.trim()) {
      alert("Isi pertanyaan tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPost.content.trim(),
          // FIX: hapus title, author, category — kolom-kolom itu
          // tidak ada di tabel discussions sesuai skema DB
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Pertanyaan berhasil diposting!");
        setShowModal(false);
        setNewPost({ content: '' });
        fetchDiscussions();
      } else {
        // FIX: tampilkan pesan error yang benar (result.message bukan result.error)
        alert("Gagal memposting pertanyaan: " + (result.message || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error("Error posting question:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="bg-black/40 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Forum Diskusi & Tanya Jawab
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Saling berbagi pengalaman, bertanya, dan belajar bersama komunitas petani dan warga.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block mt-8 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
          >
            + Buat Pertanyaan
          </button>
        </div>
      </section>

      {/* SEARCH */}
      <div className="container mx-auto px-6 -mt-6">
        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl">
          <input
            type="text"
            placeholder="🔍 Cari pertanyaan atau topik..."
            className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* LIST DISKUSI */}
      <section className="container mx-auto px-6 py-16 space-y-6">
        {loading ? (
          <p className="text-center text-gray-400">Memuat diskusi...</p>
        ) : discussions.length === 0 ? (
          <p className="text-center text-gray-400">Belum ada diskusi.</p>
        ) : (
          discussions.map((item) => (
            <div
              key={item.id}
              className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/5"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-300">{item.content}</p>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    {/* FIX: tidak ada kolom author/created_at — tampilkan created_at saja */}
                    Diposting pada{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleAnswer(item.id)}
                className="mt-4 text-green-400 hover:text-green-300 transition-colors text-sm"
              >
                {openAnswers[item.id] ? "Sembunyikan Jawaban ▲" : "Lihat Jawaban ▼"}
              </button>

              {openAnswers[item.id] && (
                <div className="mt-4 bg-black/30 p-4 rounded-xl">
                  <p className="text-gray-300 italic">
                    {item.answer ? item.answer : "Belum ada jawaban dari admin."}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* POPUP FORM */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 p-8 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(0,255,150,0.2)] border border-green-500/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ✖
            </button>

            <h2 className="text-3xl font-bold text-green-400 mb-2">Buat Pertanyaan</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Tanyakan permasalahanmu dan bantu dapatkan jawaban dari komunitas AgriLens.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-gray-300 text-sm block mb-1">Isi Pertanyaan</label>
                <textarea
                  rows="4"
                  placeholder="Tulis detail pertanyaan kamu..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ content: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.97] transition duration-200"
              >
                {submitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;