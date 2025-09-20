// Roster page logic
// Data structure: { folders: [{ name: string, pcs: [pcId, ...] }], pcs: { [id]: { name, AD, PD, ... } } }

const FOLDERS_KEY = 'eldritch_roster_folders';
const PCS_KEY = 'eldritch_roster_pcs';

const DEFENSE_LEVELS = [
  { label: 'Practitioner', min: 8, max: 14 },
  { label: 'Competent', min: 15, max: 28 },
  { label: 'Proficient', min: 29, max: 42 },
  { label: 'Advanced', min: 43, max: 56 },
  { label: 'Elite', min: 57, max: 72 }
];

function getDefenseLevel(total, count) {
  if (!count || count <= 0) {
    return { label: 'None', range: null };
  }
  const factor = count;
  let found = null;
  for (const entry of DEFENSE_LEVELS) {
    const scaledMin = entry.min * factor;
    const scaledMax = entry.max * factor;
    if (total >= scaledMin && total <= scaledMax) {
      found = { label: entry.label, range: `${scaledMin}–${scaledMax}` };
      break;
    }
  }
  if (found) return found;
  const firstMin = DEFENSE_LEVELS[0].min * factor;
  if (total < firstMin) {
    return { label: 'Below Practitioner', range: `< ${firstMin}` };
  }
  const lastMax = DEFENSE_LEVELS[DEFENSE_LEVELS.length - 1].max * factor;
  return { label: 'Elite+', range: `> ${lastMax}` };
}

function loadFolders() {
  return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
}
function saveFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}
function loadPCs() {
  return JSON.parse(localStorage.getItem(PCS_KEY) || '{}');
}
function savePCs(pcs) {
  localStorage.setItem(PCS_KEY, JSON.stringify(pcs));
}

function findFolderIndexByName(folders, name) {
  return folders.findIndex(folder => folder.name.toLowerCase() === name.toLowerCase());
}

function renderFolders() {
  const folders = loadFolders();
  const pcs = loadPCs();
  const foldersList = document.getElementById('folders-list');
  foldersList.innerHTML = '';
  folders.forEach((folder, i) => {
    const div = document.createElement('div');
    div.className = 'folder';
    div.innerHTML = `<strong>${folder.name}</strong> <button data-folder="${i}" class="select-folder">Select</button> <button data-folder="${i}" class="delete-folder">Delete</button>`;
    const folderStats = calculateDefenseLevel(folder.pcs);
    const summaryLine = document.createElement('div');
    summaryLine.className = 'folder-summary';
    summaryLine.textContent = `Defense: AD ${folderStats.totalAD}, PD ${folderStats.totalPD}, Total ${folderStats.total} → ${folderStats.level}${folderStats.range ? ' (' + folderStats.range + ')' : ''}`;
    div.appendChild(summaryLine);
    const pcsDiv = document.createElement('div');
    pcsDiv.className = 'pcs';
    folder.pcs.forEach(pcId => {
      if (pcs[pcId]) {
        const pcDiv = document.createElement('div');
        pcDiv.className = 'pc';
        pcDiv.innerHTML = `<input type="checkbox" data-pc="${pcId}" data-folder="${i}"> ${pcs[pcId].name} <button data-pc="${pcId}" data-folder="${i}" class="remove-pc-btn">Remove from Party</button> <button data-pc="${pcId}" class="delete-pc-btn">Delete</button>`;
        const pcStats = calculateDefenseLevel([pcId]);
        const pcSummary = document.createElement('span');
        pcSummary.className = 'pc-defense-tag';
        pcSummary.textContent = `AD ${pcStats.totalAD} / PD ${pcStats.totalPD}`;
        pcDiv.appendChild(pcSummary);
        pcsDiv.appendChild(pcDiv);
      }
    });
    div.appendChild(pcsDiv);
    foldersList.appendChild(div);
  });
}

function renderPCs() {
  const pcs = loadPCs();
  const pcsList = document.getElementById('pcs-list');
  pcsList.innerHTML = '<h2>All PCs</h2>';
  Object.entries(pcs).forEach(([id, pc]) => {
    const div = document.createElement('div');
    div.className = 'pc';
    div.innerHTML = `<input type="checkbox" data-pc="${id}"> ${pc.name} <button data-pc="${id}" class="delete-pc-btn">Delete</button>`;
    pcsList.appendChild(div);
  });
  renderFolderSelect();
}

function updateSelectedFolderLabel() {
  const label = document.getElementById('selected-folder-name');
  const select = document.getElementById('folder-select');
  if (!label || !select) return;
  const folders = loadFolders();
  const idx = select.value;
  if (idx === '' || !folders[idx]) {
    label.textContent = 'None';
  } else {
    label.textContent = folders[idx].name;
  }
}

function renderFolderSelect() {
  const folders = loadFolders();
  const select = document.getElementById('folder-select');
  if (!select) return;
  const previousValue = select.value;
  select.innerHTML = '';
  folders.forEach((folder, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = folder.name;
    select.appendChild(opt);
  });
  if (previousValue !== '' && select.querySelector(`option[value="${previousValue}"]`)) {
    select.value = previousValue;
  }
  populateManualFolderSelect(folders);
  updateSelectedFolderLabel();
}

function getSelectedPCs() {
  const checked = document.querySelectorAll('input[type="checkbox"][data-pc]:checked');
  return Array.from(checked).map(cb => cb.getAttribute('data-pc'));
}

function calculateDefenseLevel(selectedPCs) {
  const pcs = loadPCs();
  let totalAD = 0, totalPD = 0;
  let validCount = 0;
  selectedPCs.forEach(id => {
    if (pcs[id]) {
      totalAD += Number(pcs[id].AD || 0);
      totalPD += Number(pcs[id].PD || 0);
      validCount += 1;
    }
  });
  const total = totalAD + totalPD;
  const levelInfo = getDefenseLevel(total, validCount);
  return { totalAD, totalPD, total, count: validCount, level: levelInfo.label, range: levelInfo.range };
}

function updateDefenseSummary() {
  const selected = getSelectedPCs();
  if (selected.length === 0) {
    document.getElementById('defense-summary').textContent = 'Select a party or PCs to view defense level.';
    localStorage.removeItem('eldritch_party_defense');
    return;
  }
  const stats = calculateDefenseLevel(selected);
  const summaryText = `Active Defense: ${stats.totalAD}, Passive Defense: ${stats.totalPD}, Total: ${stats.total} → Defense Level: ${stats.level}${stats.range ? ' (' + stats.range + ')' : ''}`;
  document.getElementById('defense-summary').textContent = summaryText;
  localStorage.setItem('eldritch_party_defense', JSON.stringify({ totalAD: stats.totalAD, totalPD: stats.totalPD, total: stats.total, tier: stats.level, range: stats.range }));
}


function deletePC(pcId) {
  if (!pcId) return;
  if (!confirm('Delete this character from the roster?')) return;
  const pcs = loadPCs();
  if (!pcs[pcId]) return;
  delete pcs[pcId];
  savePCs(pcs);
  const folders = loadFolders();
  folders.forEach(folder => {
    folder.pcs = folder.pcs.filter(id => id !== pcId);
  });
  saveFolders(folders);
  renderFolders();
  renderPCs();
  updateDefenseSummary();
}

function setupEvents() {
  const addFolderBtn = document.getElementById('add-folder-btn');
  if (addFolderBtn) {
    addFolderBtn.onclick = () => {
      const input = document.getElementById('new-folder-name');
      const desiredName = (input && input.value.trim()) || 'Party';
      const folders = loadFolders();
      if (findFolderIndexByName(folders, desiredName) === -1) {
        folders.push({ name: desiredName, pcs: [] });
        saveFolders(folders);
      }
      renderFolders();
      renderFolderSelect();
      const folderSelect = document.getElementById('folder-select');
      const newIndex = findFolderIndexByName(loadFolders(), desiredName);
      if (folderSelect && newIndex !== -1) folderSelect.value = String(newIndex);
      if (input) input.value = '';
    };
  }

  const folderSelectControl = document.getElementById('folder-select');
  if (folderSelectControl) {
    folderSelectControl.addEventListener('change', updateSelectedFolderLabel);
  }

  const manualForm = document.getElementById('manual-pc-form');
  if (manualForm) {
    manualForm.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('manual-name');
      const playerInput = document.getElementById('manual-player');
      const genderSelect = document.getElementById('manual-gender');
      const adInput = document.getElementById('manual-ad');
      const pdInput = document.getElementById('manual-pd');
      const summaryInput = document.getElementById('manual-summary');
      const folderSelect = document.getElementById('manual-folder-select');
      const newFolderInput = document.getElementById('manual-new-folder');

      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        alert('Please provide a character name.');
        if (nameInput) nameInput.focus();
        return;
      }

      const player = playerInput ? playerInput.value.trim() : '';
      const gender = genderSelect ? genderSelect.value : '';
      const ad = adInput && adInput.value.trim() !== '' ? Math.max(0, Number(adInput.value.trim())) : 0;
      const pd = pdInput && pdInput.value.trim() !== '' ? Math.max(0, Number(pdInput.value.trim())) : 0;
      const summary = summaryInput ? summaryInput.value.trim() : '';

      const pcs = loadPCs();
      const id = `manual_${Date.now()}`;
      pcs[id] = {
        name,
        player,
        gender,
        summary,
        AD: ad,
        PD: pd,
        details: {
          source: 'manual-entry',
          summary
        }
      };
      savePCs(pcs);

      let folders = loadFolders();
      const newFolderName = newFolderInput ? newFolderInput.value.trim() : '';
      let folderIdx = -1;
      if (newFolderName) {
        folderIdx = findFolderIndexByName(folders, newFolderName);
        if (folderIdx === -1) {
          folders.push({ name: newFolderName, pcs: [] });
          folderIdx = folders.length - 1;
        }
      } else if (folderSelect && folderSelect.value !== '') {
        folderIdx = parseInt(folderSelect.value, 10);
        if (Number.isNaN(folderIdx)) folderIdx = -1;
      }

      if (folderIdx !== -1 && folders[folderIdx]) {
        if (!Array.isArray(folders[folderIdx].pcs)) folders[folderIdx].pcs = [];
        if (!folders[folderIdx].pcs.includes(id)) {
          folders[folderIdx].pcs.push(id);
        }
        saveFolders(folders);
      }

      renderPCs();
      renderFolders();
      updateDefenseSummary();

      manualForm.reset();
      populateManualFolderSelect(loadFolders());
    });
  }

  document.getElementById('add-to-folder-btn').onclick = () => {
    const selectedPCs = getSelectedPCs();
    if (!selectedPCs.length) return;
    const folders = loadFolders();
    let partyIdx = findFolderIndexByName(folders, 'Party');
    if (partyIdx === -1) {
      folders.push({ name: 'Party', pcs: [] });
      partyIdx = folders.length - 1;
    }
    folders.forEach(folder => {
      folder.pcs = folder.pcs.filter(pcId => !selectedPCs.includes(pcId));
    });
    const partyFolder = folders[partyIdx];
    selectedPCs.forEach(pcId => {
      if (!partyFolder.pcs.includes(pcId)) partyFolder.pcs.push(pcId);
    });
    saveFolders(folders);
    renderFolders();
    renderFolderSelect();
    const folderSelect = document.getElementById('folder-select');
    if (folderSelect) folderSelect.value = String(partyIdx);
    updateDefenseSummary();
  };
  document.getElementById('remove-from-folder-btn').onclick = () => {
    const selectedPCs = getSelectedPCs();
    const folderIdx = document.getElementById('folder-select').value;
    if (!selectedPCs.length || folderIdx === '') return;
    const folders = loadFolders();
    folders[folderIdx].pcs = folders[folderIdx].pcs.filter(pcId => !selectedPCs.includes(pcId));
    saveFolders(folders);
    renderFolders();
    renderFolderSelect();
    updateDefenseSummary();
  };
  document.getElementById('folders-list').onclick = e => {
    if (e.target.classList.contains('remove-pc-btn')) {
      const folderIdx = e.target.getAttribute('data-folder');
      const pcId = e.target.getAttribute('data-pc');
      const folders = loadFolders();
      folders[folderIdx].pcs = folders[folderIdx].pcs.filter(id => id !== pcId);
      saveFolders(folders);
      renderFolders();
      renderFolderSelect();
      updateDefenseSummary();
      return;
    }
    if (e.target.classList.contains('delete-pc-btn')) {
      const pcId = e.target.getAttribute('data-pc');
      deletePC(pcId);
      return;
    }
    if (e.target.classList.contains('select-folder')) {
      // Select all PCs in folder
      const folderIdx = e.target.getAttribute('data-folder');
      const folders = loadFolders();
      if (folders[folderIdx]) {
        document.querySelectorAll('input[type="checkbox"][data-pc]').forEach(cb => cb.checked = false);
        folders[folderIdx].pcs.forEach(pcId => {
          const cb = document.querySelector(`input[type="checkbox"][data-pc="${pcId}"]`);
          if (cb) cb.checked = true;
        });
        updateDefenseSummary();
      }
    } else if (e.target.classList.contains('delete-folder')) {
      const folderIdx = e.target.getAttribute('data-folder');
      const folders = loadFolders();
      folders.splice(folderIdx, 1);
      saveFolders(folders);
      renderFolders();
      renderFolderSelect();
    }
  };
  document.getElementById('pcs-list').onclick = e => {
    if (e.target.type === 'checkbox') {
      updateDefenseSummary();
      return;
    }
    if (e.target.classList.contains('delete-pc-btn')) {
      const pcId = e.target.getAttribute('data-pc');
      deletePC(pcId);
    }
  };
  document.getElementById('folders-list').onchange = e => {
    if (e.target.type === 'checkbox') {
      updateDefenseSummary();
    }
  };
}

function initRoster() {
  renderFolders();
  renderPCs();
  setupEvents();
}

document.addEventListener('DOMContentLoaded', initRoster);

function populateManualFolderSelect(folders) {
  const manualSelect = document.getElementById('manual-folder-select');
  if (!manualSelect) return;
  const previousValue = manualSelect.value;
  manualSelect.innerHTML = '<option value="">-- No folder --</option>';
  folders.forEach((folder, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = folder.name;
    manualSelect.appendChild(opt);
  });
  if (previousValue !== '' && manualSelect.querySelector(`option[value="${previousValue}"]`)) {
    manualSelect.value = previousValue;
  }
}

// For integration: Add function to export selected party defense to encounter generator
window.getPartyDefenseLevel = function() {
  const selected = getSelectedPCs();
  return calculateDefenseLevel(selected);
};

// For demo: Add dummy PCs if none exist
if (Object.keys(loadPCs()).length === 0) {
  const pcs = {
    'pc1': { name: 'Arin the Warrior', AD: 22, PD: 18 },
    'pc2': { name: 'Lira the Mage', AD: 14, PD: 12 },
    'pc3': { name: 'Dorn the Rogue', AD: 16, PD: 15 },
    'pc4': { name: 'Mira the Theurgist', AD: 18, PD: 17 }
  };
  savePCs(pcs);
}
