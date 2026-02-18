import React from 'react';


import { Shield, Heart, Zap, Sword, Info, Sparkles, Eye, Flame } from 'lucide-react';

export const CharacterStrip = ({ char, isSelected, onClick, isTargetable, isActive }) => {
    const skills = char.getSkills ? char.getSkills() : [];

    return (
        <div
            onClick={onClick}
            className={`
                relative flex items-center gap-3 p-2 border-l-4 transition-all duration-200 cursor-pointer overflow-hidden
                bg-stone-900/80 hover:bg-stone-800
                ${isSelected
                    ? 'border-l-amber-500 bg-amber-950/40 shadow-inner'
                    : 'border-l-stone-600'
                }
                ${isTargetable
                    ? 'ring-2 ring-amber-400 scale-[1.02] z-10'
                    : ''
                }
                ${char.hp <= 0 ? 'opacity-40 grayscale' : ''}
                ${isActive ? 'animate-action-pulse ring-2 ring-amber-500 z-20' : ''}
            `}
        >
            {/* Profile Image */}
            <div className="flex-shrink-0 w-16 h-16 bg-stone-950 border border-stone-700 rounded overflow-hidden relative">
                <img
                    src={char.profile}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                />
                {/* Fallback initials if image fails */}
                <div className="absolute inset-0 flex items-center justify-center text-stone-600 font-bold text-xl -z-10">
                    {char.name.substring(0, 2).toUpperCase()}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                {/* Header: Name and Equipment */}
                <div className="flex justify-between items-center">
                    <h3 className={`font-serif font-bold truncate ${isSelected ? 'text-amber-100' : 'text-stone-200'}`}>
                        {char.name}
                    </h3>
                    {/* Equipment Icons Placeholder - Interactive Scroll if needed */}
                    <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[100px]">
                        {char.equipment && char.equipment.length > 0 ? (
                            char.equipment.map((item, idx) => (
                                <div key={idx} title={item.name} className="bg-stone-800 p-0.5 rounded border border-stone-700 flex-shrink-0">
                                    <div className="w-4 h-4 bg-stone-600 rounded-sm" /> {/* Placeholder Icon */}
                                </div>
                            ))
                        ) : (
                            <span className="text-[10px] text-stone-600 italic">No Equip</span>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-3 text-xs font-mono text-stone-400">
                    <div className="flex items-center gap-1"><Heart size={12} className="text-red-700" /> {char.hp}/{char.maxHp}</div>
                    <div className="flex items-center gap-1"><Zap size={12} className="text-yellow-600" /> {char.speed}</div>
                    <div className="flex items-center gap-1"><Shield size={12} className="text-blue-600" /> {char.defense}</div>
                </div>

                {/* Skills Description (Truncated/Small) */}
                {/* Skills Row */}
                {/* Skills Row - Scrollable */}
                <div className="flex flex-wrap gap-2 mt-1 max-h-[60px] overflow-y-auto no-scrollbar content-start">
                    {skills.map((skill, idx) => {
                        let Icon = Sparkles;
                        let color = "text-purple-400";

                        if (skill.type === 'OFFENSIVE') { Icon = Sword; color = "text-orange-400"; }
                        if (skill.type === 'DEFENSIVE') { Icon = Shield; color = "text-blue-400"; }
                        if (skill.trigger && skill.trigger !== 'ACTION_PHASE') { Icon = Eye; color = "text-emerald-400"; } // Passive

                        return (
                            <div key={idx} className="flex items-center gap-1 bg-stone-950/50 px-1.5 py-0.5 rounded border border-stone-800/50 group relative cursor-help flex-shrink-0">
                                <Icon size={10} className={color} />
                                <span className="text-[10px] text-stone-400 truncate max-w-[60px]">{skill.name}</span>

                                {/* Tooltip - Positioned Top */}
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-black border border-stone-700 p-2 rounded shadow-xl text-xs z-50 hidden group-hover:block pointer-events-none">
                                    <div className={`font-bold mb-0.5 ${color}`}>{skill.name}</div>
                                    <div className="text-stone-300 leading-tight">{skill.description}</div>
                                </div>
                            </div>
                        )
                    })}
                    {skills.length === 0 && <span className="text-[10px] text-stone-600 italic">No Skills</span>}
                </div>
            </div>
        </div>
    );
};
