export function initializeTableSelectListener() {
    const tableSelect = document.getElementById('tableSelect');
    const showColumnsCheckbox = document.getElementById('showColumnsCheckbox');

    tableSelect.addEventListener('change', () => {
        const selectedTable = tableSelect.value;
        if (selectedTable) {
            console.log(`Tabelle ausgewählt: ${selectedTable}`);
            if (showColumnsCheckbox.checked) {
                loadColumnsForSelectedTable();
            }
        }
    });

    showColumnsCheckbox.addEventListener('change', () => {
        if (showColumnsCheckbox.checked) {
            const selectedTable = tableSelect.value;
            if (selectedTable) {
                loadColumnsForSelectedTable();
            }
        } else {
            const columnsContainer = document.getElementById('columnsContainer');
            columnsContainer.innerHTML = ''; // Spalten ausblenden
            document.getElementById('columnsHeading').classList.add('hidden');
        }
    });
}

export function populateTableSelect(tables) {
    const select = document.getElementById('tableSelect');
    select.innerHTML = ''; // Vorherige Optionen entfernen

    if (tables.length === 0) {
        const noDataOption = document.createElement('option');
        noDataOption.value = '';
        noDataOption.textContent = 'Keine Daten gefunden, die den eingestellten Filtern entsprechen';
        select.appendChild(noDataOption);
        return;
    }

    tables.forEach(table => {
        const option = document.createElement('option');
        option.value = table;
        option.textContent = table;
        select.appendChild(option);
    });

    initializeTableSelectListener();
}

export function loadColumnsForSelectedTable() {
    const tableSelect = document.getElementById('tableSelect');
    const selectedTable = tableSelect.value;

    if (!selectedTable) {
        alert('Bitte wähle eine Tabelle aus.');
        return;
    }

    fetch(`/api/get-columns?table=${encodeURIComponent(selectedTable)}`)
        .then(response => response.json())
        .then(columns => {
            const columnsContainer = document.getElementById('columnsContainer');
            columnsContainer.innerHTML = ''; // Vorherige Spalten entfernen

            if (columns.length === 0) {
                columnsContainer.textContent = 'Keine Spalten gefunden.';
                return;
            }
            document.getElementById('columnsHeading').classList.remove('hidden');
            const ul = document.createElement('ul');
            columns.forEach(column => {
                const li = document.createElement('li');
                li.textContent = column;
                ul.appendChild(li);
            });
            columnsContainer.appendChild(ul);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Spalten:', error);
            alert('Ein Fehler ist beim Abrufen der Spalten aufgetreten.');
        });
}