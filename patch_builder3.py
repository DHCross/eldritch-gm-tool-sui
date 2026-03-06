import re

file_path = "src/components/ManualCharacterBuilder.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Fix the baseCharacter setting in the useEffect
old_code = """
      // Spend all available CP to build the class baseline, then re-anchor the
      // baseline to the result so the player's full CP budget remains for customization.
      const budget = { value: cpBudget - focusSwapCpCost };
      spendCP(recommended, budget, 'balanced', selectedLevel, false, true);
      updateDerivedCharacterData(recommended);

      const newBase = deepCloneCharacter(recommended);
      setBaseCharacter(newBase);
      setCharacter(deepCloneCharacter(recommended));
      setCpSpent(calculateCPSpent(recommended, newBase, false, focusSwapCpCost));
"""

new_code = """
      // Spend all available CP to build the class baseline, then use the raw
      // race/class minima as the baseCharacter so calculateCPSpent correctly measures it.
      const budget = { value: cpBudget - focusSwapCpCost };
      spendCP(recommended, budget, 'balanced', selectedLevel, false, true);
      updateDerivedCharacterData(recommended);

      setBaseCharacter(minimaCharacter);
      setCharacter(deepCloneCharacter(recommended));
      setCpSpent(calculateCPSpent(recommended, minimaCharacter, false, focusSwapCpCost));
"""

content = content.replace(old_code.strip(), new_code.strip())

with open(file_path, "w") as f:
    f.write(content)

print("Patched 3.")
