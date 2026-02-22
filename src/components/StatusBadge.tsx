import React from 'react';
import { Clock, Search, CheckCircle2 } from 'lucide-react';
import { Suggestion } from '../types';

export const StatusBadge: React.FC<{ status: Suggestion['status'] }> = ({ status }) => {
  const config = {
    pending: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={12} />, label: 'Pending' },
    reviewed: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Search size={12} />, label: 'Reviewed' },
    responded: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={12} />, label: 'Responded' }
  };
  const { color, icon, label } = config[status];
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
      {icon}
      {label}
    </span>
  );
};
