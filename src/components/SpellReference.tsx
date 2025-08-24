import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Book, Info } from "@phosphor-icons/react"
import { 
  SPELL_CHALLENGE_TABLE, 
  SPELL_POTENCY_TABLE, 
  SPELL_FAILURE_TABLE,
  RARITY_UNLOCK_TABLE,
  CHALLENGE_DIFFICULTIES,
  SUCCESS_CHANCE_TABLE 
} from '@/data/gameData'

export default function SpellReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="text-accent" />
          Spell Reference Tables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spell Challenge and Maintenance */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles size={18} />
              Spell Challenge & Maintenance Penalty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(SPELL_CHALLENGE_TABLE).map(([rarity, data]) => (
                <div key={rarity} className="text-center p-3 border rounded-lg">
                  <Badge variant="outline" className="mb-2">{rarity}</Badge>
                  <div className="text-sm">
                    <div>Challenge: {data.challenge}</div>
                    <div>Penalty: {data.maintenancePenalty || 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spell Potency */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Spell Potency, Challenge & Rarity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(SPELL_POTENCY_TABLE).map(([level, data]) => (
                <div key={level} className="text-center p-3 border rounded-lg">
                  <Badge className="mb-2">Level {level}</Badge>
                  <div className="text-sm space-y-1">
                    <div>{data.challenge}</div>
                    <div>{data.rarity}</div>
                    <div>{data.modifier}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spell Failure */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Spell Failure Consequences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(SPELL_FAILURE_TABLE).map(([die, data]) => (
                <div key={die} className="flex items-center justify-between p-3 border rounded-lg">
                  <Badge variant="outline">{die}</Badge>
                  <div className="text-sm text-right">
                    <div>{data.reattemptConsequence}</div>
                    {data.spiritLoss && (
                      <div className="text-destructive text-xs">
                        -{data.spiritLoss} SP for {data.rounds} rounds
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rarity Unlock Requirements */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Rarity Unlock Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(RARITY_UNLOCK_TABLE).map(([rank, rarity]) => (
                <div key={rank} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{rank}</span>
                  <Badge>{rarity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenge Difficulties */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info size={18} />
              Challenge Difficulties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(CHALLENGE_DIFFICULTIES).map(([difficulty, data]) => (
                <div key={difficulty} className="flex items-center justify-between p-3 border rounded-lg">
                  <Badge variant="secondary">{difficulty}</Badge>
                  <div className="text-sm text-right">
                    <div>Base: {data.base}</div>
                    <div>Disadvantage: {data.withDisadvantage}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Chance Sample */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Success Chance Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Average (2d4) vs Easy (≥1d4)</h4>
                  <div>Standard: 94% success</div>
                  <div>Disadvantage: 59% success</div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Skilled (2d8) vs Demanding (≥1d10)</h4>
                  <div>Standard: 81% success</div>
                  <div>Disadvantage: 39% success</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Refer to full SUCCESS_CHANCE_TABLE in game data for complete statistics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}