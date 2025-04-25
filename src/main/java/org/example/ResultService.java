package org.example;

import org.duckdb.DuckDBConnection;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.example.Main.DATABASE_NAME;

@Service
public class ResultService {
    private final QueryLoader queryLoader;

    public ResultService(QueryLoader queryLoader) {
        this.queryLoader = queryLoader;
    }

    public Map<String, String> getAvailableQueries() {
        Map<String, String> queries = new HashMap<>();
        queryLoader.getQueryCache().forEach(queryData -> queries.put(queryData.description(), queryData.query()));
        return queries;
    }


    public List<Map<String, Object>> executeQuery(String query) {
        System.out.println("Custom Query API wurde aufgerufen"); // Debug-Ausgabe

        List<Map<String, Object>> results = new ArrayList<>();

        try (DuckDBConnection conn = (DuckDBConnection) DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            if (!rs.next()) { // Prüft, ob das ResultSet leer ist
                System.out.println("Die Abfrage: " + query + " hat keine Ergebnisse geliefert.");
                return results;
            }

            do {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), rs.getObject(i));
                }
                results.add(row);
            } while (rs.next());

        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Ausführen der benutzerdefinierten Abfrage", e);
        }

        return results;
    }

    public List<String> getAvailableTables() {
        List<String> tables = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             ResultSet rs = conn.getMetaData().getTables(null, "main", null, null)) {

            if (!rs.next()) { // Prüft, ob das ResultSet leer ist
                System.out.println("No tables are present.");
                return tables;
            }
            do {
                tables.add(rs.getString("TABLE_NAME"));
            } while (rs.next());
        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Abrufen der Tabellen", e);
        }
        return tables;
    }

    public List<String> getColumnsOfTable(String tableName) {
        List<String> columns = new ArrayList<>();
        String query = "PRAGMA table_info('" + tableName + "')";

        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                columns.add(rs.getString("name")); // Die Spalte "name" enthält die Spaltennamen
            }

        } catch (SQLException e) {
            throw new RuntimeException("Fehler beim Abrufen der Spaltennamen", e);
        }

        return columns;
    }
}