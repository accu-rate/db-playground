package org.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

@RestController
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/api/results")
    public List<Map<String, Object>> getResults() {
        return resultService.fetchResults();
    }

    @PostMapping("/api/custom-query")
    public List<Map<String, Object>> executeCustomQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        return resultService.executeCustomQuery(query);
    }
}