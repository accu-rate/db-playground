package org.example.database;

import org.example.database.utils.DatabaseException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.example.Constants.*;

@RestController
public class DBController {

    private final DatabaseService resultService;

    public DBController(DatabaseService resultService) {
        this.resultService = resultService;
    }

    @PostMapping(value = "/api/execute-query", consumes = MediaType.TEXT_PLAIN_VALUE)
    public QueryResponse executeQuery(@RequestBody String query) {
        try {
            return new QueryResponse(resultService.executeQuery(query));
        } catch (DatabaseException e) {
            e.printStackTrace();
            return new QueryResponse("Fehler bei der Abfrage: " + e.getMessage());
        }
    }

    @GetMapping("/api/queries")
    public QueryResponse getAvailableQueries() {
        try {
            return new QueryResponse(resultService.getAvailableQueries());
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Abfragen: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-tables")
    public QueryResponse getTables() {
        try {
            return new QueryResponse(resultService.getTables());
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Tabellen: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-columns")
    public QueryResponse getColumns(@RequestParam String table) {
        try {
            return new QueryResponse(resultService.getColumns(table));
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Spalten: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-column-values")
    public QueryResponse getColumnValues(@RequestParam String table, @RequestParam String column) {
        try {
            return new QueryResponse(resultService.getColumnValues(table, column));
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Spaltenwerte: " + e.getMessage());
        }
    }

    @GetMapping("/api/filter-options")
    public QueryResponse getFilterOptions() {
        try {
            Map<String, List<String>> filterOptions = new HashMap<>();
            List<String> tables = resultService.getTables();

            // Prüfe und füge Variant Mapping Optionen hinzu
            if (tables.contains(VARIANTMAPPING_TABLE)) {
                filterOptions.put("variant", resultService.getDistinctValuesFromVariantMapping("variant"));
                filterOptions.put("ref", resultService.getDistinctValuesFromVariantMapping("ref"));
                filterOptions.put("type", resultService.getDistinctValuesFromVariantMapping("type"));
                filterOptions.put("assignment", resultService.getDistinctValuesFromVariantMapping("assignment"));
            }

            // Prüfe und füge Variant Result Optionen hinzu
            if (tables.contains(VARIANTRESULTSUMMARY_TABLE)) {
                filterOptions.put("constraint_type", resultService.getDistinctValuesFromVariantResult("constraint type"));
                filterOptions.put("value_type", resultService.getDistinctValuesFromVariantResult("value type"));
                filterOptions.put("value", resultService.getDistinctValuesFromVariantResult("value"));
                filterOptions.put("fulfilled", resultService.getDistinctValuesFromVariantResult("constraint fulfilled"));
            }
            return new QueryResponse(filterOptions);
        } catch (DatabaseException e) {
            return handleError(e);
        }
    }

    @PostMapping("/api/filter-data")
    public QueryResponse filterData(@RequestBody List<Map<String, String>> filters) {
        try {
            Map<String, String> columnTableMap = resultService.getColumnTableMapping();
            Map<String, String> updatedFilters = new HashMap<>();

            for (Map<String, String> filter : filters) {
                String columnName = filter.get("key");
                String operator = filter.get("operator");
                String value = filter.get("value");
                String tableName = columnTableMap.get(columnName);

                if (tableName != null) {
                    String quotedColumnName = columnName.contains(" ") ? "\"" + columnName + "\"" : columnName;
                    updatedFilters.put(tableName + "." + quotedColumnName + " " + operator, value);
                } else {
                    throw new DatabaseException("Spalte " + columnName + " konnte keiner Tabelle zugeordnet werden.");
                }
            }
            return new QueryResponse(resultService.getFilteredTables(updatedFilters));
        } catch (DatabaseException e) {
            return handleError(e);
        }
    }


    @GetMapping("/api/get-variant-assignment")
    public QueryResponse getVariantAssignment(@RequestParam("table") String tableName) {
        try {
            // Extrahiere den Variantennamen (alles nach dem letzten Unterstrich)
            String variantName = tableName.substring(0, tableName.lastIndexOf('_') );
            String assignmentTable = variantName + VARIANT_ASSIGNMENT_TABLE;

            // SQL-Query für die Abfrage der Spalten ref, type und assignment
            String query = "SELECT ref, type, assignment FROM " + assignmentTable;

            return new QueryResponse(resultService.executeQuery(query));
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Zuweisungsdaten: " + e.getMessage());
        }
    }

    private static QueryResponse handleError(DatabaseException e) {
        e.printStackTrace();
        return new QueryResponse("Fehler beim Filtern: " + e.getCause());
    }
}