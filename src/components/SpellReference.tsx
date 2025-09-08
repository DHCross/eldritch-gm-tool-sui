import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useKV } from '@github/spark/hooks'
import { MagnifyingGlass, Sparkles, Lightning, Shield, Heart, Plus, Minus, BookOpen, Star } from "@phosphor-icons/react"

// Comprehensive spell database
const spellDatabase = {
  // Universal spells available to all Gift of Magic wielders
  Universal: {
    Common: [
      {
        name: "Dispel Effect",
        category: "Activate",
        description: "Used to remove magical barriers or effects. Can break enchantments, dispel illusions, or neutralize active magical phenomena.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Identify Magic",
        category: "Activate", 
        description: "Detects and identifies magic emanations. Reveals the nature, power level, and source of magical effects within range.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Eldritch Bolt",
        category: "Harm",
        description: "A basic magic attack that projects raw arcane energy at a target. The fundamental offensive spell known to all wielders of magic.",
        potency: "d4",
        challenge: "d4", 
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Eldritch Defense",
        category: "Protect",
        description: "Creates a protective barrier of magical energy. Can deflect physical attacks or provide resistance to magical effects.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None", 
        failure: "Next round spell fizzles"
      }
    ]
  },

  // Elementalism - Controls raw matter and natural forces
  Elementalism: {
    Common: [
      {
        name: "Air Bubble",
        category: "Activate",
        description: "Creates a pocket of breathable air around the target, allowing survival underwater or in toxic atmospheres.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Ball of Light", 
        category: "Activate",
        description: "Conjures a glowing orb that illuminates the surrounding area. Can be moved at will and provides bright light.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Boil Water",
        category: "Modify",
        description: "Rapidly heats water to boiling temperature. Useful for purification, cooking, or creating steam effects.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Breeze",
        category: "Activate",
        description: "Generates a controlled wind current. Can cool areas, disperse gases, or provide gentle propulsion.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Fire Strike",
        category: "Harm",
        description: "Manipulates existing flames to attack a target. Requires a source of fire within range to function.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Water Breathing",
        category: "Protect", 
        description: "Grants the ability to extract oxygen from water, allowing underwater breathing for the duration.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Fire Whip",
        category: "Harm",
        description: "Shapes flames into a long, flexible whip of fire that can strike at medium range with burning damage.",
        potency: "d6",
        challenge: "d6", 
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Stone Shape",
        category: "Modify",
        description: "Allows manipulation and reshaping of stone materials. Can create simple tools, seal passages, or alter terrain.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2", 
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Water Walk",
        category: "Activate",
        description: "Enables walking on the surface of water as if it were solid ground. Affects one target per casting.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Windwalk",
        category: "Activate",
        description: "Allows movement through the air on currents of wind. Provides limited flight capabilities.",
        potency: "d6", 
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ],
    Esoteric: [
      {
        name: "Fire Elemental",
        category: "Activate",
        description: "Summons a being of living flame to serve the caster. The elemental follows commands and fights independently.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Stone Armor",
        category: "Protect",
        description: "Encases the target in a shell of protective stone. Provides significant damage reduction but reduces mobility.",
        potency: "d8",
        challenge: "d8", 
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Whirlpool",
        category: "Harm",
        description: "Creates a dangerous vortex in a body of water that can trap and damage creatures caught within.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      }
    ],
    Occult: [
      {
        name: "Whirlwind",
        category: "Harm",
        description: "Conjures a powerful tornado that can lift and hurl objects and creatures with tremendous force.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      },
      {
        name: "Stone Golem",
        category: "Activate", 
        description: "Animates stone into a powerful construct that serves the caster. The golem is incredibly durable and strong.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      }
    ],
    Legendary: [
      {
        name: "Elemental Form",
        category: "Modify",
        description: "Transforms the caster into a being of pure elemental energy. Grants immunity to physical harm and elemental powers.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      },
      {
        name: "Tidal Surge",
        category: "Harm",
        description: "Summons a massive wave of water that can devastate large areas and sweep away everything in its path.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5", 
        failure: "5 rounds, -5 spirit points"
      }
    ]
  },

  // Sorcery - Harnesses chaos, illusion, and extra-dimensional realms
  Sorcery: {
    Common: [
      {
        name: "Arcane Lock",
        category: "Protect",
        description: "Imbues an object with magical resistance, making it significantly harder to open, break, or manipulate.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Minor Illusion",
        category: "Activate",
        description: "Creates a simple visual illusion no larger than a few feet. Can mimic objects, textures, or simple movements.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Shadow Step",
        category: "Activate",
        description: "Allows rapid movement between shadows over short distances. Requires existing shadows at both origin and destination.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Teleport Object",
        category: "Activate",
        description: "Instantly transports a small object from one location to another within range. Object must be unattended.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Enfeeblement",
        category: "Modify",
        description: "Weakens a target's physical capabilities, reducing their strength, speed, and overall physical performance.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Illusory Disguise",
        category: "Modify",
        description: "Changes the appearance of the target to look like someone or something else. Affects visual perception only.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Summon Monster",
        category: "Activate",
        description: "Calls forth a hostile creature from another realm to attack the caster's enemies. The creature acts independently.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Phantom Blade",
        category: "Activate",
        description: "Conjures a weapon of pure force that can strike both physical and incorporeal targets with equal effectiveness.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ],
    Esoteric: [
      {
        name: "Dimensional Travel",
        category: "Activate",
        description: "Opens a portal to another location or plane of existence, allowing travel across vast distances instantly.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Full Body Illusion",
        category: "Modify",
        description: "Creates a complete sensory illusion affecting sight, sound, smell, and touch. Nearly indistinguishable from reality.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      }
    ],
    Occult: [
      {
        name: "Mirrored Opponent",
        category: "Activate",
        description: "Creates a perfect duplicate of an enemy that fights alongside the caster with all the original's abilities.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      },
      {
        name: "Waking Terror",
        category: "Afflict",
        description: "Manifests the target's deepest fears as a tangible threat that can cause both psychological and physical harm.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      }
    ],
    Legendary: [
      {
        name: "Mass Invisibility",
        category: "Protect", 
        description: "Renders a large group completely invisible to all forms of detection. Affects multiple targets simultaneously.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      },
      {
        name: "Dreamscape",
        category: "Modify",
        description: "Traps targets in a realm of living dreams where reality bends to the caster's will and imagination rules supreme.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      }
    ]
  },

  // Thaumaturgy - Bends reality, manipulates matter and time
  Thaumaturgy: {
    Common: [
      {
        name: "Banish",
        category: "Afflict",
        description: "Forces a creature to retreat or sends an unwilling target away from the caster's presence.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Claw Growth",
        category: "Modify",
        description: "Extends and sharpens fingernails into claws, enhancing unarmed strikes with arcane cutting power.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Conjure Weapon",
        category: "Activate",
        description: "Materializes a simple weapon from thin air. The weapon lasts until dismissed or the spell ends.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Mend",
        category: "Restore",
        description: "Repairs damaged objects by reversing entropy and restoring them to their original condition.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Invisibility",
        category: "Protect",
        description: "Renders the target completely invisible to visual detection. Does not affect other senses or magical sight.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Quickened Reflexes",
        category: "Modify",
        description: "Dramatically increases the target's reaction time and movement speed, improving combat effectiveness.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Strengthen Creature",
        category: "Modify",
        description: "Enhances a target's physical capabilities, increasing their strength, endurance, and overall physical prowess.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ],
    Esoteric: [
      {
        name: "Levitation",
        category: "Activate",
        description: "Grants the ability to float and move through the air without need for physical support or propulsion.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Spatial Warp",
        category: "Modify",
        description: "Distorts space around the caster, making distances longer or shorter and confusing spatial relationships.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      }
    ],
    Occult: [
      {
        name: "Loop Time",
        category: "Modify",
        description: "Creates a temporal loop that repeats a brief period, allowing multiple attempts at the same action.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      },
      {
        name: "Monster Form",
        category: "Modify",
        description: "Transforms the caster into a powerful monstrous creature with enhanced abilities and natural weapons.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      }
    ],
    Legendary: [
      {
        name: "Time Halt",
        category: "Modify",
        description: "Stops the flow of time for everything except the caster, allowing actions while the world is frozen.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      },
      {
        name: "Petrify",
        category: "Afflict",
        description: "Transforms living creatures into stone, preserving them perfectly while rendering them completely immobile.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      }
    ]
  },

  // Mysticism - Manipulates mental and spiritual energies
  Mysticism: {
    Common: [
      {
        name: "Confusion",
        category: "Afflict",
        description: "Clouds the target's mind, making them uncertain of their actions and unable to think clearly.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Detect Magic",
        category: "Activate",
        description: "Reveals the presence of magical auras and energies within the area, highlighting their general location.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Ethereal Sight",
        category: "Activate",
        description: "Allows vision into the ethereal plane, revealing spirits, ghosts, and other incorporeal entities.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Soothing Balm",
        category: "Restore",
        description: "Heals minor wounds and provides temporary immunity to fear effects through calming mental influence.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Mind Shield",
        category: "Protect",
        description: "Creates a barrier around the mind that blocks attempts at mental intrusion, telepathy, and mind reading.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Mind Blade",
        category: "Harm",
        description: "Channels mental energy into a weapon of pure thought that can cut through both matter and spirit.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "See Aura",
        category: "Activate",
        description: "Reveals the spiritual aura surrounding creatures, showing their emotional state and magical nature.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ],
    Esoteric: [
      {
        name: "Mind Read",
        category: "Activate",
        description: "Accesses the surface thoughts of a target, revealing their current intentions and immediate memories.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Shadow Walk",
        category: "Activate",
        description: "Allows movement through the shadow realm, enabling travel between distant locations via darkness.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      }
    ],
    Occult: [
      {
        name: "Dreamwalk",
        category: "Activate",
        description: "Enters the dreams of sleeping targets, allowing communication and influence within their subconscious.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      },
      {
        name: "Ethereal Projection",
        category: "Activate",
        description: "Separates the spirit from the body, allowing exploration as an incorporeal entity while the body remains protected.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      }
    ],
    Legendary: [
      {
        name: "Mind Control",
        category: "Afflict",
        description: "Takes complete control of a target's mind and actions, forcing them to obey the caster's will absolutely.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      },
      {
        name: "Form of Night",
        category: "Modify",
        description: "Transforms the caster into living shadow, granting immunity to physical attacks and the power of darkness.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      }
    ]
  },

  // Hieraticism - Draws power from devotion to gods
  Hieraticism: {
    Common: [
      {
        name: "Heal",
        category: "Restore",
        description: "Channels divine energy to mend wounds and restore physical health to the target through sacred power.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Aura of Restoration",
        category: "Restore",
        description: "Creates a healing aura that continuously restores health to allies within range through divine blessing.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Repel Undead",
        category: "Protect",
        description: "Creates a divine barrier that forces undead creatures to flee or prevents them from approaching.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Word of Cleansing",
        category: "Restore",
        description: "Speaks a holy word that purifies the target, removing poisons, diseases, and minor curses.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Blessing of Health",
        category: "Restore",
        description: "Bestows divine protection that not only heals wounds but also grants resistance to disease and poison.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Consecrate Ground",
        category: "Protect",
        description: "Blesses an area with holy energy, making it painful for evil creatures and empowering divine magic.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Banish Undead",
        category: "Harm",
        description: "Channels holy power to destroy or banish undead creatures, causing them to flee back to their realm.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ],
    Esoteric: [
      {
        name: "Mystical Regeneration",
        category: "Restore",
        description: "Grants accelerated healing that can regrow lost limbs and restore the body to perfect health over time.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Remove Curse",
        category: "Restore",
        description: "Breaks powerful curses and magical compulsions through the intervention of divine power.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      }
    ],
    Occult: [
      {
        name: "Entreat Entity",
        category: "Activate",
        description: "Calls upon a divine being for aid, potentially gaining their direct intervention in mortal affairs.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      },
      {
        name: "Soul Transmutation",
        category: "Modify",
        description: "Alters the fundamental nature of a soul, potentially changing alignment, personality, or spiritual essence.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      }
    ],
    Legendary: [
      {
        name: "Regeneration",
        category: "Restore",
        description: "Grants permanent regenerative abilities that allow continuous healing and immunity to most forms of harm.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      },
      {
        name: "Commune with the Dead",
        category: "Activate",
        description: "Establishes communication with deceased souls, allowing conversation and knowledge gathering from beyond.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      }
    ]
  },

  // Druidry - Channels divine energy from the living world
  Druidry: {
    Common: [
      {
        name: "Entangling Roots",
        category: "Afflict",
        description: "Causes roots and vines to burst from the ground and wrap around targets, immobilizing them in place.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Plant Growth",
        category: "Activate",
        description: "Accelerates the growth of plants, causing them to increase in size and vitality rapidly.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Summon Animal",
        category: "Activate",
        description: "Calls a natural animal to aid the caster. The animal arrives quickly and follows simple commands.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Eyes of the Eagle",
        category: "Modify",
        description: "Grants supernatural visual acuity, allowing the target to see clearly at great distances like a bird of prey.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Animate Flora",
        category: "Activate",
        description: "Brings plants to life, allowing them to move and act according to the druid's will while retaining their plant nature.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Control Animal",
        category: "Afflict",
        description: "Exerts direct mental control over a natural animal, forcing it to obey the caster's commands.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Shapeshift",
        category: "Modify",
        description: "Transforms the caster into a natural animal, gaining all the creature's physical abilities and characteristics.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ],
    Esoteric: [
      {
        name: "Plant Meld",
        category: "Activate",
        description: "Allows the caster to merge with large plants or trees, hiding within them and sharing their senses.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      },
      {
        name: "Speak with Nature",
        category: "Activate",
        description: "Enables communication with all forms of natural life, from the smallest insects to the mightiest trees.",
        potency: "d8",
        challenge: "d8",
        maintenance: "-3",
        failure: "3 rounds, -3 spirit points"
      }
    ],
    Occult: [
      {
        name: "Animal Transformation",
        category: "Modify",
        description: "Permanently transforms a target into a natural animal, potentially reversible only with powerful magic.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      },
      {
        name: "Nature's Blessing",
        category: "Restore",
        description: "Calls upon the power of nature itself to provide healing, protection, and enhancement to allies.",
        potency: "d10",
        challenge: "d10",
        maintenance: "-4",
        failure: "4 rounds, -4 spirit points"
      }
    ],
    Legendary: [
      {
        name: "Plant Mastery",
        category: "Activate",
        description: "Grants complete control over all plant life in a vast area, commanding forests and jungles like extensions of will.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      },
      {
        name: "Magical Transformation",
        category: "Modify",
        description: "Transforms targets into magical creatures or beings, potentially granting supernatural abilities permanently.",
        potency: "d12",
        challenge: "d12",
        maintenance: "-5",
        failure: "5 rounds, -5 spirit points"
      }
    ]
  }
}

const rarityColors = {
  Common: "bg-gray-100 text-gray-800 border-gray-300",
  Uncommon: "bg-blue-100 text-blue-800 border-blue-300", 
  Esoteric: "bg-purple-100 text-purple-800 border-purple-300",
  Occult: "bg-red-100 text-red-800 border-red-300",
  Legendary: "bg-amber-100 text-amber-800 border-amber-300"
}

const categoryIcons = {
  Activate: <Lightning className="w-4 h-4" />,
  Harm: <Swords className="w-4 h-4" />,
  Protect: <Shield className="w-4 h-4" />,
  Restore: <Heart className="w-4 h-4" />,
  Modify: <Sparkles className="w-4 h-4" />,
  Afflict: <Lightning className="w-4 h-4" />
}

export default function SpellReference() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPath, setSelectedPath] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSpells, setSelectedSpells] = useKV('selected-spells', [] as any[])
  const [spellListName, setSpellListName] = useState('')
  const [savedSpellLists, setSavedSpellLists] = useKV('saved-spell-lists', {} as Record<string, any[]>)

  const allSpells = useMemo(() => {
    const spells: any[] = []
    
    Object.entries(spellDatabase).forEach(([pathName, rarities]) => {
      Object.entries(rarities).forEach(([rarity, spellList]) => {
        spellList.forEach((spell: any) => {
          spells.push({
            ...spell,
            path: pathName,
            rarity,
            id: `${pathName}-${spell.name}-${rarity}`
          })
        })
      })
    })
    
    return spells
  }, [])

  const filteredSpells = useMemo(() => {
    return allSpells.filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           spell.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPath = selectedPath === 'all' || spell.path === selectedPath
      const matchesRarity = selectedRarity === 'all' || spell.rarity === selectedRarity
      const matchesCategory = selectedCategory === 'all' || spell.category === selectedCategory
      
      return matchesSearch && matchesPath && matchesRarity && matchesCategory
    })
  }, [allSpells, searchTerm, selectedPath, selectedRarity, selectedCategory])

  const paths = ['all', ...Object.keys(spellDatabase)]
  const rarities = ['all', 'Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary']
  const categories = ['all', 'Activate', 'Harm', 'Protect', 'Restore', 'Modify', 'Afflict']

  const addSpellToSelection = (spell: any) => {
    setSelectedSpells(current => {
      if (current.find(s => s.id === spell.id)) return current
      return [...current, spell]
    })
  }

  const removeSpellFromSelection = (spellId: string) => {
    setSelectedSpells(current => current.filter(s => s.id !== spellId))
  }

  const clearSelection = () => {
    setSelectedSpells([])
  }

  const saveSpellList = () => {
    if (!spellListName.trim() || selectedSpells.length === 0) return
    
    setSavedSpellLists(current => ({
      ...current,
      [spellListName]: [...selectedSpells]
    }))
    
    setSpellListName('')
    clearSelection()
  }

  const loadSpellList = (listName: string) => {
    const list = savedSpellLists[listName]
    if (list) {
      setSelectedSpells([...list])
    }
  }

  const deleteSpellList = (listName: string) => {
    setSavedSpellLists(current => {
      const updated = { ...current }
      delete updated[listName]
      return updated
    })
  }

  const getSpellsByPath = (pathName: string) => {
    return selectedSpells.filter(spell => spell.path === pathName)
  }

  const getSpellCountsByRarity = (pathSpells: any[]) => {
    const counts = { Common: 0, Uncommon: 0, Esoteric: 0, Occult: 0, Legendary: 0 }
    pathSpells.forEach(spell => {
      counts[spell.rarity as keyof typeof counts]++
    })
    return counts
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Spell Reference & Selection
          </CardTitle>
          <CardDescription>
            Browse and search the complete Eldritch RPG spell library. Contains {allSpells.length} spells across all magical paths. Build spell lists for your characters.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Browse Spells
          </TabsTrigger>
          <TabsTrigger value="selection" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Current Selection ({selectedSpells.length})
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Saved Lists ({Object.keys(savedSpellLists).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search spells..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedPath} onValueChange={setSelectedPath}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Paths" />
                  </SelectTrigger>
                  <SelectContent>
                    {paths.map(path => (
                      <SelectItem key={path} value={path}>
                        {path === 'all' ? 'All Paths' : path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rarities" />
                  </SelectTrigger>
                  <SelectContent>
                    {rarities.map(rarity => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity === 'all' ? 'All Rarities' : rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedPath !== 'all' || selectedRarity !== 'all' || selectedCategory !== 'all') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedPath('all')
                      setSelectedRarity('all')
                      setSelectedCategory('all')
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredSpells.length} of {allSpells.length} spells
              </div>
            </CardContent>
          </Card>

          {/* Spell List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSpells.map((spell, index) => {
              const isSelected = selectedSpells.find(s => s.id === spell.id)
              
              return (
                <Card key={`${spell.path}-${spell.name}-${index}`} className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-accent' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{spell.name}</CardTitle>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${rarityColors[spell.rarity]} border text-xs`}>
                          {spell.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {spell.path}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {categoryIcons[spell.category]}
                      <span>{spell.category}</span>
                      <span>•</span>
                      <span>Potency: {spell.potency}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed">{spell.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-muted-foreground">Challenge:</span>
                        <div className="text-foreground">{spell.challenge}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Maintenance:</span>
                        <div className="text-foreground">{spell.maintenance}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-muted-foreground">Failure:</span>
                        <div className="text-foreground">{spell.failure}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      {isSelected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSpellFromSelection(spell.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSpellToSelection(spell)}
                          className="text-accent-foreground border-accent hover:bg-accent"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Selection
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredSpells.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No spells found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="selection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Spell Selection</CardTitle>
              <CardDescription>
                {selectedSpells.length} spells selected. Organize your selection by Mastery Path and save as a spell list.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSpells.length > 0 && (
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Name your spell list..."
                    value={spellListName}
                    onChange={(e) => setSpellListName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={saveSpellList}
                    disabled={!spellListName.trim()}
                    className="whitespace-nowrap"
                  >
                    Save List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearSelection}
                    className="whitespace-nowrap"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {selectedSpells.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No spells selected. Browse spells to build your selection.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group spells by path */}
                  {Object.keys(spellDatabase).map(pathName => {
                    const pathSpells = getSpellsByPath(pathName)
                    if (pathSpells.length === 0) return null

                    const rarityCounts = getSpellCountsByRarity(pathSpells)

                    return (
                      <Card key={pathName}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{pathName}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(rarityCounts).map(([rarity, count]) => {
                              if (count === 0) return null
                              return (
                                <Badge key={rarity} className={`${rarityColors[rarity]} text-xs`}>
                                  {count} {rarity}
                                </Badge>
                              )
                            })}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {pathSpells.map(spell => (
                              <div key={spell.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{spell.name}</span>
                                    <Badge className={`${rarityColors[spell.rarity]} text-xs`}>
                                      {spell.rarity}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {spell.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{spell.description}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSpellFromSelection(spell.id)}
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground ml-2"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Spell Lists</CardTitle>
              <CardDescription>
                Your saved spell lists. Load them to view or edit, or create new ones from your current selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(savedSpellLists).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No saved spell lists yet. Create one from your current selection.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {Object.entries(savedSpellLists).map(([listName, spells]) => {
                    const pathCounts = Object.keys(spellDatabase).reduce((acc, path) => {
                      acc[path] = spells.filter(s => s.path === path).length
                      return acc
                    }, {} as Record<string, number>)

                    return (
                      <Card key={listName} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{listName}</CardTitle>
                              <CardDescription>{spells.length} spells total</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadSpellList(listName)}
                              >
                                Load
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSpellList(listName)}
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(pathCounts).map(([path, count]) => {
                              if (count === 0) return null
                              return (
                                <Badge key={path} variant="outline" className="text-xs">
                                  {path}: {count}
                                </Badge>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}