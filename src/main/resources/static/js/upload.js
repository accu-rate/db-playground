// js/upload.js
export function uploadMultipleCsvFilesAndFetchTables(fileInputId) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Ladeindikator anzeigen

    const fileInput = document.getElementById(fileInputId);
    if (!fileInput.files.length) {
        alert('Bitte wähle mindestens eine Datei aus.');
        loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        return;
    }

    const formData = new FormData();
    for (const file of fileInput.files) {
        formData.append('files', file);
    }

    fetch('/api/upload-multiple-csvs', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return fetch('/api/get-tables'); // Tabellen abrufen
            } else {
                throw new Error('Fehler beim Hochladen der Dateien.');
            }
        })
        .then(response => response.json())
        .then(tables => {
            const select = document.getElementById('tableSelect');
            select.innerHTML = ''; // Vorherige Optionen entfernen
            tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table;
                option.textContent = table;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten.');
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        });
}
