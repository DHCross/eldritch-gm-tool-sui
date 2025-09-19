import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import EncounterGenerator from './components/EncounterGenerator';
import NPCGenerator from './components/NPCGenerator';
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator';
import BattleCalculator from './components/BattleCalculator';
import MonsterGenerator from './components/MonsterGenerator';
import SpellReference from './components/SpellReference';
import CharacterRoster from './components/CharacterRoster';
import MovementCalculator from './components/MovementCalculator';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { UserCircle, DiceOne, User, Sword, Heart, Sparkles, Users, ScrollText, Rocket } from "@phosphor-icons/react";

// Fix for "now is not defined" error - provide global fallback
if (typeof window !== 'undefined' && !(window as any).now) {
  (window as any).now = Date.now;
}

export interface Character {
  id: string
  name?: string
  race: string
  class: string
  level: number
  displayLevel?: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  pools: { active: number; passive: number; spirit: number }
  masteryDie: string
  actions?: Record<string, string>
  advantages?: string[]
  flaws?: string[]
  classFeats?: string[]
  equipment?: string[]
  spells?: Array<{ name: string; rarity: string; path: string }>
  spellbook?: Array<{ name: string; rarity: string; path: string }>
  magicPath?: string
  recommendedSpellCount?: number
  createdAt?: number
  updatedAt?: number
  [key: string]: any
}

const toolComponents: { [key: string]: React.ElementType } = {
  character: PlayerCharacterGenerator,
  spells: SpellReference,
  roster: CharacterRoster,
  encounter: EncounterGenerator,
  npc: NPCGenerator,
  battle: BattleCalculator,
  monster: MonsterGenerator,
  movement: MovementCalculator,
};

const playerTools = [
  { id: 'character', name: 'Character Codex', icon: UserCircle, description: 'Create and manage player characters' },
  { id: 'spells', name: 'Spell Repertoire', icon: Sparkles, description: 'Browse spells and manage character spellbooks' },
  { id: 'roster', name: 'Character Roster', icon: Users, description: 'View and manage saved characters' },
];

const gmTools = [
  { id: 'encounter', name: 'Encounter Generator', icon: DiceOne, description: 'Generate balanced encounters for your party' },
  { id: 'npc', name: 'NPC Generator', icon: User, description: 'Create detailed non-player characters' },
  { id: 'battle', name: 'Initiative Tracker', icon: Sword, description: 'Track initiative and manage combat' },
  { id: 'monster', name: 'Monster Generator', icon: Heart, description: 'Create custom monsters and creatures' },
  { id: 'movement', name: 'Movement Calculator', icon: Rocket, description: 'Calculate and reference movement rates' },
];

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [activeTool, setActiveTool] = useState('character');

  const ActiveToolComponent = toolComponents[activeTool];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-background to-background/95 font-sans text-base font-normal tracking-wide">
        <Sidebar>
          <SidebarHeader>
            <div className="text-center py-6 border-b border-border/30">
              <ScrollText size={32} className="mx-auto mb-2 text-primary" />
              <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Eldritch RPG
              </h1>
              <p className="text-xs text-muted-foreground font-light tracking-widest uppercase">
                Tool Suite
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarGroupLabel className="font-serif text-lg font-semibold tracking-normal text-primary mb-2">
                  Player Tools
                </SidebarGroupLabel>
                {playerTools.map(tool => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTool(tool.id)}
                      isActive={activeTool === tool.id}
                      className={`font-sans text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeTool === tool.id 
                          ? 'bg-primary text-primary-foreground shadow-lg border-2 border-primary' 
                          : 'hover:bg-accent/10 hover:text-accent border-2 border-transparent'
                      }`}
                    >
                      <tool.icon size={20} className="flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs opacity-75">{tool.description}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="font-serif text-lg font-semibold tracking-normal text-secondary mb-2">
                  Game Master Tools
                </SidebarGroupLabel>
                {gmTools.map(tool => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTool(tool.id)}
                      isActive={activeTool === tool.id}
                      className={`font-sans text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeTool === tool.id 
                          ? 'bg-secondary text-secondary-foreground shadow-lg border-2 border-secondary' 
                          : 'hover:bg-accent/10 hover:text-accent border-2 border-transparent'
                      }`}
                    >
                      <tool.icon size={20} className="flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs opacity-75">{tool.description}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* Can add footer items here */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="main-content-area">
              <div className="md:hidden flex justify-between items-center mb-6 p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-3">
                  <ScrollText size={24} className="text-primary" />
                  <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
                    Eldritch RPG
                  </h1>
                </div>
                <SidebarTrigger />
              </div>
              
              {/* Active tool header */}
              <div className="mb-8">
                {(() => {
                  const currentTool = [...playerTools, ...gmTools].find(tool => tool.id === activeTool);
                  const isPlayerTool = playerTools.some(tool => tool.id === activeTool);
                  return currentTool ? (
                    <div className="flex items-center gap-4 p-6 bg-card rounded-xl border shadow-sm">
                      <div className={`p-3 rounded-lg ${isPlayerTool ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        <currentTool.icon size={32} />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-foreground">
                          {currentTool.name}
                        </h2>
                        <p className="text-muted-foreground">
                          {currentTool.description}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="pb-8">
                <ActiveToolComponent
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={setSelectedCharacter}
                  onCharacterUpdate={setSelectedCharacter}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default App;
