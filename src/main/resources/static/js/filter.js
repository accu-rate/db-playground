import {populateTableSelect} from './tables.js';
import {fetchAndPopulateTables} from './data.js';
import {sendRequestToBackend} from './utils.js';

export async function applyFilters() {
    const filters = {
        variant: document.getElementById('variantFilter').value,
        ref: document.getElementById('refFilter').value,
        type: document.getElementById('typeFilter').value,
        assignment: document.getElementById('assignmentFilter').value
    };
    const url = '/api/filter-data';
    const data = await sendRequestToBackend(filters, url);
    if (!data) return;
    console.log('Gefilterte Tabellennamen:', data);
    populateTableSelect(data); // Tabellennamen in die Dropdown-Liste einfügen
}

export async function updateFilters() {
    const url = '/api/filter-options';
    const filterOptions = await sendRequestToBackend(null, url);

    if (!filterOptions) {
        console.error('Fehler beim Abrufen der Filteroptionen.');
        return;
    }
    populateFilter('variantFilter', filterOptions.variant);
    populateFilter('refFilter', filterOptions.ref);
    populateFilter('typeFilter', filterOptions.type);
    populateFilter('assignmentFilter', filterOptions.assignment);

}

export function populateFilter(filterId, options) {
    const filter = document.getElementById(filterId);
    filter.innerHTML = ''; // Vorherige Optionen entfernen

    // Standardoption hinzufügen
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Alle --';
    filter.appendChild(defaultOption);

    // Filteroptionen hinzufügen
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        filter.appendChild(opt);
    });
}

export function resetFilters() {
    const filterIds = ['variantFilter', 'refFilter', 'typeFilter', 'assignmentFilter'];
    filterIds.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
    fetchAndPopulateTables();
}
