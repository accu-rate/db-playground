package org.example.io;

public interface DataHandler {

    void importCsv(String filePath, String tableName);

    void resetDatabase();

    void exportDatabase();
}
