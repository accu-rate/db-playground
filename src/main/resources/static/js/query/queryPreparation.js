export function prepareQuery() {
    const query = document.getElementById('query').value;
    console.log("query: " + query);
    const congestionVelocity = document.getElementById('congestionVelocity').value;
    const noOfPeds = document.getElementById('noOfPeds').value;
    const posXMin = document.getElementById('posXMin').value;
    const posYMin = document.getElementById('posYMin').value;
    const posXMax = document.getElementById('posXMax').value;
    const posYMax = document.getElementById('posYMax').value;

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

    if (query.includes('${p')) {
        if (!additionalAreaParamContainer) {
            alert('Bitte setze die Region.');
            return;
        }
        queryWithParam = queryWithParam.replaceAll('${posXMin}', posXMin);
        queryWithParam = queryWithParam.replaceAll('${posXMax}', posXMax);
        queryWithParam = queryWithParam.replaceAll('${posYMin}', posYMin);
        queryWithParam = queryWithParam.replaceAll('${posYMax}', posYMax);
     }
    return queryWithParam;
}