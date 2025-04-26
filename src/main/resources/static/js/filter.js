import {populateTableSelect} from './tables.js';
import {fetchAndPopulateTables} from './data.js';

export function applyFilters() {
    const filters = {
        variant: document.getElementById('variantFilter').value,
        ref: document.getElementById('refFilter').value,
        type: document.getElementById('typeFilter').value,
        assignment: document.getElementById('assignmentFilter').value
    };

    fetch('/api/filter-data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(filters)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Gefilterte Tabellennamen:', data);
            populateTableSelect(data); // Tabellennamen in die Dropdown-Liste einfügen
        })
        .catch(error => console.error('Fehler beim Anwenden der Filter:', error));
}

export async function updateFilters() {
    const response = await fetch('/api/filter-options');
    if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Filteroptionen.');
    }
    try {
        const filterOptions = await response.json();
        populateFilter('variantFilter', filterOptions.variant);
        populateFilter('refFilter', filterOptions.ref);
        populateFilter('typeFilter', filterOptions.type);
        populateFilter('assignmentFilter', filterOptions.assignment);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Filter:', error);
        alert('Ein Fehler ist aufgetreten.');
    }
}

export function populateFilter(filterId, options) {
    const filter = document.getElementById(filterId);
    filter.innerHTML = ''; // Vorherige Optionen entfernen

    // Standardoption hinzufügen
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Kein Filter --';
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
