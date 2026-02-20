import { getCharacter } from '../data/characters';
import {
    SharpDagger, GuardianShield, VampireFang,
    CounterRing, SniperScope, GamblersCoin, FlameSword
} from '../data/equipment';

export const EQUIP_MAP = {
    sharp_dagger: SharpDagger,
    guardian_shield: GuardianShield,
    vampire_fang: VampireFang,
    counter_ring: CounterRing,
    sniper_scope: SniperScope,
    gamblers_coin: GamblersCoin,
    flame_sword: FlameSword
};

export class SaveManager {
    static SAVE_KEY = 'aethelgard_save';

    static save(gameState) {
        if (!gameState) return;

        const serialized = {
            level: gameState.level,
            gold: gameState.gold,
            lastEventLevel: gameState.lastEventLevel,
            activeTeam: gameState.activeTeam,
            castleFacilities: gameState.castleFacilities,
            roster: gameState.roster.map(c => ({
                id: c.id,
                hp: c.hp,
                maxHp: c.maxHp,
                hasActed: c.hasActed,
                equipmentIds: c.equipment ? c.equipment.map(e => e.id) : []
            })),
            inventory: gameState.inventory ? gameState.inventory.map(e => e.id) : []
        };

        localStorage.setItem(this.SAVE_KEY, JSON.stringify(serialized));
    }

    static load() {
        const dataStr = localStorage.getItem(this.SAVE_KEY);
        if (!dataStr) return null;

        try {
            const data = JSON.parse(dataStr);

            // Reconstruct Character roster
            const roster = data.roster.map(cData => {
                const char = getCharacter(cData.id);
                if (char) {
                    char.hp = cData.hp !== undefined ? cData.hp : char.hp;
                    char.maxHp = cData.maxHp !== undefined ? cData.maxHp : char.maxHp;
                    char.hasActed = cData.hasActed || false;
                    // Equipments will be mapped back to characters
                    if (cData.equipmentIds) {
                        cData.equipmentIds.forEach(eqId => {
                            const EqClass = EQUIP_MAP[eqId];
                            if (EqClass) {
                                char.equip(new EqClass());
                            }
                        });
                    }
                }
                return char;
            }).filter(Boolean);

            // Reconstruct Inventory
            const inventory = data.inventory ? data.inventory.map(eqId => {
                const EqClass = EQUIP_MAP[eqId];
                return EqClass ? new EqClass() : null;
            }).filter(Boolean) : [];

            return {
                level: data.level,
                gold: data.gold,
                lastEventLevel: data.lastEventLevel || 0,
                activeTeam: data.activeTeam || [],
                castleFacilities: data.castleFacilities || { mainHall: { level: 1 }, expeditionOffice: { level: 1 } },
                roster,
                inventory
            };
        } catch (e) {
            console.error("Failed to load save data", e);
            return null;
        }
    }

    static clearSave() {
        localStorage.removeItem(this.SAVE_KEY);
    }

    static hasSave() {
        return !!localStorage.getItem(this.SAVE_KEY);
    }
}
