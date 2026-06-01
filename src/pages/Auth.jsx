import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Auth = () => {
  const [page, setPage] = useState('login'); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', nama: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi panjang password
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect ke halaman konten setelah login sukses
        navigate('/admin/konten');
      } else {
        setError(data.message || 'Login gagal. Periksa email dan password Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nama: formData.nama, 
          email: formData.email, 
          password: formData.password 
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Registrasi berhasil! Silakan login.');
        setPage('login');
        setFormData({ ...formData, password: '' });
      } else {
        setError(data.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-white">
      <main className="w-full max-w-md relative">
        <Link to="/" className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 bg-black/50 p-2 rounded-full text-gray-300 hover:text-white hover:bg-green-600 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* LOGIN PAGE */}
        {page === 'login' && (
          <section className="bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">🌿 <span className="text-green-400">Agri</span>Lens</h1>
              <p className="text-gray-300 mt-2">Selamat Datang Kembali</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 pl-4 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/10 transition-all" 
                />
              </div>
          
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 pl-4 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/10 transition-all" 
                />
              </div>
          
              <button type="submit"
                className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 text-lg hover:bg-green-500">
                Login
              </button>

              <div className="text-center text-sm pt-4 space-y-2">
                {/* <p>
                  <span onClick={() => setPage('forgot')}
                    className="text-green-300 hover:text-green-200 cursor-pointer font-semibold">Lupa password?</span>
                </p> */}
                <p className="text-gray-300">
                  Belum punya akun? <span onClick={() => {
                    setPage('register');
                    setError('');
                  }}
                    className="text-green-300 hover:text-green-200 cursor-pointer font-semibold">Daftar sekarang</span>
                </p>
              </div>
            </form>
          </section>
        )}

        {/* REGISTER PAGE */}
        {page === 'register' && (
          <section className="bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">🌿 <span className="text-green-400">Agri</span>Lens</h1>
              <p className="text-gray-300 mt-2">Buat Akun Baru</p>
            </div>

            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  required 
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-3 pl-4 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/10 transition-all" 
                />
              </div>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 pl-4 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/10 transition-all" 
                />
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 pl-4 pr-10 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/10 transition-all" 
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={togglePasswordVisibility}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
              
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 text-lg hover:bg-green-500">
                Register
              </button>

              <p className="text-center text-sm pt-4 text-gray-300">
                Sudah punya akun? <span onClick={() => {
                  setPage('login');
                  setError('');
                }} className="text-green-300 hover:text-green-200 cursor-pointer font-semibold">Login</span>
              </p>
            </form>
          </section>
        )}

        {/* FORGOT PASSWORD PAGE */}
        {page === 'forgot' && (
          <section className="bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Lupa Password?</h1>
              <p className="text-gray-300 mt-2">Kami akan bantu reset password Anda.</p>
            </div>

            <form className="space-y-6">
              <div className="relative">
                <input type="email" placeholder="Masukkan email terdaftar" required className="w-full p-3 pl-4 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/10 transition-all" />
              </div>

              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 text-lg hover:bg-green-500">
                Kirim Link Reset
              </button>

              <p className="text-center text-sm pt-4 text-gray-300">
                Ingat password? <span onClick={() => setPage('login')} className="text-green-300 hover:text-green-200 cursor-pointer font-semibold">Kembali ke Login</span>
              </p>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

export default Auth;
