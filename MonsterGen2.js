<!DOCTYPE html>
<html>
<head>
    <title>Monster Hit Points Calculator</title>
</head>
<body>
    <h1>Monster Hit Points Calculator</h1>

    <form onsubmit="event.preventDefault(); calculateThreat()">
        <label for="monsterType">Monster Type:</label>
        <select id="monsterType" name="monsterType">
            <option value="1">Mundane</option>
            <option value="2">Magical</option>
            <option value="3">Preternatural</option>
            <option value="4">Supernatural</option>
        </select>

        <label for="monsterSize">Monster Size:</label>
        <select id="monsterSize" name="monsterSize">
            <option value="0">Minuscule or Tiny</option>
            <option value="1">Small or Medium</option>
            <option value="2">Large</option>
            <option value="3">Huge</option>
            <option value="4">Gargantuan</option>
        </select>

        <label for="Primary Attack; Minor">Minor HP (MV):</label>
        <select id="Tier 1 Threat--Minor" name="minor">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="Primary Attack; add Standard die">Standard HP (MV):</label>
        <select id="Tier2AddsStandardDie" name="standard">
            <option value="0">None</option>
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="Primary Attack is Exceptional">Exceptional HP (MV):</label>
        <select id="Tier3AddExceptionalDie" name="exceptional">
            <option value="0">None</option>
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <button type="submit" id="calculateHitPoints">Calculate Hit Points</button>
    </form>

    <div id="output"></div>
    <script>
    function calculateHitPoints(ThreatMinor, ThreatStandard, ThreatExceptional, creatureSize, creatureNature) {
        let sizeModifier = parseFloat(creatureSize);
        let natureModifier = parseFloat(creatureNature);

        let totalModifier = (sizeModifier + natureModifier) / 2;
        let totalHitPoints = ThreatMinor + ThreatStandard + ThreatExceptional;
        let finalHitPoints = Math.ceil(totalHitPoints * totalModifier);

        return finalHitPoints;
    }

    function calculateThreat() {
        let hitPoints = calculateHitPoints(
            parseInt(document.getElementById("Tier 1 Threat--Minor").value),
            parseInt(document.getElementById("Tier2AddsStandardDie").value),
            parseInt(document.getElementById("Tier3AddExceptionalDie").value),
            parseFloat(document.getElementById("monsterSize").value),
            parseFloat(document.getElementById("monsterType").value)
        );

        document.getElementById("output").innerHTML = `
            <h2>Monster Hit Points</h2>
            <p>The final hit points, after applying size and nature modifiers, is ${hitPoints}.</p>
        `;
    }
</script>

</body>
</html>

