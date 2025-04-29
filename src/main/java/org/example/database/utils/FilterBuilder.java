package org.example.database.utils;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class FilterBuilder {


    public String buildFilterQuery(Map<String, String> filters) {
        StringBuilder query = new StringBuilder(
                "SELECT DISTINCT variantmapping.variant " +
                        "FROM variantmapping " +
                        "JOIN variantresultsummary ON variantmapping.variant = variantresultsummary.variant " +
                        "WHERE 1=1"
        );
        filters.entrySet().forEach(entry -> addFilterCondition(query, entry));
        return query.toString();
    }

    private void addFilterCondition(StringBuilder query, Map.Entry<String, String> entry) {
        if (entry.getValue() != "") {
            query.append(" AND ").append(entry.getKey()).append("'" + entry.getValue() + "'");
        }
    }

}