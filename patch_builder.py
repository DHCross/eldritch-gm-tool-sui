import re

file_path = "src/components/ManualCharacterBuilder.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Modify the useEffect that handles character creation
old_use_effect = """
  useEffect(() => {
    if (selectedRaceName && selectedClass) {
      const { character: workingCharacter, baseCharacter: minimaCharacter } = createCharacterShell(
        selectedRaceName as RaceName,
        selectedClass,
        selectedLevel,
        { focusSwap: activeFocusSwap }
      );
      updateDerivedCharacterData(workingCharacter);
      setCharacter(workingCharacter);
      setBaseCharacter(minimaCharacter);
      setCpSpent(calculateCPSpent(workingCharacter, minimaCharacter, false, focusSwapCpCost));
    } else {
      setCharacter(null);
      setBaseCharacter(null);
      setCpSpent(null);
    }
  }, [selectedRaceName, selectedClass, selectedLevel, activeFocusSwap, focusSwapCpCost]);
"""

new_use_effect = """
  useEffect(() => {
    if (selectedRaceName && selectedClass) {
      const { baseCharacter: minimaCharacter } = createCharacterShell(
        selectedRaceName as RaceName,
        selectedClass,
        selectedLevel,
        { focusSwap: activeFocusSwap }
      );

      const recommended = deepCloneCharacter(minimaCharacter);
      recommended.level = selectedLevel;
      recommended.magicPath = selectedMagicPath;

      // Spend all available CP to build the class baseline, then re-anchor the
      // baseline to the result so the player's full CP budget remains for customization.
      const budget = { value: cpBudget - focusSwapCpCost };
      spendCP(recommended, budget, 'balanced', selectedLevel, false, true);
      updateDerivedCharacterData(recommended);

      const newBase = deepCloneCharacter(recommended);
      setBaseCharacter(newBase);
      setCharacter(deepCloneCharacter(recommended));
      setCpSpent(calculateCPSpent(recommended, newBase, false, focusSwapCpCost));
    } else {
      setCharacter(null);
      setBaseCharacter(null);
      setCpSpent(null);
    }
  }, [selectedRaceName, selectedClass, selectedLevel, activeFocusSwap, focusSwapCpCost, cpBudget, selectedMagicPath]);
"""

content = content.replace(old_use_effect.strip(), new_use_effect.strip())

with open(file_path, "w") as f:
    f.write(content)

print("Patched.")
