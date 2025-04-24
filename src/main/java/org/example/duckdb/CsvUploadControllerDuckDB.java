package org.example.duckdb;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class CsvUploadControllerDuckDB {

    private final CsvImporterToDuckDB csvImporter;

    public CsvUploadControllerDuckDB(CsvImporterToDuckDB csvImporter) {
        this.csvImporter = csvImporter;
    }

    @PostMapping("/api/upload-csv-duckdb")
    public void uploadCsv(@RequestParam("file") MultipartFile file) {

        System.out.println("Hochladen der CSV-Datei: " + file.getOriginalFilename());
        if (file.isEmpty()) {
            throw new RuntimeException("Die hochgeladene Datei ist leer.");
        }

        try {

            File tempFile = File.createTempFile("uploaded-", file.getOriginalFilename());
            file.transferTo(tempFile);

            csvImporter.importCsv(tempFile.getAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Verarbeiten der Datei", e);
        }
    }
}