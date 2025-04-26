// js/query.js
export let cachedQueries = []; // Array für mehrere Abfragen


export function setQuery() {
    const querySelect = document.getElementById('querySelect');
    const queryTextarea = document.getElementById('query');
    const congestionVelocity = document.getElementById('congestionVelocityContainer');
    const noOfPedsField = document.getElementById('noOfPedsContainer');
    const additionalAreaParamContainer = document.getElementById('additionalAreaParamContainer');

    const selectedQuery = querySelect.value;
    queryTextarea.value = selectedQuery;
    if (selectedQuery.includes('?')) {
        console.log("query mit velocity")
        congestionVelocity.style.display = 'block';
    } else {
        congestionVelocity.style.display = 'none';
    }
    if (selectedQuery.includes('${noOfPeds}')) {
        console.log("query mit no of Peds")
        noOfPedsField.style.display = 'block';
    } else {
        noOfPedsField.style.display = 'none';
    }

    if (selectedQuery.includes('${p')) {
        console.log("query mit velocity")
        additionalAreaParamContainer.classList.remove('hidden');
    } else {
        additionalAreaParamContainer.classList.add('hidden');
    }
}

export function executeQuery() {
    const query = finalizeQuery();

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    const url = '/api/execute-query';
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query})
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';

            if (data.length === 0) {
                alert('Keine Daten gefunden.');
                return;
            }

            const querySelect = document.getElementById('querySelect');
            const queryName = querySelect.options[querySelect.selectedIndex].text; // Name der Query
            const tableSelect = document.getElementById('tableSelect');
            const tableName = tableSelect.options[tableSelect.selectedIndex].text; // Name der Tabelle

            cachedQueries.push({id: queryName, table: tableName, query, data}); // Speichere die Abfrage mit Tabellennamen
            const executedQueriesTable = document.getElementById('executedQueries');
            executedQueriesTable.classList.remove('hidden');

            // Füge die Query zur Tabelle hinzu
            const queryTableBody = document.querySelector('#queryTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" value="${cachedQueries.length - 1}" checked></td>
                <td>${queryName}</td>
                <td>${tableName}</td>
                <td>${query}</td>
                <td>${Object.keys(data[0]).join(', ')}</td>
                <td>${data.length}</td>   
                `;
            queryTableBody.appendChild(row);
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function finalizeQuery() {
    const query = document.getElementById('query').value;
    const congestionVelocity = document.getElementById('congestionVelocity').value;
    const posXMin = document.getElementById('posXMin').value || Number.MIN_VALUE;
    const posXMax = document.getElementById('posXMax').value || Number.MAX_VALUE;
    const posYMin = document.getElementById('posYMin').value || Number.MIN_VALUE;
    const posYMax = document.getElementById('posYMax').value || Number.MAX_VALUE;
    const selectedTable = document.getElementById('tableSelect').value;
    const noOfPeds = document.getElementById('noOfPeds').value;

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

    // Ersetze den Platzhalter "?" nur, wenn er in der Query vorhanden ist
    let queryWithParam = query;
    if (query.includes('?')) {
        if (!congestionVelocity) {
            alert('Bitte setze die Staugrenzgeschwindigkeit.');
            return;
        }
        queryWithParam = query.replace('?', congestionVelocity);
    }

    // Ersetze die Platzhalter "${selectedTable}" nur, wenn sie in der Query vorhanden sind
    if (query.includes('${selectedTable}')) {
        queryWithParam = queryWithParam
            .replaceAll('${selectedTable}', selectedTable);
    }
    if (query.includes('${noOfPeds}')) {
        queryWithParam = queryWithParam
            .replaceAll('${noOfPeds}', noOfPeds);
    }

    // Ersetze die Platzhalter "${...}" nur, wenn sie in der Query vorhanden sind
    if (query.includes('${p')) {
        queryWithParam = queryWithParam
            .replace('${posXMin}', posXMin)
            .replace('${posXMax}', posXMax)
            .replace('${posYMin}', posYMin)
            .replace('${posYMax}', posYMax);
    }
    return queryWithParam;
}

export function clearAllQueries() {
    // Leere das Array der gespeicherten Queries
    cachedQueries.length = 0;

    // Entferne alle Listenelemente aus query table
    const queryTableBody = document.querySelector('#queryTable tbody');
    queryTableBody.innerHTML = '';
    const executedQueriesTable = document.getElementById('executedQueries');
    executedQueriesTable.classList.add('hidden');
}

export function deleteSelectedQueries() {
    const queryTableBody = document.querySelector('#queryTable tbody');
    const selectedCheckboxes = queryTableBody.querySelectorAll('input[type="checkbox"]:checked');

    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr'); // Finde die zugehörige Tabellenzeile
        const index = parseInt(checkbox.value); // Hole den Index der Abfrage
        cachedQueries.splice(index, 1); // Entferne die Abfrage aus dem Array
        row.remove(); // Entferne die Zeile aus der Tabelle
    });

    // Aktualisiere die Werte der Checkboxen, um die Indizes zu korrigieren
    Array.from(queryTableBody.querySelectorAll('input[type="checkbox"]')).forEach((checkbox, newIndex) => {
        checkbox.value = newIndex;
    });
}

export function loadQueriesFromApiAndFillOptions(apiUrl, selectElementId) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(queries => {
            const querySelect = document.getElementById(selectElementId);
            querySelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Wähle eine Abfrage --';
            querySelect.appendChild(defaultOption);

            for (const [name, query] of Object.entries(queries)) {
                const option = document.createElement('option');
                option.value = query;
                option.textContent = name;
                querySelect.appendChild(option);
            }
        })
        .catch(error => console.error('Fehler beim Laden der Queries:', error));
}

export function loadQueriesFromApi(apiUrl) {
    return fetch(apiUrl)
        .then(response => response.json())
        .catch(error => {
            console.error('Fehler beim Laden der Queries:', error);
            return [];
        });
}

export async function filterQueriesFromQuerySelect(selectedTable, tableColumns) {
    try {
        const queries = await loadQueriesFromApi('/api/queries');

        // Map in ein Array von Objekten umwandeln
        const queryArray = Object.entries(queries).map(([key, value]) => ({key, value}));

        const filteredQueries = queryArray
            .filter(option => option.value) // Entferne leere Werte
            .filter(option => {
                const query = option.value;
                if (query.includes('${selectedTable}') || query.includes(selectedTable)) {
                    const usedColumns = extractColumnsFromQuery(query);
                    return usedColumns.every(column => tableColumns.includes(column));
                }
                return false;
            });

        // Gib die gefilterten Key-Value-Paare zurück
        return filteredQueries;
    } catch (error) {
        console.error('Fehler beim Filtern der Queries:', error);
        return [];
    }
}

function extractColumnsFromQuery(query) {
    // Einfache Extraktion von Spaltennamen aus der Query (z. B. nach SELECT oder WHERE)
    const columnRegex = /\b(posX|posY|pedID|time)\b/g; // Passe das Regex an die erwarteten Spalten an
    const matches = query.match(columnRegex);
    return matches ? Array.from(new Set(matches)) : [];
}

export function updateQueryOptions(filteredQueries) {
    const querySelect = document.getElementById('querySelect');
    querySelect.innerHTML = '';

    // Füge eine Standardoption hinzu
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Wähle eine Abfrage --';
    querySelect.appendChild(defaultOption);

    // Füge die gefilterten Queries hinzu
    filteredQueries.forEach(({key, value}) => {
        const option = document.createElement('option');
        option.value = value; // Setze den Query-String als Value
        option.textContent = key; // Setze die Beschreibung als Text
        querySelect.appendChild(option);
    });
}


