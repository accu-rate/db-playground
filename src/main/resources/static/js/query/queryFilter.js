import {populateTableSelect} from '../tables/tables.js';
import {QUERY_NAME_EXITS_VS_EVACTIME, QUERY_NAME_PEDS_VS_EVACTIME} from './query.js';
import {sendRequestToBackend} from '../utils.js';
import {getAppliedFilters, getMatchingTablesForFilters} from '../filter.js';

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


export async function filterTables(selectedQueryName, selectedQuery) {
    if (!selectedQuery) {
        return;
    }

    // Filtere die Tabellen basierend auf den benötigten Spalten
    const validTables = [];
    console.log("selectedQueryname:", selectedQueryName);
    if (queryNeedsTableName(selectedQueryName)) {
        // Extrahiere die benötigten Spalten aus der Query
        const requiredColumns = extractColumnsFromQuery(selectedQuery);

        // Hole alle verfügbaren Tabellen
        const allTables = await getMatchingTablesForFilters(getAppliedFilters());

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


function queryNeedsTableName(selectedQueryName) {
    return selectedQueryName !== QUERY_NAME_PEDS_VS_EVACTIME && selectedQueryName !== QUERY_NAME_EXITS_VS_EVACTIME;
}

async function getTables() {
    const url = '/api/get-tables';
    const tables = await sendRequestToBackend(null, url); // sendRequestToBackend verwenden
    return tables;
}


async function fetchTableColumns(table) {
    return await sendRequestToBackend(null, `/api/get-columns?table=${encodeURIComponent(table)}`)
}

function extractColumnsFromQuery(query) {
    // Einfache Extraktion von Spaltennamen aus der Query (z. B. nach SELECT oder WHERE)
    const columnRegex = /\b(posX|posY|pedID|time)\b/g; // Passe das Regex an die erwarteten Spalten an
    const matches = query.match(columnRegex);
    return matches ? Array.from(new Set(matches)) : [];
}
