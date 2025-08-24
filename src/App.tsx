import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import EncounterGenerator from './components/EncounterGenerator'
import NPCGenerator from './components/NPCGenerator'
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator'
import BattleCalculator from './components/BattleCalculator'
import MonsterHPCalculator from './components/MonsterHPCalculator'
import SpellReference from './components/SpellReference'
import { Crown, UserFocus, Dice6, User, Swords, Heart, Sparkles } from "@phosphor-icons/react"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary drop-shadow-lg">
          Eldritch RPG Tool Suite
        </h1>
        
        <Tabs defaultValue="gm" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="gm" className="flex items-center gap-2 text-lg py-3">
              <Crown size={24} />
              Game Master Tools
            </TabsTrigger>
            <TabsTrigger value="player" className="flex items-center gap-2 text-lg py-3">
              <UserFocus size={24} />
              Player Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gm" className="space-y-6">
            <Tabs defaultValue="encounter" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="encounter" className="flex items-center gap-2">
                  <Dice6 size={18} />
                  <span className="hidden sm:inline">Encounter Generator</span>
                  <span className="sm:hidden">Encounter</span>
                </TabsTrigger>
                <TabsTrigger value="npc" className="flex items-center gap-2">
                  <User size={18} />
                  <span className="hidden sm:inline">NPC Generator</span>
                  <span className="sm:hidden">NPC</span>
                </TabsTrigger>
                <TabsTrigger value="battle" className="flex items-center gap-2">
                  <Swords size={18} />
                  <span className="hidden sm:inline">Battle Calculator</span>
                  <span className="sm:hidden">Battle</span>
                </TabsTrigger>
                <TabsTrigger value="monster" className="flex items-center gap-2">
                  <Heart size={18} />
                  <span className="hidden sm:inline">Monster HP</span>
                  <span className="sm:hidden">Monster</span>
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
                <MonsterHPCalculator />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="player" className="space-y-6">
            <Tabs defaultValue="character" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="character" className="flex items-center gap-2">
                  <UserFocus size={18} />
                  <span className="hidden sm:inline">Character Generator</span>
                  <span className="sm:hidden">Character</span>
                </TabsTrigger>
                <TabsTrigger value="spells" className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span className="hidden sm:inline">Spell Reference</span>
                  <span className="sm:hidden">Spells</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="character">
                <PlayerCharacterGenerator />
              </TabsContent>
              
              <TabsContent value="spells">
                <SpellReference />
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
