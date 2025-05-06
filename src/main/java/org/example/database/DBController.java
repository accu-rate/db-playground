package org.example.database;

import org.example.database.utils.DatabaseException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

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
}