<!DOCTYPE html>
<html>
<head>
    <title>Monster Hit Points Calculator</title>
</head>
<body>
    <h1>Monster Hit Points Calculator</h1>
    <form id="monsterForm">
        <!-- Your form elements here -->
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
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="meleeStandard">Melee Standard (MV):</label>
        <select id="meleeStandard" name="meleeStandard">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="meleeExceptional">Melee Exceptional (MV):</label>
        <select id="meleeExceptional" name="meleeExceptional">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="naturalMinor">Natural Minor (MV):</label>
        <select id="naturalMinor" name="naturalMinor">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="naturalStandard">Natural Standard (MV):</label>
        <select id="naturalStandard" name="naturalStandard">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="naturalExceptional">Natural Exceptional (MV):</label>
        <select id="naturalExceptional" name="naturalExceptional">
            <option value="4">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="rangedMinor">Ranged Minor (MV):</label>
        <select id="rangedMinor" name="rangedMinor">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="rangedStandard">Ranged Standard (MV):</label>
        <select id="rangedStandard" name="rangedStandard">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="rangedExceptional">Ranged Exceptional (MV):</label>
        <select id="rangedExceptional" name="rangedExceptional">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="arcaneMinor">Arcane/Magic Minor (MV):</label>
        <select id="arcaneMinor" name="arcaneMinor">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="arcaneStandard">Arcane/Magic Standard (MV):</label>
        <select id="arcaneStandard" name="arcaneStandard">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <label for="arcaneExceptional">Arcane/Magic Exceptional (MV):</label>
        <select id="arcaneExceptional" name="arcaneExceptional">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
        </select>

        <input type="submit" value="Calculate Threat">
    </form>

    <div id="output"></div>

    <!-- Your form elements here -->
        <input type="submit" value="Calculate Hit Points">
    </form>

    <div id="output"></div>

    <script>
        document.getElementById('monsterForm').addEventListener('submit', function(event) {
            // Prevent the form from submitting normally
            event.preventDefault();

            // Get the user's input
            let meleeMinor = document.getElementById('meleeMinor').value;
            let meleeStandard = document.getElementById('meleeStandard').value;
            let meleeExceptional = document.getElementById('meleeExceptional').value;
            let rangedMinor = document.getElementById('rangedMinor').value;
            let rangedStandard = document.getElementById('rangedStandard').value;
            let rangedExceptional = document.getElementById('rangedExceptional').value;
            let naturalMinor = document.getElementById('naturalMinor').value;
            let naturalStandard = document.getElementById('naturalStandard').value;
            let naturalExceptional = document.getElementById('naturalExceptional').value;
            let arcaneMinor = document.getElementById('arcaneMinor').value;
            let arcaneStandard = document.getElementById('arcaneStandard').value;
            let arcaneExceptional = document.getElementById('arcaneExceptional').value;

            // Calculate the hit points for each category
            let meleeHitPoints = parseInt(meleeMinor) + parseInt(meleeStandard) + parseInt(meleeExceptional);
            let rangedHitPoints = parseInt(rangedMinor) + parseInt(rangedStandard) + parseInt(rangedExceptional);
            let naturalHitPoints = parseInt(naturalMinor) + parseInt(naturalStandard) + parseInt(naturalExceptional);
            let arcaneHitPoints = parseInt(arcaneMinor) + parseInt(arcaneStandard) + parseInt(arcaneExceptional);

            // Get the highest hit points
            let highestHitPoints = Math.max(meleeHitPoints, rangedHitPoints, naturalHitPoints, arcaneHitPoints);

            // Set the output
            document.getElementById('output').innerHTML = `
                <h2>Monster Hit Points</h2>
                <p>The highest hit points is ${highestHitPoints}.</p>
            `;
        });
    </script>
</body>
</html>


