import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PC_MOVEMENT_TABLE, CREATURE_MOVEMENT_TABLE } from '@/data/gameData'

const pcMovementData = PC_MOVEMENT_TABLE
const creatureMovementData = CREATURE_MOVEMENT_TABLE

const MovementCalculator = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PC Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Base Movement per Phase:</strong> (12 + Prowess MV + Agility MV) ÷ 5. Round <strong>up</strong> if the character has the Agility specialty, otherwise round <strong>down</strong>. Add Speed Focus Bonus after rounding.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prowess</TableHead>
                <TableHead>Agility</TableHead>
                <TableHead>Agility Specialty?</TableHead>
                <TableHead>Walk (squares/phase)</TableHead>
                <TableHead>Run (squares/phase)</TableHead>
                <TableHead>Sprint (squares/phase)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pcMovementData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.prowess}</TableCell>
                  <TableCell>{row.agility}</TableCell>
                  <TableCell>{row.specialty}</TableCell>
                  <TableCell>{row.walk}</TableCell>
                  <TableCell>{row.run}</TableCell>
                  <TableCell>{row.sprint}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-2">
            <p><strong>Speed Focus Bonus (after rounding):</strong></p>
            <ul className="list-disc pl-5">
              <li>d4–d6: <strong>+1</strong> sq/phase</li>
              <li>d8–d10: <strong>+2</strong> sq/phase</li>
              <li>d12+: <strong>+3</strong> sq/phase</li>
            </ul>
            <p><strong>Movement Multipliers:</strong></p>
            <ul className="list-disc pl-5">
              <li><strong>Run:</strong> ×2 movement (–3 Threat Points penalty to attacks)</li>
              <li><strong>Sprint:</strong> ×4 movement (no other actions possible)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Creature Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Movement in 5-foot squares per phase before size adjustments. BP Die replaces Prowess MV for QSB creatures.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BP Die</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>+Fast (+1)</TableHead>
                <TableHead>+Esp. Speedy (+4)</TableHead>
                <TableHead>SF d4–d6 (+1)</TableHead>
                <TableHead>SF d8–d10 (+2)</TableHead>
                <TableHead>SF d12+ (+3)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(creatureMovementData).map(([bpDie, data]) => (
                <TableRow key={bpDie}>
                  <TableCell>{bpDie}</TableCell>
                  <TableCell>{data.base}</TableCell>
                  <TableCell>{data.fast}</TableCell>
                  <TableCell>{data.espSpeedy}</TableCell>
                  <TableCell>{data.sf_d4_d6}</TableCell>
                  <TableCell>{data.sf_d8_d10}</TableCell>
                  <TableCell>{data.sf_d12_plus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-2">
            <p><strong>Movement Multipliers (Creatures):</strong></p>
            <ul className="list-disc pl-5">
              <li><strong>Normal Creatures / PCs:</strong> Run ×2, Sprint ×4</li>
              <li><strong>Especially Speedy Creatures:</strong> Run ×3, Sprint ×5, Burst ×7 (for 1 phase, then rest 1 round)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MovementCalculator
