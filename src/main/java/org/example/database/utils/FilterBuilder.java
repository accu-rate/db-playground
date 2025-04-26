package org.example.database.utils;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class FilterBuilder {
    private final List<Object> parameters = new ArrayList<>();

    public String buildFilterQuery(Map<String, String> filters) {
        parameters.clear();
        StringBuilder query = new StringBuilder("SELECT * FROM variantmapping WHERE 1=1");

        addFilterCondition(query, filters, "variant");
        addFilterCondition(query, filters, "ref");
        addFilterCondition(query, filters, "type");
        addFilterCondition(query, filters, "assignment");

        return query.toString();
    }

    private void addFilterCondition(StringBuilder query, Map<String, String> filters, String field) {
        if (filters.containsKey(field) && !filters.get(field).isEmpty()) {
            query.append(" AND ").append(field).append(" = ?");
            parameters.add(filters.get(field));
        }
    }

    public List<Object> getParameters() {
        return new ArrayList<>(parameters);
    }
}