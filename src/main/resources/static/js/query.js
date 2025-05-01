// js/query.js
import {sendRequestToBackend} from './utils.js';
import {populateTableSelect} from './tables.js';

export const QUERY_NAME_PEDS_VS_EVACTIME = 'Anzahl Personen vs. Räumungszeit'; // be careful with this name, it is used in queries-duckdb.sql - I know, very bad practice
export const QUERY_NAME_EXITS_VS_EVACTIME = 'Anzahl Ausgänge vs. Räumungszeit'; // be careful with this name, it is used in queries-duckdb.sql - I know, very bad practice
export let cachedQueries = []; // Array für mehrere Abfragen


export async function setQuery() {
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
    await filterTables(querySelect.options[querySelect.selectedIndex].text, selectedQuery);
}


function queryNeedsTableName(selectedQueryName) {
    return selectedQueryName !== QUERY_NAME_PEDS_VS_EVACTIME && selectedQueryName !== QUERY_NAME_EXITS_VS_EVACTIME;
}

async function filterTables(selectedQueryName, selectedQuery) {
    if (!selectedQuery) {
        // Wenn keine Query ausgewählt ist, alle Tabellen anzeigen
        const allTables = await fetchAllTables();
        populateTableSelect(allTables);
        return;
    }

    // Filtere die Tabellen basierend auf den benötigten Spalten
    const validTables = [];
    console.log("selectedQueryname:", selectedQueryName);
    if (queryNeedsTableName(selectedQueryName)) {
        // Extrahiere die benötigten Spalten aus der Query
        const requiredColumns = extractColumnsFromQuery(selectedQuery);

        // Hole alle verfügbaren Tabellen
        const allTables = await getCurrentTablesFromTableSelect();

        for (const table of allTables) {
            try {
                const tableColumns = await fetchTableColumns(table);
                if (requiredColumns.every(column => tableColumns.includes(column))) {
                    validTables.push(table);
                }
            } catch (error) {
                console.error(`Fehler beim Abrufen der Spalten für Tabelle ${table}:`, error);
            }
        }
    }
    console.log("validTables:", validTables);
    // Aktualisiere die Optionen in tableSelect
    populateTableSelect(validTables);
}

function getCurrentTablesFromTableSelect() {
    const tableSelect = document.getElementById('tableSelect');
    const currentTables = Array.from(tableSelect.options)
        .map(option => option.value)
        .filter(value => value); // Entferne leere Werte
    return currentTables;
}


async function fetchColumnValues(table, columnName) {
    const url = `/api/get-column-values?table=${encodeURIComponent(table)}&column=${encodeURIComponent(columnName)}`;
    return await sendRequestToBackend(null, url);
}

async function fetchTableColumns(table) {
    return await sendRequestToBackend(null, `/api/get-columns?table=${encodeURIComponent(table)}`)
}

export async function executeQuery() {
    const query = finalizeQuery();

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

    const tableSelect = document.getElementById('tableSelect');
    const selectedOptions = Array.from(tableSelect.options).filter(option => option.selected && option.value);

    if (selectedOptions.length === 0 && queryNeedsTableName(querySelect.options[querySelect.selectedIndex].text)) {
        console.log(querySelect.options[querySelect.selectedIndex].text);
        alert('Bitte wähle mindestens eine Tabelle aus.');
        return;
    }
    console.log(querySelect.options[querySelect.selectedIndex].text);
    if (selectedOptions.length === 0) {
        await executeTableQuery(query, 'default');
        return;
    }

    for (const option of selectedOptions) {
        const tableName = option.text;
        await executeTableQuery(query, tableName);
    }
}

async function executeTableQuery(query, tableName) {
    console.log("Query wird ersetzt:", query);
    const tableQuery = query.replaceAll('${selectedTable}', tableName); // Ersetze Platzhalter mit Tabellenname
    console.log("Query:", tableQuery);
    const url = '/api/execute-query';
    const data = await sendRequestToBackend(tableQuery, url);
    if (!data) return null;

    const queryName = querySelect.options[querySelect.selectedIndex].text; // Name der Query
    cachedQueries.push({id: queryName, table: tableName, query: tableQuery, data});
    addQueryToTable(tableName, queryName, data);

    return data;
}

function addQueryToTable(tableName, queryName, data) {
    const executedQueriesTable = document.getElementById('executedQueries');
    executedQueriesTable.classList.remove('hidden');

    const queryTableBody = document.querySelector('#queryTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" value="${cachedQueries.length - 1}" checked></td>
        <td>${tableName}</td>
        <td>${queryName}</td>
        <td>${Object.keys(data[0]).join(', ')}</td>
        <td>${data.length}</td>
    `;
    queryTableBody.appendChild(row);
}

function finalizeQuery() {
    const query = document.getElementById('query').value;
    const congestionVelocity = document.getElementById('congestionVelocity').value;
    const posXMin = document.getElementById('posXMin').value || Number.MIN_VALUE;
    const posXMax = document.getElementById('posXMax').value || Number.MAX_VALUE;
    const posYMin = document.getElementById('posYMin').value || Number.MIN_VALUE;
    const posYMax = document.getElementById('posYMax').value || Number.MAX_VALUE;
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

    if (query.includes('${noOfPeds}')) {
        if (!noOfPeds) {
            alert('Bitte setze die Anzahl der Personen.');
            return;
        }
        queryWithParam = queryWithParam
            .replaceAll('${noOfPeds}', noOfPeds);
    }

    // Ersetze die Platzhalter "${...}" nur, wenn sie in der Query vorhanden sind
    if (query.includes('${p')) {
        if (!posXMin || !posXMax || !posYMin || !posYMax) {
            alert('Bitte setze die Werte für die Position.');
            return;
        }
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

export async function loadQueriesFromApiAndFillOptions() {
    try {
        const apiUrl = '/api/queries'; // API-URL für die Queries
        console.log("Lade Queries von API:", apiUrl);
        const queries = await sendRequestToBackend(null, apiUrl);

        if (!queries || typeof queries !== 'object') {
            console.error('Ungültige API-Antwort:', queries);
            return;
        }

        const querySelect = document.getElementById('querySelect');
        if (!querySelect) {
            console.error("Element mit ID 'querySelect' nicht gefunden.");
            return;
        }

        querySelect.innerHTML = '';

        // Standardoption hinzufügen
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Wähle eine Abfrage --';
        querySelect.appendChild(defaultOption);

        // Queries hinzufügen
        for (const [name, query] of Object.entries(queries)) {
            if (name === QUERY_NAME_EXITS_VS_EVACTIME) {
                const typeFilter = document.getElementById('typeFilter');
                const options = Array.from(typeFilter.options);
                const containsTrueOrFalse = options.some(option => option.text === 'availability');
                if (!containsTrueOrFalse) {
                    console.log("query filter." + options.map(option => option.text));
                    continue;
                }
            }
            if (name === QUERY_NAME_PEDS_VS_EVACTIME) {
                const typeFilter = document.getElementById('typeFilter');
                const options = Array.from(typeFilter.options);
                const containsTrueOrFalse = options.some(option => option.text === 'noOfPeds');
                if (!containsTrueOrFalse) {
                    console.log("query filter." + options.map(option => option.text));
                    continue;
                }
            }
            if (name === QUERY_NAME_EXITS_VS_EVACTIME || name === QUERY_NAME_PEDS_VS_EVACTIME) {
                const constraintTypeFilter = document.getElementById('constraintTypeFilter');
                const constraintOptions = Array.from(constraintTypeFilter.options);
                const containsEvacTime = constraintOptions.some(option => option.text === 'evacuationTime');
                if (!containsEvacTime) {
                    console.log("query filter." + constraintOptions.map(option => option.text));
                    continue;
                }
            }

            const option = document.createElement('option');
            option.value = query;
            option.textContent = name;
            querySelect.appendChild(option);
        }

        console.log("Queries erfolgreich geladen und hinzugefügt.");
    } catch (error) {
        console.error('Fehler beim Laden der Queries:', error.message || error);
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


