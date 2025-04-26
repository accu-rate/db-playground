package org.example.database;

public record QueryResponse(
        Object data,
        String error,
        boolean success
) {
    public QueryResponse(Object data, String error) {
        this(data, error, error == null || error.isEmpty());
    }

    public QueryResponse(Object data) {
        this(data, null, true);
    }

    public QueryResponse(String error) {
        this(null, error, false);
    }
}