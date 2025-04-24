package org.example;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Component
public class QueryLoader {

//    private static final String QUERY_FILE_PATH = "src/main/resources/static/sql/queries-sqlite.sql";
    private static final String QUERY_FILE_PATH = "src/main/resources/static/sql/queries-duckdb.sql";

    private final List<QueryData> queryCache = new ArrayList<>();

    public QueryLoader() {
        try {
            loadQueries();
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Laden der Abfragen aus der Datei: " + QUERY_FILE_PATH, e);
        }
    }

    public QueryData getQuery(String queryName) {
        Optional<QueryData> queryData = queryCache.stream().filter(q -> q.description().equals(queryName)).findFirst();
        if (queryData.isEmpty()) {
            throw new IllegalArgumentException("Abfrage mit dem Namen '" + queryName + "' wurde nicht gefunden.");
        }
        return queryData.get();
    }

    public List<QueryData> getQueryCache() {
        return queryCache;
    }

    private void loadQueries() throws IOException {
        String currentDescription = null;
        StringBuilder currentQuery = new StringBuilder();

        for (String line : Files.readAllLines(Paths.get(QUERY_FILE_PATH))) {
            line = line.trim();

            if (line.startsWith("--")) {
                // Vorherige Abfrage speichern, falls vorhanden
                if (currentDescription != null && !currentQuery.isEmpty()) {
                    queryCache.add(new QueryData(currentDescription, currentQuery.toString().trim()));
                    currentQuery.setLength(0); // Puffer leeren
                }
                currentDescription = line.substring(2).trim(); // Neue Beschreibung setzen
            } else if (!line.isEmpty()) {
                currentQuery.append(line).append(" "); // Zeile zur Abfrage hinzufügen
            }
        }


        if (currentDescription != null && !currentQuery.isEmpty()) {
            queryCache.add(new QueryData(currentDescription, currentQuery.toString().trim()));
        }
    }
}