import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import EncounterGenerator from './components/EncounterGenerator';
import NPCGenerator from './components/NPCGenerator';
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator';
import BattleCalculator from './components/BattleCalculator';
import MonsterGenerator from './components/MonsterGenerator';
import SpellReference from './components/SpellReference';
import CharacterRoster from './components/CharacterRoster';
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
import { Crown, UserCircle, DiceOne, User, Sword, Heart, Sparkles, Users } from "@phosphor-icons/react";

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
};

const playerTools = [
  { id: 'character', name: 'Character', icon: UserCircle },
  { id: 'spells', name: 'Spells', icon: Sparkles },
  { id: 'roster', name: 'Roster', icon: Users },
];

const gmTools = [
  { id: 'encounter', name: 'Encounter', icon: DiceOne },
  { id: 'npc', name: 'NPC', icon: User },
  { id: 'battle', name: 'Battle', icon: Sword },
  { id: 'monster', name: 'Monster', icon: Heart },
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
            <div className="text-center py-4">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                Eldritch RPG
              </h1>
              <p className="text-sm text-muted-foreground font-light tracking-widest">
                Tool Suite
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarGroup>
                <SidebarGroupLabel className="font-serif text-xl font-semibold tracking-normal">Player Tools</SidebarGroupLabel>
                {playerTools.map(tool => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTool(tool.id)}
                      isActive={activeTool === tool.id}
                      className="font-sans text-sm font-medium"
                    >
                      <tool.icon size={24} />
                      <span>{tool.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel className="font-serif text-xl font-semibold tracking-normal">Game Master Tools</SidebarGroupLabel>
                {gmTools.map(tool => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTool(tool.id)}
                      isActive={activeTool === tool.id}
                      className="font-sans text-sm font-medium"
                    >
                      <tool.icon size={24} />
                      <span>{tool.name}</span>
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
        <SidebarInset>
          <div className="container max-w-6xl mx-auto px-6 py-12">
            <div className="md:hidden flex justify-between items-center mb-4">
               <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Eldritch RPG
              </h1>
              <SidebarTrigger />
            </div>
            <ActiveToolComponent
              selectedCharacter={selectedCharacter}
              onCharacterSelect={setSelectedCharacter}
              onCharacterUpdate={setSelectedCharacter}
            />
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

export default App;
