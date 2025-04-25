package org.example;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
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
        return resultService.getAvailableTables();
    }

    @GetMapping("/api/get-columns")
    public List<String> getColumns(@RequestParam String table) {
        return resultService.getColumnsOfTable(table);
    }
}