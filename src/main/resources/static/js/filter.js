import {populateTableSelect} from './tables/tables.js';
import {fetchAndPopulateTables} from './data.js';
import {sendRequestToBackend} from './utils.js';

export async function applyFilters() {
    const filters = [
        { key: 'ref', operator: '=', value: document.getElementById('objectFilter').value },
        { key: 'type', operator: '=', value: document.getElementById('typeFilter').value },
        { key: 'assignment', operator: '=', value: document.getElementById('assignmentFilter').value },
        { key: 'constraint type', operator: '=', value: document.getElementById('constraintTypeFilter').value },
        { key: 'value', operator: '<=', value: document.getElementById('valueFilter').value }
     ].filter(f => f.value !== ''); // Leere Filter entfernen


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

    const filterForm = document.getElementById('filterForm'); // Formular-Element auswählen

    if (Object.keys(filterOptions).length === 0) {
         filterForm.classList.add('hidden'); // Formular ausblenden
        return;
    }
    filterForm.classList.remove('hidden'); // Formular anzeigen, falls es sichtbar sein soll
    populateFilter('objectFilter', filterOptions.ref);
    populateFilter('typeFilter', filterOptions.type);
    populateFilter('assignmentFilter', filterOptions.assignment);
    populateFilter('constraintTypeFilter', filterOptions.constraint_type);
    populateFilter('valueFilter', filterOptions.value);
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
    const filters = document.querySelectorAll('.filter-section'); // Elemente mit der Klasse 'filter-class' auswählen
    filters.forEach(filter => {
        if (filter instanceof HTMLSelectElement) {
            filter.value = ''; // Zurücksetzen des Wertes
        }
    });
    fetchAndPopulateTables();
}
