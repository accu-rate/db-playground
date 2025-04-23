package org.example;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class CsvUploadController {

    private final CsvImporter csvImporter;

    public CsvUploadController(CsvImporter csvImporter) {
        this.csvImporter = csvImporter;
    }

    @PostMapping("/api/upload-csv")
    public void uploadCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Die hochgeladene Datei ist leer.");
        }

        try {
            // Speichere die Datei temporär
            File tempFile = File.createTempFile("uploaded-", ".csv");
            file.transferTo(tempFile);

            // Importiere die Datei in die Datenbank
            csvImporter.importCsv(tempFile.getAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Verarbeiten der Datei", e);
        }
    }
}