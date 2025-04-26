package org.example.database.utils;

public class DatabaseException extends RuntimeException {
    public DatabaseException(Throwable cause) {
        super("Error accessing database:", cause);
    }

    public DatabaseException(String query, Throwable cause) {
        super("Error with database query:" + query, cause);
    }
}
