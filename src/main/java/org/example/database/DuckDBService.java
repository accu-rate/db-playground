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
    public List<String> getFilteredTables(Map<String, String> filters) {
        System.out.println("getting filtered tables: ");
        logPoolStats();
        FilterBuilder filterBuilder = new FilterBuilder();
        String query = filterBuilder.buildFilterQuery(filters);
        List<Object> parameters = filterBuilder.getParameters();

        List<String> results = new ArrayList<>();
        List<Map<String, Object>> queryResults = executeQuery(query, parameters);

        for (Map<String, Object> row : queryResults) {
            String variantTable = "variant" + row.get("variant");
            if (tableExists(variantTable)) {
                results.add(variantTable);
            }
        }

        return results;

    }

    @Override
    public List<String> getDistinctValues(String columnName) {
        System.out.println("getting distinct values for column: " + columnName);
        logPoolStats();
        String query = "SELECT DISTINCT " + columnName + " FROM variantmapping ORDER BY " + columnName;
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
        logPoolStats();
        return executeQuery(query, Collections.emptyList());
    }

    private List<Map<String, Object>> executeQuery(String query, List<Object> parameters) {
        List<Map<String, Object>> results = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            for (int i = 0; i < parameters.size(); i++) {
                stmt.setObject(i + 1, parameters.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                ResultSetMetaData metaData = rs.getMetaData();
                while (rs.next()) {  // Entfernung der ersten next() Prüfung
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
        Map<String, Object> row = new HashMap<>();
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
}