import {populateTableSelect} from './tables.js';

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
            if (!response.ok) {
                throw new Error(`Fehler beim Hochladen der Dateien: ${response.statusText}`);
            }
            return updateTablesAndFilters();
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten: ' + error.message);
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Ladeindikator ausblenden
        });
}

async function updateTablesAndFilters(loadingIndicator) {
    try {
        await fetchAndPopulateTables();

        const response = await fetch('/api/filter-options');
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Filteroptionen.');
        }

        const filterOptions = await response.json();
        populateFilter('variantFilter', filterOptions.variant);
        populateFilter('refFilter', filterOptions.ref);
        populateFilter('typeFilter', filterOptions.type);
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten.');
    } finally {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

export function populateFilter(filterId, options) {
    const filter = document.getElementById(filterId);
    filter.innerHTML = ''; // Vorherige Optionen entfernen

    // Standardoption hinzufügen
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Kein Filter --';
    filter.appendChild(defaultOption);

    // Filteroptionen hinzufügen
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        filter.appendChild(opt);
    });
}

function fetchAndPopulateTables() {
    return fetch('/api/get-tables') // Tabellen abrufen
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Tabellen.');
            }
            return response.json();
        })
        .then(tables => {
            populateTableSelect(tables);
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Ein Fehler ist aufgetreten.');
        });
}

export async function processVariantFolder() {
    const fileInput = document.getElementById('zipFile');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/api/process-variant-folder', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Fehler beim Verarbeiten des Ordners.');
        }

        // Erfolgreiche Verarbeitung, Tabellen und Filter aktualisieren
        await updateTablesAndFilters();
    } catch (error) {
        console.error('Fehler:', error);
    }
}

export function resetDatabase() {
    if (confirm('Möchtest du wirklich die gesamte Datenbank löschen?')) {
        fetch('/api/reset-database', {method: 'POST'})
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
    fetch('/api/export-database', {method: 'POST'})
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

export function importDatabase() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip'; // Nur ZIP-Dateien erlauben

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Bitte wähle eine Datei aus.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/import-database', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    alert('Datenbank erfolgreich importiert.');
                    fetchAndPopulateTables();
                } else {
                    throw new Error('Fehler beim Importieren der Datenbank.');
                }
            })
            .catch(error => {
                console.error('Fehler:', error);
                alert('Ein Fehler ist aufgetreten.');
            });
    });
    fileInput.click(); // Öffnet den Datei-Dialog
}