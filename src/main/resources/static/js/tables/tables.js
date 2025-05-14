import {hideElement, showElement, sendRequestToBackend} from '../utils/utils.js';

export function initializeTableSelectListener() {
    const tableSelect = document.getElementById('tableSelect');
    const showColumnsCheckbox = document.getElementById('showColumnsCheckbox');

    showColumnsCheckbox.addEventListener('change', () => {
        if (showColumnsCheckbox.checked) {
            const selectedTable = tableSelect.value;
            if (selectedTable) {
                loadColumnsForSelectedTable();
            }
        } else {
            const columnsContainer = document.getElementById('columnsContainer');
            columnsContainer.innerHTML = '';
            hideElement(document.getElementById('columnsHeading'));
        }
    });
}

export function populateTableSelect(tables) {
    const select = document.getElementById('tableSelect');
    select.innerHTML = ''; // Vorherige Optionen entfernen

    if (tables.length === 0) {
        const noDataOption = document.createElement('option');
        noDataOption.value = '';
        noDataOption.textContent = 'Keine Daten gefunden';
        select.appendChild(noDataOption);
        return;
    }
    tables.forEach(table => {
        const option = document.createElement('option');
        option.value = table;
        option.textContent = generateTableString(table);
        select.appendChild(option);
    });

    if (document.getElementById('selectAllTablesCheckbox').checked) {
         for (const option of select.options) {
            option.selected = true;
        }
    }
}

function generateTableString(table) {
    const match = table.match(/variant(\d+)/i); // Match "variant" followed by a number
    if (match) {
        return `Variante ${match[1]}`; // Format as "Variante x"
    }
    return table; // Return the original table name if no match
}

export async function loadColumnsForSelectedTable() {
    const tableSelect = document.getElementById('tableSelect');
    const selectedTable = tableSelect.value;

    if (!selectedTable) {
        alert('Bitte wähle eine Tabelle aus.');
        return;
    }

    const url = `/api/get-columns?table=${encodeURIComponent(selectedTable)}`;
    const columns = await sendRequestToBackend(null, url);

    if (!columns) {
        console.error('Fehler beim Abrufen der Spalten.');
        return;
    }

    const columnsContainer = document.getElementById('columnsContainer');
    columnsContainer.innerHTML = ''; // Vorherige Spalten entfernen

    if (columns.length === 0) {
        columnsContainer.textContent = 'Keine Spalten gefunden.';
        return;
    }

    showElement(document.getElementById('columnsHeading'));
    const ul = document.createElement('ul');
    columns.forEach(column => {
        const li = document.createElement('li');
        li.textContent = column;
        ul.appendChild(li);
    });
    columnsContainer.appendChild(ul);
}