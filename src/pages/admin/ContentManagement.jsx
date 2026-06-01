import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [allData, setAllData] = useState({ modules: [], news: [], discussions: [] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const endpoints = ['modules', 'news', 'discussions'];
      const responses = await Promise.all(
        endpoints.map(ep => 
          fetch(`http://localhost:5000/api/${ep}`)
            .then(async res => {
              const data = await res.json();
              return Array.isArray(data) ? data : [];
            })
            .catch(() => [])
        )
      );
      
      setAllData({
        modules: responses[0],
        news: responses[1],
        discussions: responses[2]
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/${activeTab}/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchAllData();
      }
    } catch (err) {
      console.error("Error deleting data:", err);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedItem(null);
    if (activeTab === 'discussions') {
      setFormData({ title: '', author: user?.nama || '', content: '', category: 'Tips Menanam' });
    } else {
      setFormData({ title: '', category: '', image: '', short_desc: '', long_desc: '' });
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    const dataToSet = { ...item };
    if (dataToSet.post_date) {
        dataToSet.post_date = dataToSet.post_date.split('T')[0];
    }
    setFormData(dataToSet);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form...", { activeTab, modalMode, formData, userId: user?.id });
    
    const url = modalMode === 'add' 
      ? `http://localhost:5000/api/${activeTab}` 
      : `http://localhost:5000/api/${activeTab}/${selectedItem.id}`;
    
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      let response;
      
      // Jika kategori adalah news atau modules, gunakan FormData untuk mendukung upload file
      if (activeTab === 'news' || activeTab === 'modules') {
        const data = new FormData();
        
        // Tambahkan userId (selalu tambahkan jika ada, agar update juga bisa update userId jika perlu)
        if (user?.id) {
          data.append('userId', user.id);
        }

        // Append semua field dari formData ke FormData object
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            // Jika key adalah image dan nilainya adalah string (bukan file), 
            // kita tetap kirimkan string tersebut kecuali ada file baru
            data.append(key, formData[key]);
          }
        });

        // Debug: Log FormData contents
        for (let pair of data.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        response = await fetch(url, {
          method,
          body: data
        });
      } else {
        // Untuk kuis dan diskusi, tetap kirim sebagai JSON
        const jsonData = { ...formData };
        if (user?.id) {
          jsonData.userId = user.id;
        }

        response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData)
        });
      }

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setShowModal(false);
        fetchAllData();
      } else {
        alert(result.error || result.message || "Gagal menyimpan data");
      }
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Terjadi kesalahan koneksi ke server");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const tabs = [
    { id: 'modules', label: 'E-Learning Modules', icon: '📚' },
    { id: 'news', label: 'Agricultural News', icon: '📰' },
    { id: 'discussions', label: 'Forum Discussions', icon: '💬' },
  ];

  const currentData = Array.isArray(allData[activeTab]) ? allData[activeTab] : [];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 font-sans selection:bg-emerald-500/30 flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        handleLogout={handleLogout} 
      />

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden w-12 h-12 bg-[#111827] border border-white/10 rounded-xl flex items-center justify-center text-xl"
            >
              ☰
            </button>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-1 md:mb-2 tracking-tight">Dashboard</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Content Management
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab !== 'discussions' && (
              <button 
                  onClick={handleOpenAdd}
                  className="group relative bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl font-normal">+</span> Add New Content
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {tabs.map(tab => (
             <div key={tab.id} className={`p-6 rounded-3xl border transition-all duration-500 ${activeTab === tab.id ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'bg-[#111827] border-white/5 opacity-80'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl">{tab.icon}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${activeTab === tab.id ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                    {activeTab === tab.id ? 'Viewing' : 'Active'}
                  </span>
                </div>
                <h3 className="text-slate-400 text-sm font-bold mb-1">{tab.label.split(' ')[1] || tab.label}</h3>
                <p className="text-3xl font-black text-white">{allData[tab.id]?.length || 0}</p>
             </div>
           ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#111827] p-2 rounded-2xl border border-white/5 flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab.label.split(' ')[1] || tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Table */}
        <section className="bg-[#111827] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
             <h3 className="text-xl font-bold text-white flex items-center gap-3">
               <span className="w-1.5 h-6 rounded-full bg-emerald-500"></span>
               Current {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List
             </h3>
             <div className="relative group">
                <input type="text" placeholder="Search content..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 transition-all" />
                <span className="absolute right-3 top-2.5 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01] text-slate-500 text-xs uppercase tracking-widest font-black">
                  <th className="px-8 py-5"># ID</th>
                  <th className="px-8 py-5">Main Content</th>
                  <th className="px-8 py-5">Information</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold animate-pulse text-sm">Synchronizing Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-slate-400 font-bold">No entries found in this category.</p>
                      <p className="text-slate-600 text-sm mt-1">Try adding a new {activeTab} to get started.</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6 text-slate-500 font-mono text-sm">#{String(item.id).padStart(3, '0')}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {/* Thumbnail Gambar */}
                          {(activeTab === 'news' || activeTab === 'modules') && (
                            <div className="w-16 h-16 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                               {item.image ? (
                                 <img 
                                   src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                                   alt="Thumbnail" 
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     e.target.onerror = null;
                                     e.target.src = 'https://placehold.co/400x400/1e293b/4ade80?text=Pupuk';
                                   }}
                                 />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">N/A</div>
                               )}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-lg leading-tight group-hover:text-emerald-400 transition-colors">
                              {item.title || item.question || item.content || "Untitled Content"}
                            </span>
                            <span className="text-slate-500 text-xs mt-1 italic line-clamp-1 max-w-md">
                              {item.short_desc || item.long_desc?.substring(0, 100) || ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/5 w-fit">
                            {item.category || item.game_type || 'General'}
                          </span>
                          {activeTab === 'news' && item.post_date && (
                             <span className="text-[10px] text-slate-600 font-mono ml-1">
                               📅 {new Date(item.post_date).toLocaleDateString('id-ID')}
                             </span>
                          )}
                          {activeTab === 'discussions' && item.answer && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 w-fit">
                              Answered
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10">
                            <span>✏️</span> {activeTab === 'discussions' ? 'Reply' : 'Edit'}
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-all border border-rose-500/20">
                            <span>🗑️</span> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center text-xs text-slate-600 font-bold">
            Showing {currentData.length} entries • AgriLens Admin Control Panel
          </div>
        </section>
      </main>

      {/* CRUD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0f1c]/90 backdrop-blur-xl flex items-center justify-center p-4 z-[200]">
          <div className="bg-[#111827] p-8 rounded-[3rem] w-full max-w-2xl border border-white/10 shadow-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{modalMode === 'add' ? 'Add New' : 'Manage'} {activeTab}</h3>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Management System</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'modules' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Title</label>
                    <input
                      type="text"
                      placeholder={formData.category === 'Panduan Membuat Pupuk' ? 'Contoh: Pupuk Kompos dari Sampah Dapur' : 'Contoh: Panduan Menanam Padi'}
                      value={formData.title || ''}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-white"
                    />
                  </div>
                            
                  {/* Category Dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Category</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({...formData, category: e.target.value, image: '', short_desc: '', long_desc: ''})}
                      required
                      className="w-full bg-[#1a2332] border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-white"
                    >
                      <option value="" disabled>-- Pilih Kategori --</option>
                      <option value="Panduan Menanam">Panduan Menanam</option>
                      <option value="Panduan Membuat Pupuk">Panduan Membuat Pupuk</option>
                    </select>
                  </div>
                            
                  {/* ===== PANDUAN MENANAM ===== */}
                  {formData.category === 'Panduan Menanam' && (
                    <>
                      {/* Image Upload */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-slate-400
                            file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                            file:bg-emerald-500 file:text-slate-900 file:font-bold
                            hover:file:bg-emerald-400 cursor-pointer"
                        />
                      </div>
                  
                      {/* Short Description */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Short Description</label>
                        <textarea
                          placeholder="Deskripsi singkat konten..."
                          value={formData.short_desc || ''}
                          onChange={(e) => setFormData({...formData, short_desc: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-24 resize-none text-white"
                        />
                      </div>
                  
                      {/* Long Description */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Long Description</label>
                        <textarea
                          placeholder="Deskripsi lengkap konten..."
                          value={formData.long_desc || ''}
                          onChange={(e) => setFormData({...formData, long_desc: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-32 resize-none text-white"
                        />
                      </div>
                  
                      {/* Benefits */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Benefits</label>
                        <textarea
                          placeholder="Manfaat tanaman ini..."
                          value={formData.benefits || ''}
                          onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-24 resize-none text-white"
                        />
                      </div>
                  
                      {/* Planting Steps */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Planting Steps</label>
                        <textarea
                          placeholder="Langkah-langkah penanaman..."
                          value={formData.planting_steps || ''}
                          onChange={(e) => setFormData({...formData, planting_steps: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-24 resize-none text-white"
                        />
                      </div>
                  
                      {/* Care Tips */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Care Tips</label>
                        <textarea
                          placeholder="Tips perawatan tanaman..."
                          value={formData.care_tips || ''}
                          onChange={(e) => setFormData({...formData, care_tips: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-24 resize-none text-white"
                        />
                      </div>
                    </>
                  )}
              
                  {/* ===== PANDUAN MEMBUAT PUPUK ===== */}
                  {formData.category === 'Panduan Membuat Pupuk' && (
                    <>
                      {/* YouTube Link - menggantikan Image Upload */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">YouTube Link</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">▶️</span>
                          <input
                            type="url"
                            placeholder="Contoh: https://www.youtube.com/watch?v=..."
                            value={formData.image || ''}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            required
                            className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-white"
                          />
                        </div>
                        {/* Preview thumbnail jika URL valid */}
                        {formData.image && formData.image.includes('youtube.com/watch?v=') && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                            <img
                              src={`https://img.youtube.com/vi/${new URL(formData.image).searchParams.get('v')}/hqdefault.jpg`}
                              alt="YouTube Thumbnail"
                              className="w-full h-40 object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Description - menggantikan short_desc + long_desc */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Description</label>
                        <textarea
                          placeholder="Deskripsi lengkap panduan pembuatan pupuk..."
                          value={formData.long_desc || ''}
                          onChange={(e) => setFormData({...formData, long_desc: e.target.value})}
                          required
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-32 resize-none text-white"
                        />
                      </div>
                      
                      {/* Ingredients */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Ingredients (Bahan-bahan)</label>
                        <textarea
                          placeholder="Contoh: 1kg sampah dapur, 2L air..."
                          value={formData.benefits || ''}
                          onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-24 resize-none text-white"
                        />
                      </div>
                      
                      {/* Tools */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Tools (Alat yang Dibutuhkan)</label>
                        <textarea
                          placeholder="Contoh: ember, sekop, sarung tangan..."
                          value={formData.care_tips || ''}
                          onChange={(e) => setFormData({...formData, care_tips: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-24 resize-none text-white"
                        />
                      </div>
                      
                      {/* Making Steps */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Making Steps (Langkah Pembuatan)</label>
                        <textarea
                          placeholder="1. Siapkan bahan... 2. Campurkan..."
                          value={formData.planting_steps || ''}
                          onChange={(e) => setFormData({...formData, planting_steps: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-32 resize-none text-white"
                        />
                      </div>
                    </>
                  )}
              
                  {/* Placeholder jika kategori belum dipilih */}
                  {!formData.category && (
                    <div className="md:col-span-2 flex items-center justify-center gap-3 p-6 rounded-2xl border border-dashed border-white/10 text-slate-500">
                      <span className="text-2xl">☝️</span>
                      <p className="text-sm font-bold">Pilih kategori terlebih dahulu untuk melihat field tambahan</p>
                    </div>
                  )}
              
                </div>
              )}

            {activeTab === 'news' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                {/* Title */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Title</label>
                  <input
                    type="text"
                    placeholder="Contoh: Harga Padi Naik Pesat"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-white"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full bg-[#1a2332] border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-white"
                  >
                    <option value="" disabled>-- Pilih Kategori --</option>
                    <option value="Teknologi">Teknologi</option>
                    <option value="Harga Pasar">Harga Pasar</option>
                    <option value="Cuaca & Iklim">Cuaca & Iklim</option>
                    <option value="Hama & Penyakit">Hama & Penyakit</option>
                    <option value="Kebijakan Pertanian">Kebijakan Pertanian</option>
                  </select>
                </div>

                {/* Post Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Post Date</label>
                  <input
                    type="date"
                    value={formData.post_date || ''}
                    onChange={(e) => setFormData({...formData, post_date: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-white"
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 text-slate-400
                      file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                      file:bg-emerald-500 file:text-slate-900 file:font-bold
                      hover:file:bg-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Long Description */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">Description</label>
                  <textarea
                    placeholder="Isi berita selengkapnya..."
                    value={formData.long_desc || ''}
                    onChange={(e) => setFormData({...formData, long_desc: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500/50 h-32 resize-none text-white"
                  />
                </div>

              </div>
            )}

              {activeTab === 'discussions' && (
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        Discussion Content 
                        {modalMode === 'edit' && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-600">READ ONLY</span>}
                      </label>
                      <textarea 
                        value={formData.content || ''} 
                        onChange={(e) => setFormData({...formData, content: e.target.value})} 
                        required 
                        readOnly={modalMode === 'edit'}
                        className={`w-full border border-white/10 p-4 rounded-2xl outline-none h-32 transition-all ${modalMode === 'edit' ? 'bg-white/[0.02] text-slate-500 cursor-not-allowed border-dashed' : 'bg-white/5 focus:ring-2 ring-emerald-500/50'}`} 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-black text-emerald-500 uppercase tracking-widest ml-1 underline decoration-emerald-500/30">Official Answer / Solution</label>
                      <textarea 
                        placeholder="Write the verified solution here..." 
                        value={formData.answer || ''} 
                        onChange={(e) => setFormData({...formData, answer: e.target.value})} 
                        className="w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl outline-none h-32 focus:ring-2 ring-emerald-500/50 text-white font-bold" 
                      />
                   </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                  {modalMode === 'add' ? 'Confirm Addition' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black border border-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
