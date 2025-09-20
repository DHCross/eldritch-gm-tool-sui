// NPC Roster logic

const NPC_FOLDERS_KEY = 'eldritch_npc_roster_folders';
const NPC_RECORDS_KEY = 'eldritch_npc_roster_records';

const NPC_DEFENSE_LEVELS = [
  { label: 'Practitioner', min: 8, max: 14 },
  { label: 'Competent', min: 15, max: 28 },
  { label: 'Proficient', min: 29, max: 42 },
  { label: 'Advanced', min: 43, max: 56 },
  { label: 'Elite', min: 57, max: 72 }
];

function npcLoadFolders() {
  return JSON.parse(localStorage.getItem(NPC_FOLDERS_KEY) || '[]');
}
function npcSaveFolders(folders) {
  localStorage.setItem(NPC_FOLDERS_KEY, JSON.stringify(folders));
}
function npcLoadRecords() {
  return JSON.parse(localStorage.getItem(NPC_RECORDS_KEY) || '{}');
}
function npcSaveRecords(records) {
  localStorage.setItem(NPC_RECORDS_KEY, JSON.stringify(records));
}

function npcFindFolderIndexByName(folders, name) {
  return folders.findIndex(folder => folder.name.toLowerCase() === name.toLowerCase());
}

function npcGetDefenseLevel(total, count) {
  if (!count || count <= 0) {
    return { label: 'None', range: null };
  }
  const factor = count;
  let found = null;
  for (const entry of NPC_DEFENSE_LEVELS) {
    const scaledMin = entry.min * factor;
    const scaledMax = entry.max * factor;
    if (total >= scaledMin && total <= scaledMax) {
      found = { label: entry.label, range: `${scaledMin}–${scaledMax}` };
      break;
    }
  }
  if (found) return found;
  const firstMin = NPC_DEFENSE_LEVELS[0].min * factor;
  if (total < firstMin) {
    return { label: 'Below Practitioner', range: `< ${firstMin}` };
  }
  const lastMax = NPC_DEFENSE_LEVELS[NPC_DEFENSE_LEVELS.length - 1].max * factor;
  return { label: 'Elite+', range: `> ${lastMax}` };
}

function npcCalculateDefense(ids) {
  const records = npcLoadRecords();
  let totalAD = 0;
  let totalPD = 0;
  let valid = 0;
  ids.forEach(id => {
    const entry = records[id];
    if (!entry) return;
    totalAD += Number(entry.AD || 0);
    totalPD += Number(entry.PD || 0);
    valid += 1;
  });
  const total = totalAD + totalPD;
  const info = npcGetDefenseLevel(total, valid);
  return { totalAD, totalPD, total, count: valid, level: info.label, range: info.range };
}

function npcRenderFolders() {
  const folders = npcLoadFolders();
  const records = npcLoadRecords();
  const list = document.getElementById('npc-folders-list');
  list.innerHTML = '';
  folders.forEach((folder, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'npc-folder';
    wrapper.innerHTML = `<strong>${folder.name}</strong> <button data-folder="${idx}" class="npc-select-folder">Select</button> <button data-folder="${idx}" class="npc-delete-folder">Delete</button>`;
    const folderStats = npcCalculateDefense(folder.npcs || []);
    const summary = document.createElement('div');
    summary.className = 'npc-folder-summary';
    summary.textContent = `Defense: AD ${folderStats.totalAD}, PD ${folderStats.totalPD}, Total ${folderStats.total} → ${folderStats.level}${folderStats.range ? ' (' + folderStats.range + ')' : ''}`;
    wrapper.appendChild(summary);
    const entriesDiv = document.createElement('div');
    entriesDiv.className = 'npc-entries';
    (folder.npcs || []).forEach(id => {
      const record = records[id];
      if (!record) return;
      const row = document.createElement('div');
      row.className = 'npc-entry';
      row.innerHTML = `<input type="checkbox" data-npc="${id}" data-folder="${idx}"> ${record.name || 'Unnamed'} <button data-npc="${id}" data-folder="${idx}" class="npc-remove-btn">Remove from Folder</button> <button data-npc="${id}" class="npc-delete-btn">Delete</button>`;
      const stats = npcCalculateDefense([id]);
      const tag = document.createElement('span');
      tag.className = 'npc-defense-tag';
      tag.textContent = `AD ${stats.totalAD} / PD ${stats.totalPD}`;
      row.appendChild(tag);
      if (record.notes) {
        const note = document.createElement('span');
        note.style.marginLeft = '0.5em';
        note.style.fontStyle = 'italic';
        note.textContent = `— ${record.notes}`;
        row.appendChild(note);
      }
      entriesDiv.appendChild(row);
    });
    wrapper.appendChild(entriesDiv);
    list.appendChild(wrapper);
  });
}

function npcRenderAllRecords() {
  const records = npcLoadRecords();
  const container = document.getElementById('npc-list');
  container.innerHTML = '<h2>All NPCs</h2>';
  Object.entries(records).forEach(([id, record]) => {
    const row = document.createElement('div');
    row.className = 'npc-entry';
    row.innerHTML = `<input type="checkbox" data-npc="${id}"> ${record.name || 'Unnamed'} <button data-npc="${id}" class="npc-delete-btn">Delete</button>`;
    if (record.notes) {
      const note = document.createElement('span');
      note.style.marginLeft = '0.5em';
      note.style.fontStyle = 'italic';
      note.textContent = `— ${record.notes}`;
      row.appendChild(note);
    }
    container.appendChild(row);
  });
  npcPopulateManualFolderSelect(npcLoadFolders());
}

function npcPopulateManualFolderSelect(folders) {
  const select = document.getElementById('manual-npc-folder-select');
  if (!select) return;
  const prev = select.value;
  select.innerHTML = '<option value="">-- No folder --</option>';
  folders.forEach((folder, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = folder.name;
    select.appendChild(opt);
  });
  if (prev !== '' && select.querySelector(`option[value="${prev}"]`)) {
    select.value = prev;
  }
  npcUpdateSelectedFolderLabel();
}

function npcUpdateSelectedFolderLabel() {
  const label = document.getElementById('npc-selected-folder-name');
  const select = document.getElementById('npc-folder-select');
  if (!label || !select) return;
  const folders = npcLoadFolders();
  const idx = select.value;
  if (idx === '' || !folders[idx]) {
    label.textContent = 'None';
  } else {
    label.textContent = folders[idx].name;
  }
}

function npcPopulateFolderSelect() {
  const folders = npcLoadFolders();
  const select = document.getElementById('npc-folder-select');
  if (!select) return;
  const prev = select.value;
  select.innerHTML = '';
  folders.forEach((folder, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = folder.name;
    select.appendChild(opt);
  });
  if (prev !== '' && select.querySelector(`option[value="${prev}"]`)) {
    select.value = prev;
  }
  npcUpdateSelectedFolderLabel();
}

function npcGetSelected() {
  return Array.from(document.querySelectorAll('input[type="checkbox"][data-npc]:checked')).map(cb => cb.getAttribute('data-npc'));
}

function npcDeleteRecord(id) {
  if (!id) return;
  if (!confirm('Delete this NPC?')) return;
  const records = npcLoadRecords();
  if (!records[id]) return;
  delete records[id];
  npcSaveRecords(records);
  const folders = npcLoadFolders();
  folders.forEach(folder => {
    folder.npcs = (folder.npcs || []).filter(entry => entry !== id);
  });
  npcSaveFolders(folders);
  npcRenderFolders();
  npcRenderAllRecords();
}

function npcSetupEvents() {
  const addFolderBtn = document.getElementById('npc-add-folder-btn');
  if (addFolderBtn) {
    addFolderBtn.onclick = () => {
      const input = document.getElementById('npc-folder-name');
      const desired = (input && input.value.trim()) || 'New Folder';
      const folders = npcLoadFolders();
      if (npcFindFolderIndexByName(folders, desired) === -1) {
        folders.push({ name: desired, npcs: [] });
        npcSaveFolders(folders);
      }
      npcRenderFolders();
      npcPopulateFolderSelect();
      npcPopulateManualFolderSelect(npcLoadFolders());
      if (input) input.value = '';
    };
  }

  const folderSelectCtrl = document.getElementById('npc-folder-select');
  if (folderSelectCtrl) {
    folderSelectCtrl.addEventListener('change', npcUpdateSelectedFolderLabel);
  }

  const manualForm = document.getElementById('manual-npc-form');
  if (manualForm) {
    manualForm.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('manual-npc-name');
      const notesInput = document.getElementById('manual-npc-notes');
      const adInput = document.getElementById('manual-npc-ad');
      const pdInput = document.getElementById('manual-npc-pd');
      const folderSelect = document.getElementById('manual-npc-folder-select');
      const newFolderInput = document.getElementById('manual-npc-new-folder');

      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        alert('Please provide an NPC name.');
        if (nameInput) nameInput.focus();
        return;
      }

      const notes = notesInput ? notesInput.value.trim() : '';
      const ad = adInput && adInput.value.trim() !== '' ? Math.max(0, Number(adInput.value.trim())) : 0;
      const pd = pdInput && pdInput.value.trim() !== '' ? Math.max(0, Number(pdInput.value.trim())) : 0;

      const records = npcLoadRecords();
      const id = `npc_${Date.now()}`;
      records[id] = { name, notes, AD: ad, PD: pd };
      npcSaveRecords(records);

      let folders = npcLoadFolders();
      const newFolderName = newFolderInput ? newFolderInput.value.trim() : '';
      let folderIdx = -1;
      if (newFolderName) {
        folderIdx = npcFindFolderIndexByName(folders, newFolderName);
        if (folderIdx === -1) {
          folders.push({ name: newFolderName, npcs: [] });
          folderIdx = folders.length - 1;
        }
      } else if (folderSelect && folderSelect.value !== '') {
        folderIdx = parseInt(folderSelect.value, 10);
        if (Number.isNaN(folderIdx)) folderIdx = -1;
      }

      if (folderIdx !== -1 && folders[folderIdx]) {
        if (!Array.isArray(folders[folderIdx].npcs)) folders[folderIdx].npcs = [];
        if (!folders[folderIdx].npcs.includes(id)) folders[folderIdx].npcs.push(id);
        npcSaveFolders(folders);
      }

      npcRenderFolders();
      npcRenderAllRecords();
      npcPopulateFolderSelect();
      manualForm.reset();
    });
  }

  const addToFolderBtn = document.getElementById('npc-add-to-folder-btn');
  if (addToFolderBtn) {
    addToFolderBtn.onclick = () => {
      const selected = npcGetSelected();
      const target = document.getElementById('npc-folder-select').value;
      if (!selected.length || target === '') return;
      const folders = npcLoadFolders();
      if (!folders[target]) return;
      folders.forEach(folder => {
        folder.npcs = (folder.npcs || []).filter(id => !selected.includes(id));
      });
      folders[target].npcs = [...(folders[target].npcs || []), ...selected];
      npcSaveFolders(folders);
      npcRenderFolders();
      npcRenderAllRecords();
    };
  }

  const removeFromFolderBtn = document.getElementById('npc-remove-from-folder-btn');
  if (removeFromFolderBtn) {
    removeFromFolderBtn.onclick = () => {
      const selected = npcGetSelected();
      const target = document.getElementById('npc-folder-select').value;
      if (!selected.length || target === '') return;
      const folders = npcLoadFolders();
      if (!folders[target]) return;
      folders[target].npcs = (folders[target].npcs || []).filter(id => !selected.includes(id));
      npcSaveFolders(folders);
      npcRenderFolders();
      npcRenderAllRecords();
    };
  }

  const foldersList = document.getElementById('npc-folders-list');
  foldersList.addEventListener('click', e => {
    if (e.target.classList.contains('npc-remove-btn')) {
      const folderIdx = e.target.getAttribute('data-folder');
      const npcId = e.target.getAttribute('data-npc');
      const folders = npcLoadFolders();
      if (folders[folderIdx]) {
        folders[folderIdx].npcs = (folders[folderIdx].npcs || []).filter(id => id !== npcId);
        npcSaveFolders(folders);
        npcRenderFolders();
      }
      return;
    }
    if (e.target.classList.contains('npc-delete-btn')) {
      npcDeleteRecord(e.target.getAttribute('data-npc'));
      return;
    }
    if (e.target.classList.contains('npc-select-folder')) {
      const idx = e.target.getAttribute('data-folder');
      const folders = npcLoadFolders();
      if (folders[idx]) {
        document.querySelectorAll('input[type="checkbox"][data-npc]').forEach(cb => cb.checked = false);
        (folders[idx].npcs || []).forEach(id => {
          const checkbox = document.querySelector(`input[type="checkbox"][data-npc="${id}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      return;
    }
    if (e.target.classList.contains('npc-delete-folder')) {
      const idx = e.target.getAttribute('data-folder');
      const folders = npcLoadFolders();
      folders.splice(idx, 1);
      npcSaveFolders(folders);
      npcRenderFolders();
      npcPopulateFolderSelect();
      npcPopulateManualFolderSelect(folders);
    }
  });

  const npcList = document.getElementById('npc-list');
  npcList.addEventListener('click', e => {
    if (e.target.classList.contains('npc-delete-btn')) {
      npcDeleteRecord(e.target.getAttribute('data-npc'));
    }
  });
}

function initNpcRoster() {
  npcRenderFolders();
  npcRenderAllRecords();
  npcPopulateFolderSelect();
  npcSetupEvents();
}

document.addEventListener('DOMContentLoaded', initNpcRoster);
