export const typeMappings = {
    noOfPeds: 'Anzahl Personen',
    pedsInScenario: 'Anzahl Personen',
    availability: 'Verfügbarkeit',
    evacuationTime: 'Räumungszeit',
    true: 'ja',
    false: 'nein'
};

const evacuationLabel = 'Räumungszeit kleiner als: ';
const noOfPedsLabel = 'Anzahl Personen: ';
const availableLabel = 'verfügbar';
const notAvailableLabel = 'nicht verfügbar';
const unitString = " Sekunden";

export function mapTypeAndAssignment(type, assignment) {
    if (type === 'availability') {
        return assignment === 'true' ? availableLabel : notAvailableLabel;
    }
    if (type === 'noOfPeds' || type === 'pedsInScenario') {
        return noOfPedsLabel + assignment;
    }
    if (type === 'evacuationTime') {
        return evacuationLabel + assignment + unitString;
    }
     return assignment;
}

export function mapAssignment(assignment) {
    if (assignment === 'true' || assignment === 'false') {
        return assignment === 'true' ? availableLabel : notAvailableLabel;
    }
    return assignment;
}

export function mapType(type) {
    return typeMappings[type];
}

export function invertMapAssignment(text) {
    if (text === availableLabel) {
        return {type: 'availability', assignment: 'true'};
    }
    if (text === notAvailableLabel) {
        return {type: 'availability', assignment: 'false'};
    }
    if (text.startsWith(noOfPedsLabel)) {
        const assignment = text.split(': ')[1];
        return {type: 'noOfPeds', assignment};
    }
    if (text.startsWith(evacuationLabel)) {
        const assignment = text.split(': ')[1].split(unitString)[0];;
        return {type: 'evacuationTime', assignment};
    }

    return {type: '', assignment: text};
}