import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import API_BASE_URL from '../../api';

const Profile = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({ nama: '' });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/auth'); return; }
    setUser(userData);
    setProfileData({ nama: userData.nama });
    setLoading(false);
  }, [navigate]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, nama: profileData.nama }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, nama: profileData.nama };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        showMessage('Profil berhasil diperbarui!', 'success');
      } else {
        showMessage(data.message || 'Gagal memperbarui profil.', 'error');
      }
    } catch {
      showMessage('Terjadi kesalahan server.', 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setModalError('');
    if (passwordData.new_password.length < 8) {
      setModalError('Password baru minimal 8 karakter.');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setModalError('Konfirmasi password tidak cocok.');
      return;
    }
    if (passwordData.old_password === passwordData.new_password) {
      setModalError('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:        user.email,
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        showMessage('Password berhasil diperbarui!', 'success');
      } else {
        setModalError(data.message || 'Gagal memperbarui password.');
      }
    } catch {
      setModalError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    setModalError('');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse text-sm tracking-widest uppercase">Initializing Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 font-sans selection:bg-emerald-500/30 flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        handleLogout={handleLogout} 
      />

      <main className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full">
        {/* Toast notifikasi */}
        {message.text && (
          <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-right duration-500 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/50 text-rose-400'
          }`}>
            <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-xl"
            >
              ☰
            </button>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-1 md:mb-2 tracking-tight">Admin Profile</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Manage your credentials
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Avatar Card */}
          <section className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full bg-[#111827] rounded-[2.5rem] border border-white/5 p-10 flex flex-col items-center shadow-2xl">
              <div className="relative group mb-6">
                <div className="w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[2rem] flex items-center justify-center text-6xl font-black text-white shadow-2xl shadow-emerald-500/30 group-hover:rotate-6 transition-transform duration-500">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 border-4 border-[#111827] rounded-2xl flex items-center justify-center text-xl shadow-lg">
                  🏅
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{user.nama}</h3>
              <p className="text-slate-500 font-bold text-sm mb-8 tracking-widest uppercase">Super Admin Access</p>
            </div>
          </section>

          {/* Settings Form */}
          <section className="lg:col-span-8 space-y-8">
            <div className="bg-[#111827] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl">
              <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span>
                Account Information
              </h4>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.nama}
                      onChange={(e) => setProfileData({ nama: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none text-white font-bold transition-all placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address (Fixed)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={user.email}
                        disabled
                        className="w-full bg-white/[0.01] border border-white/5 p-4 rounded-2xl text-slate-600 font-bold cursor-not-allowed pr-12"
                      />
                      <span className="absolute right-4 top-4 text-xl grayscale">🔒</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                  <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                    Synchronize Changes
                  </button>
                  <button type="button" onClick={() => setShowModal(true)} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black border border-white/10 transition-all">
                    Security Update
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Password Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0f1c]/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[200] animate-in fade-in duration-300">
          <div className="bg-[#111827] w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-8 border-b border-white/5 relative">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <span className="p-2 bg-emerald-500/20 rounded-lg text-xl">🛡️</span>
                Security Update
              </h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 ml-12">Update your authentication</p>
              <button onClick={handleCloseModal} className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all text-sm">✕</button>
            </div>

            <form onSubmit={handlePasswordUpdate} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Current Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors">🔑</span>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    required
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-emerald-500/40 text-white font-bold transition-all placeholder:text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Password (8+ chars)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors">✨</span>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    required
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-emerald-500/40 text-white font-bold transition-all placeholder:text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors">🔄</span>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    required
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className={`w-full bg-white/[0.02] border p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-emerald-500/40 text-white font-bold transition-all placeholder:text-slate-800 text-sm ${
                      passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password ? 'border-rose-500/40' : 'border-white/10'
                    }`}
                  />
                </div>
              </div>

              {modalError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-[11px] font-bold flex items-center gap-2 animate-pulse">
                  <span>⚠️</span> {modalError}
                </div>
              )}
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all text-sm border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 text-sm"
                >
                  {passwordLoading ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
