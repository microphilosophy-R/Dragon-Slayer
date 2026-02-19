
import React, { useState, useEffect, useMemo } from 'react';
import { Tent, ArrowRight, X, ChevronLeft, ChevronRight, Grid, List, AlignJustify, Users, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CharacterCard } from '../components/ui/CharacterCard';
import { ItemCard } from '../components/ui/ItemCard';

export const ExpeditionOffice = ({ gameState, setGameState, onEmbark, onBack }) => {
    // --- State ---
    const [charPage, setCharPage] = useState(0);
    const [itemPage, setItemPage] = useState(0);
    const [charPageSize, setCharPageSize] = useState(7);
    const [itemPageSize, setItemPageSize] = useState(6);
    const [sortMode, setSortMode] = useState('selectedProps'); // 'selectedProps' or 'index'

    // --- Helpers ---

    // Sort Roster
    const sortedRoster = useMemo(() => {
        const selectedIds = gameState.activeTeam;
        const roster = [...gameState.roster];

        // 1. Split Selected vs Unselected
        const selected = roster.filter(c => selectedIds.includes(c.id));
        const unselected = roster.filter(c => !selectedIds.includes(c.id));

        // 3. Combine
        return [...selected, ...unselected];
    }, [gameState.roster, gameState.activeTeam]);

    // Pagination Logic
    const charPages = Math.ceil(sortedRoster.length / charPageSize);
    const currentChars = sortedRoster.slice(charPage * charPageSize, (charPage + 1) * charPageSize);

    const inventory = gameState.inventory || [];
    const itemPages = Math.ceil(inventory.length / itemPageSize);
    const currentItems = inventory.slice(itemPage * itemPageSize, (itemPage + 1) * itemPageSize);

    // --- Handlers ---

    // Unequip on Mount (if not selected)
    useEffect(() => {
        setGameState(prev => {
            const newRoster = prev.roster.map(c => {
                if (c.equipment && c.equipment.length > 0 && !prev.activeTeam.includes(c.id)) {
                    return Object.assign(Object.create(Object.getPrototypeOf(c)), c, { equipment: [] });
                }
                return c;
            });

            const newInventory = [...(prev.inventory || [])];
            prev.roster.forEach(c => {
                if (c.equipment && c.equipment.length > 0 && !prev.activeTeam.includes(c.id)) {
                    newInventory.push(...c.equipment);
                }
            });

            return {
                ...prev,
                roster: newRoster,
                inventory: newInventory
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggleSelection = (charId) => {
        const currentSelected = gameState.activeTeam;
        const isSelected = currentSelected.includes(charId);

        if (isSelected) {
            setGameState(prev => ({ ...prev, activeTeam: currentSelected.filter(id => id !== charId) }));
        } else {
            if (currentSelected.length < 4) {
                setGameState(prev => ({ ...prev, activeTeam: [...currentSelected, charId] }));
            }
        }
    };

    const handleUnselectAll = () => {
        setGameState(prev => ({ ...prev, activeTeam: [] }));
    };

    const handleEquip = (e, char) => {
        const itemData = e.dataTransfer.getData("item");
        if (!itemData) return;
        const item = JSON.parse(itemData);

        // Validation
        const currentEquip = char.equipment || [];
        if (currentEquip.length >= 3) {
            alert("This hero cannot carry more equipment!");
            return;
        }
        if (currentEquip.some(i => i.type === item.type)) {
            alert(`This hero already has a ${item.type} equipped!`);
            return;
        }

        // Apply Change
        setGameState(prev => {
            const newInventory = [...prev.inventory];
            const foundIdx = newInventory.findIndex(i => i.id === item.id);
            if (foundIdx === -1) return prev;
            newInventory.splice(foundIdx, 1);

            const newRoster = prev.roster.map(c => {
                if (c.id === char.id) {
                    const clone = Object.assign(Object.create(Object.getPrototypeOf(c)), c);
                    clone.equipment = [...(clone.equipment || []), item];
                    return clone;
                }
                return c;
            });

            return {
                ...prev,
                inventory: newInventory,
                roster: newRoster
            };
        });
    };

    const handleUnequip = (item, char) => {
        setGameState(prev => {
            const newRoster = prev.roster.map(c => {
                if (c.id === char.id) {
                    const clone = Object.assign(Object.create(Object.getPrototypeOf(c)), c);
                    clone.equipment = clone.equipment.filter(i => i.type !== item.type && i.name !== item.name);
                    return clone;
                }
                return c;
            });

            return {
                ...prev,
                roster: newRoster,
                inventory: [...prev.inventory, item]
            };
        });
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-stone-950 overflow-hidden animate-fade-in-up font-serif">

            {/* --- GLOBAL HEADER --- */}
            <div className="h-20 flex justify-between items-center px-8 bg-stone-900 border-b-2 border-amber-900/50 shadow-2xl shrink-0 z-50 relative">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-amber-100 flex items-center gap-3 tracking-wide drop-shadow-md">
                        <Tent className="text-amber-500 stroke-2" size={28} />
                        Expedition Office
                    </h1>
                    <span className="text-xs text-stone-500 tracking-widest uppercase ml-10 mt-1">Prepare Your Forces</span>
                </div>

                <div className="flex items-center gap-6">
                    <Button onClick={onBack} className="w-auto px-6 py-2 border border-stone-600 bg-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-700 shadow-lg rounded-sm transition-all hover:-translate-y-0.5">
                        Back to Camp
                    </Button>
                    <Button
                        onClick={onEmbark}
                        disabled={gameState.activeTeam.length === 0}
                        primary
                        className="w-auto px-8 py-2 text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] border border-amber-500/50 rounded-sm transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        EMBARK <ArrowRight size={20} strokeWidth={3} />
                    </Button>
                </div>
            </div>

            {/* --- ROW 1: CHARACTERS (Flex Grow) --- */}
            <div className="flex-1 flex flex-col min-h-0 relative">
                {/* Row Header */}
                <div className="flex justify-between items-center px-8 py-4 bg-stone-900/90 border-b border-stone-800/80 backdrop-blur-md z-20 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-stone-700 to-stone-900 p-2 rounded shadow-inner border border-stone-600 text-amber-500">
                            <Users size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-base font-bold text-stone-200 uppercase tracking-wider">Roster Selection</h2>
                            <span className="text-xs text-stone-500 font-sans">Active Team: <strong className={`text-amber-400 ${gameState.activeTeam.length === 4 ? 'animate-pulse' : ''}`}>{gameState.activeTeam.length}/4</strong></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Tools Group */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleUnselectAll}
                                className="h-9 px-4 text-xs font-bold border border-stone-700 bg-stone-800 text-stone-400 hover:text-red-400 hover:border-red-900/50 hover:bg-stone-900 shadow-sm rounded-sm transition-all"
                                title="Unselect All Heroes"
                            >
                                <X size={14} className="mr-2" /> CLEAR SELECTION
                            </Button>

                            <div className="w-px h-8 bg-stone-800 mx-2" />

                            <Button
                                onClick={() => setCharPageSize(prev => prev === 7 ? 4 : (prev === 4 ? 9 : 7))}
                                className="h-9 px-4 text-xs font-bold border border-stone-700 bg-stone-800 text-amber-500 hover:text-amber-300 hover:border-amber-900/50 hover:bg-stone-900 shadow-sm rounded-sm transition-all"
                                title="Toggle Grid Size"
                            >
                                <Grid size={14} className="mr-2" /> VIEW: {charPageSize}
                            </Button>
                        </div>

                        {/* Pagination Group */}
                        <div className="flex items-center gap-1 bg-stone-950/50 rounded p-1 border border-stone-800/50 shadow-inner">
                            <Button onClick={() => setCharPage(p => Math.max(0, p - 1))} disabled={charPage === 0} className="w-8 h-8 p-0 rounded hover:bg-stone-800 border-none text-stone-400 hover:text-amber-500"><ChevronLeft size={18} /></Button>
                            <span className="text-stone-300 text-sm font-mono font-bold min-w-[3rem] text-center">{charPage + 1} / {Math.max(1, charPages)}</span>
                            <Button onClick={() => setCharPage(p => Math.min(charPages - 1, p + 1))} disabled={charPage >= charPages - 1} className="w-8 h-8 p-0 rounded hover:bg-stone-800 border-none text-stone-400 hover:text-amber-500"><ChevronRight size={18} /></Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900/40 via-stone-950 to-stone-950 flex items-center justify-center relative shadow-inner">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #1c1917 25%, transparent 25%), linear-gradient(-45deg, #1c1917 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1917 75%), linear-gradient(-45deg, transparent 75%, #1c1917 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>

                    <div className="flex gap-6 items-center z-10 px-8 min-w-min">
                        {currentChars.map(char => (
                            <CharacterCard
                                key={char.id}
                                char={char}
                                isSelected={gameState.activeTeam.includes(char.id)}
                                onClick={() => handleToggleSelection(char.id)}
                                onDrop={handleEquip}
                                onUnequip={(item) => handleUnequip(item, char)}
                            />
                        ))}
                        {currentChars.length === 0 && (
                            <div className="flex flex-col items-center gap-2 opacity-50">
                                <Users size={48} className="text-stone-700" />
                                <div className="text-stone-500 italic font-serif text-lg">No heroes available in this sector.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ROW 2: INVENTORY (Fixed Height) --- */}
            <div className="h-80 bg-stone-950 border-t-4 border-stone-800/80 flex flex-col shrink-0 z-30 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] relative">
                {/* Row Header */}
                <div className="flex justify-between items-center px-8 py-3 bg-stone-900 border-b border-stone-800 shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-stone-800 to-stone-950 p-2 rounded shadow-inner border border-stone-700 text-blue-400">
                            <Package size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">Equipment Storage</h3>
                            <span className="text-xs text-stone-500 font-sans">Available: <strong className="text-blue-400">{inventory.length}</strong></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Tools Group */}
                        <div className="flex items-center">
                            <Button
                                onClick={() => setItemPageSize(prev => prev === 6 ? 4 : (prev === 4 ? 9 : 6))}
                                className="h-8 px-4 text-xs font-bold border border-stone-700 bg-stone-800 text-blue-400 hover:text-blue-300 hover:border-blue-900/50 hover:bg-stone-900 shadow-sm rounded-sm transition-all"
                                title="Toggle Slot Size"
                            >
                                <Grid size={14} className="mr-2" /> SLOTS: {itemPageSize}
                            </Button>
                        </div>

                        {/* Pagination Group */}
                        <div className="flex items-center gap-1 bg-stone-950/50 rounded p-1 border border-stone-800/50 shadow-inner">
                            <Button onClick={() => setItemPage(p => Math.max(0, p - 1))} disabled={itemPage === 0} className="w-7 h-7 p-0 rounded hover:bg-stone-800 border-none text-stone-400 hover:text-blue-500"><ChevronLeft size={16} /></Button>
                            <span className="text-stone-300 text-xs font-mono font-bold min-w-[3rem] text-center">{itemPage + 1} / {Math.max(1, itemPages)}</span>
                            <Button onClick={() => setItemPage(p => Math.min(itemPages - 1, p + 1))} disabled={itemPage >= itemPages - 1} className="w-7 h-7 p-0 rounded hover:bg-stone-800 border-none text-stone-400 hover:text-blue-500"><ChevronRight size={16} /></Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 bg-stone-900 flex items-center justify-center gap-6 overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    {currentItems.length > 0 ? (
                        currentItems.map((item, idx) => (
                            <ItemCard key={`inv-${idx}-${item.id}`} item={item} />
                        ))
                    ) : (
                        <div className="border-2 border-dashed border-stone-800/50 rounded-xl px-16 py-8 flex flex-col items-center gap-3 text-stone-600">
                            <Package size={40} className="opacity-30" />
                            <span className="text-sm italic font-serif">Storage is empty</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
