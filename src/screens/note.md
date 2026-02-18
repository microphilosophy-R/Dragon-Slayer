# Application Screens

## `StartScreen.js`
The initial landing page of the application.
- **Features**:
  - Displays the game title "AETHELGARD".
  - **Buttons**:
    - **New Expedition**: Starts a new game (resets state).
    - **Resume Chronicle**: (Disabled) Load functionality placeholder.
    - **Ancestral Legacy**: (Disabled) Meta-progression placeholder.

## `CastleScreen.js`
The main hub for the player between battles.
- **Features**:
  - Displays current level.
  - **Navigation**:
    - **Main Hall**: Go to `MainHall.js` for random events/upgrades.
    - **Expedition Office**: Go to `ExpeditionOffice.js` to manage the team.

## `MainHall.js`
A narrative event screen where the player deals with random encounters to upgrade their team.
- **Events (Randomly rolled on mount)**:
  - **Divine Blessings**: Choose between HP or Speed upgrades for the team.
  - **Wheel of Fortune**: Swap skills between characters or lose them.
  - **Fever of Faith**: Risk/reward dice roll for mass healing or debuffs.

## `ExpeditionOffice.js`
The team management screen.
- **Features**:
  - View the full roster of available characters.
  - Select up to 4 characters for the active team (`activeTeam` state).
  - **Embark**: Starts the `BattleScreen` with the selected team.

## `BattleScreen.js`
The core gameplay loop where combat takes place.
- **Phases**:
  1. **Initialization**: Creates `Faction` instances for Player and Enemy based on level data.
  2. **Player Turn**:
     - Player rolls dice.
     - `Combat.processMainTurn` executes the player's actions based on the roll.
     - Supports manual targeting via `requestPlayerTarget`.
  3. **Enemy Turn**:
     - AI rolls dice.
     - `Combat.processMainTurn` executes AI actions.
  4. **End Round**: Increments round counter and triggers end-of-round effects.
- **Features**:
  - Visualizes combat with animations (`animate-attack-lunge`, `animate-hit-shake`).
  - Displays battle logs.
  - Shows turn order via `ActionOrderBar`.
  - Handles win/loss conditions.
