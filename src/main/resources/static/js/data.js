import { populateTableSelect } from './tables.js';
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
            populateTableSelect(tables);
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten.');
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        });
}

export function resetDatabase() {
        if (confirm('Möchtest du wirklich die gesamte Datenbank löschen?')) {
            fetch('/api/reset-database', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        alert('Die Datenbank wurde erfolgreich zurückgesetzt.');
                        location.reload(); // Seite neu laden, um Änderungen anzuzeigen
                    } else {
                        throw new Error('Fehler beim Zurücksetzen der Datenbank.');
                    }
                })
                .catch(error => {
                    console.error('Fehler:', error);
                    alert('Ein Fehler ist aufgetreten.');
                });
        }

}

export function downloadDatabase() {
    fetch('/api/export-database', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Exportieren der Datenbank.');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'database-export.zip'; // Dateiname
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten.');
        });
}

export function exportDatabaseToDirectory(directoryInputId) {
    const directoryInput = document.getElementById(directoryInputId);
    const files = directoryInput.files;

    if (!files.length) {
        alert('Bitte wähle ein Verzeichnis aus.');
        return;
    }

    // Hole den Pfad des ersten ausgewählten Ordners
    const exportPath = files[0].webkitRelativePath.split('/')[0];

    fetch('/api/export-database', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath: exportPath })
    })
        .then(response => {
            if (response.ok) {
                alert('Die Datenbank wurde erfolgreich exportiert.');
            } else {
                throw new Error('Fehler beim Exportieren der Datenbank.');
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten.');
        });
}
