export const typeMappings = {
    noOfPeds: 'Anzahl Personen',
    availability: 'Verfügbarkeit'
};

export function mapAssignment(type, assignment) {
    if (type === 'availability') {
        return assignment === 'true' ? 'verfügbar' : 'nicht verfügbar';
    }
    if (type === 'noOfPeds')
        return 'Anzahl Personen: ' + assignment;
    return assignment;
}