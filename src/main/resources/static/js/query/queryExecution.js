import {sendRequestToBackend} from '../utils/utils.js';
import {addResultToOverviewTable} from '../result/resultTable.js';
import {prepareQuery} from './queryPreparation.js';
import {cachedQueries} from './query.js';

const tablePlaceholder = '${selectedTable}';

export async function executeQuery() {
    const query = prepareQuery();
    console.log("query:", query);
    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

    const queryNeedsTable = query.includes(tablePlaceholder);
    if (!queryNeedsTable) {
       await executeTableQuery(query, null);
        return;
    }

    const tableSelect = document.getElementById('tableSelect');
    const selectedOptions = Array.from(tableSelect.options).filter(option => option.selected && option.value);

    console.log("selectedOptions:", selectedOptions);
    if (selectedOptions.length === 0) {
        alert('Bitte wähle zuerst eine Tabelle aus.');
        return;
    }

    for (const option of selectedOptions) {
        await executeTableQuery(query, option);
    }
}

async function executeTableQuery(query, selectedOption) {
    const tableValue = selectedOption ? selectedOption.value : null;
    const tableName = selectedOption ? selectedOption.textContent : null;
    const tableQuery = query.replaceAll(tablePlaceholder, tableValue);
    const url = '/api/execute-query';
    const data = await sendRequestToBackend(tableQuery, url);
    if (!data) return null;

    const queryName = querySelect.options[querySelect.selectedIndex].text;

    cachedQueries.push({
        id: queryName, table: tableName, query: tableQuery, data
    });
    await addResultToOverviewTable(tableValue, queryName, data, tableName);
}