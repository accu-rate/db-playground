-- Aufenthaltsdauer
SELECT pedID, MAX(time) - MIN(time) AS Dauer
FROM ${selectedTable}
GROUP BY pedID
HAVING COUNT(*) > 2;

-- Aufenthaltsdauer innerhalb eines bestimmten Bereichs
SELECT pedID, MAX(time) - MIN(time) AS Dauer
FROM ${selectedTable}
WHERE posX BETWEEN ${posXMin} AND ${posXMax} AND posY BETWEEN ${posYMin} AND ${posYMax}
GROUP BY pedID
HAVING COUNT(*) > 2;

-- Räumungsverlauf
SELECT time AS Zeit, COUNT(DISTINCT pedID) AS Anzahl_Personen
FROM ${selectedTable}
GROUP BY time
ORDER BY time ASC;

-- Leerungsverlauf in einem bestimmten Bereich
SELECT time AS Zeit, COUNT(DISTINCT pedID) AS Anzahl_Personen
FROM ${selectedTable}
WHERE posX BETWEEN ${posXMin} AND ${posXMax} AND posY BETWEEN ${posYMin} AND ${posYMax}
GROUP BY time
ORDER BY time ASC;


-- Anzahl Personen im Stau über die Zeit
DROP INDEX IF EXISTS idx_${selectedTable}_pedID_time;
CREATE INDEX idx_${selectedTable}_pedID_time ON ${selectedTable} (pedID, time);
WITH LaggedData AS (
    SELECT
        time AS current_time,
        pedID,
        posX,
        posY,
        LAG(posX) OVER (PARTITION BY pedID ORDER BY time) AS prev_posX,
        LAG(posY) OVER (PARTITION BY pedID ORDER BY time) AS prev_posY,
        LAG(time) OVER (PARTITION BY pedID ORDER BY time) AS prev_time
    FROM ${selectedTable}
    WHERE time IS NOT NULL
),
Velocity AS (
    SELECT
        current_time,
        pedID,
        SQRT(POWER(posX - prev_posX, 2) + POWER(posY - prev_posY, 2)) / (current_time - prev_time) AS speed
    FROM LaggedData
    WHERE prev_time IS NOT NULL
),
AverageSpeed AS (
    SELECT
        current_time,
        pedID,
        AVG(speed) AS avg_speed
    FROM Velocity
    GROUP BY current_time, pedID
),
Filtered AS (
    SELECT
        current_time,
        pedID
    FROM AverageSpeed
    WHERE avg_speed < ?
)
SELECT
    current_time AS 'Zeit [s]',
    COUNT(pedID) AS 'Anzahl Personen im Stau'
FROM Filtered
GROUP BY current_time
ORDER BY current_time;

-- Anzahl Ausgänge vs. Räumungszeit
WITH AvailableExits AS (
    SELECT
        variant,
        COUNT(*) AS available_exits
    FROM
        variantmapping
    WHERE
        assignment = 'true'
    GROUP BY
        variant
)
SELECT
    a.available_exits AS 'Anzahl Ausgänge',
    b.value AS Raeumungszeit
FROM
    AvailableExits a
JOIN
    variantresultsummary b
ON
    a.variant = b.variant
WHERE
    b."constraint type" = 'evacuationTime'
ORDER BY b.value, a.available_exits;

-- Anzahl Personen vs. Räumungszeit
WITH NoOfPeds AS (
    SELECT
        variant,
        SUM(assignment) AS no_of_peds
    FROM
        variantmapping
    WHERE
        CAST(assignment AS INTEGER) < ${noOfPeds}
    GROUP BY
        variant
)
SELECT
    b.value AS Raeumungszeit,
    SUM(a.no_of_peds) AS Gesamtanzahl_Personen
FROM
    NoOfPeds a
        JOIN
    variantresultsummary b
    ON
        a.variant = b.variant
WHERE
    b."constraint type" = 'evacuationTime'
GROUP BY
    b.value
ORDER BY
    b.value ASC;