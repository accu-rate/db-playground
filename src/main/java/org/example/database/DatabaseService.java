package org.example.database;

import java.util.List;
import java.util.Map;

public interface DatabaseService {
    List<Map<String, Object>> executeQuery(String query);

    List<String> getDistinctValues(String columnName);

    Map<String, String> getAvailableQueries();

    List<String> getTables();

    List<String> getFilteredTables(Map<String, String> filters);

    List<String> getColumns(String tableName);

    boolean tableExists(String tableName);
}
