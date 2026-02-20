import React, { useState, useEffect } from 'react';
import { Shield, Heart, Zap, Sword, Info, Sparkles, Eye, Flame, Swords } from 'lucide-react';
import { SKILL_CABINET } from '../../data/skills';

export const BossCard = ({ char, isSelected, onClick, isTargetable, isActive, compact = false, onDrop, onUnequip }) => {
    let skills = [];
    if (typeof char.getSkills === 'function') {
        skills = char.getSkills();
    } else if (char.skillIds) {
        skills = char.skillIds.map(id => SKILL_CABINET[id]).filter(Boolean);
    } else {
        // Fallback for objects with direct properties
        if (char.offensiveSkillId) skills.push(SKILL_CABINET[char.offensiveSkillId]);
        if (char.defensiveSkillId) skills.push(SKILL_CABINET[char.defensiveSkillId]);
        skills = skills.filter(Boolean);
    }

    const [hoveredSkill, setHoveredSkill] = useState(null);
    const [imageError, setImageError] = useState(false);

    // Reset error state when the profile source changes
    useEffect(() => {
        setImageError(false);
    }, [char.profile]);

    return (
        <div
            id={`char-card-${char.id}`}
            onClick={onClick}
            className={`
                relative flex flex-col sm:flex-row items-center sm:items-stretch gap-4 p-5 border-4 transition-all duration-200 cursor-pointer h-auto sm:h-[32rem] w-full sm:w-[36rem] flex-shrink-0
                bg-red-950/90 hover:bg-red-900/90
                ${isSelected
                    ? 'border-red-600 bg-red-950 shadow-2xl shadow-red-900/50'
                    : 'border-stone-800'
                }
                ${isTargetable
                    ? 'ring-4 ring-red-500 z-10 shadow-[0_0_30px_rgba(220,38,38,0.7)]'
                    : ''
                }
                ${char.hp <= 0 ? 'opacity-40 grayscale pointer-events-none' : ''}
                ${isActive ? 'animate-pulse border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] z-20' : ''}
                ${char.animationClass || ''}
            `}
            onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#dc2626'; // Red-600
            }}
            onDragLeave={(e) => {
                e.currentTarget.style.borderColor = ''; // Reset
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = ''; // Reset
                if (onDrop) onDrop(e, char);
            }}
        >
            {/* Profile Image - 3:4 Aspect Ratio */}
            <div className="w-48 h-64 sm:w-56 sm:h-auto bg-stone-950 border-4 border-stone-900 overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.8)] shrink-0 mt-0">
                {!imageError && char.profile ? (
                    <img
                        key={char.profile}
                        src={char.profile}
                        alt={char.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center text-stone-600 font-bold text-3xl -z-10 bg-stone-900 ${(!char.profile || imageError) ? 'z-0' : '-z-10'}`}>
                    {char.name ? char.name.substring(0, 2).toUpperCase() : '??'}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full flex flex-col gap-3 items-center sm:items-start text-center sm:text-left min-h-0 overflow-hidden relative">

                {/* Boss UI Accents */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Flame size={120} />
                </div>

                {/* Name */}
                <div className="w-full">
                    <h3 className={`font-serif font-black tracking-widest text-2xl truncate w-full uppercase ${isSelected ? 'text-red-400' : 'text-stone-300'} drop-shadow-md`}>
                        {char.name}
                    </h3>
                    {char.description && (
                        <p className="text-stone-500 text-xs italic mt-1 line-clamp-2 pr-2">{char.description}</p>
                    )}
                </div>

                {/* Main Stats - Boss Emphasized */}
                <div className="flex flex-wrap gap-4 text-sm font-mono font-bold text-stone-300 bg-red-950/50 px-4 py-2 rounded border border-red-900/50 shrink-0 w-full sm:w-auto mt-2">
                    <div className="flex items-center gap-2 text-red-500 text-lg"><Heart size={18} fill="currentColor" /> {char.hp}/{char.maxHp}</div>
                    <div className="flex items-center gap-1 text-blue-400"><Shield size={14} fill="currentColor" /> {char.defense}</div>
                    <div className="flex items-center gap-1 text-yellow-500"><Zap size={14} fill="currentColor" /> {char.speed}</div>
                </div>

                {/* Equipment Row */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar w-full justify-center min-h-[32px] shrink-0 px-2">
                    {char.equipment && char.equipment.length > 0 ? (
                        char.equipment.map((item, idx) => (
                            <div
                                key={idx}
                                title={`${item.name}\n${item.description}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onUnequip) onUnequip(item);
                                }}
                                className={`
                                    w-8 h-8 rounded border flex items-center justify-center relative transition-all group shrink-0
                                    ${item.type === 'WEAPON' ? 'bg-red-900/30 border-red-500/50' : ''}
                                    ${item.type === 'ARMOR' ? 'bg-blue-900/30 border-blue-500/50' : ''}
                                    ${item.type === 'ACCESSORY' ? 'bg-amber-900/30 border-amber-500/50' : ''}
                                    ${onUnequip ? 'hover:bg-red-900/80 cursor-alias' : 'cursor-help'}
                                `}
                            >
                                {/* Simple Icon rep */}
                                {item.type === 'WEAPON' && <Sword size={14} className="text-red-300" />}
                                {item.type === 'ARMOR' && <Shield size={14} className="text-blue-300" />}
                                {item.type === 'ACCESSORY' && <Zap size={14} className="text-amber-300" />}

                                {/* Unequip Overlay Hint */}
                                {onUnequip && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded">
                                        <span className="text-[10px] text-red-400 font-bold">X</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center border border-dashed border-stone-800 rounded py-1">
                            <span className="text-[10px] text-stone-600 italic">Drag Equipment Here</span>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-stone-800/80 my-1 shrink-0" />

                {/* Skills Section */}
                <div className={`w-full flex-1 flex flex-col gap-2 pr-2 min-h-0 relative transition-all duration-300 overflow-y-auto`}>
                    <h4 className="text-stone-500 font-bold text-xs uppercase tracking-wider mb-1 border-b border-stone-800/50 pb-1">Boss Mechanics</h4>
                    {skills.map((skill, idx) => {
                        let Icon = Sparkles;
                        let color = "text-purple-500";
                        let border = "border-purple-900/50 hover:border-purple-500/50";
                        let bg = "bg-purple-950/20";

                        if (skill.type === 'OFFENSIVE') { Icon = Sword; color = "text-red-500"; border = "border-red-900/50 hover:border-red-500/50"; bg = "bg-red-950/20"; }
                        if (skill.type === 'DEFENSIVE') { Icon = Shield; color = "text-orange-500"; border = "border-orange-900/50 hover:border-orange-500/50"; bg = "bg-orange-950/20"; }
                        if (skill.trigger && skill.trigger !== 'ACTION_PHASE') { Icon = Eye; color = "text-emerald-500"; border = "border-emerald-900/50 hover:border-emerald-500/50"; bg = "bg-emerald-950/20"; }

                        return (
                            <div
                                key={idx}
                                className={`text-left p-2 rounded border ${border} ${bg} transition-colors group relative cursor-help shrink-0 shadow-sm`}
                                onMouseEnter={() => setHoveredSkill(idx)}
                                onMouseLeave={() => setHoveredSkill(null)}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Icon size={12} className={color} />
                                    <span className="text-xs font-bold text-stone-300 truncate">{skill.name}</span>
                                </div>

                                {/* Description: Always show for bosses */}
                                <div className="text-xs text-stone-400 leading-relaxed mt-1">
                                    {skill.description}
                                </div>
                            </div>
                        )
                    })}
                    {skills.length === 0 && <span className="text-xs text-stone-600 italic">No Boss Mechanics Defined</span>}
                </div>
            </div>
        </div>
    );
};
