
import React from 'react';
import { Sword, Shield, Skull, BookOpen, Save, Crown, ChevronRight, Tent, Castle, Dices, User, Heart, Zap, ArrowRight, X, Play, RefreshCw, Trophy } from 'lucide-react';

export const Button = ({ children, onClick, disabled = false, icon: Icon, primary = false, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
      relative group w-full flex items-center justify-center gap-3 px-6 py-3 
      font-serif text-lg tracking-widest border-2 transition-all duration-300
      ${disabled
                ? 'border-stone-700 text-stone-600 cursor-not-allowed bg-stone-900/50'
                : primary
                    ? 'border-amber-600 text-amber-100 bg-stone-900 hover:bg-amber-900/30 hover:border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.1)] hover:shadow-[0_0_25px_rgba(217,119,6,0.3)]'
                    : 'border-stone-600 text-stone-400 bg-stone-900 hover:bg-stone-800 hover:border-stone-400 hover:text-stone-200'
            }
      ${className}
    `}
    >
        {Icon && <Icon size={20} className={primary ? "text-amber-500" : "text-stone-500"} />}
        <span>{children}</span>
    </button>
);
