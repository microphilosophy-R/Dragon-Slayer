import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const CastlePopup = ({ title, onClose, children }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-amber-900/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-full">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-stone-800 bg-stone-950/50">
                    <h2 className="text-2xl font-serif text-amber-500 tracking-wider">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-stone-500 hover:text-amber-500 hover:bg-stone-800 rounded transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Optional Footer/Border Styling */}
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-900/50 to-transparent w-full mt-auto" />
            </div>
        </div>
    );
};
