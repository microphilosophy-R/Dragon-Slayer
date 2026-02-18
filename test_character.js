
const { Character } = require('./src/models/Character');

// Mock data
const mockData = {
    id: 'hero_1',
    name: 'Test Hero',
    hp: 100,
    maxHp: 100,
    speed: 10,
    skills: []
};

try {
    const char = new Character(mockData);
    console.log("Character created successfully.");
    console.log("Profile:", char.profile);

    if (char.profile) {
        console.log("Profile attribute exists.");
    } else {
        console.error("Profile attribute missing.");
        process.exit(1);
    }

} catch (e) {
    console.error("Error creating character:", e);
    process.exit(1);
}
