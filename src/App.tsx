import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import EncounterGenerator from './components/EncounterGenerator'
import CharacterGenerator from './components/CharacterGenerator'
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator'
import BattleCalculator from './components/BattleCalculator'
import MonsterHPCalculator from './components/MonsterHPCalculator'
import SpellReference from './components/SpellReference'
import { Dice6, User, Swords, Heart, Sparkles, UserFocus } from "@phosphor-icons/react"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary drop-shadow-lg">
          Eldritch RPG GM Tool Suite
        </h1>
        
        <Tabs defaultValue="encounter" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="encounter" className="flex items-center gap-2">
              <Dice6 size={20} />
              <span className="hidden sm:inline">Encounter Generator</span>
              <span className="sm:hidden">Encounter</span>
            </TabsTrigger>
            <TabsTrigger value="character" className="flex items-center gap-2">
              <User size={20} />
              <span className="hidden sm:inline">Character Generator</span>
              <span className="sm:hidden">Character</span>
            </TabsTrigger>
            <TabsTrigger value="player" className="flex items-center gap-2">
              <UserFocus size={20} />
              <span className="hidden sm:inline">Player Character</span>
              <span className="sm:hidden">Player</span>
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Swords size={20} />
              <span className="hidden sm:inline">Battle Calculator</span>
              <span className="sm:hidden">Battle</span>
            </TabsTrigger>
            <TabsTrigger value="monster" className="flex items-center gap-2">
              <Heart size={20} />
              <span className="hidden sm:inline">Monster HP</span>
              <span className="sm:hidden">Monster</span>
            </TabsTrigger>
            <TabsTrigger value="spells" className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="hidden sm:inline">Spell Reference</span>
              <span className="sm:hidden">Spells</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encounter">
            <EncounterGenerator />
          </TabsContent>
          
          <TabsContent value="character">
            <CharacterGenerator />
          </TabsContent>
          
          <TabsContent value="player">
            <PlayerCharacterGenerator />
          </TabsContent>
          
          <TabsContent value="battle">
            <BattleCalculator />
          </TabsContent>
          
          <TabsContent value="monster">
            <MonsterHPCalculator />
          </TabsContent>
          
          <TabsContent value="spells">
            <SpellReference />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App
