import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  LayoutDashboard, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Image as ImageIcon,
  Video,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  Search,
  Filter,
  X,
  Settings,
  Lock,
  Key
} from 'lucide-react';
import { Suggestion, Comment, Department } from './types';
import AdminDashboard from './components/AdminDashboard';
import { SuggestionCard } from './components/SuggestionCard';

const DEPARTMENTS: Department[] = ['Catering', 'Welfare', 'Administration', 'ICT', 'Others'];

export default function App() {
  const [view, setView] = useState<'student' | 'board' | 'admin'>('student');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Student Form State
  const [formData, setFormData] = useState({
    student_name: '',
    department: 'Administration' as Department,
    text: '',
    image_url: '',
    video_url: ''
  });
  const [resetKey, setResetKey] = useState(0);
  const [trackingId, setTrackingId] = useState<number | null>(null);

  useEffect(() => {
    if (view === 'board') fetchPublicSuggestions();
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      if (res.ok) {
        setIsAdminAuthenticated(true);
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (err) {
      setLoginError('Login service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setLoginData({ username: '', password: '' });
    setView('student');
  };

  const fetchPublicSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions/public');
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setTrackingId(data.id);
      setFormData({ student_name: '', department: 'Administration', text: '', image_url: '', video_url: '' });
      setResetKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type === 'image' ? 'image_url' : 'video_url']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('student')}>
              <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">Upik Suggestion Box</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex gap-1 bg-zinc-900 p-1 rounded-2xl">
              <NavButton active={view === 'student'} onClick={() => setView('student')} icon={<Send size={16} />} label="Submit" />
              <NavButton active={view === 'board'} onClick={() => setView('board')} icon={<LayoutDashboard size={16} />} label="Public Board" />
              <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={<ShieldCheck size={16} />} label="Admin" />
            </div>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex gap-2">
               <button onClick={() => setView('student')} className={`p-2 rounded-lg ${view === 'student' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500'}`}><Send size={20} /></button>
               <button onClick={() => setView('board')} className={`p-2 rounded-lg ${view === 'board' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500'}`}><LayoutDashboard size={20} /></button>
               <button onClick={() => setView('admin')} className={`p-2 rounded-lg ${view === 'admin' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500'}`}><ShieldCheck size={20} /></button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <AnimatePresence mode="wait">
          {view === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              {trackingId ? (
                <div className="max-w-md mx-auto bg-white rounded-[2rem] p-10 shadow-xl shadow-zinc-200/50 border border-zinc-100 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="text-emerald-500 w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-display font-bold mb-3">Feedback Logged</h2>
                  <p className="text-zinc-500 mb-8 leading-relaxed">Your suggestion has been securely transmitted to the administration team.</p>
                  <div className="bg-zinc-50 rounded-2xl p-6 mb-10 border border-zinc-100">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Reference Number</span>
                    <div className="text-4xl font-display font-bold text-emerald-600 mt-2">#{trackingId}</div>
                  </div>
                  <button 
                    onClick={() => setTrackingId(null)}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-zinc-900 transition-all shadow-lg shadow-black/20"
                  >
                    Submit New Feedback
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  {/* Left Column: Info */}
                  <div className="space-y-8 py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle size={14} />
                      Student Feedback Portal
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight leading-[1.1]">
                      Your voice <br />
                      <span className="text-emerald-600">matters.</span>
                    </h1>
                    <p className="text-lg text-zinc-500 leading-relaxed max-w-md">
                      Help us build a better campus experience. Share your suggestions, complaints, or ideas directly with the administration.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                        <div className="text-emerald-600 font-bold text-2xl mb-1">100%</div>
                        <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Anonymous Option</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                        <div className="text-emerald-600 font-bold text-2xl mb-1">24/7</div>
                        <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Support Access</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Form */}
                  <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-zinc-200/60 border border-zinc-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Name (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="Anonymous"
                              className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none border"
                              value={formData.student_name}
                              onChange={e => setFormData({...formData, student_name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Department</label>
                            <select 
                              className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none border appearance-none"
                              value={formData.department}
                              onChange={e => setFormData({...formData, department: e.target.value as Department})}
                            >
                              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Your Message</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Detail your suggestion or concern..."
                            className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none border resize-none"
                            value={formData.text}
                            onChange={e => setFormData({...formData, text: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors group">
                            <input key={`img-${resetKey}`} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'image')} />
                            <ImageIcon size={18} className={formData.image_url ? 'text-emerald-600' : 'text-zinc-400'} />
                            <span className="text-xs font-bold text-zinc-600">{formData.image_url ? 'Photo Added' : 'Add Photo'}</span>
                          </label>
                          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors group">
                            <input key={`vid-${resetKey}`} type="file" accept="video/*" className="hidden" onChange={e => handleFileChange(e, 'video')} />
                            <Video size={18} className={formData.video_url ? 'text-emerald-600' : 'text-zinc-400'} />
                            <span className="text-xs font-bold text-zinc-600">{formData.video_url ? 'Video Added' : 'Add Video'}</span>
                          </label>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                      >
                        {loading ? 'Processing...' : <><Send size={18} /> Submit Feedback</>}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'board' && (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-display font-bold tracking-tight">Public Board</h1>
                  <p className="text-zinc-500 max-w-md">Transparency in action. Track how the administration is addressing campus feedback.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search feedback..." 
                      className="pl-11 pr-6 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none w-full md:w-64 shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-zinc-400 font-medium animate-pulse">Loading board...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                  <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-zinc-300" size={40} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-zinc-400">No public entries yet</h3>
                  <p className="text-zinc-400 mt-2">Approved suggestions will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {suggestions
                    .filter(s => 
                      s.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.department.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((suggestion: Suggestion) => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {!isAdminAuthenticated ? (
                <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-zinc-200/60 border border-zinc-100">
                  <div className="text-center mb-10">
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                      <ShieldCheck className="text-emerald-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold">Admin Access</h2>
                    <p className="text-zinc-500 mt-2">Authorized personnel only.</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Username</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none border"
                        value={loginData.username}
                        onChange={e => setLoginData({...loginData, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none border"
                        value={loginData.password}
                        onChange={e => setLoginData({...loginData, password: e.target.value})}
                      />
                    </div>
                    {loginError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={14} />
                        {loginError}
                      </div>
                    )}
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-900 transition-all shadow-lg shadow-black/20 disabled:opacity-50"
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              ) : (
                <AdminDashboard 
                  username={loginData.username}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
    >
      {icon}
      {label}
    </button>
  );
}
