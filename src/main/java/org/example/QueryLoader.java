package org.example;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class QueryLoader {

    private final String queryFilePath;
    private final List<QueryData> queryCache = new ArrayList<>();

    public QueryLoader(@Value("${app.query.file-path}") String queryFilePath) {
        this.queryFilePath = queryFilePath;
        try {
            loadQueries();
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Laden der Abfragen aus der Datei: " + queryFilePath, e);
        }
    }

    private void loadQueries() throws IOException {
        String currentDescription = null;
        StringBuilder currentQuery = new StringBuilder();

        for (String line : Files.readAllLines(Paths.get(queryFilePath))) {
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

}