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

        System.out.println("Hochladen der CSV-Datei: " + file.getOriginalFilename());
        if (file.isEmpty()) {
            throw new RuntimeException("Die hochgeladene Datei ist leer.");
        }

        try {
            // Speichere die Datei temporär
            File tempFile = File.createTempFile("uploaded-", file.getOriginalFilename());
            file.transferTo(tempFile); // Übertrage den Inhalt der Datei in die temporäre Datei

            // Importiere die Datei in die Datenbank
            csvImporter.importCsv(tempFile.getAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Verarbeiten der Datei", e);
        }
    }
}