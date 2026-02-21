import React from 'react';
import { CastlePopup } from '../../components/ui/CastlePopup';
import { Package, Truck, AlertTriangle } from 'lucide-react';
import { Economy } from '../../models/Economy';

export const CastleStables = ({ onClose, gameState, setGameState }) => {
    const eco = new Economy(gameState.economy);

    // Calculate Supply Needed for the next level
    // Formula: (Active Team Size + 1 Baseline) * Next Level
    const nextLevel = gameState.level + 1;
    const teamSize = gameState.activeTeam ? gameState.activeTeam.length : 3; // Fallback to 3 if activeTeam missing
    const supplyNeeded = (teamSize + 1) * nextLevel * 2; // multiply by 2 to make numbers a bit bigger

    const handleInvest = (amount) => {
        if (eco.gold < amount) return; // Not enough gold

        setGameState(prev => {
            const updatedEco = new Economy(prev.economy);
            updatedEco.gold -= amount;
            updatedEco.supplies_sent += amount; // 1 gold = 1 supply
            return {
                ...prev,
                economy: updatedEco
            };
        });
    };

    return (
        <CastlePopup title="The Stables" onClose={onClose}>
            <div className="flex flex-col gap-6 text-stone-300 w-full max-w-2xl mx-auto">
                <div className="flex gap-4 items-center mb-2">
                    <div className="p-4 bg-stone-950 rounded-full border-2 border-amber-700 text-amber-500">
                        <Package size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl text-stone-100 font-serif">Logistics & Supply Chains</h3>
                        <p className="text-stone-400 text-sm">Invest gold to send supplies to the expedition frontlines. Supplies arrive at the start of the next level.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Current Setup */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-stone-300">
                            <Truck size={18} className="text-amber-500" />
                            <span className="font-serif text-lg">Next Campaign</span>
                        </div>
                        <div className="text-sm text-stone-400 mb-2">
                            Level {nextLevel} Expedition
                        </div>
                        <div className="flex justify-between items-end border-b border-stone-800 pb-2 mb-2 text-sm">
                            <span>Projected Need:</span>
                            <span className="text-amber-100 font-bold text-lg">{supplyNeeded} Units</span>
                        </div>
                        <div className="flex justify-between items-end text-sm">
                            <span>Supplies Sent:</span>
                            <span className={`font-bold text-lg ${eco.supplies_sent >= supplyNeeded ? 'text-green-500' : 'text-amber-500'}`}>
                                {eco.supplies_sent}
                            </span>
                        </div>
                    </div>

                    {/* Dangers & Info */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded p-4 flex flex-col justify-center text-sm text-stone-400">
                        <div className="flex items-center gap-2 mb-2 text-stone-300">
                            <AlertTriangle size={18} className="text-red-500" />
                            <span className="font-serif text-lg">The Road is Perilous</span>
                        </div>
                        <p className="mb-2">There is a 10% chance that bandits or weather will intercept 20% of your shipment before it arrives.</p>
                        <p className="italic text-xs bg-stone-950/50 p-2 rounded border border-stone-800/50">
                            Entering combat with insufficient supply causes <span className="text-red-400">Starvation (-25% Max HP, -1 Speed)</span>.
                        </p>
                    </div>

                    {/* Investment Controls */}
                    <div className="col-span-2 bg-stone-900/50 border border-stone-800 rounded p-4 flex flex-col items-center">
                        <span className="text-stone-300 font-serif mb-2">Fund Supply Wagons (1 Gold = 1 Supply)</span>
                        <div className="flex gap-4">
                            <button
                                className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded border border-stone-700 transition-colors disabled:opacity-50"
                                onClick={() => handleInvest(10)}
                                disabled={eco.gold < 10}
                            >
                                Send 10 (10g)
                            </button>
                            <button
                                className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded border border-stone-700 transition-colors disabled:opacity-50"
                                onClick={() => handleInvest(50)}
                                disabled={eco.gold < 50}
                            >
                                Send 50 (50g)
                            </button>
                            <button
                                className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded border border-amber-700 transition-colors disabled:opacity-50 text-amber-200"
                                onClick={() => handleInvest(supplyNeeded - eco.supplies_sent)}
                                disabled={eco.gold < (supplyNeeded - eco.supplies_sent) || eco.supplies_sent >= supplyNeeded}
                            >
                                Fill Needed ({(supplyNeeded - eco.supplies_sent) > 0 ? supplyNeeded - eco.supplies_sent : 0}g)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CastlePopup>
    );
};
