import React from 'react';
import { ChevronRight } from 'lucide-react';

export const ActionOrderBar = ({ factions, activeCharacterId }) => {
    // 1. Flatten all living characters
    const allChars = factions.flatMap(f => f.livingMembers);

    // 2. Sort by Speed (Descending) - MUST match ActionSequence logic
    // Using tempSpeed as per combat logic
    allChars.sort((a, b) => b.tempSpeed - a.tempSpeed);

    return (
        <div className="flex items-center gap-2 bg-stone-900/80 p-2 rounded-lg border border-stone-700 overflow-x-auto max-w-full no-scrollbar">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mr-2">Turn Order</span>
            {allChars.map((char, idx) => {
                const isActive = char.id === activeCharacterId;
                const isPlayer = char.faction?.type === 'PLAYER'; // Optional check if needed

                return (
                    <div key={char.id} className="flex items-center">
                        <div
                            className={`
                                relative w-8 h-8 rounded-full border-2 overflow-hidden transition-all duration-300
                                ${isActive
                                    ? 'border-amber-400 scale-125 shadow-[0_0_10px_rgba(251,191,36,0.5)] z-10'
                                    : 'border-stone-600 opacity-80'
                                }
                                ${isPlayer ? 'ring-1 ring-stone-500/30' : ''} 
                            `}
                            title={`${char.name} (Speed: ${char.tempSpeed})`}
                        >
                            <img
                                src={char.profile}
                                alt={char.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-800 text-[10px] font-bold text-stone-400 -z-10">
                                {char.name.substring(0, 1)}
                            </div>
                        </div>

                        {/* Arrow separator, but not after last item */}
                        {idx < allChars.length - 1 && (
                            <ChevronRight size={12} className="text-stone-700 mx-1" />
                        )}
                    </div>
                )
            })}
        </div>
    );
};
