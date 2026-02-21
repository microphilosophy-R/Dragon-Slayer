import React from 'react';
import { CastlePopup } from '../../components/ui/CastlePopup';
import { Swords, Users } from 'lucide-react';
import { Economy } from '../../models/Economy';

export const CastleBarracks = ({ onClose, gameState, setGameState }) => {
    const eco = new Economy(gameState.economy);

    const maxAssignable = eco.working_population - eco.assigned_workshop;

    const handleAssign = (amount) => {
        setGameState(prev => {
            const updatedEco = new Economy(prev.economy);
            let newAssigned = updatedEco.assigned_barracks + amount;
            const maxAllowed = updatedEco.working_population - updatedEco.assigned_workshop;
            newAssigned = Math.max(0, Math.min(newAssigned, maxAllowed));
            updatedEco.assigned_barracks = newAssigned;
            return {
                ...prev,
                economy: updatedEco
            };
        });
    };

    return (
        <CastlePopup title="The Barracks" onClose={onClose}>
            <div className="flex flex-col gap-6 text-stone-300 w-full max-w-2xl mx-auto">
                <div className="flex gap-4 items-center mb-2">
                    <div className="p-4 bg-stone-950 rounded-full border-2 border-amber-700 text-amber-500">
                        <Swords size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl text-stone-100 font-serif">Recruit Conscripts</h3>
                        <p className="text-stone-400 text-sm">Assign working population to continuously train basic infantry.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 bg-stone-900/50 border border-stone-800 rounded p-4">
                    <div className="flex items-center gap-2 mb-2 text-stone-300">
                        <Users size={18} className="text-amber-500" />
                        <span className="font-serif text-lg">Drill Master Assignment</span>
                    </div>

                    <div className="text-stone-400 text-sm mb-2 flex flex-col gap-1">
                        <p>Total Working Population Available: <span className="text-amber-100">{eco.working_population}</span></p>
                        <p>Recruits Assigned Here: <span className="text-amber-400 font-bold">{eco.assigned_barracks}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded border border-stone-700 transition-colors disabled:opacity-50"
                            onClick={() => handleAssign(-50)}
                            disabled={eco.assigned_barracks <= 0}
                        >
                            -50 Recruits
                        </button>
                        <div className="w-full h-2 bg-stone-950 rounded overflow-hidden">
                            <div
                                className="h-full bg-amber-600 transition-all duration-300"
                                style={{ width: `${maxAssignable > 0 ? (eco.assigned_barracks / maxAssignable) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <button
                            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded border border-stone-700 transition-colors disabled:opacity-50"
                            onClick={() => handleAssign(50)}
                            disabled={eco.assigned_barracks >= maxAssignable}
                        >
                            +50 Recruits
                        </button>
                    </div>

                    {eco.assigned_barracks === 0 ? (
                        <div className="text-red-400 text-sm text-center mt-2 p-2 bg-red-900/10 rounded">
                            No population assigned. The barracks are empty.
                        </div>
                    ) : (
                        <div className="text-green-400 text-sm text-center mt-2">
                            {eco.assigned_barracks} conscripts are training for the next battle.
                        </div>
                    )}
                </div>

                <div className="w-full mt-2 p-8 border-2 border-dashed border-stone-800 rounded-lg flex flex-col items-center justify-center text-stone-600 gap-2 bg-stone-900/50">
                    <p className="text-center">Basic conscript generation logic pending.</p>
                </div>
            </div>
        </CastlePopup>
    );
};
