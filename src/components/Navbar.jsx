import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Effect untuk mengecek status login setiap kali navigasi berubah
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  return (
    <header className="bg-black/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold text-white">
          🌿 <span className="text-green-400">Agri</span>Lens
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/module" className={`transition duration-300 ${location.pathname === '/module' ? 'text-green-400 font-bold' : 'text-gray-300 hover:text-green-400'}`}>Module Edukasi</Link>
          <Link to="/news" className={`transition duration-300 ${location.pathname === '/news' ? 'text-green-400 font-bold' : 'text-gray-300 hover:text-green-400'}`}>News - AgriLens</Link>
          <Link to="/quiz" className={`transition duration-300 ${location.pathname === '/quiz' ? 'text-green-400 font-bold' : 'text-gray-300 hover:text-green-400'}`}>Quiz & Tantangan</Link>
          <Link to="/forum" className={`transition duration-300 ${location.pathname === '/forum' ? 'text-green-400 font-bold' : 'text-gray-300 hover:text-green-400'}`}>Forum</Link>
        </div>

        {/* Auth Button (Desktop) */}
        <div className="hidden md:block">
          {user ? (
            <Link
              to="/admin/konten"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-2.5 px-8 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
              <span>📊</span> Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-8 rounded-2xl transition duration-300 transform hover:scale-105"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-3xl focus:outline-none"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="backdrop-blur-xl md:hidden">
          <div className="flex flex-col px-6 py-4 space-y-4">
            <Link to="/module" className="text-gray-300 hover:text-green-400 transition duration-300">Module Edukasi</Link>
            <Link to="/news" className="text-gray-300 hover:text-green-400 transition duration-300">News - AgriLens</Link>
            <Link to="/quiz" className="text-gray-300 hover:text-green-400 transition duration-300">Quiz & Tantangan</Link>
            <Link to="/forum" className="text-gray-300 hover:text-green-400 transition duration-300">Forum</Link>

            {user ? (
              <Link
                to="/admin/konten"
                onClick={() => setIsOpen(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-3 px-6 text-center rounded-2xl transition-all"
              >
                📊 Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 text-center rounded-2xl transition duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
