import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  X, 
  Lock, 
  Key, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon, 
  Video,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Suggestion, Department } from '../types';
import { StatusBadge } from './StatusBadge';

interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
}

const DEPARTMENTS: Department[] = ['Catering', 'Welfare', 'Administration', 'ICT', 'Others'];

export default function AdminDashboard({ username, onLogout }: AdminDashboardProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({ current: '', new: '', confirm: '' });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleAdminUpdate = async (id: number, updates: Partial<Suggestion>) => {
    try {
      const res = await fetch(`/api/admin/suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchSuggestions();
        if (selectedSuggestion?.id === id) {
          setSelectedSuggestion(prev => prev ? { ...prev, ...updates } : null);
        }
      }
    } catch (error) {
      console.error('Error updating suggestion:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess(false);

    if (passwordChangeData.new !== passwordChangeData.confirm) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword: passwordChangeData.current,
          newPassword: passwordChangeData.new
        })
      });

      if (res.ok) {
        setPasswordChangeSuccess(true);
        setPasswordChangeData({ current: '', new: '', confirm: '' });
        setTimeout(() => setShowPasswordChange(false), 2000);
      } else {
        const data = await res.json();
        setPasswordChangeError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordChangeError('An error occurred');
    }
  };

  // Stats Calculations
  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === 'pending').length,
    responded: suggestions.filter(s => s.status === 'responded').length,
    public: suggestions.filter(s => s.is_public === 1).length
  };

  const chartData = DEPARTMENTS.map(dept => ({
    name: dept,
    count: suggestions.filter(s => s.department === dept).length
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-900/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-black">Admin Command Center</h1>
              <p className="text-zinc-500 text-sm">Manage and respond to student feedback</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className={`p-3 rounded-xl transition-all ${showPasswordChange ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-50 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
              title="Security Settings"
            >
              <Lock size={20} />
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Bento */}
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-black">{stats.total}</div>
            <div className="text-xs text-zinc-500 mt-1">Submissions received</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pending</span>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-black">{stats.pending}</div>
            <div className="text-xs text-zinc-500 mt-1">Awaiting review</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Responded</span>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-black">{stats.responded}</div>
            <div className="text-xs text-zinc-500 mt-1">Addressed entries</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Public</span>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-black">{stats.public}</div>
            <div className="text-xs text-zinc-500 mt-1">Visible on board</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chart & Inbox */}
        <div className="lg:col-span-4 space-y-8">
          {/* Chart */}
          <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-600" />
              By Department
            </h3>
            <div className="h-48 w-full min-h-[192px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#71717a' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inbox List */}
          <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl flex items-center gap-2 text-black">
                <Users size={22} className="text-emerald-600" />
                Inbox
              </h2>
            </div>

            <div className="mb-6 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search inbox..." 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {showPasswordChange && (
              <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lock size={14} className="text-emerald-600" />
                  Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Current Password"
                    required
                    className="w-full bg-white border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 border"
                    value={passwordChangeData.current}
                    onChange={e => setPasswordChangeData({...passwordChangeData, current: e.target.value})}
                  />
                  <input 
                    type="password" 
                    placeholder="New Password"
                    required
                    className="w-full bg-white border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 border"
                    value={passwordChangeData.new}
                    onChange={e => setPasswordChangeData({...passwordChangeData, new: e.target.value})}
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password"
                    required
                    className="w-full bg-white border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 border"
                    value={passwordChangeData.confirm}
                    onChange={e => setPasswordChangeData({...passwordChangeData, confirm: e.target.value})}
                  />
                  {passwordChangeError && <p className="text-[10px] text-red-500 font-bold">{passwordChangeError}</p>}
                  {passwordChangeSuccess && <p className="text-[10px] text-emerald-500 font-bold">Password updated successfully!</p>}
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                    >
                      Update
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowPasswordChange(false)}
                      className="px-3 bg-zinc-200 text-zinc-600 py-2 rounded-xl text-xs font-bold hover:bg-zinc-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-sm">No submissions yet.</div>
              ) : suggestions
                  .filter(s => 
                    s.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.id.toString().includes(searchQuery)
                  )
                  .map((s: Suggestion) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSuggestion(s);
                    setAdminResponse(s.admin_response || '');
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedSuggestion?.id === s.id ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' : 'bg-zinc-50 border-transparent hover:bg-zinc-100'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{s.department}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm font-semibold text-zinc-800 line-clamp-2 mb-3 leading-snug">{s.text}</p>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span>ID: #{s.id}</span>
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Detail View */}
        <div className="lg:col-span-8">
          {selectedSuggestion ? (
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-zinc-100 shadow-sm h-full flex flex-col min-h-[800px]">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {selectedSuggestion.department}
                    </span>
                    <StatusBadge status={selectedSuggestion.status} />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-black">Submission #{selectedSuggestion.id}</h2>
                  <p className="text-zinc-400 text-sm mt-1 font-medium">
                    From <span className="text-zinc-600">{selectedSuggestion.student_name}</span> • {new Date(selectedSuggestion.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleAdminUpdate(selectedSuggestion.id, { is_public: selectedSuggestion.is_public ? 0 : 1 })}
                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-bold transition-all ${selectedSuggestion.is_public ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {selectedSuggestion.is_public ? 'Hide from Board' : 'Publish to Board'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
                <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
                  <p className="text-xl text-zinc-800 leading-relaxed font-medium">{selectedSuggestion.text}</p>
                  {(selectedSuggestion.image_url || selectedSuggestion.video_url) && (
                    <div className="mt-8 flex flex-wrap gap-4">
                      {selectedSuggestion.image_url && (
                        <div className="group relative">
                          <img src={selectedSuggestion.image_url} className="h-40 w-40 object-cover rounded-2xl border border-white shadow-md transition-transform group-hover:scale-105" alt="Attached" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                            <ImageIcon className="text-white" size={24} />
                          </div>
                        </div>
                      )}
                      {selectedSuggestion.video_url && (
                        <div className="h-40 w-40 bg-black rounded-2xl flex items-center justify-center text-white shadow-md group cursor-pointer">
                          <Video size={32} className="group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-100"></div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Official Response</label>
                    <div className="h-px flex-1 bg-zinc-100"></div>
                  </div>
                  
                  <textarea 
                    rows={5}
                    className="w-full bg-zinc-50 border-zinc-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none border resize-none text-zinc-800 font-medium"
                    placeholder="Draft your response to the student..."
                    value={adminResponse}
                    onChange={e => setAdminResponse(e.target.value)}
                  />
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => handleAdminUpdate(selectedSuggestion.id, { admin_response: adminResponse, status: 'responded' })}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                    >
                      Send & Mark Responded
                    </button>
                    <button 
                      onClick={() => handleAdminUpdate(selectedSuggestion.id, { status: 'reviewed' })}
                      className="px-8 bg-zinc-100 text-zinc-700 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-[0.98]"
                    >
                      Mark Reviewed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-[2rem] border border-dashed border-zinc-200 min-h-[600px]">
              <div className="text-center p-12">
                <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="text-zinc-300" size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-zinc-300">Select a submission</h3>
                <p className="text-zinc-400 mt-2">Choose an entry from the list to view and respond.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
