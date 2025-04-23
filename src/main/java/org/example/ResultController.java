package org.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/api/results")
    public List<Map<String, Object>> getResults(String queryName) {
        return resultService.fetchResults(queryName);
    }

    @PostMapping("/api/custom-query")
    public List<Map<String, Object>> executeCustomQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        return resultService.executeQuery(query);
    }

    @GetMapping("/api/queries")
    public Map<String, String> getAvailableQueries() {
        return resultService.getAvailableQueries();
    }
}