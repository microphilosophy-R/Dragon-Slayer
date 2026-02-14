# Dragon Slayer - Project Overview

Welcome to **Dragon Slayer**, a turn-based tactical RPG featuring meaningful skill interactions and a robust event-driven architecture.

## Current State: Event & Skill Systems
We have successfully implemented the core systems that drive gameplay:
1.  **Event System**: A global `EventBus` now allows characters, skills, and equipment to communicate seamlessly without tight coupling.
2.  **Skill System**: A refined `Determine -> Target -> Execute` pipeline supports complex abilities, including Rerolls, Revives, and Speed-based mechanics.
3.  **Battle Workflow**: A faction-based turn system orchestrated by `ActionSequence` and `Combat`.

## Term Dictionary

### Game Time Units
*   **Round**: A complete cycle where **every** Faction has finished one **Turn**.
*   **Turn**: A phase assigned to a specific **Faction**. Crucially, **ALL** characters (Friend and Foe) act during a Turn.
    *   **Active Faction Members**: Execute **Offensive** actions.
    *   **Opposing Faction Members**: Execute **Defensive** actions.
*   **Action Sequence**: The sorted order (by Speed) in which all characters act within a single Turn.

### Entities
*   **Faction**: A group of characters allied together (e.g., 'PLAYER', 'ENEMY'). Factions share a Turn and victory conditions.
*   **Character**: The primary actor. Has Stats (`HP`, `Speed`, `Defense`), holds **Skills**, and can equip Items.
*   **Skill**: A discrete ability (Offensive, Defensive, or Passive). Follows a flexible **4-step execution flow**:
    1.  **Trigger**: Event signal (`ACTION_PHASE`, `Skill:TakeDamage`) that activates the skill.
    2.  **Determinator**: Checks conditions (Dice, History, Limits) & Validity.
    3.  **Targeting**: Selects recipients (Auto/Manual).
    4.  **Execution**: Applies effects (Damage, Heal, Buff).
*   **Passive Skills**: Skills triggered by specific events (not just the turn phase).
    *   **Loop Prevention**: Limited by `limitPerTurn` (default 1).
    *   **Resolution Order**: Multiple passives triggered by the same event resolve in order of Character **Speed** (Fastest to Slowest).
*   **Equipment**: Items attached to a Character. They passively modify stats or actively listen to **Events** to intervene in combat (e.g., "Add +1 Damage on Hit").

### Mechanics
*   **Event**: A signal broadcast by the `EventBus` (e.g., `Skill:CausingDamage`, `Character:Die`). Listeners (like Equipment) can react to or modify these signals.
*   **Context**: A snapshot of the battle state (`Dice Value`, `Active Faction`, `History`) passed to every Skill and Event to ensure consistent logic resolution.

## Architecture Highlights
*   **Models**: Located in `src/models/`, these classes (`Character`, `Skill`, `Equipment`) encapsulate data and behavior.
*   **Systems**: Located in `src/systems/`, these managers (`Combat`, `EventBus`, `ActionSequence`) handle the game flow and rules.
*   **Data**: Static definitions (`skills.js`, `equipment.js`) drive the content, allowing for easy balancing and expansion.

## Next Steps
*   **Enemy AI**: Refine the decision-making for non-player factions.
*   **Level Progression**: Implement multiple battle types (Normal/Elite/Boss) strung together in a roguelike run.
*   **UI Polish**: Enhance visual feedback for complex events like "Reroll" or "Revive".
