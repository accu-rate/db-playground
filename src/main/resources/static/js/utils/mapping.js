export const typeMappings = {
    noOfPeds: 'Anzahl Personen',
    availability: 'Verfügbarkeit',
    evacuationTime: 'Räumungszeit'
};
const evacuationLabel = 'Räumungszeit kleiner als: ';
const noOfPedsLabel = 'Anzahl Personen: ';
const availableLabel = 'verfügbar';
const notAvailableLabel = 'nicht verfügbar';

export function mapAssignment(type, assignment) {
    if (type === 'availability') {
        return assignment === 'true' ? availableLabel : notAvailableLabel;
    }
    if (type === 'noOfPeds')
        return noOfPedsLabel + assignment;
    if (type === 'evacuationTime') {
         return evacuationLabel + assignment;
    }

    return assignment;
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
        const assignment = text.split(': ')[1];
        return {type: 'evacuationTime', assignment};
    }

    return {type: '', assignment: text};
}