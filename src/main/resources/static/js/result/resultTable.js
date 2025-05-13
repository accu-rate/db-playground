import {sendRequestToBackend, showElement, hideElement} from '../utils/utils.js';
import {cachedQueries} from '../query/query.js';
import {mapTypeAndAssignment} from '../utils/mapping.js';
import {makeCanvasResizable} from '../result/resize.js';


export async function addResultToOverviewTable(tableName, queryName, data) {
    const chartFormElement = document.getElementById('chartForm');
    console.log("found element: " + chartFormElement);
    if (notYetVisible(chartFormElement)) {
        showElement(chartFormElement);
        makeCanvasResizable();
    }
    let formattedVariantAssignment = '';

    if (hasFilters() && tableName) {
        const variantAssignment = await sendRequestToBackend(null, `/api/get-variant-assignment?table=${encodeURIComponent(tableName)}`);
        console.log("variantAssignment:", variantAssignment);
        formattedVariantAssignment = formatVariantAssignment(variantAssignment);
    }

    const queryTableBody = document.querySelector('#queryTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" value="${cachedQueries.length - 1}" checked></td>
        <td>${tableName === null ? 'alle' : tableName}</td>
        <td>${formattedVariantAssignment}</td>
        <td>${queryName}</td>
        <td>${Object.keys(data[0]).join(', ')}</td>
        <td>${data.length}</td>
    `;
    queryTableBody.appendChild(row);
}

function hasFilters() {
    return !document.getElementById('filterForm').classList.contains('hidden');
}


function notYetVisible(chartFormElement) {
    return chartFormElement.classList.contains('hidden');
}

function formatVariantAssignment(variantAssignment) {
    if (!variantAssignment) {
        return 'Keine Daten';
    }

    return variantAssignment.map(item => {
        const mappedAssignment = mapTypeAndAssignment(item.type, item.assignment);
        return `${item.ref} - ${mappedAssignment}`;
    }).join('<br>');
}