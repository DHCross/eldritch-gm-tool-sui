// GM Tools JavaScript Module
// Contains all the functionality for the GM Tools suite

// Tab functionality
function openTool(evt, toolName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(toolName).style.display = "block";
    evt.currentTarget.className += " active";
}

// --- Encounter Generator Module ---
const EncounterGenerator = {
    difficultyLevels: ['Easy', 'Moderate', 'Difficult', 'Demanding', 'Formidable', 'Deadly'],
    defenseLevels: ['Practitioner', 'Competent', 'Proficient', 'Advanced', 'Elite'],
    
    encounterDifficultyTable: {
        1: { Practitioner: [7,10,12,14,16,18], Competent: [14,20,24,28,32,36], Proficient: [21,29,36,42,48,55], Advanced: [28,39,48,56,64,73], Elite: [35,49,60,70,80,110] },
        2: { Practitioner: [14,20,24,28,32,36], Competent: [28,39,48,56,64,73], Proficient: [42,59,72,84,96,108], Advanced: [56,77,96,112,128,144], Elite: [70,95,120,140,160,190] },
        3: { Practitioner: [21,30,36,42,48,54], Competent: [42,59,72,84,96,108], Proficient: [63,84,108,126,144,162], Advanced: [84,111,144,168,192,216], Elite: [105,140,180,210,240,270] },
        4: { Practitioner: [28,42,50,56,64,72], Competent: [56,77,96,112,128,144], Proficient: [84,111,144,168,192,216], Advanced: [112,147,180,224,256,288], Elite: [140,185,228,280,320,360] }
    },
    
    threatDiceByCategory: {
        Minor: ['1d4','1d6','1d8','1d10','1d12'],
        Standard: ['2d4','2d6','2d8','2d10','2d12'],
        Exceptional: ['3d4','3d6','3d8','3d10','3d12'],
        Legendary: ['3d12','3d14','3d16','3d18','3d20']
    },
    
    hpMultipliers: {
        'Minuscule': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
        'Tiny': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
        'Small': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
        'Medium': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
        'Large': {'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3},
        'Huge': {'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5},
        'Gargantuan': {'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4}
    },

    updateSliderValues: function() {
        document.getElementById('partySizeValue').textContent = document.getElementById('partySize').value;
        document.getElementById('defenseLevelValue').textContent = this.defenseLevels[document.getElementById('defenseLevel').value - 1];
        document.getElementById('difficultyValue').textContent = this.difficultyLevels[document.getElementById('difficulty').value - 1];
        document.getElementById('nonMediumPercentageValue').textContent = document.getElementById('nonMediumPercentage').value;
        document.getElementById('nonMundanePercentageValue').textContent = document.getElementById('nonMundanePercentage').value;
        document.getElementById('specialTypePercentageValue').textContent = document.getElementById('specialTypePercentage').value;
    },

    generateMonsterForEncounter: function(maxThreat, selectedTypes, nonMediumPercentage, nonMundanePercentage, specialTypePercentage) {
        const category = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
        const threatDice = this.threatDiceByCategory[category][Math.floor(Math.random() * this.threatDiceByCategory[category].length)];
        const threatMV = parseInt(threatDice.split('d')[0]) * parseInt(threatDice.split('d')[1]);
        
        const sizes = ['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
        let size = 'Medium';
        if (Math.random() * 100 < nonMediumPercentage) {
            const nonMediumSizes = sizes.filter(s => s !== 'Medium');
            size = nonMediumSizes[Math.floor(Math.random() * nonMediumSizes.length)];
        }

        const natures = ['Mundane', 'Magical', 'Preternatural', 'Supernatural'];
        let nature = 'Mundane';
        if (Math.random() * 100 < nonMundanePercentage) {
            const nonMundaneNatures = natures.filter(n => n !== 'Mundane');
            nature = nonMundaneNatures[Math.floor(Math.random() * nonMundaneNatures.length)];
        }

        let creatureType = 'Normal';
        if (Math.random() * 100 < specialTypePercentage) {
            creatureType = Math.random() < 0.5 ? 'Fast' : 'Tough';
        }
        
        const { hitPoints, multiplier } = this.calculateHitPoints(threatMV, size, nature);
        
        let activeDefense, passiveDefense;
        if (creatureType === 'Fast') {
            activeDefense = Math.round(hitPoints * 0.75);
            passiveDefense = hitPoints - activeDefense;
        } else if (creatureType === 'Tough') {
            passiveDefense = Math.round(hitPoints * 0.75);
            activeDefense = hitPoints - passiveDefense;
        } else {
            activeDefense = Math.round(hitPoints / 2);
            passiveDefense = hitPoints - activeDefense;
        }

        const prowessDie = parseInt(threatDice.split('d')[1]);
        const battlePhase = this.calculateBattlePhase(prowessDie);
        const savingThrow = `d${4 * (['Minor', 'Standard', 'Exceptional', 'Legendary'].indexOf(category) + 1)}`;
        
        return {
            category, threatDice, threatMV, size, nature, creatureType,
            hitPoints, multiplier, activeDefense, passiveDefense,
            savingThrow, battlePhase
        };
    },

    calculateHitPoints: function(baseHP, size, nature) {
        const multiplier = this.hpMultipliers[size][nature];
        return {
            hitPoints: Math.round(baseHP * multiplier),
            multiplier: multiplier
        };
    },
    
    calculateBattlePhase: function(prowessDie) {
        if (prowessDie >= 12) return 1;
        if (prowessDie >= 10) return 2;
        if (prowessDie >= 8) return 3;
        if (prowessDie >= 6) return 4;
        return 5;
    }
};

// Global function for encounter generation (called from HTML)
function generateEncounter() {
    const partySize = parseInt(document.getElementById('partySize').value);
    const defenseLevel = EncounterGenerator.defenseLevels[document.getElementById('defenseLevel').value - 1];
    const difficulty = parseInt(document.getElementById('difficulty').value);
    const nonMediumPercentage = parseInt(document.getElementById('nonMediumPercentage').value);
    const nonMundanePercentage = parseInt(document.getElementById('nonMundanePercentage').value);
    const specialTypePercentage = parseInt(document.getElementById('specialTypePercentage').value);
    const selectedTypes = Array.from(document.querySelectorAll('input[name="creatureTypes"]:checked')).map(checkbox => checkbox.value);

    if (selectedTypes.length === 0) {
        alert("Please select at least one creature type.");
        return;
    }

    const threatScore = EncounterGenerator.encounterDifficultyTable[partySize][defenseLevel][difficulty - 1];
    let output = `Eldritch RPG Encounter\n=========================\n`;
    output += `Party Size: ${partySize}\n`;
    output += `Defense Level: ${defenseLevel}\n`;
    output += `Difficulty: ${EncounterGenerator.difficultyLevels[difficulty - 1]}\n`;
    output += `Total Threat Score: ${threatScore}\n\n`;
    output += `Creatures:\n=========================\n`;

    let remainingThreat = threatScore;
    let monsters = [];

    while (remainingThreat > 0) {
        const monster = EncounterGenerator.generateMonsterForEncounter(remainingThreat, selectedTypes, nonMediumPercentage, nonMundanePercentage, specialTypePercentage);
        monsters.push(monster);
        remainingThreat -= monster.threatMV;
        if (monster.threatMV === 0) break; 
    }

    monsters.forEach((monster, index) => {
        output += `Monster ${index + 1}\n`;
        output += `Type: ${monster.category} | TD: ${monster.threatDice} | `;
        output += `HP: ${monster.hitPoints} (${monster.activeDefense}/${monster.passiveDefense}) `;
        output += `[${monster.size}, ${monster.nature}; ×${monster.multiplier}] ${monster.creatureType}\n`;
        output += `ST: ${monster.savingThrow} | BP: ${monster.battlePhase}\n\n`;
    });

    document.getElementById('encounterOutput').textContent = output;
}

// --- NPC Generator Module ---
const NPCGenerator = {
    races: ["Human", "Elf", "Dwarf", "Gnome", "Half-Elf", "Half-Orc", "Halfling"],
    roles: ["Warrior", "Rogue", "Adept", "Mage", "Mystic", "Theurgist", "Barbarian"],
    levels: [1, 2, 3, 4, 5],
    
    populateDropdowns: function() {
        const raceSelect = document.getElementById('race');
        const classSelect = document.getElementById('class');
        const levelSelect = document.getElementById('level');

        this.races.forEach(race => {
            raceSelect.innerHTML += `<option value="${race}">${race}</option>`;
        });
        this.roles.forEach(role => {
            classSelect.innerHTML += `<option value="${role}">${role}</option>`;
        });
        this.levels.forEach(level => {
            levelSelect.innerHTML += `<option value="${level}">${level}</option>`;
        });
    }
};

// Global function for character generation (called from HTML)
function generateCharacter() {
    // Advanced NPC generation logic
    const genders = ["Male", "Female"];
    const races = ["Human", "Elf", "Dwarf", "Gnome", "Half-Elf", "Half-Orc", "Halfling"];
    const roles = ["Warrior", "Rogue", "Adept", "Mage", "Mystic", "Theurgist", "Barbarian"];
    const levels = [1, 2, 3, 4, 5];
    const abilities = ["Competence", "Prowess", "Fortitude"];
    const dieRanks = ["d4", "d6", "d8", "d10", "d12"];
    const dieValues = {"d4": 4, "d6": 6, "d8": 8, "d10": 10, "d12": 12};
    const specialties = {
        Competence: ["Adroitness", "Expertise", "Perception"],
        Prowess: ["Agility", "Melee", "Precision"],
        Fortitude: ["Endurance", "Strength", "Willpower"]
    };
    const focuses = {
        Adroitness: ["Skulduggery", "Cleverness"],
        Expertise: ["Wizardry", "Theurgy"],
        Perception: ["Alertness", "Perspicacity"],
        Agility: ["Speed", "Reaction"],
        Melee: ["Threat", "Finesse"],
        Precision: ["Ranged Threat", "Ranged Finesse"],
        Endurance: ["Vitality", "Resilience"],
        Strength: ["Ferocity", "Might"],
        Willpower: ["Courage", "Resistance"]
    };
    const rarities = ["Common", "Uncommon", "Esoteric", "Occult", "Legendary"];
    const energyPointsByRarity = {
        "Common": 8,
        "Uncommon": 12,
        "Esoteric": 16,
        "Occult": 20,
        "Legendary": 30
    };

    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Get selections
    let gender = document.getElementById('gender').value;
    if (gender === "Random") gender = randomChoice(genders);
    const race = document.getElementById('race').value;
    const role = document.getElementById('class').value;
    const level = parseInt(document.getElementById('level').value);
    const includeMagic = document.getElementById('includeMagic').checked;

    // Generate ability scores
    let abilityBlock = "";
    abilities.forEach(ability => {
        const die = dieRanks[Math.min(level - 1, dieRanks.length - 1)];
        abilityBlock += `${ability}: ${die}  `;
        specialties[ability].forEach(spec => {
            const focus = randomChoice(focuses[spec]);
            abilityBlock += `\n  - ${spec}: ${focus}`;
        });
        abilityBlock += "\n";
    });

    // Generate iconic item
    let itemBlock = "";
    if (includeMagic) {
        const rarity = randomChoice(rarities);
        const energy = energyPointsByRarity[rarity];
        itemBlock = `Iconic Item: ${rarity} rarity, ${energy} Energy Points`;
    } else {
        itemBlock = "Iconic Item: Mundane";
    }

    // Output
    let output = `--- Generated NPC ---\n`;
    output += `Gender: ${gender}\n`;
    output += `Race: ${race}\n`;
    output += `Role: ${role}\n`;
    output += `Level: ${level}\n`;
    output += `\nAbilities:\n${abilityBlock}`;
    output += `\n${itemBlock}`;

    document.getElementById('character').textContent = output;
}

// --- Battle Calculator Module ---
const BattleCalculator = {
    combatants: [],
    autoRollEnabled: false,
    defeatedCombatants: [],

    addCombatant: function() {
        const name = document.getElementById('combatantName').value || 'Unnamed';
        const prowess = document.getElementById('prowess').value;
        const type = document.getElementById('combatantType').value;
        this.combatants.push({ name, prowess, type });
        this.displayTurnOrder();
    },
    
    displayTurnOrder: function() {
        this.combatants.sort((a, b) => b.prowess - a.prowess);
        const turnOrderList = document.getElementById('turnOrder');
        turnOrderList.innerHTML = '';
        this.combatants.forEach((c, idx) => {
            turnOrderList.innerHTML += `<li>${c.name} (Prowess: d${c.prowess}, Type: ${c.type.toUpperCase()}) <button onclick="BattleCalculator.defeatCombatant(${idx})">Defeat</button></li>`;
        });
        this.displayDefeatedList();
    },
    
    toggleAutoRoll: function() {
        this.autoRollEnabled = document.getElementById('autoRollToggle').checked;
    },

    defeatCombatant: function(idx) {
        this.defeatedCombatants.push(this.combatants[idx]);
        this.combatants.splice(idx, 1);
        this.displayTurnOrder();
    },

    displayDefeatedList: function() {
        const defeatedList = document.getElementById('defeatedList');
        defeatedList.innerHTML = '';
        this.defeatedCombatants.forEach(c => {
            defeatedList.innerHTML += `<li>${c.name} (Prowess: d${c.prowess}, Type: ${c.type.toUpperCase()})</li>`;
        });
    }
};

// Global functions for Battle Calculator (called from HTML)
function addCombatant() {
    BattleCalculator.addCombatant();
}

function toggleAutoRoll() {
    BattleCalculator.toggleAutoRoll();
}

function toggleFields() {
    // Placeholder for field toggling logic
}

// --- Monster HP Calculator Module ---
function calculateMonsterHP() {
    // Advanced Monster HP logic
    const nature = parseFloat(document.getElementById('monsterType').value);
    const size = parseFloat(document.getElementById('monsterSize').value);
    const minor = parseInt(document.getElementById('Tier1Threat').value);
    const standard = parseInt(document.getElementById('Tier2Threat').value);
    const exceptional = parseInt(document.getElementById('Tier3Threat').value);
    const armorBonus = parseFloat(document.getElementById('monsterArmor').value);

    let totalModifier = (size + nature) / 2;
    let totalHitPoints = minor + standard + exceptional;
    let finalHitPoints = Math.ceil(totalHitPoints * totalModifier);
    finalHitPoints += armorBonus;

    let threat = "";
    if (minor !== 0 && standard === 0 && exceptional === 0) {
        threat = "a Minor";
    } else if (standard !== 0 && exceptional === 0) {
        threat = "a Standard";
    } else if (exceptional !== 0) {
        threat = "an Exceptional";
    } else {
        threat = "a Minor";
    }

    document.getElementById('monsterHPOutput').innerHTML = `Final hit points (after applying size, nature, and armor modifiers) is ${finalHitPoints}.<br>This creature is ${threat} threat (MV ${totalHitPoints}).`;
}

// --- Initializations ---
document.addEventListener('DOMContentLoaded', () => {
    EncounterGenerator.updateSliderValues();
    NPCGenerator.populateDropdowns();
    toggleFields();

    // Set up slider event listeners
    document.querySelectorAll('.slider').forEach(slider => {
        slider.addEventListener('input', EncounterGenerator.updateSliderValues.bind(EncounterGenerator));
    });
});