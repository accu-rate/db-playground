package org.example;

import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.example.Main.DATABASE_NAME;

@Service
public class ResultService {

    public List<Map<String, Object>> fetchResults() {
        List<Map<String, Object>> results = new ArrayList<>();
        String query = """
                SELECT pedID, MAX(time) - MIN(time) AS duration
                FROM floor_data
                WHERE posX BETWEEN 2 AND 6 AND posY BETWEEN 4 AND 8
                GROUP BY pedID
                HAVING COUNT(*) > 2
            """;

        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                results.add(Map.of(
                        "pedID", rs.getInt("pedID"),
                        "duration", rs.getDouble("duration")
                ));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Abrufen der Ergebnisse", e);
        }

        return results;
    }

    public List<Map<String, Object>> executeCustomQuery(String query) {
        System.out.println("Custom Query API wurde aufgerufen"); // Debug-Ausgabe

        List<Map<String, Object>> results = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), rs.getObject(i));
                }
                results.add(row);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Ausführen der benutzerdefinierten Abfrage", e);
        }

        return results;
    }
}