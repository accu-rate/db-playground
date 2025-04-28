package org.example.database;

import org.example.database.utils.DatabaseException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class DBController {

    private final DatabaseService resultService;

    public DBController(DatabaseService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/api/execute-query")
    public QueryResponse executeQuery(@RequestBody String query) {
        try {
            // Entferne umschließende Anführungszeichen, falls vorhanden
            if (query.startsWith("\"") && query.endsWith("\"")) {
                query = query.substring(1, query.length() - 1);
            }
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

    @GetMapping("/api/filter-options")
    public QueryResponse getFilterOptions() {
        try {
            Map<String, List<String>> filterOptions = new HashMap<>();
            filterOptions.put("variant", resultService.getDistinctValuesFromVariantMapping("variant"));
            filterOptions.put("ref", resultService.getDistinctValuesFromVariantMapping("ref"));
            filterOptions.put("type", resultService.getDistinctValuesFromVariantMapping("type"));
            filterOptions.put("assignment", resultService.getDistinctValuesFromVariantMapping("assignment"));
            return new QueryResponse(filterOptions);
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Filter-Optionen: " + e.getMessage());
        }
    }

    @PostMapping("/api/filter-data")
    public QueryResponse filterData(@RequestBody Map<String, String> filters) {
        try {
            return new QueryResponse(resultService.getFilteredTables(filters));
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Filtern: " + e.getMessage());
        }
    }
}