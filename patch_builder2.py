import re

file_path = "src/components/ManualCharacterBuilder.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Remove the `applyRecommendedBuild` function
apply_recommended_regex = r"  const applyRecommendedBuild = \(\) => \{\n.*?setInteractionWarning\(`Applied recommended \$\{selectedClass\} baseline\. You can now fine-tune manually\.`\);\n  \};\n"
content = re.sub(apply_recommended_regex, "", content, flags=re.DOTALL)

# Remove the "Quick Start Preset" UI block in Step 2
quick_start_regex = r"          \{\/\* Quick start preset \*\/.*?<\/button>\n          <\/div>\n\n"
content = re.sub(quick_start_regex, "", content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)

print("Patched 2.")
