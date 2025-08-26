import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import EncounterGenerator from './components/EncounterGenerator'
import NPCGenerator from './components/NPCGenerator'
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator'
import BattleCalculator from './components/BattleCalculator'
import MonsterGenerator from './components/MonsterGenerator'
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
          <TabsList className="grid w-full grid-cols-2 mb-8 h-16 bg-card border-2 border-primary/20">
            <TabsTrigger 
              value="gm" 
              className="horizontal-tab text-lg px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 flex items-center justify-center"
            >
              <Crown size={24} />
              <span className="font-medium">Game Master Tools</span>
            </TabsTrigger>
            <TabsTrigger 
              value="player" 
              className="horizontal-tab text-lg px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 flex items-center justify-center"
            >
              <UserFocus size={24} />
              <span className="font-medium">Player Tools</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gm" className="space-y-6">
            <Tabs defaultValue="encounter" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 h-16 bg-card/50">
                <TabsTrigger 
                  value="encounter" 
                  className="px-2 h-full text-center data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Dice6 size={20} />
                    <span className="text-sm font-medium leading-tight">Encounter</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="npc" 
                  className="px-2 h-full text-center data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <User size={20} />
                    <span className="text-sm font-medium leading-tight">NPC</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="battle" 
                  className="px-2 h-full text-center data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Swords size={20} />
                    <span className="text-sm font-medium leading-tight">Battle</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="monster" 
                  className="px-2 h-full text-center data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Heart size={20} />
                    <span className="text-sm font-medium leading-tight">Monster</span>
                  </div>
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
          
          <TabsContent value="player" className="space-y-6">
            <Tabs defaultValue="character" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-16 bg-card/50">
                <TabsTrigger 
                  value="character" 
                  className="px-4 h-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <UserFocus size={24} />
                    <span className="text-sm font-medium">Character</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="spells" 
                  className="px-4 h-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Sparkles size={24} />
                    <span className="text-sm font-medium">Spells</span>
                  </div>
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
