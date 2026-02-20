import React from 'react';
import { CastlePopup } from '../../components/ui/CastlePopup';
import { HardHat } from 'lucide-react'; // Note: Horse icon might need an alternative like 'Shield' or similar if not found in lucide-react, but we'll try something generic if it fails. Let's use 'Tent' or 'Shield' as a fallback mentally. 'Tractor'? No. 'Wagon'? No. We'll use 'Shield' for now to be safe, or just use lucide-react if 'Horse' is absent. Wait, let's use 'Tent' or similar. Actually 'Backpack' from lucide-react might represent logistics well. Or just 'Package'.

import { Package } from 'lucide-react';

export const CastleStables = ({ onClose }) => {
    return (
        <CastlePopup title="The Stables" onClose={onClose}>
            <div className="flex flex-col items-center gap-6 text-stone-300">
                <div className="p-6 bg-stone-950 rounded-full border-2 border-amber-700 text-amber-500">
                    <Package size={48} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl text-stone-100 font-serif">Logistics & Supply</h3>
                    <p className="text-stone-400">Manage wagons, supplies, and logistics capacity for deeper expeditions.</p>
                </div>
                <div className="w-full mt-4 p-8 border-2 border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-stone-600 gap-2 bg-stone-900/50">
                    <HardHat size={32} />
                    <span>Under Construction</span>
                </div>
            </div>
        </CastlePopup>
    );
};
