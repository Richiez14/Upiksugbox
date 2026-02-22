import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  ShieldCheck, 
  MessageCircle, 
  Send 
} from 'lucide-react';
import { Suggestion, Comment } from '../types';

export const SuggestionCard: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    const res = await fetch(`/api/suggestions/${suggestion.id}/comments`);
    const data = await res.json();
    setComments(data);
  };

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await fetch(`/api/suggestions/${suggestion.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_text: newComment, author_role: 'student' })
    });
    setNewComment('');
    fetchComments();
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 hover:border-black transition-all flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1.5 rounded-xl">
          {suggestion.department}
        </span>
        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">#{suggestion.id}</span>
      </div>
      
      <p className="text-zinc-800 font-semibold text-lg mb-6 line-clamp-4 flex-grow leading-snug group-hover:text-emerald-900 transition-colors">{suggestion.text}</p>
      
      {(suggestion.image_url || suggestion.video_url) && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {suggestion.image_url && (
            <img src={suggestion.image_url} className="h-24 w-24 object-cover rounded-xl border border-zinc-100 shadow-sm" alt="Attached" />
          )}
          {suggestion.video_url && (
            <div className="h-24 w-24 bg-black rounded-xl flex items-center justify-center text-white shadow-sm">
              <Video size={20} />
            </div>
          )}
        </div>
      )}
      
      {suggestion.admin_response && (
        <div className="bg-emerald-50/40 rounded-2xl p-5 mb-6 border border-emerald-100/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Official Response</span>
          </div>
          <p className="text-sm text-emerald-900/80 leading-relaxed font-medium italic">"{suggestion.admin_response}"</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400">
            {suggestion.student_name ? suggestion.student_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-black">{suggestion.student_name || 'Anonymous'}</span>
            <span className="text-[9px] text-zinc-400 font-medium">{new Date(suggestion.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${showComments ? 'text-emerald-600' : 'text-zinc-400 hover:text-emerald-500'}`}
        >
          <MessageCircle size={18} />
          {comments.length > 0 ? `${comments.length} Comments` : 'Discuss'}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 pt-6 border-t border-zinc-50"
          >
            <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {comments.length === 0 && <p className="text-[10px] text-zinc-400 text-center italic">No comments yet. Start the conversation.</p>}
              {comments.map(c => (
                <div key={c.id} className={`p-3 rounded-2xl text-xs relative ${c.author_role === 'admin' ? 'bg-emerald-50 border border-emerald-100 ml-4' : 'bg-zinc-50 border border-zinc-100 mr-4'}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`font-bold uppercase tracking-widest text-[8px] ${c.author_role === 'admin' ? 'text-emerald-600' : 'text-zinc-400'}`}>{c.author_role}</span>
                    <span className="text-[8px] text-zinc-300 font-bold">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-zinc-700 font-medium leading-relaxed">{c.comment_text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Write a comment..."
                className="flex-1 bg-zinc-50 border-zinc-200 border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button 
                onClick={handleAddComment}
                className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
