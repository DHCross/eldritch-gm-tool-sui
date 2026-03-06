import re

file_path = "src/components/ManualCharacterBuilder.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Let's inspect spendCP behavior in characterBuild.ts
with open("src/utils/characterBuild.ts", "r") as f:
    build_ts = f.read()
