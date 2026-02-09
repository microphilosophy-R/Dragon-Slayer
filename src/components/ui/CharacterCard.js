
import React from 'react';
import { Shield, Heart, Zap } from 'lucide-react';

export const CharacterCard = ({ char, isSelected, onClick, showSelect = false, compact = false, defense = 0 }) => {
    // Safe access to descriptions in case char is a raw object or class instance
    const offDesc = char.offensiveDesc || (char.offensiveSkill ? char.offensiveSkill.description : "None");
    const defDesc = char.defensiveDesc || (char.defensiveSkill ? char.defensiveSkill.description : "None");

    return (
        <div
            onClick={onClick}
            className={`
        relative border-2 transition-all duration-200 cursor-pointer flex flex-col gap-2
        ${compact ? 'p-2' : 'p-4'}
        ${isSelected
                    ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'border-stone-700 bg-stone-900/50 hover:border-stone-500 hover:bg-stone-800'
                }
        ${char.hp <= 0 ? 'opacity-50 grayscale border-red-900' : ''}
      `}
        >
            <div className="flex justify-between items-start">
                <h3 className={`font-serif font-bold ${isSelected ? 'text-amber-100' : 'text-stone-300'} ${compact ? 'text-sm' : 'text-base'}`}>
                    {char.name}
                </h3>
                {defense > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-900/40 px-2 rounded-full border border-blue-800">
                        <Shield size={10} /> +{defense}
                    </div>
                )}
            </div>

            <div className="flex gap-4 text-sm text-stone-400">
                <div className="flex items-center gap-1"><Heart size={14} className="text-red-800" /> {char.hp}/{char.maxHp}</div>
                <div className="flex items-center gap-1"><Zap size={14} className="text-yellow-700" /> {char.speed}</div>
            </div>

            {!compact && (
                <div className="space-y-2 mt-2 text-xs text-stone-500">
                    <div><span className="text-stone-400 font-semibold">Offensive:</span> {offDesc}</div>
                    <div><span className="text-stone-400 font-semibold">Defensive:</span> {defDesc}</div>
                </div>
            )}
        </div>
    );
};
