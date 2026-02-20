import React from 'react';
import { CastlePopup } from '../../components/ui/CastlePopup';
import { Coins, HardHat } from 'lucide-react';

export const CastleKeep = ({ onClose }) => {
    return (
        <CastlePopup title="The Keep" onClose={onClose}>
            <div className="flex flex-col items-center gap-6 text-stone-300">
                <div className="p-6 bg-stone-950 rounded-full border-2 border-amber-700 text-amber-500">
                    <Coins size={48} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl text-stone-100 font-serif">Economic Management</h3>
                    <p className="text-stone-400">Upgrade buildings, manage taxes, and oversee the realm's treasury here.</p>
                </div>
                <div className="w-full mt-4 p-8 border-2 border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-stone-600 gap-2 bg-stone-900/50">
                    <HardHat size={32} />
                    <span>Under Construction</span>
                </div>
            </div>
        </CastlePopup>
    );
};
