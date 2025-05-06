import {populateTableSelect} from './tables/tables.js';
import {sendRequestToBackend} from './utils/utils.js';
import {invertMapAssignment, mapAssignment, mapType} from './utils/mapping.js';
import {filterTypeElement, filterAssignmentLabel} from './constants.js';

export async function getMatchingTablesForFilters(filters) {
    if (filters.length === 0) {
        console.log("getMatchingTablesForFilters: called without any filters.");
    }
    const url = '/api/filter-data';
    const data = await sendRequestToBackend(filters, url);
    if (!data) return null;
    return data;
}

export function getAppliedFilters() {
    const revertedConstraint = invertMapAssignment(document.getElementById('constraintValue').value);

    const filters = [
        {key: 'ref', operator: '=', value: document.getElementById('objectFilter').value},
        {key: 'type', operator: '=', value: document.getElementById(filterTypeElement).value},
        {key: 'assignment', operator: '=', value: document.getElementById('filterAssignment').value},
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
    populateTableSelect(data);
}

export async function initFilter() {
    const url = '/api/get-filter-types';
    const filterTypes = await sendRequestToBackend(null, url);

    if (!filterTypes) {
        console.error('Fehler beim Abrufen der Filteroptionen.');
        return;
    }
    const filterForm = document.getElementById('filterForm'); // Formular-Element auswählen

    if (Object.keys(filterTypes).length === 0) {
        filterForm.classList.add('hidden'); // hide form
        return;
    }
    filterForm.classList.remove('hidden');
    populateFilter(filterTypeElement, filterTypes.map(entry => entry.type), true);

    const constraintURL = '/api/get-constraint-value-pairs';
    const constraintValuePairs = await sendRequestToBackend(null, constraintURL);
    if (!constraintValuePairs) {
        console.error('Fehler beim Abrufen der Constraints.');
        return;
    }
    populateConstraintFilter('constraintValue', constraintValuePairs);
    initEventListenerForTypeChange();
}

export function populateFilter(htmlElementId, options, translate) {
    const filter = document.getElementById(htmlElementId);
    addDefaultOption(filter);

    // Filteroptionen hinzufügen
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = translate ? mapType(option) : option;
        filter.appendChild(opt);
    });
}


function addDefaultOption(filter) {
    filter.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Alle --';
    filter.appendChild(defaultOption);
}

export function initEventListenerForTypeChange() {
    const typeFilter = document.getElementById(filterTypeElement);
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            populatePossibleAssignments(typeFilter.value);
            initEventListenerForAssignmentChange(typeFilter.value);
        });
    }
}

async function populatePossibleAssignments(filterType) {
    const url = `/api/get-filter-values?type=${encodeURIComponent(filterType)}`;
    const values = await sendRequestToBackend(null, url);
    console.log("values: " + values.entries());

    if (!values) {
        console.error('Fehler beim Abrufen der Filteroptionen.');
        return;
    }
    populateFilter(filterAssignmentLabel, values.map(entry => entry.assignment, false));

}

export function initEventListenerForAssignmentChange(typeValue) {
    const filterAssignment = document.getElementById(filterAssignmentLabel);
    if (filterAssignment) {
        filterAssignment.addEventListener('change', (event) => {
            populatePossibleObjects(typeValue, filterAssignment.value);
        });
    }
}

async function populatePossibleObjects(filterType, filterAssignment) {
    const url = `/api/get-objects-for-filter?type=${encodeURIComponent(filterType)}&assignment=${encodeURIComponent(filterAssignment)}`;
    const values = await sendRequestToBackend(null, url);
    console.log("values: " + values.entries());

    if (!values) {
        console.error('Fehler beim Abrufen der Filteroptionen.');
        return;
    }
    populateFilter('objectFilter', values.map(entry => entry.ref, false));

}

export function populateConstraintFilter(htmlElementId, typeAssignments) {
    const filter = document.getElementById(htmlElementId);

    addDefaultOption(filter);

    // Filteroptionen hinzufügen
    typeAssignments.forEach(entry => {

        const constraintType = entry['constraint type'];
        const value = entry['value'];

        const opt = document.createElement('option');
        opt.value = mapAssignment(constraintType, value);
        opt.textContent = mapAssignment(constraintType, value); // mapAssignment aufrufen
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
