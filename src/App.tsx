import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import EncounterGenerator from './components/EncounterGenerator'
import NPCGenerator from './components/NPCGenerator'
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator'
import BattleCalculator from './components/BattleCalculator'
import MonsterGenerator from './components/MonsterGenerator'
import SpellReference from './components/SpellReference'
import CharacterRoster from './components/CharacterRoster'
import { Crown, UserCircle, DiceOne, User, Sword, Heart, Sparkles, Users } from "@phosphor-icons/react"

// Fix for "now is not defined" error - provide global fallback
if (typeof window !== 'undefined' && !(window as any).now) {
  (window as any).now = Date.now
}

export interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  pools: { active: number; passive: number; spirit: number }
  masteryDie: string
  spells?: Array<{ name: string; rarity: string; path: string }>
  [key: string]: any
}

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-background to-background/95">
      <div className="container max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 text-foreground drop-shadow-2xl tracking-wide">
            Eldritch RPG
          </h1>
          <p className="text-xl text-muted-foreground font-light tracking-widest">
            Tool Suite
          </p>
        </div>
        
        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 h-20 bg-card/80 border-2 border-primary/20 rounded-xl shadow-2xl backdrop-blur-sm">
            <TabsTrigger 
              value="player" 
              className="text-xl px-8 h-full data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-primary/50 hover:bg-primary/20 transition-all duration-300 flex items-center justify-center gap-4 border-2 border-transparent rounded-lg mx-2 my-2"
            >
              <UserCircle size={28} />
              <span className="font-semibold tracking-wide">Player Tools</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gm" 
              className="text-xl px-8 h-full data-[state=active]:bg-secondary/90 data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-secondary/50 hover:bg-secondary/20 transition-all duration-300 flex items-center justify-center gap-4 border-2 border-transparent rounded-lg mx-2 my-2"
            >
              <Crown size={28} />
              <span className="font-semibold tracking-wide">Game Master Tools</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gm" className="space-y-8">
            <Tabs defaultValue="encounter" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 h-16 bg-card/60 border-2 border-accent/20 rounded-xl shadow-lg backdrop-blur-sm">
                <TabsTrigger 
                  value="encounter" 
                  className="px-3 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <DiceOne size={22} />
                  <span className="text-sm font-medium leading-tight tracking-wide">Encounter</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="npc" 
                  className="px-3 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <User size={22} />
                  <span className="text-sm font-medium leading-tight tracking-wide">NPC</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="battle" 
                  className="px-3 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <Sword size={22} />
                  <span className="text-sm font-medium leading-tight tracking-wide">Battle</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="monster" 
                  className="px-3 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-1 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <Heart size={22} />
                  <span className="text-sm font-medium leading-tight tracking-wide">Monster</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="encounter">
                <EncounterGenerator />
              </TabsContent>
              
              <TabsContent value="npc">
                <NPCGenerator />
              </TabsContent>
              
              <TabsContent value="battle">
                <BattleCalculator />
              </TabsContent>
              
              <TabsContent value="monster">
                <MonsterGenerator />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="player" className="space-y-8">
            <Tabs defaultValue="character" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 h-16 bg-card/60 border-2 border-accent/20 rounded-xl shadow-lg backdrop-blur-sm">
                <TabsTrigger 
                  value="character" 
                  className="px-6 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-2 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <UserCircle size={24} />
                  <span className="text-sm font-medium tracking-wide">Character</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="spells" 
                  className="px-6 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-2 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <Sparkles size={24} />
                  <span className="text-sm font-medium tracking-wide">Spells</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="roster" 
                  className="px-6 h-full data-[state=active]:bg-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-accent/50 hover:bg-accent/20 transition-all duration-200 flex flex-col items-center justify-center gap-2 border-2 border-transparent rounded-lg mx-1 my-1"
                >
                  <Users size={24} />
                  <span className="text-sm font-medium tracking-wide">Roster</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="character">
                <PlayerCharacterGenerator 
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={setSelectedCharacter}
                />
              </TabsContent>
              
              <TabsContent value="spells">
                <SpellReference 
                  selectedCharacter={selectedCharacter}
                  onCharacterUpdate={setSelectedCharacter}
                />
              </TabsContent>
              
              <TabsContent value="roster">
                <CharacterRoster 
                  selectedCharacter={selectedCharacter}
                  onCharacterSelect={setSelectedCharacter}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App
