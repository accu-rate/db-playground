package org.example.database.utils;

import org.springframework.stereotype.Component;

import java.util.Map;

import static org.example.Constants.VARIANTMAPPING_TABLE;
import static org.example.Constants.VARIANTRESULTSUMMARY_TABLE;


@Component
public class FilterBuilder {


    public String buildFilterQuery(Map<String, String> filters) {
        StringBuilder query = new StringBuilder(
                "SELECT DISTINCT " + VARIANTMAPPING_TABLE + ".variant " +
                        "FROM " + VARIANTMAPPING_TABLE +
                        "JOIN " + VARIANTRESULTSUMMARY_TABLE + " ON " + VARIANTMAPPING_TABLE + ".variant = " + VARIANTRESULTSUMMARY_TABLE + ".variant " +
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