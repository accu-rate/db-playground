
-- Abfrage für die Dauer der Bewegung
SELECT pedID, MAX(time) - MIN(time) AS duration
FROM floor_data
WHERE posX BETWEEN 2 AND 6 AND posY BETWEEN 4 AND 8
GROUP BY pedID
HAVING COUNT(*) > 2;


-- Abfrage für die Anzahl der Personen pro Zeit
SELECT time, COUNT(DISTINCT pedID) AS pedID_count
FROM floor_data
GROUP BY time
ORDER BY time ASC;