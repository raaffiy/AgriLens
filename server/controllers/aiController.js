const Groq = require('groq-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    console.error('CRITICAL ERROR: GROQ_API_KEY tidak ditemukan di .env');
}
const groq = new Groq({ apiKey: groqApiKey || 'placeholder' });

exports.analyzeImage = async (req, res) => {
    try {
        const { base64, mediaType } = req.body;
        if (!base64 || !mediaType) {
            return res.status(400).json({ error: 'base64 dan mediaType wajib diisi' });
        }

        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: `data:${mediaType};base64,${base64}` }
                        },
                        {
                            type: 'text',
                            text: `Analisis gambar ini dengan aturan ketat:
1. Validasi: Periksa apakah objek utama adalah tanaman (pohon, sayur, bunga, daun) atau tanah.
2. Jika objek utama BUKAN tanaman atau tanah (misalnya manusia, kendaraan, bangunan, hewan, barang elektronik, atau objek lainnya), berikan jawaban persis seperti ini: "ERROR: BUKAN_TANAMAN_ATAU_TANAH".
3. Jika objek utama adalah TANAH: Berikan deskripsi detail tentang jenis tanah tersebut, kondisinya, dan berikan rekomendasi tanaman apa saja yang cocok ditanam di tanah tersebut.
4. Jika objek utama adalah TANAMAN: Berikan deskripsi detail tentang jenis tanaman tersebut, kondisinya (sehat/sakit), dan berikan solusi atau masukan perawatan yang tepat untuk tanaman tersebut.
5. Berikan jawaban dalam Bahasa Indonesia yang ramah dan profesional.`
                        }
                    ]
                }
            ],
            max_tokens: 1000
        });

        const text = response.choices[0].message.content;
        res.json({ success: true, text });
    } catch (err) {
        console.error('Groq API Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.generateQuiz = async (req, res) => {
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Anda adalah pakar pertanian dan edukasi. Tugas Anda adalah membuat soal kuis yang edukatif dan menarik.'
                },
                {
                    role: 'user',
                    content: `Buatlah 5 soal kuis pilihan ganda tentang pertanian (budidaya tanaman, teknologi pertanian, pupuk, hama, dll) dalam format JSON murni.
                    Format harus berupa array of objects dengan struktur:
                    {
                      "q": "Pertanyaan dalam Bahasa Indonesia",
                      "a": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
                      "correct": 0, // indeks jawaban benar (0-3)
                      "emoji": "🌿" // emoji relevan
                    }
                    PENTING: Hanya berikan JSON array saja, tanpa penjelasan atau markdown.`
                }
            ],
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        let quizData;
        try {
            const parsed = JSON.parse(content);
            quizData = Array.isArray(parsed) ? parsed : (parsed.quizzes || parsed.questions || Object.values(parsed)[0]);
        } catch (e) {
            console.error("JSON Parsing error:", e);
            return res.status(500).json({ error: "Gagal memproses format kuis dari AI" });
        }
        res.json(quizData);
    } catch (err) {
        console.error('Groq Quiz Error:', err);
        res.status(500).json({ error: "Gagal menghasilkan kuis dari AI" });
    }
};
