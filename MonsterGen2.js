Sure! Here is the complete example that includes the user selectable drop downs for the threat category die size choices:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Monster Threat Calculator</title>
    <script>
        function calculateThreat() {
            // Get the values from the select elements
            let meleeDamage = document.getElementById('meleeDamage').value;
            let rangedDamage = document.getElementById('rangedDamage').value;
            let naturalDamage = document.getElementById('naturalDamage').value;
            let arcaneDamage = document.getElementById('arcaneDamage').value;

            // Populate the hidden input fields
            document.getElementById('meleeMinor').value = meleeDamage[0];
            document.getElementById('meleeStandard').value = meleeDamage[1];
            document.getElementById('meleeExceptional').value = meleeDamage[2];
            document.getElementById('rangedMinor').value = rangedDamage[0];
            document.getElementById('rangedStandard').value = rangedDamage[1];
            document.getElementById('rangedExceptional').value = rangedDamage[2];
            document.getElementById('naturalMinor').value = naturalDamage[0];
            document.getElementById('naturalStandard').value = naturalDamage[1];
            document.getElementById('naturalExceptional').value = naturalDamage[2];
            document.getElementById('arcaneMinor').value = arcaneDamage[0];
            document.getElementById('arcaneStandard').value = arcaneDamage[1];
            document.getElementById('arcaneExceptional').value = arcaneDamage[2];

            // Calculate the threat for each category
            let meleeThreat = parseInt(meleeDamage[0]) + parseInt(meleeDamage[1]) + parseInt(meleeDamage[2]);
            let rangedThreat = parseInt(rangedDamage[0]) + parseInt(rangedDamage[1]) + parseInt(rangedDamage[2]);
            let naturalThreat = parseInt(naturalDamage[0]) + parseInt(naturalDamage[1]) + parseInt(naturalDamage[2]);
            let arcaneThreat = parseInt(arcaneDamage[0]) + parseInt(arcaneDamage[1]) + parseInt(arcaneDamage[2]);

            // Get the highest threat
            let highestThreat = Math.max(meleeThreat, rangedThreat, naturalThreat, arcaneThreat);

            // Set the output
            document.getElementById('output').innerHTML = `
                <h2>Monster Threat</h2>
                <p>The highest threat is ${highestThreat}.</p>
            `;
        }
    </script>
</head>
<body>
    <h1>Monster Threat Calculator</h1>
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
            <option value="0.5">Minuscule or Tiny</option>
            <option value="1">Small or Medium</option>
            <option value="1.5">Large</option>
            <option value="2">Huge</option>
            <option value="2.5">Gargantuan</option>
        </select>

        <label for="meleeMinor">Melee Minor (MV):</label>
        <select id="meleeMinor" name="meleeMinor">