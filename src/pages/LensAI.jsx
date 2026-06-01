import { useState, useRef } from 'react';
import API_BASE_URL from '../api';

const LensAI = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(selectedFile);
      });

      const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mediaType: selectedFile.type }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("model_decommissioned")) {
          throw new Error("Model AI yang digunakan sudah usang. Silakan hubungi admin.");
        }
        throw new Error(data.error || 'Server error');
      }

      if (data.text.includes("ERROR: BUKAN_TANAMAN_ATAU_TANAH")) {
        setError("Gambar yang diunggah harus berupa tanaman atau tanah.");
      } else {
        setResult(data.text);
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(`Terjadi kesalahan: ${err.message || "Silakan coba lagi."}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="container mx-auto px-6 py-14">
      <div className="bg-black/40 backdrop-blur-xl border border-green-500/50 rounded-3xl p-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-green-400 mb-10">
          🔎 AgriLens AI - Analisis Tanaman & Tanah
        </h2>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-green-500/50 rounded-2xl p-10 text-center hover:border-green-400 transition bg-green-500/5">
          <div className="flex flex-col items-center space-y-4">
            {imagePreview ? (
              <div className="relative w-full max-w-xs h-64 mx-auto rounded-xl overflow-hidden border border-green-500/30">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setImagePreview(null); setSelectedFile(null); setResult(null); setError(null); }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-500 transition shadow-lg"
                  title="Hapus Gambar"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-5xl border border-green-500/20">
                🌱
              </div>
            )}

            <div className="space-y-2">
              <p className="text-gray-300 font-medium">
                {selectedFile ? selectedFile.name : "Klik tombol di bawah untuk memilih foto"}
              </p>
              <p className="text-gray-500 text-sm italic">Mendukung format JPG, PNG, WebP</p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition border border-white/10"
              >
                {selectedFile ? 'Ganti Foto' : 'Pilih Foto'}
              </button>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !selectedFile}
                className={`bg-green-600 hover:bg-green-500 text-white font-bold px-10 py-3 rounded-xl transition transform hover:scale-105 shadow-lg shadow-green-900/20 ${analyzing || !selectedFile ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menganalisis...
                  </span>
                ) : 'Mulai Analisis'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="text-xl font-semibold text-green-400">Hasil Analisis AI:</h3>
          </div>

          <div className={`bg-black/40 border ${result ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/10'} rounded-2xl p-8 min-h-[150px] transition-all duration-500`}>
            {result ? (
              <div className="text-gray-200 text-lg leading-relaxed whitespace-pre-line">
                {result}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                {analyzing ? (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-green-400 animate-pulse font-medium">AI sedang meneliti foto Anda, harap tunggu...</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic max-w-md">
                    Hasil analisis akan muncul di sini setelah Anda mengunggah foto tanaman atau tanah dan menekan tombol analisis.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LensAI;