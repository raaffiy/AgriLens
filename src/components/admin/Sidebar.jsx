import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Enhanced Sidebar (Desktop & Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-[160] w-80 bg-[#111827] border-r border-white/5 p-8 flex flex-col transition-transform duration-300 xl:translate-x-0 xl:sticky xl:top-0 xl:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
              🌿
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Agri<span className="text-emerald-500">Lens</span>
            </h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="xl:hidden text-2xl">✕</button>
        </div>

        <nav className="space-y-2 flex-grow">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">Main Menu</p>
          <Link 
            to="/admin/konten" 
            onClick={() => setIsSidebarOpen(false)} 
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
              location.pathname === '/admin/konten' 
              ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <span className="text-xl">🛠️</span>
            Content Management
          </Link>
          <Link 
            to="/admin/profile" 
            onClick={() => setIsSidebarOpen(false)} 
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
              location.pathname === '/admin/profile' 
              ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <span className="text-xl">👤</span>
            Admin Profile
          </Link>
          <hr className="my-6 border-white/5" />
          <Link to="/" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span className="text-xl">🏠</span>
            Back to Website
          </Link>
        </nav>
        
        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
            className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 font-bold transition-all w-full text-left border border-transparent hover:border-rose-500/20"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              🚪
            </div>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
