-- Aufenthaltsdauer
SELECT pedID, MAX(time) - MIN(time) AS Duration
FROM floor_data
WHERE posX BETWEEN ? AND ? AND posY BETWEEN ? AND ?
GROUP BY pedID
HAVING COUNT(*) > 2;

-- Räumungsverlauf
SELECT time AS Time, COUNT(DISTINCT pedID) AS pedID_count
FROM floor_data
GROUP BY time
ORDER BY time ASC;

-- Leerungsverlauf in einem bestimmten Bereich
SELECT time AS Time, COUNT(DISTINCT pedID) AS pedID_count
FROM floor_data
WHERE posX BETWEEN ? AND ? AND posY BETWEEN ? AND ?
GROUP BY time
ORDER BY time ASC;

-- Anzahl Personen im Stau über die Zeit
WITH AverageSpeed AS (
    SELECT
        current_time,
        pedID,
        AVG(speed) AS avg_speed
    FROM velocity
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
    current_time AS Time,
    COUNT(pedID) AS PedCount
FROM Filtered
GROUP BY current_time
ORDER BY current_time;