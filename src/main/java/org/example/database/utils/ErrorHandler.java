package org.example.database.utils;

import org.example.database.QueryResponse;

public class ErrorHandler {

    public static QueryResponse handleError(DatabaseException e) {
        e.printStackTrace();
        return new QueryResponse("Fehler beim Filtern: " + e.getCause());
    }
}
