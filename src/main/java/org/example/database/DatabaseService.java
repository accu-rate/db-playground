package org.example.database;

import org.example.database.utils.DatabaseException;

import java.util.List;
import java.util.Map;

public interface DatabaseService {
    List<Map<String, Object>> executeQuery(String query);

    List<String> getDistinctValuesFromVariantMapping(String columnName);

    List<String> getDistinctValuesFromVariantResult(String columnName);

    Map<String, String> getAvailableQueries();

    List<Map<String, Object>> getColumnValues(String tableName, String columnName);

    List<String> getTables();

    List<String> getFilteredTables(Map<String, String> updatedFilters);

    List<String> getColumns(String tableName);

    boolean tableExists(String tableName);

    Map<String, String> getColumnTableMapping() throws DatabaseException;
}
