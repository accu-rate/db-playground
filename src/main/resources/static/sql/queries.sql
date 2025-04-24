
-- Zeitverlauf
SELECT pedID, MAX(time) - MIN(time) AS Duration
FROM floor_data
WHERE posX BETWEEN ${posXMin} AND ${posXMax} AND posY BETWEEN ${posYMin} AND ${posYMax}
GROUP BY pedID
HAVING COUNT(*) > 2;


-- Räumungsverlauf
SELECT time AS Time, COUNT(DISTINCT pedID) AS pedID_count
FROM floor_data
WHERE posX BETWEEN ${posXMin} AND ${posXMax} AND posY BETWEEN ${posYMin} AND ${posYMax}
GROUP BY time
ORDER BY time ASC;


-- Anzahl Personen im Stau über die Zeit
With AverageSpeed AS (
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
WHERE posX BETWEEN ${posXMin} AND ${posXMax} AND posY BETWEEN ${posYMin} AND ${posYMax}
GROUP BY current_time
ORDER BY current_time;