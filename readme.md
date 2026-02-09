How to View Scenario 0

I have generated the Start Page ("Scenario 0") for your medieval roguelike game.

Features Implemented

Atmosphere: A "Lord of the Rings" inspired dark fantasy aesthetic using MedievalSharp and Cinzel fonts, particle effects (embers), and responsive buttons.

Architecture: The App component is set up as a State Machine. It currently defaults to scenario: 0.

Data Models: I have created the HERO_DEFAULTS constant within the code containing the specific attributes (Health, Speed, Offensive/Passive skills) for Merlin, Arthur, Archer, and the Architect as requested.

Buttons:

New Expedition: Initializes the game state. Currently, it triggers an alert confirming the action, ready to be connected to Scenario 1.

Resume Chronicle: Visual placeholder (Disabled).

Ancestral Legacy: Visual placeholder (Disabled).

Next Steps

When you are ready for Scenario 1 (The Castle), I will:

Update the App component to switch scenario to 1.

Build the Expedition Office UI to allow selecting 4 heroes from the roster.

Build the Main Hall for random events.

Scenario 1: The Castle - Walkthrough

I have implemented Scenario 1, allowing you to manage your heroes and prepare for battle. Here is a breakdown of the new features:

1. The Castle Hub

After clicking "New Expedition" on the start screen, you are taken to the Castle Hub. You will see two main facilities:

Main Hall: The place for random events and rewards.

Expedition Office: The place to organize your team.

2. The Main Hall (Events)

When you enter the Main Hall, one of three random events (as specified in your requirements) will trigger:

Blessings: Offers 3 choices to buff Health or Speed.

Fever of Faith: A risky dice roll event. Roll 4+ to heal everyone, otherwise a random hero loses Speed.

Fortune: Allows you to swap Passive Skills between heroes.

Note: I updated the Hero data structure to separate offensiveSkill and passiveSkill strings to make this swapping logic possible.

3. The Expedition Office

You can see your full roster of 4 heroes (Merlin, Arthur, Archer, Architect).

Click on a hero card to select or deselect them.

The "Embark" button is enabled only when you have between 1 and 4 heroes selected.

Currently, clicking "Embark" shows an alert (placeholder for Scenario 2).

Next Steps

To proceed to Scenario 2 (The Battle), I will need to:

Generate the Enemy data models (Rebel Army, Red Dragon).

Build the Turn-Based Battle System (Initiative rolls, Friendly/Hostile turns).

Implement the specific dice mechanics described for each skill.
