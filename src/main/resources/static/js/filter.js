import {populateTableSelect} from './tables/tables.js';
import {sendRequestToBackend} from './utils/utils.js';
import {invertMapAssignment, mapAssignment} from './utils/mapping.js';

export async function getMatchingTablesForFilters(filters) {
    const url = '/api/filter-data';
    const data = await sendRequestToBackend(filters, url);
    if (!data) return null;
    return data;
}

export function getAppliedFilters() {

    const revertedAssignment = invertMapAssignment(document.getElementById('typeFilter').value);
    const revertedConstraint = invertMapAssignment(document.getElementById('constraintValue').value);

    const filters = [
        {key: 'ref', operator: '=', value: document.getElementById('objectFilter').value},
        {key: 'type', operator: '=', value: revertedAssignment.type},
        {key: 'assignment', operator: '=', value: revertedAssignment.assignment},
        {key: 'constraint type', operator: '=', value: revertedConstraint.type},
        {key: 'value', operator: '<=', value: revertedConstraint.assignment}
    ].filter(f => f.value !== '');
    return filters;
}

export async function applyFilters() {
    const filters = getAppliedFilters(); // Leere Filter entfernen
    const data = await getMatchingTablesForFilters(filters);
    if (!data) {
        return;
    }
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

    const secondUrl = '/api/get-type-assignment-pairs';
    const typeAssignmentPairs = await sendRequestToBackend(null, secondUrl);
    if (!typeAssignmentPairs) {
        console.error('Fehler beim Abrufen der Filteroptionen.');
        return;
    }

    populateTypeFilter('typeFilter', typeAssignmentPairs);

    const thirdUrl = '/api/get-constraint-value-pairs';
    const constraintValuePairs = await sendRequestToBackend(null, thirdUrl);
    if (!constraintValuePairs) {
        console.error('Fehler beim Abrufen der Constraints.');
        return;
    }
    populateTypeFilter('constraintValue', constraintValuePairs);
}

export function populateFilter(htmlElementId, options) {
    const filter = document.getElementById(htmlElementId);
    filter.innerHTML = ''; // Vorherige Optionen entfernen

    addDefaultOption(filter);

    // Filteroptionen hinzufügen
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        filter.appendChild(opt);
    });
}

function addDefaultOption(filter) {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Alle --';
    filter.appendChild(defaultOption);
}

export function populateTypeFilter(htmlElementId, typeAssignments) {
    const filter = document.getElementById(htmlElementId);
    filter.innerHTML = ''; // Vorherige Optionen entfernen
    console.log("type: " + typeAssignments);

    // Standardoption hinzufügen
    addDefaultOption(filter);

    // Filteroptionen hinzufügen
    typeAssignments.forEach(entry => {

        const type = entry.type ? entry.type : entry['constraint type'];
        const assignment = entry.assignment ? entry.assignment : entry['value'];

        const opt = document.createElement('option');
        opt.value = mapAssignment(type, assignment);
        opt.textContent = mapAssignment(type, assignment); // mapAssignment aufrufen
        filter.appendChild(opt);
    });
}


export function resetFilters() {
    const filters = document.querySelectorAll('.filter-section select'); // Nur <select>-Elemente innerhalb von .filter-section auswählen
    filters.forEach(filter => {
        if (filter instanceof HTMLSelectElement) {
            filter.selectedIndex = 0; // Auswahl auf die erste Option zurücksetzen
            console.log("filter: " + filter.id + " zurückgesetzt");
        }
    });
    console.log('Filter zurückgesetzt');
}
