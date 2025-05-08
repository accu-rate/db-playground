export function prepareQuery() {
    const query = document.getElementById('query').value;
    const congestionVelocity = document.getElementById('congestionVelocity').value;
    const noOfPeds = document.getElementById('noOfPeds').value;

    if (!query) {
        alert('Bitte wähle zuerst eine Abfrage aus.');
        return;
    }

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
        queryWithParam = queryWithParam.replaceAll('${noOfPeds}', noOfPeds);
    }
    return queryWithParam;
}