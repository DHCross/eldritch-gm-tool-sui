#!/usr/bin/env python3
"""Bulk restyle components from light-mode to dark eldritch theme."""
import os

COMPONENTS_DIR = os.path.join(os.path.dirname(__file__), "src", "components")

FILES = [
    "CharacterGenerator.tsx",
    "BattleCalculator.tsx",
    "MonsterGenerator.tsx",
    "EnhancedMonsterGenerator.tsx",
    "NPCGenerator.tsx",
    "AdvancedNPCGenerator.tsx",
    "Bestiary.tsx",
    "GrimoireIndex.tsx",
    "StatBlockParser.tsx",
    "PartyManagement.tsx",
]

# Order matters: longer/more-specific patterns first
REPLACEMENTS = [
    # Gray buttons (cancel/secondary) - must be before generic gray
    ("bg-gray-500 hover:bg-gray-600", "bg-white/10 hover:bg-white/15"),

    # Backgrounds - specific patterns first
    ("bg-white text-gray-900", "bg-white/5 text-off-white"),
    ("bg-gray-50", "bg-white/5"),
    ("bg-gray-100", "bg-white/10"),
    ("bg-gray-200", "bg-white/15"),
    ("bg-white", "bg-white/5"),

    # Borders
    ("border-gray-100", "border-white/10"),
    ("border-gray-200", "border-white/10"),
    ("border-gray-300", "border-white/15"),
    ("border-gray-400", "border-white/20"),

    # Text colors
    ("text-gray-900", "text-off-white"),
    ("text-gray-800", "text-off-white"),
    ("text-gray-700", "text-off-white/80"),
    ("text-gray-600", "text-off-white/60"),
    ("text-gray-500", "text-off-white/50"),
    ("text-gray-400", "text-off-white/40"),

    # Hover backgrounds
    ("hover:bg-gray-50", "hover:bg-white/5"),
    ("hover:bg-gray-100", "hover:bg-white/10"),
    ("hover:bg-gray-200", "hover:bg-white/15"),
    ("hover:bg-gray-300", "hover:bg-white/20"),

    # Hover text
    ("hover:text-gray-700", "hover:text-off-white"),
    ("hover:text-gray-600", "hover:text-off-white/80"),

    # Divides
    ("divide-gray-200", "divide-white/10"),
    ("divide-gray-300", "divide-white/15"),

    # Blue accent -> soft-amethyst
    ("bg-blue-600", "bg-soft-amethyst"),
    ("hover:bg-blue-700", "hover:bg-soft-amethyst/80"),
    ("hover:bg-blue-50", "hover:bg-soft-amethyst/10"),
    ("text-blue-600", "text-soft-amethyst"),
    ("text-blue-700", "text-soft-amethyst"),
    ("text-blue-800", "text-soft-amethyst"),
    ("border-blue-600", "border-soft-amethyst"),
    ("border-blue-300", "border-soft-amethyst/30"),
    ("hover:border-blue-300", "hover:border-soft-amethyst/30"),
    ("focus:ring-blue-500", "focus:ring-soft-amethyst/50"),
    ("focus:border-blue-500", "focus:border-soft-amethyst"),

    # Green accent
    ("bg-green-600", "bg-muted-eldritch-green"),
    ("hover:bg-green-700", "hover:bg-muted-eldritch-green/80"),
    ("text-green-600", "text-muted-eldritch-green"),
    ("text-green-700", "text-muted-eldritch-green"),
    ("text-green-800", "text-muted-eldritch-green"),
    ("border-green-200", "border-green-500/30"),
    ("border-green-300", "border-green-500/30"),
    ("bg-green-100", "bg-green-900/20"),
    ("bg-green-50", "bg-green-900/20"),

    # Red accent
    ("border-red-200", "border-red-500/30"),
    ("border-red-300", "border-red-500/30"),
    ("bg-red-50", "bg-red-900/20"),
    ("bg-red-100", "bg-red-900/20"),
    ("text-red-600", "text-red-400"),
    ("text-red-700", "text-red-400"),
    ("text-red-800", "text-red-400"),
    ("hover:bg-red-600", "hover:bg-red-500"),
    ("hover:bg-red-700", "hover:bg-red-500"),

    # Amber
    ("border-amber-200", "border-amber-500/30"),
    ("bg-amber-100", "bg-amber-900/20"),
    ("text-amber-800", "text-amber-300"),

    # Yellow
    ("bg-yellow-50", "bg-yellow-900/20"),
    ("bg-yellow-100", "bg-yellow-900/20"),
    ("border-yellow-200", "border-yellow-500/30"),
    ("border-yellow-300", "border-yellow-500/30"),
    ("text-yellow-800", "text-yellow-300"),
    ("text-yellow-700", "text-yellow-300"),

    # Indigo accent
    ("border-indigo-200", "border-indigo-500/30"),
    ("focus:ring-indigo-500", "focus:ring-soft-amethyst/50"),
    ("focus:border-indigo-500", "focus:border-soft-amethyst"),
    ("bg-indigo-600", "bg-soft-amethyst"),
    ("bg-indigo-100", "bg-soft-amethyst/20"),
    ("text-indigo-600", "text-soft-amethyst"),
    ("text-indigo-700", "text-soft-amethyst"),
    ("text-indigo-800", "text-soft-amethyst"),
    ("border-indigo-600", "border-soft-amethyst"),

    # Placeholder
    ("placeholder:text-gray-500", "placeholder:text-off-white/30"),
    ("placeholder:text-gray-400", "placeholder:text-off-white/30"),
    ("placeholder-gray-500", "placeholder-off-white/30"),

    # Shadow adjustments
    ("hover:shadow-xl", "hover:shadow-lg"),
]

def main():
    for fname in FILES:
        path = os.path.join(COMPONENTS_DIR, fname)
        with open(path, "r") as f:
            content = f.read()

        original = content
        for old, new in REPLACEMENTS:
            content = content.replace(old, new)

        if content != original:
            with open(path, "w") as f:
                f.write(content)
            print(f"Updated: {fname}")
        else:
            print(f"No changes: {fname}")

    print("\nDone!")

if __name__ == "__main__":
    main()
