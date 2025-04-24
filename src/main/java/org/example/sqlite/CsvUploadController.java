package org.example.sqlite;


import org.example.duckdb.CsvImporterToDuckDB;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class CsvUploadController {

    private final CsvImporterSqlLite csvImporter;

    public CsvUploadController(CsvImporterSqlLite csvImporter) {
        this.csvImporter = csvImporter;
    }

    @PostMapping("/api/upload-csv-sqlite")
    public void uploadCsv(@RequestParam("file") MultipartFile file) {

        System.out.println("Hochladen der CSV-Datei: " + file.getOriginalFilename());
        if (file.isEmpty()) {
            throw new RuntimeException("Die hochgeladene Datei ist leer.");
        }

        try {

            File tempFile = File.createTempFile("uploaded-", file.getOriginalFilename());
            file.transferTo(tempFile);

            csvImporter.initDatabase(tempFile.getAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Verarbeiten der Datei", e);
        }
    }
}