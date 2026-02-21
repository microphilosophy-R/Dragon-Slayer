import React from 'react';
import { CastlePopup } from '../../components/ui/CastlePopup';
import { Coins, Users, Map, Wheat, TrendingDown, TrendingUp } from 'lucide-react';
import { Economy } from '../../models/Economy';

export const CastleKeep = ({ onClose, gameState, setGameState }) => {
    // Ensure we have a class instance to use the getters
    const eco = new Economy(gameState.economy);

    const handleTaxChange = (e) => {
        const newTax = parseInt(e.target.value, 10);
        setGameState(prev => {
            const updatedEco = new Economy(prev.economy);
            updatedEco.tax_rate = newTax;
            return {
                ...prev,
                economy: updatedEco
            };
        });
    };

    return (
        <CastlePopup title="The Keep" onClose={onClose}>
            <div className="flex flex-col gap-6 text-stone-300 w-full max-w-2xl mx-auto">
                <div className="flex gap-4 items-center">
                    <div className="p-4 bg-stone-950 rounded-full border-2 border-amber-700 text-amber-500">
                        <Coins size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl text-stone-100 font-serif">Manor Administration</h3>
                        <p className="text-stone-400 text-sm">Manage taxes, review population, and oversee land development.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    {/* Population Card */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-stone-300">
                            <Users size={18} className="text-amber-500" />
                            <span className="font-serif text-lg">Population</span>
                        </div>
                        <div className="text-3xl text-amber-100 mb-2 font-serif">{eco.population}</div>
                        <div className="text-stone-400 flex flex-col gap-1 mt-2">
                            <div className="flex justify-between border-b border-stone-800 pb-1"><span>Working (Manors):</span> <span className="text-amber-200">{eco.working_population_at_manors}</span></div>
                            <div className="flex justify-between border-b border-stone-800 py-1"><span>Non-Working:</span> <span>{eco.non_working_population}</span></div>
                            <div className="flex justify-between border-b border-stone-800 py-1"><span>Assigned (Barracks):</span> <span>{eco.assigned_barracks}</span></div>
                            <div className="flex justify-between pt-1"><span>Assigned (Workshops):</span> <span>{eco.assigned_workshop}</span></div>
                        </div>
                    </div>

                    {/* Land Card */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-stone-300">
                            <Map size={18} className="text-amber-500" />
                            <span className="font-serif text-lg">Land & Territory</span>
                        </div>
                        <div className="text-3xl text-amber-100 mb-1 font-serif">{eco.land_developed} <span className="text-sm text-stone-500">/ {eco.land_capacity}</span></div>
                        <div className="mt-auto text-stone-400 text-xs italic bg-stone-950/50 p-2 rounded">
                            Developing more land requires high happiness (&gt;60%), spare working population, and gold.
                        </div>
                    </div>

                    {/* Economy & Happiness Card */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded p-5 flex flex-col col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-stone-300">
                                <Wheat size={24} className="text-amber-500" />
                                <span className="font-serif text-xl">Happiness Index:</span>
                                <span className={`text-2xl font-bold ml-2 ${eco.happiness > 70 ? 'text-green-500' : eco.happiness < 40 ? 'text-red-500' : 'text-amber-500'}`}>
                                    {eco.happiness}%
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-semibold">
                                <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded"><TrendingUp size={16} /> +{eco.projected_income} Gold/Turn</div>
                            </div>
                        </div>

                        {/* Slider for Tax Rate */}
                        <div className="text-stone-300">
                            <div className="flex justify-between mb-2">
                                <span className="font-serif text-lg">Tax Rate:</span>
                                <span className="text-amber-400 font-bold text-lg">{eco.tax_rate}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="40"
                                value={eco.tax_rate}
                                onChange={handleTaxChange}
                                className="w-full h-3 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                            />
                            <div className="flex justify-between text-xs text-stone-500 mt-2">
                                <span>0% (High Growth)</span>
                                <span>10-20% (Stable)</span>
                                <span>40% (Starvation & Rebellion)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CastlePopup>
    );
};
