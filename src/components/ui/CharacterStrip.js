import React from 'react';
import { Shield, Heart, Zap, Sword, Info, Sparkles, Eye, Flame } from 'lucide-react';

export const CharacterStrip = ({ char, isSelected, onClick, isTargetable, isActive }) => {
    const skills = char.getSkills ? char.getSkills() : [];

    return (
        <div
            onClick={onClick}
            className={`
                relative flex flex-col items-center gap-2 p-3 border-4 transition-all duration-200 cursor-pointer h-full w-64 flex-shrink-0
                bg-stone-900/90 hover:bg-stone-800
                ${isSelected
                    ? 'border-amber-500 bg-amber-950/40 shadow-xl scale-[1.02]'
                    : 'border-stone-700'
                }
                ${isTargetable
                    ? 'ring-4 ring-amber-400 scale-[1.05] z-10 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    : ''
                }
                ${char.hp <= 0 ? 'opacity-40 grayscale' : ''}
                ${isActive ? 'animate-action-pulse border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] z-20 scale-[1.03]' : ''}
                ${char.animationClass || ''}
            `}
        >
            {/* Profile Image - Larger & Prominent */}
            <div className="w-24 h-24 bg-stone-950 border-2 border-stone-600 rounded-full overflow-hidden relative shadow-lg shrink-0">
                <img
                    src={char.profile}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                />
                {/* Fallback initials if image fails */}
                <div className="absolute inset-0 flex items-center justify-center text-stone-600 font-bold text-3xl -z-10 bg-stone-900">
                    {char.name.substring(0, 2).toUpperCase()}
                </div>
            </div>

            {/* Info Section - Vertical Flow */}
            <div className="flex-1 w-full flex flex-col gap-2 items-center text-center">
                {/* Name */}
                <h3 className={`font-serif font-bold text-lg truncate w-full ${isSelected ? 'text-amber-100' : 'text-stone-200'}`}>
                    {char.name}
                </h3>

                {/* Main Stats - Bigger */}
                <div className="flex gap-4 text-sm font-mono font-bold text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-stone-800">
                    <div className="flex items-center gap-1 text-red-400"><Heart size={14} fill="currentColor" /> {char.hp}/{char.maxHp}</div>
                    <div className="flex items-center gap-1 text-blue-400"><Shield size={14} fill="currentColor" /> {char.defense}</div>
                    <div className="flex items-center gap-1 text-yellow-500"><Zap size={14} fill="currentColor" /> {char.speed}</div>
                </div>

                {/* Equipment Row */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar w-full justify-center min-h-[24px]">
                    {char.equipment && char.equipment.length > 0 ? (
                        char.equipment.map((item, idx) => (
                            <div key={idx} title={item.name} className="w-6 h-6 bg-stone-800 rounded border border-stone-600 flex items-center justify-center relative hover:border-amber-500 transition-colors group">
                                <div className="w-3 h-3 bg-stone-500 rounded-sm" />
                            </div>
                        ))
                    ) : (
                        <span className="text-[10px] text-stone-600 italic">No Equipment</span>
                    )}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-stone-800/80 my-1" />

                {/* Skills Section - Flexible Height / Scroll */}
                <div className="w-full flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1 min-h-[80px]">
                    {skills.map((skill, idx) => {
                        let Icon = Sparkles;
                        let color = "text-purple-400";
                        let border = "border-purple-900/30";

                        if (skill.type === 'OFFENSIVE') { Icon = Sword; color = "text-orange-400"; border = "border-orange-900/30"; }
                        if (skill.type === 'DEFENSIVE') { Icon = Shield; color = "text-blue-400"; border = "border-blue-900/30"; }
                        if (skill.trigger && skill.trigger !== 'ACTION_PHASE') { Icon = Eye; color = "text-emerald-400"; border = "border-emerald-900/30"; }

                        return (
                            <div key={idx} className={`text-left bg-stone-950/60 p-1.5 rounded border ${border} hover:bg-stone-900 transition-colors group relative`}>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Icon size={12} className={color} />
                                    <span className="text-xs font-bold text-stone-300 truncate">{skill.name}</span>
                                </div>
                                <div className="text-[10px] text-stone-500 leading-tight line-clamp-2 group-hover:line-clamp-none group-hover:text-stone-400">
                                    {skill.description}
                                </div>
                            </div>
                        )
                    })}
                    {skills.length === 0 && <span className="text-xs text-stone-600 italic">No Skills Learned</span>}
                </div>
            </div>
        </div>
    );
};
