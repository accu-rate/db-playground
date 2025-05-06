package org.example.database;

import org.example.database.utils.DatabaseException;

import java.util.List;
import java.util.Map;

public interface DatabaseService {
    List<Map<String, Object>> executeQuery(String query);

    List<Map<String, Object>> getDistinctValuesFromVariantMapping(String columnName);

    List<Map<String, Object>> getTypeAssignmentPair();

    List<Map<String, Object>> getConstraintValuePairs();

    List<String> getDistinctValuesFromVariantResult(String columnName);

    Map<String, String> getAvailableQueries();

    List<Map<String, Object>> getColumnValues(String tableName, String columnName);

    List<String> getTables();

    List<String> getFilteredTables(Map<String, String> updatedFilters);

    List<String> getColumns(String tableName);

    boolean tableExists(String tableName);

    Map<String, String> getColumnTableMapping() throws DatabaseException;

    List<Map<String, Object>> getDistinctValuesForType(String type);

    List<Map<String, Object>> getDistinctObjectsFor(String type, String assignment);
}
