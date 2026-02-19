
import React from 'react';
import { Shield, Sword, Gem, AlertCircle } from 'lucide-react';

export const ItemCard = ({ item, isEquipped, onClick, showEquipStatus = false }) => {
    let Icon = AlertCircle;
    let color = "text-stone-400";
    let border = "border-stone-600";

    if (item.type === 'WEAPON') { Icon = Sword; color = "text-red-400"; border = "border-red-900/50"; }
    if (item.type === 'ARMOR') { Icon = Shield; color = "text-blue-400"; border = "border-blue-900/50"; }
    if (item.type === 'ACCESSORY') { Icon = Gem; color = "text-amber-400"; border = "border-amber-900/50"; }

    const handleDragStart = (e) => {
        if (isEquipped) return; // Cannot drag if already equipped (conceptually, though UI might differ)
        e.dataTransfer.setData("item", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <div
            draggable={!isEquipped}
            onDragStart={handleDragStart}
            onClick={onClick}
            title={item.description}
            className={`
                relative flex flex-col items-center justify-center gap-1 p-2 border-2 rounded bg-stone-900/80 
                w-24 h-32 cursor-grab active:cursor-grabbing hover:bg-stone-800 transition-all group shrink-0
                ${border}
                ${isEquipped ? 'opacity-50 grayscale' : 'hover:scale-105 shadow-lg'}
            `}
        >
            <div className={`p-2 rounded-full bg-stone-950 border border-stone-800 ${color}`}>
                <Icon size={24} />
            </div>

            <div className="text-xs font-bold text-center text-stone-300 leading-tight line-clamp-2">
                {item.name}
            </div>

            <div className="mt-1 text-[9px] text-stone-500 font-mono">
                {item.type}
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-stone-950 border border-stone-700 p-2 rounded shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                <div className={`font-bold text-xs ${color}`}>{item.name}</div>
                <div className="text-[10px] text-stone-400 italic">{item.description}</div>
            </div>

            {showEquipStatus && isEquipped && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_lime]" />
            )}
        </div>
    );
};
