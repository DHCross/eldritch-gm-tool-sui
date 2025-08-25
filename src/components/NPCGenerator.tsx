import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'

// Data Definitions
const genders = ["Male", "Female"];
const races = ["Human", "Elf", "Dwarf", "Gnome", "Half-Elf", "Half-Orc", "Halfling"];
const roles = ["Warrior", "Rogue", "Adept", "Mage", "Mystic", "Theurgist", "Barbarian"];
const levels = [1, 2, 3, 4, 5];
const abilities = ["Competence", "Prowess", "Fortitude"];
const dieRanks = ["d4", "d6", "d8", "d10", "d12"];
const dieValues = {
  "d4": 4,
  "d6": 6,
  "d8": 8,
  "d10": 10,
  "d12": 12
};
const specialties = {
  Competence: ["Adroitness", "Expertise", "Perception"],
  Prowess: ["Agility", "Melee", "Precision"],
  Fortitude: ["Endurance", "Strength", "Willpower"]
};
const focuses = {
  Adroitness: ["Skulduggery", "Cleverness"],
  Expertise: ["Wizardry", "Theurgy"],
  Perception: ["Alertness", "Perspicacy"],
  Agility: ["Speed", "Reaction"],
  Melee: ["Threat", "Finesse"],
  Precision: ["Ranged Threat", "Ranged Finesse"],
  Endurance: ["Vitality", "Resilience"],
  Strength: ["Ferocity", "Might"],
  Willpower: ["Courage", "Resistance"]
};

// Minimum Die-Ranks for Races
const raceMinimums = {
  "Human": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d4",
    "Willpower": "d6"
  },
  "Elf": {
    "Competence": "d6",
    "Prowess": "d8",
    "Fortitude": "d4",
    "Willpower": "d6"
  },
  "Dwarf": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d8",
    "Willpower": "d4"
  },
  "Gnome": {
    "Competence": "d6",
    "Prowess": "d4",
    "Fortitude": "d6",
    "Willpower": "d6"
  },
  "Half-Elf": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d6",
    "Willpower": "d6"
  },
  "Half-Orc": {
    "Competence": "d6",
    "Prowess": "d8",
    "Fortitude": "d6",
    "Willpower": "d4"
  },
  "Halfling": {
    "Competence": "d6",
    "Prowess": "d4",
    "Fortitude": "d4",
    "Willpower": "d6"
  }
};

// Minimum Die-Ranks for Roles (Classes)
const roleMinimums = {
  "Warrior": {
    "Prowess": "d8",
    "Melee": "d6",
    "Fortitude": "d6"
  },
  "Rogue": {
    "Prowess": "d6",
    "Agility": "d6",
    "Fortitude": "d4"
  },
  "Adept": {
    "Competence": "d6",
    "Expertise": "d6",
    "Willpower": "d6"
  },
  "Mage": {
    "Competence": "d8",
    "Expertise": "d6",
    "Willpower": "d8"
  },
  "Mystic": {
    "Competence": "d6",
    "Expertise": "d6",
    "Willpower": "d8"
  },
  "Theurgist": {
    "Competence": "d8",
    "Expertise": "d6",
    "Willpower": "d8"
  },
  "Barbarian": {
    "Prowess": "d8",
    "Melee": "d6",
    "Fortitude": "d6"
  }
};

interface GeneratorSettings {
  gender: string
  race: string
  role: string
  level: number
  includeMagic: boolean
}

interface NPCCharacter {
  gender: string
  role: string
  race: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  defensePools: { activeDefense: number, passiveDefense: number }
  spiritPoints: number
  masteryDie: string
  armor: string
  actions: Record<string, string>
  iconicItem?: {
    type: string
    properties?: string
    details?: string
    potency?: string
    rarity?: string
    energyPoints?: number
    activationCost?: number
  }
}

function NPCGenerator() {
  const [settings, setSettings] = useState<GeneratorSettings>({
    gender: 'Random',
    race: '',
    role: '',
    level: 1,
    includeMagic: false
  });

  const [character, setCharacter] = useState<NPCCharacter | null>(null);

  // Utility Functions
  function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getDieValue(dieRank: string): number {
    return dieValues[dieRank as keyof typeof dieValues] || 4;
  }

  function getHigherDieRank(die1: string, die2: string): string {
    return getDieValue(die1) >= getDieValue(die2) ? die1 : die2;
  }

  function increaseDieRank(obj: Record<string, string>, key: string): void {
    let currentRank = obj[key];
    let currentIndex = dieRanks.indexOf(currentRank);
    if (currentIndex < dieRanks.length - 1) {
      obj[key] = dieRanks[currentIndex + 1];
    }
  }

  function generateCharacter() {
    if (!settings.race || !settings.role) {
      toast.error("Please select a race and role before generating a character.");
      return;
    }

    let gender: string;
    if (settings.gender === "Random") {
      gender = getRandomElement(genders);
    } else {
      gender = settings.gender;
    }

    const character: NPCCharacter = {
      gender,
      role: settings.role,
      race: settings.race,
      level: settings.level,
      abilities: {},
      specialties: {},
      focuses: {}
    } as NPCCharacter;

    // Assign abilities and specialties based on minimums and level
    assignAbilities(character);
    character.defensePools = calculateDefensePools(character);
    character.spiritPoints = calculateSpiritPoints(character);
    character.masteryDie = getMasteryDie(character.level);
    character.armor = getArmor(character.level);
    character.actions = calculateActions(character);

    // Generate Iconic Items according to the role
    character.iconicItem = generateIconicItem(character, settings.includeMagic);

    setCharacter(character);
    toast.success('NPC generated successfully!');
  }

  function assignAbilities(character: NPCCharacter) {
    // Start with base minimums from race
    const raceMins = raceMinimums[character.race as keyof typeof raceMinimums] || {};
    abilities.forEach(ability => {
      const minDieRank = raceMins[ability as keyof typeof raceMins] || "d4";
      character.abilities[ability] = minDieRank;
      character.specialties[ability] = {};
      specialties[ability as keyof typeof specialties].forEach(specialty => {
        // Set specialty cheat die rank as minimum of race and default role minimum
        const roleMin = (roleMinimums[character.role as keyof typeof roleMinimums] as any)?.[specialty] || "d4";
        // Choose the higher die rank between race minimum and role minimum
        character.specialties[ability][specialty] = getHigherDieRank(minDieRank, roleMin);
        character.focuses[specialty] = {};
        focuses[specialty as keyof typeof focuses].forEach(focus => {
          // Initially set focus bonuses to +1 per character level
          character.focuses[specialty][focus] = `+${Math.floor(character.level / 2) || 1}`;
        });
      });
    });

    // Increase die ranks based on level
    for (let i = 1; i < character.level; i++) {
      // Distribute die increases as desired
      if (character.role === "Warrior" || character.role === "Barbarian") {
        increaseDieRank(character.abilities, "Prowess");
        increaseDieRank(character.specialties.Prowess, "Melee");
      }
      if (character.role === "Mage" || character.role === "Mystic" || character.role === "Theurgist" || character.role === "Adept") {
        increaseDieRank(character.abilities, "Competence");
        increaseDieRank(character.specialties.Competence, "Expertise");
      }
      if (character.role === "Rogue") {
        increaseDieRank(character.abilities, "Prowess");
        increaseDieRank(character.specialties.Prowess, "Agility");
      }
    }

    // Ensure specialties are at least as high as their parent ability
    abilities.forEach(ability => {
      specialties[ability as keyof typeof specialties].forEach(specialty => {
        if (getDieValue(character.specialties[ability][specialty]) < getDieValue(character.abilities[ability])) {
          character.specialties[ability][specialty] = character.abilities[ability];
        }
      });
    });
  }

  function calculateDefensePools(character: NPCCharacter) {
    const prowessDie = character.abilities.Prowess;
    const agility = character.specialties.Prowess.Agility;
    const melee = character.specialties.Prowess.Melee;
    const fortitudeDie = character.abilities.Fortitude;
    const endurance = character.specialties.Fortitude.Endurance;
    const strength = character.specialties.Fortitude.Strength;

    const activeDefense = getDieValue(prowessDie) + getDieValue(agility) + getDieValue(melee);
    const passiveDefense = getDieValue(fortitudeDie) + getDieValue(endurance) + getDieValue(strength);

    return { activeDefense, passiveDefense };
  }

  function calculateSpiritPoints(character: NPCCharacter) {
    const competenceDie = character.abilities.Competence;
    const willpower = character.specialties.Fortitude.Willpower;
    return getDieValue(competenceDie) + getDieValue(willpower);
  }

  function getMasteryDie(level: number): string {
    const masteryDice = ["d4", "d6", "d8", "d10", "d12"];
    return masteryDice[Math.min(level - 1, masteryDice.length - 1)];
  }

  function getArmor(level: number): string {
    const armorGrades = ["d4", "d6", "d8", "d10", "d12"];
    return armorGrades[Math.min(Math.floor(level / 2), armorGrades.length - 1)];
  }

  function calculateActions(character: NPCCharacter) {
    return {
      meleeAttack: `${character.abilities.Prowess} + ${character.specialties.Prowess.Melee} + Focus Bonus`,
      rangedAttack: `${character.abilities.Prowess} + ${character.specialties.Prowess.Precision} + Focus Bonus`,
      magicAttack: `${character.abilities.Competence} + ${character.specialties.Competence.Expertise} + Focus Bonus`,
      perceptionCheck: `${character.abilities.Competence} + ${character.specialties.Competence.Perception} + Focus Bonus`
    };
  }

  function generateIconicItem(character: NPCCharacter, includeMagic: boolean) {
    let item: any = { type: "", properties: "No special properties." };

    // Determine the type of Iconic Item based on role
    if (["Warrior", "Barbarian", "Rogue"].includes(character.role)) {
      item.type = "Iconic Weapon";
      if (includeMagic) {
        const magicEffects = [
          { effect: "Harm", description: "Inflicts additional elemental damage (e.g., fire, ice)." },
          { effect: "Afflict", description: "Has a chance to inflict status ailments (e.g., paralysis)." },
          { effect: "Modify", description: "Enhances weapon's sharpness, increasing damage output." }
        ];
        const selectedEffect = getRandomElement(magicEffects);
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`;
        item.potency = getRandomElement(["d4", "d6", "d8", "d10", "d12"]);
        item.rarity = determineRarity(item.potency);
        item.energyPoints = { "Common": 8, "Uncommon": 12, "Esoteric": 16, "Occult": 20, "Legendary": 30 }[item.rarity];
        item.activationCost = 1;
      } else {
        item.details = "A personalized weapon of great significance to the character. Can trigger 'Master Twist' when used with a mastery die.";
      }
    } else if (["Mage", "Mystic", "Theurgist", "Adept"].includes(character.role)) {
      item.type = "Iconic Magic Focus";
      if (includeMagic) {
        const magicEffects = [
          { effect: "Activate", description: "Allows casting of specific spells (e.g., teleportation)." },
          { effect: "Restore", description: "Augments healing spells, restoring more health." },
          { effect: "Protect", description: "Strengthens defensive spells, providing better protection." }
        ];
        const selectedEffect = getRandomElement(magicEffects);
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`;
        item.potency = getRandomElement(["d4", "d6", "d8", "d10", "d12"]);
        item.rarity = determineRarity(item.potency);
        item.energyPoints = { "Common": 8, "Uncommon": 12, "Esoteric": 16, "Occult": 20, "Legendary": 30 }[item.rarity];
        item.activationCost = 1;
      } else {
        item.details = "A personalized grimoire or focus significant to the character. Can trigger 'Master Twist' when used with a mastery die.";
      }
    } else {
      item.type = "Iconic Inspirational Item";
      if (includeMagic) {
        const magicEffects = [
          { effect: "Modify", description: "Enhances attributes (e.g., increased agility)." },
          { effect: "Afflict", description: "Can impose disadvantages on opponents in social encounters." },
          { effect: "Activate", description: "Triggers specific events (e.g., unlocking hidden doors)." }
        ];
        const selectedEffect = getRandomElement(magicEffects);
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`;
        item.potency = getRandomElement(["d4", "d6", "d8", "d10", "d12"]);
        item.rarity = determineRarity(item.potency);
        item.energyPoints = { "Common": 8, "Uncommon": 12, "Esoteric": 16, "Occult": 20, "Legendary": 30 }[item.rarity];
        item.activationCost = 1;
      } else {
        item.details = "An item of sentimental or historical value. Functions as Inspirational Aid, granting +1 bonus per character level to specific ability tests or feats.";
      }
    }
    return item;
  }

  function determineRarity(potency: string): string {
    switch (potency) {
      case "d4": return "Common";
      case "d6": return "Uncommon";
      case "d8": return "Esoteric";
      case "d10": return "Occult";
      case "d12": return "Legendary";
      default: return "Common";
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">NPC Generator</CardTitle>
          <CardDescription>Generate detailed NPCs for your Eldritch campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={settings.gender} onValueChange={(value) => setSettings({ ...settings, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Random">Random</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="race">Race</Label>
              <Select value={settings.race} onValueChange={(value) => setSettings({ ...settings, race: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Race" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={settings.role} onValueChange={(value) => setSettings({ ...settings, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={settings.level.toString()} onValueChange={(value) => setSettings({ ...settings, level: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeMagic"
              checked={settings.includeMagic}
              onCheckedChange={(checked) => setSettings({ ...settings, includeMagic: checked as boolean })}
            />
            <Label htmlFor="includeMagic">Include Magical Properties for Iconic Items</Label>
          </div>

          <Button onClick={generateCharacter} className="w-full">
            Generate Character
          </Button>
        </CardContent>
      </Card>

      {/* Character Output */}
      {character && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              Level {character.level} {character.gender} {character.race} {character.role}
            </h2>

            {/* Abilities Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Abilities</h3>
              <div className="space-y-2 text-sm">
                {abilities.map(ability => {
                  const specs = specialties[ability as keyof typeof specialties];
                  const specText = specs.map(spec => {
                    const focusText = focuses[spec as keyof typeof focuses]
                      .map(focus => {
                        const value = character.focuses[spec]?.[focus];
                        return value && value !== '+0' ? `${focus} ${value}` : null;
                      })
                      .filter(Boolean)
                      .join(', ');
                    
                    return `${spec} ${character.specialties[ability][spec]}${focusText ? ` (${focusText})` : ''}`;
                  }).join(', ');
                  
                  return (
                    <p key={ability}>
                      <strong>{ability} {character.abilities[ability]} → {specText}.</strong>
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-center">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">SP</div>
                <div className="text-lg font-bold">{character.spiritPoints}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Active DP</div>
                <div className="text-lg font-bold">{character.defensePools.activeDefense}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Passive DP</div>
                <div className="text-lg font-bold">{character.defensePools.passiveDefense}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Mastery Die</div>
                <div className="text-lg font-bold">{character.masteryDie}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Armor</div>
                <div className="text-lg font-bold">{character.armor}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Actions</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Melee Attack:</strong> {character.actions.meleeAttack}</p>
                <p><strong>Ranged Attack:</strong> {character.actions.rangedAttack}</p>
                <p><strong>Magic Attack:</strong> {character.actions.magicAttack}</p>
                <p><strong>Perception Check:</strong> {character.actions.perceptionCheck}</p>
              </div>
            </div>

            {/* Iconic Item */}
            {character.iconicItem && (
              <div className="border rounded-lg p-4 bg-accent/20">
                <h3 className="text-lg font-semibold mb-2">{character.iconicItem.type}</h3>
                {character.iconicItem.details && (
                  <p className="text-sm mb-2"><strong>Details:</strong> {character.iconicItem.details}</p>
                )}
                {character.iconicItem.properties !== "No special properties." && (
                  <>
                    <p className="text-sm mb-2"><strong>{character.iconicItem.properties}</strong></p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline">Potency: {character.iconicItem.potency}</Badge>
                      <Badge variant="outline">Rarity: {character.iconicItem.rarity}</Badge>
                      <Badge variant="outline">Energy Points: {character.iconicItem.energyPoints}</Badge>
                      <Badge variant="outline">Activation Cost: {character.iconicItem.activationCost} energy point(s)</Badge>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NPCGenerator