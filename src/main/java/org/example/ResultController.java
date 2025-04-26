package org.example;

import org.example.database.DatabaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ResultController {

    private final DatabaseService resultService;

    public ResultController(DatabaseService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/api/execute-query")
    public List<Map<String, Object>> executeQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        return resultService.executeQuery(query);
    }

    @GetMapping("/api/queries")
    public Map<String, String> getAvailableQueries() {
        return resultService.getAvailableQueries();
    }

    @GetMapping("/api/get-tables")
    public List<String> getTables() {
        return resultService.getTables();
    }

    @GetMapping("/api/get-columns")
    public List<String> getColumns(@RequestParam String table) {
        return resultService.getColumns(table);
    }

    @GetMapping("/api/filter-options")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        Map<String, List<String>> filterOptions = new HashMap<>();
        filterOptions.put("variant", resultService.getDistinctValues("variant"));
        filterOptions.put("ref", resultService.getDistinctValues("ref"));
        filterOptions.put("type", resultService.getDistinctValues("type"));
        filterOptions.put("assignment", resultService.getDistinctValues("assignment"));
        return ResponseEntity.ok(filterOptions);
    }

    @PostMapping("/api/filter-data")
    public ResponseEntity<List<String>> filterData(@RequestBody Map<String, String> filters) {
        List<String> results = resultService.getFilteredTables(filters);
        return ResponseEntity.ok(results);
    }
}