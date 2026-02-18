# UI Components

## `ActionOrderBar.js`
Displays the turn order of all living characters (both player and enemy factions) based on their speed.
- **Features**:
  - Sorts characters by speed (descending).
  - Highlights the currently active character.
  - Distinguishes player characters with specific styling.
  - Horizontal scrollable list.

## `Button.js`
A reusable button component with various styles and states.
- **Props**:
  - `primary`: Applies the primary amber/gold theme.
  - `disabled`: Applies a disabled state style.
  - `icon`: Accepts a Lucide icon component to display alongside text.
- **Usage**: Used throughout the app for all interactive buttons.

## `CharacterCard.js`
The primary display component for a character's status.
- **Features**:
  - Displays name, portrait, stats (HP, Defense, Speed), and equipment.
  - Lists skills with tooltips for detailed descriptions.
  - **Visual States**:
    - `isSelected`: Highlights the card (e.g., during targeting or selection).
    - `isTargetable`: Glows to indicate valid target.
    - `isActive`: Pulses to indicate it's this character's turn.
    - `dead`: Grayscale and lower opacity.

## `CharacterStack.js`
A container that displays multiple `CharacterCard` components in a horizontal overlapping stack.
- **Features**:
  - Handles hovering and selection logic for the cards within the stack.
  - Adjusts z-index and scale on hover/select to bring cards to front.

## `CharacterStrip.deprecated.js`
**[DEPRECATED]**
An older version of character display, intended for a vertical layout. It has been largely replaced by `CharacterCard` but stays in the codebase for reference or potential future use.
