package org.example.io;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class CsvUploadController {

    private final CsvImporter csvImporter;

    public CsvUploadController(CsvImporter csvImporter) {
        this.csvImporter = csvImporter;
    }

    private void uploadInDatabase(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            File tempFile = File.createTempFile("uploaded-", originalFilename);
            file.transferTo(tempFile);

            assert originalFilename != null;
            originalFilename = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
            String cleanedFilename = originalFilename.replaceAll("[^a-zA-Z0-9]", "");
            csvImporter.importCsv(tempFile.getAbsolutePath(), cleanedFilename);
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

}