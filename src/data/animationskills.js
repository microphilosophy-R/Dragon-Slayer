
export const ANIMATIONS = {
    // Healing: Green rising particles / glow
    healing: {
        id: 'healing',
        type: 'css-class',
        className: 'animate-heal-glow', // We need to define this in index.css
        duration: 1000
    },
    // Attacking: Vibration / Shake
    attacking: {
        id: 'attacking',
        type: 'css-class',
        className: 'animate-shake', // We need to define this too
        duration: 500
    },
    // Buff: Blue/Gold shine
    buff: {
        id: 'buff',
        type: 'css-class',
        className: 'animate-buff-shine',
        duration: 800
    }
};
