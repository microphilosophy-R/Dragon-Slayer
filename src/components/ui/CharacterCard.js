import React, { useState, useEffect } from 'react';
import { Shield, Heart, Zap, Sword, Info, Sparkles, Eye, Flame, Swords } from 'lucide-react';
import { SKILL_CABINET } from '../../data/skills';

export const CharacterCard = ({ char, isSelected, onClick, isTargetable, isActive, compact = false, onDrop, onUnequip }) => {
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
                relative flex flex-col items-center gap-2 p-5 border-4 transition-all duration-200 cursor-pointer h-[32rem] w-64 flex-shrink-0
                bg-stone-900/95 hover:bg-stone-800
                ${isSelected
                    ? 'border-amber-500 bg-amber-950/40 shadow-xl'
                    : 'border-stone-700'
                }
                ${isTargetable
                    ? 'ring-4 ring-amber-400 z-10 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    : ''
                }
                ${char.hp <= 0 ? 'opacity-40 grayscale pointer-events-none' : ''}
                ${isActive ? 'animate-action-pulse border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] z-20' : ''}
                ${char.animationClass || ''}
            `}
            onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#f59e0b'; // Amber-500
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
            {/* Profile Image */}
            <div className="w-32 h-40 bg-stone-950 border-2 border-stone-600 overflow-hidden relative shadow-lg shrink-0 mt-2">
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
            <div className="flex-1 w-full flex flex-col gap-2 items-center text-center min-h-0 overflow-hidden">
                {/* Name */}
                <h3 className={`font-serif font-bold text-lg truncate w-full ${isSelected ? 'text-amber-100' : 'text-stone-200'}`}>
                    {char.name}
                </h3>

                {/* Main Stats */}
                <div className="flex gap-4 text-sm font-mono font-bold text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-stone-800 shrink-0">
                    <div className="flex items-center gap-1 text-red-400"><Heart size={14} fill="currentColor" /> {char.hp}/{char.maxHp}</div>
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
                <div className={`w-full flex-1 flex flex-col gap-1.5 pr-2 min-h-0 relative transition-all duration-300 ${isSelected ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                    {skills.map((skill, idx) => {
                        let Icon = Sparkles;
                        let color = "text-purple-400";
                        let border = "border-purple-900/30";

                        if (skill.type === 'OFFENSIVE') { Icon = Sword; color = "text-red-400"; border = "border-red-900/30"; }
                        if (skill.type === 'DEFENSIVE') { Icon = Swords; color = "text-orange-400"; border = "border-orange-900/30"; }
                        if (skill.trigger && skill.trigger !== 'ACTION_PHASE') { Icon = Eye; color = "text-emerald-400"; border = "border-emerald-900/30"; }

                        return (
                            <div
                                key={idx}
                                className={`text-left bg-stone-950/60 p-1.5 rounded border ${border} hover:bg-stone-900 transition-colors group relative cursor-help shrink-0`}
                                onMouseEnter={() => setHoveredSkill(idx)}
                                onMouseLeave={() => setHoveredSkill(null)}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Icon size={12} className={color} />
                                    <span className="text-xs font-bold text-stone-300 truncate">{skill.name}</span>
                                </div>

                                {/* Description: Only show if selected, with scrollbar if needed */}
                                {isSelected && (
                                    <div className="text-[10px] text-stone-500 leading-tight max-h-[100px] overflow-y-auto pr-1">
                                        {skill.description}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {skills.length === 0 && <span className="text-xs text-stone-600 italic">No Skills Learned</span>}
                </div>
            </div>
        </div>
    );
};
