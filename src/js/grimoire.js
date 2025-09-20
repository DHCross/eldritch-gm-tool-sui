// Grimoire Viewer JavaScript Module
class GrimoireViewer {
    constructor() {
        this.spells = [];
        this.filteredSpells = [];
        this.currentSort = { column: null, ascending: true };
        this.init();
    }

    async init() {
        try {
            await this.loadSpells();
            this.setupEventListeners();
            this.populateFilters();
            this.renderSpells();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize grimoire:', error);
            this.showError();
        }
    }

    async loadSpells() {
        try {
            const response = await fetch('grimoire_index sheets - Grimoire.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            this.spells = this.parseCSV(csvText);
            this.filteredSpells = [...this.spells];
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const spells = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= headers.length) {
                const spell = {};
                headers.forEach((header, index) => {
                    spell[header.toLowerCase().replace(/[^a-z0-9]/g, '')] = values[index] || '';
                });
                
                // Only add spells that have a name
                if (spell.spellname && spell.spellname.trim()) {
                    spells.push(spell);
                }
            }
        }

        return spells;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('spellSearch');
        const clearButton = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', () => this.handleSearch());
        clearButton.addEventListener('click', () => this.clearSearch());

        // Filter functionality
        const pathFilter = document.getElementById('pathFilter');
        const rarityFilter = document.getElementById('rarityFilter');
        const effectFilter = document.getElementById('effectFilter');

        pathFilter.addEventListener('change', () => this.applyFilters());
        rarityFilter.addEventListener('change', () => this.applyFilters());
        effectFilter.addEventListener('change', () => this.applyFilters());

        // Sort functionality
        const headers = document.querySelectorAll('.grimoire-table th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortSpells(column);
            });
        });
    }

    populateFilters() {
        const paths = new Set();
        const rarities = new Set();
        const effects = new Set();

        this.spells.forEach(spell => {
            if (spell.path) paths.add(spell.path);
            if (spell.rarity) rarities.add(spell.rarity);
            if (spell.effects) effects.add(spell.effects);
        });

        this.populateSelect('pathFilter', Array.from(paths).sort());
        this.populateSelect('rarityFilter', Array.from(rarities).sort());
        this.populateSelect('effectFilter', Array.from(effects).sort());
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    handleSearch() {
        const searchTerm = document.getElementById('spellSearch').value.toLowerCase();
        this.applyFilters(searchTerm);
    }

    clearSearch() {
        document.getElementById('spellSearch').value = '';
        document.getElementById('pathFilter').value = '';
        document.getElementById('rarityFilter').value = '';
        document.getElementById('effectFilter').value = '';
        this.applyFilters();
    }

    applyFilters(searchTerm = null) {
        if (searchTerm === null) {
            searchTerm = document.getElementById('spellSearch').value.toLowerCase();
        }
        
        const pathFilter = document.getElementById('pathFilter').value;
        const rarityFilter = document.getElementById('rarityFilter').value;
        const effectFilter = document.getElementById('effectFilter').value;

        this.filteredSpells = this.spells.filter(spell => {
            const matchesSearch = !searchTerm || 
                spell.spellname.toLowerCase().includes(searchTerm) ||
                spell.path.toLowerCase().includes(searchTerm) ||
                spell.effects.toLowerCase().includes(searchTerm) ||
                spell.notes.toLowerCase().includes(searchTerm);

            const matchesPath = !pathFilter || spell.path === pathFilter;
            const matchesRarity = !rarityFilter || spell.rarity === rarityFilter;
            const matchesEffect = !effectFilter || spell.effects === effectFilter;

            return matchesSearch && matchesPath && matchesRarity && matchesEffect;
        });

        this.renderSpells();
        this.updateSpellCount();
    }

    sortSpells(column) {
        const ascending = this.currentSort.column === column ? !this.currentSort.ascending : true;
        this.currentSort = { column, ascending };

        this.filteredSpells.sort((a, b) => {
            let aValue = a[column] || '';
            let bValue = b[column] || '';
            
            // Convert to string for comparison
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
            
            if (aValue < bValue) return ascending ? -1 : 1;
            if (aValue > bValue) return ascending ? 1 : -1;
            return 0;
        });

        this.updateSortUI(column, ascending);
        this.renderSpells();
    }

    updateSortUI(column, ascending) {
        // Reset all headers
        document.querySelectorAll('.grimoire-table th').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            const arrow = th.querySelector('.sort-arrow');
            if (arrow) arrow.textContent = '↕';
        });

        // Update current header
        const currentHeader = document.querySelector(`[data-sort="${column}"]`);
        if (currentHeader) {
            currentHeader.classList.add(ascending ? 'sorted-asc' : 'sorted-desc');
            const arrow = currentHeader.querySelector('.sort-arrow');
            if (arrow) arrow.textContent = ascending ? '↑' : '↓';
        }
    }

    renderSpells() {
        const tbody = document.getElementById('spellTableBody');
        tbody.innerHTML = '';

        this.filteredSpells.forEach(spell => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="spell-name">${this.escapeHtml(spell.spellname)}</td>
                <td class="path-cell">${this.escapeHtml(spell.path)}</td>
                <td class="rarity-${spell.rarity.toLowerCase()}">${this.escapeHtml(spell.rarity)}</td>
                <td class="rank-cell">${this.escapeHtml(spell.rankdie)}</td>
                <td class="effect-${spell.effects.toLowerCase()}">${this.escapeHtml(spell.effects)}</td>
                <td class="notes-cell">${this.escapeHtml(spell.notes)}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateSpellCount() {
        const total = this.spells.length;
        const filtered = this.filteredSpells.length;
        const countElement = document.getElementById('spellCount');
        
        if (filtered === total) {
            countElement.textContent = `Displaying all ${total} spells`;
        } else {
            countElement.textContent = `Displaying ${filtered} of ${total} spells`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.grimoire-table-container').style.display = 'block';
        document.querySelector('.search-controls').style.display = 'block';
        document.querySelector('.spell-stats').style.display = 'block';
    }

    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// Initialize the grimoire viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GrimoireViewer();
});