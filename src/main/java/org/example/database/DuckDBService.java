package org.example.database;

import com.zaxxer.hikari.HikariDataSource;
import org.example.QueryLoader;
import org.example.database.utils.DatabaseException;
import org.example.database.utils.FilterBuilder;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;

@Service
public class DuckDBService implements DatabaseService {
    private final HikariDataSource dataSource;
    private final QueryLoader queryLoader;

    public DuckDBService(HikariDataSource dataSource, QueryLoader queryLoader) {
        this.queryLoader = queryLoader;
        this.dataSource = dataSource;
    }

    private void logPoolStats() {
//        System.out.println("Pool Stats:");
//        System.out.println("Active Connections: " + dataSource.getHikariPoolMXBean().getActiveConnections());
//        System.out.println("Idle Connections: " + dataSource.getHikariPoolMXBean().getIdleConnections());
//        System.out.println("Total Connections: " + dataSource.getHikariPoolMXBean().getTotalConnections());
//        System.out.println("Threads Awaiting Connection: " + dataSource.getHikariPoolMXBean().getThreadsAwaitingConnection());
    }

    @Override
    public List<String> getFilteredTables(Map<String, String> updatedFilters) {
        System.out.println("getting filtered tables: ");
        logPoolStats();

        FilterBuilder filterBuilder = new FilterBuilder();
        String query = filterBuilder.buildFilterQuery(updatedFilters);

        List<String> results = new ArrayList<>();
        List<Map<String, Object>> queryResults = executeQuery(query);

        for (Map<String, Object> row : queryResults) {
            String variantTable = "variant" + row.get("variant") + "_";
            results.addAll(getTablesContaining(variantTable));
        }

        return results;
    }

    private List<String> getTablesContaining(String pattern) {
        List<String> matchingTables = new ArrayList<>();

        List<String> tables = getTables();
        tables.stream()
                .filter(tableName -> tableName.contains(pattern))
                .forEach(matchingTables::add);

        return matchingTables;
    }

    @Override
    public List<String> getDistinctValuesFromVariantMapping(String columnName) {
        return getValuesFromTableForColumn("variantmapping", columnName);
    }

    private List<String> getValuesFromTableForColumn(String tableName, String columnName) {
        System.out.println("getting distinct values for column: " + columnName + " from table" + tableName);
        String query = "SELECT DISTINCT \"" + columnName + "\" FROM " + tableName + " ORDER BY \"" + columnName + "\"";
        List<String> results = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                results.add(rs.getString(1));
            }
            return results;
        } catch (Exception e) {
            throw new DatabaseException(query, e);
        }
    }

    @Override
    public List<String> getDistinctValuesFromVariantResult(String columnName) {
        return getValuesFromTableForColumn("variantresultsummary", columnName);
    }

    @Override
    public Map<String, String> getAvailableQueries() {
        System.out.println("getting avaialable queries: ");
        logPoolStats();
        Map<String, String> queries = new HashMap<>();
        queryLoader.getQueryCache().forEach(queryData -> queries.put(queryData.description(), queryData.query()));
        return queries;
    }


    @Override
    public List<Map<String, Object>> executeQuery(String query) {
        System.out.println("executing query: " + query);
        List<Map<String, Object>> results = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            try (ResultSet rs = stmt.executeQuery()) {
                ResultSetMetaData metaData = rs.getMetaData();
                while (rs.next()) {
                    results.add(extractRow(rs, metaData));
                }
                return results;
            }
        } catch (Exception e) {
            throw new DatabaseException(query, e);
        }
    }


    @Override
    public List<Map<String, Object>> getColumnValues(String tableName, String columnName) {
        String query = "SELECT DISTINCT \"" + columnName + "\" FROM " + tableName + " ORDER BY \"" + columnName + "\"";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            try (ResultSet rs = stmt.executeQuery()) {
                List<Map<String, Object>> results = new ArrayList<>();
                ResultSetMetaData metaData = rs.getMetaData();
                while (rs.next()) {
                    results.add(extractRow(rs, metaData));
                }
                return results;
            }
        } catch (Exception e) {
            throw new DatabaseException(query, e);
        }
    }
    private Map<String, Object> extractRow(ResultSet rs, ResultSetMetaData metaData) throws
            SQLException {
        Map<String, Object> row = new LinkedHashMap<>();
        int columnCount = metaData.getColumnCount();
        for (int i = 1; i <= columnCount; i++) {
            row.put(metaData.getColumnName(i), rs.getObject(i));
        }
        return row;
    }

    @Override
    public List<String> getTables() {
        System.out.println("Fetching tables: ");
        logPoolStats();
        List<String> tables = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             ResultSet rs = conn.getMetaData().getTables(null, "main", null, null)) {

            if (!rs.next()) { // Prüft, ob das ResultSet leer ist
                System.out.println("No tables are present.");
                return tables;
            }
            do {
                tables.add(rs.getString("TABLE_NAME"));
            } while (rs.next());
        } catch (SQLException e) {
            e.printStackTrace();
            throw new DatabaseException(e);
        }
        return tables;
    }


    @Override
    public List<String> getColumns(String tableName) {
        System.out.println("Fetching columns for table: " + tableName);
        logPoolStats();

        List<String> columns = new ArrayList<>();
        String query = "PRAGMA table_info('" + tableName + "')";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                columns.add(rs.getString("name"));
            }
        } catch (SQLException e) {
            throw new DatabaseException(query, e);
        }
        return columns;
    }

    @Override
    public boolean tableExists(String tableName) {
        try (Connection conn = dataSource.getConnection();
             ResultSet rs = conn.getMetaData().getTables(null, "main", tableName, null)) {
            return rs.next();
        } catch (SQLException e) {
            throw new DatabaseException(e);
        }
    }


    @Override
    public Map<String, String> getColumnTableMapping() throws DatabaseException {
        Map<String, String> columnTableMap = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            List<String> tables = getTables();
            for (String tableName : tables) {
                ResultSet columns = metaData.getColumns(null, null, tableName, "%");
                while (columns.next()) {
                    String columnName = columns.getString("COLUMN_NAME");
                    columnTableMap.put(columnName, tableName);
                }
            }
            printColumnTableMapping(columnTableMap);
        } catch (Exception e) {
            throw new DatabaseException("Fehler beim Abrufen der Tabellen- und Spalteninformationen", e);
        }
        return columnTableMap;
    }

    private void printColumnTableMapping(Map<String, String> mapping) {
        System.out.println("\nSpalten-Tabellen-Zuordnung:");
        System.out.println("===========================");
        mapping.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .forEach(entry -> System.out.printf("%-30s -> %s%n", entry.getKey(), entry.getValue()));
        System.out.println("===========================\n");
    }

}