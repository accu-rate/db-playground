import {populateTableSelect} from './tables.js';

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