package org.example.io;

import java.io.File;

public interface DataHandler {

    void importCsv(String filePath, String tableName);

    void resetDatabase();

    File exportDatabase();
}
