import React from 'react';
import { CastlePopup } from '../../components/ui/CastlePopup';
import { Cross, Lock } from 'lucide-react';
import { Economy } from '../../models/Economy';

export const CastleTemple = ({ onClose, gameState }) => {
    const eco = new Economy(gameState.economy);

    // Temple recruitment requires high happiness
    const isAvailable = eco.happiness >= 75;

    return (
        <CastlePopup title="The Temple" onClose={onClose}>
            <div className="flex flex-col gap-6 text-stone-300 w-full max-w-2xl mx-auto">
                <div className="flex gap-4 items-center mb-2">
                    <div className="p-4 bg-stone-950 rounded-full border-2 border-amber-700 text-amber-500">
                        <Cross size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl text-stone-100 font-serif">Elite Recruitment</h3>
                        <p className="text-stone-400 text-sm">Divine intervention and epic heroes answer to a prosperous realm.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 bg-stone-900/50 border border-stone-800 rounded p-6 items-center text-center">
                    {!isAvailable ? (
                        <>
                            <Lock size={48} className="text-stone-500 mb-2" />
                            <h4 className="text-xl text-red-400 font-serif">The Divines are Silent</h4>
                            <p className="text-stone-400 text-sm max-w-sm">
                                The population is suffering (Happiness: {eco.happiness}%).
                                Elite heroes will only appear when the realm is prosperous (Requires 75% Happiness).
                            </p>
                        </>
                    ) : (
                        <>
                            <h4 className="text-xl text-amber-400 font-serif mb-2">The Golden Call</h4>
                            <p className="text-stone-300 text-sm max-w-sm mb-4">
                                The realm thrives, and rumors of greatness echo in the halls. You may spend vast sums of gold to recruit legends.
                            </p>
                            <p className="text-stone-500 italic">Advanced recruitment options pending.</p>
                        </>
                    )}
                </div>
            </div>
        </CastlePopup>
    );
};
