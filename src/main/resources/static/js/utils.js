export function sendRequestToBackend(data, url) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    const options = {
        method: data ? 'POST' : 'GET'
    };

    if (data) {
        const isFormData = data instanceof FormData;
        options.body = isFormData ? data : JSON.stringify(data); // Direkte Übergabe der Daten

        if (!isFormData) {
            options.headers = {'Content-Type': 'application/json'};
        }
    }
    return fetch(url, options)
        .then(response => response.json())
        .then(result => {
            loadingIndicator.style.display = 'none';

            if (!result.success) {
                alert(result.error);
                return null;
            }

            // Optional auf Daten prüfen
            const responseData = result.data;
            console.log('Daten sind wie folgt:', responseData);
            if (!responseData || responseData.length === 0) {
                console.warn('Keine Daten gefunden, aber Erfolg gemeldet.');
            }

            return responseData;
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            alert('Ein Fehler ist aufgetreten: ' + error.message);
            console.error('Fehler beim Abrufen der Daten:', error);
            return null;
        });
}