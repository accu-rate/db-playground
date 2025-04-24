// js/query.js
export function setQuery() {
    const querySelect = document.getElementById('querySelect');
    const queryTextarea = document.getElementById('query');
    const additionalParamContainer = document.getElementById('additionalParamContainer');
    const additionalAreaParamContainer = document.getElementById('additionalAreaParamContainer');

    const selectedQuery = querySelect.value;
    queryTextarea.value = selectedQuery;

    if (selectedQuery.includes('?')) {
        additionalParamContainer.style.display = 'block';
        additionalAreaParamContainer.classList.remove('hidden');
    } else if (selectedQuery.includes('${x')) {
        additionalAreaParamContainer.classList.add('hidden');
        additionalParamContainer.style.display = 'none';
    } else {
        additionalAreaParamContainer.classList.remove('hidden');
        additionalParamContainer.style.display = 'none';
    }
}

export function loadQueriesFromApi(apiUrl, selectElementId) {
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