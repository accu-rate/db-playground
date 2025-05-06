import {sendRequestToBackend} from '../utils/utils.js';
import {cachedQueries} from '../query/query.js';
import {mapAssignment} from '../utils/mapping.js';

export async function addResultToOverviewTable(tableName, queryName, data) {
    const executedQueriesTable = document.getElementById('chartForm');
    console.log("found element: " + executedQueriesTable);
    executedQueriesTable.classList.remove('hidden');
    let formattedVariantAssignment = '';

    if (!document.getElementById('filterForm').classList.contains('hidden')) {
        const variantAssignment = await sendRequestToBackend(null, `/api/get-variant-assignment?table=${encodeURIComponent(tableName)}`);
        console.log("variantAssignment:", variantAssignment);
        formattedVariantAssignment = formatVariantAssignment(variantAssignment);
    }

    const queryTableBody = document.querySelector('#queryTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" value="${cachedQueries.length - 1}" checked></td>
        <td>${tableName}</td>
        <td>${formattedVariantAssignment}</td>
        <td>${queryName}</td>
        <td>${Object.keys(data[0]).join(', ')}</td>
        <td>${data.length}</td>
    `;
    queryTableBody.appendChild(row);
}

function formatVariantAssignment(variantAssignment) {
    if (!variantAssignment) {
        return 'Keine Daten';
    }

    return variantAssignment.map(item => {
        const mappedAssignment = mapAssignment(item.type, item.assignment);
        return `Bezugsquelle: ${item.ref}, Bedingung: ${mappedAssignment}\n`;
    }).join('\n');
}