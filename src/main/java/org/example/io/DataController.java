package org.example.io;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class DataController {

    private final DataHandler dataHandler;

    public DataController(DataHandler dataHandler) {
        this.dataHandler = dataHandler;
    }

    private void uploadInDatabase(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            File tempFile = File.createTempFile("uploaded-", originalFilename);
            file.transferTo(tempFile);

            assert originalFilename != null;
            originalFilename = originalFilename.substring(0, originalFilename.indexOf('.'));
            String cleanedFilename = originalFilename.replaceAll("[^a-zA-Z0-9]", "");
            dataHandler.importCsv(tempFile.getAbsolutePath(), cleanedFilename);
            tempFile.delete();
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Verarbeiten der Datei", e);
        }
    }

    @PostMapping("/api/upload-multiple-csvs")
    public ResponseEntity<String> uploadMultipleCsvs(@RequestParam("files") MultipartFile[] files) {
        if (files.length == 0) {
            return ResponseEntity.badRequest().body("Keine Dateien hochgeladen.");
        }

        for (int i = 0; i < files.length; i++) {
            uploadInDatabase(files[i]);
        }
        return ResponseEntity.ok("Dateien erfolgreich importiert.");
    }

    @PostMapping("/api/reset-database")
    public ResponseEntity<Void> resetDatabase() {
        dataHandler.resetDatabase();
        return ResponseEntity.ok().build();
    }


    @PostMapping("/api/export-database")
    public ResponseEntity<byte[]> exportDatabase() {
        try {
            // Exportiere die Datenbank in eine Datei
            File exportedFile = dataHandler.exportDatabase(); // Implementiere diese Methode in DataHandler
            byte[] fileContent = java.nio.file.Files.readAllBytes(exportedFile.toPath());

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + exportedFile.getName())
                    .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/api/import-database")
    public ResponseEntity<String> importDatabase(@RequestParam("file") MultipartFile file) {
        try {
            // Temporäre Datei erstellen
            File tempFile = File.createTempFile("imported-database-", ".zip");
            file.transferTo(tempFile);

            // Datenbank importieren
            dataHandler.importDatabase(tempFile.getAbsolutePath());

            // Temporäre Datei löschen
            tempFile.delete();

            return ResponseEntity.ok("Datenbank erfolgreich importiert.");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Fehler beim Importieren der Datenbank: " + e.getMessage());
        }
    }
}