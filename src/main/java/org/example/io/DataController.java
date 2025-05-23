package org.example.io;

import org.example.io.utils.ZipUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import static org.example.Constants.*;

@RestController
public class DataController {

    private final DataHandler dataHandler;

    public DataController(DataHandler dataHandler) {
        this.dataHandler = dataHandler;
    }

    @PostMapping("/api/process-variant-folder")
    public ResponseEntity<String> processVariantFolder(@RequestParam("file") MultipartFile zipFile) {
        if (!zipFile.getOriginalFilename().endsWith(".zip")) {
            return ResponseEntity.badRequest().body("Es wird eine ZIP-Datei erwartet");
        }

        try {
            // Temporäres Verzeichnis und ZIP-Datei erstellen
            File tempDir = Files.createTempDirectory("variant-processing-").toFile();
            File zipTemp = File.createTempFile("upload-", ".zip");
            zipFile.transferTo(zipTemp);

            // ZIP-Datei mit ZipUtils entpacken
            ZipUtils.unzip(zipTemp, tempDir);
            // In den Unterordner wechseln
            File[] subDirs = tempDir.listFiles(File::isDirectory);
            if (subDirs == null || subDirs.length == 0) {
                throw new RuntimeException("Kein Unterordner im entpackten Verzeichnis gefunden: " + tempDir);
            }

            File crowditFolder = subDirs[0]; // Erster Unterordner
            System.out.println("Gefundener Unterordner: " + crowditFolder.getAbsolutePath());

            ResponseEntity<String> body = importVariants(crowditFolder, tempDir, zipTemp);
            if (body != null) return body;

            cleanupTempFiles(tempDir, zipTemp);
            return ResponseEntity.ok("ZIP-Datei erfolgreich verarbeitet");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Fehler beim Verarbeiten der ZIP-Datei: " + e.getMessage());
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

    private void uploadInDatabase(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            File tempFile = File.createTempFile("uploaded-", originalFilename);
            file.transferTo(tempFile);

            assert originalFilename != null;
            originalFilename = originalFilename.substring(0, originalFilename.indexOf('.'));
            String cleanedFilename = cleanFilename(originalFilename);
            dataHandler.importCsv(tempFile.getAbsolutePath(), cleanedFilename);
            tempFile.delete();
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Verarbeiten der Datei", e);
        }
    }

    private String cleanFilename(String originalFilename) {
        return originalFilename.replaceAll("[^a-zA-Z0-9]", "");
    }

    private ResponseEntity<String> importVariants(File crowditFolder, File tempDir, File zipTemp) {
        // Verarbeite die entpackten Dateien
        File variantMapping = new File(crowditFolder, VARIANT_MAPPING_CSV);
        File variantSummary = new File(crowditFolder, VARIANT_RESULT_SUMMARY_CSV);

        importTable(variantMapping, VARIANTMAPPING_TABLE);
        importTable(variantSummary, VARIANTRESULTSUMMARY_TABLE);

        File[] variantDirs = crowditFolder.listFiles((dir, name) ->
                name.startsWith(OUT_FOLDER_PREFIX) && new File(dir, name).isDirectory());

        if (variantDirs == null || variantDirs.length == 0) {
            cleanupTempFiles(tempDir, zipTemp);
            return ResponseEntity.badRequest().body("Keine variant-Ordner in der ZIP-Datei gefunden");
        }

        for (File variantDir : variantDirs) {
            String baseTableName = createTableNameFromDir(variantDir.getName());
            File[] gzFiles = variantDir.listFiles((dir, name) -> name.endsWith(".gz"));

            if (gzFiles != null) {
                for (File gzFile : gzFiles) {
                    // Extrahiere den Dateinamen ohne .gz Endung
                    String fileName = gzFile.getName().replace(".gz", "").replace(".csv", "").replace("floor", "");
                    // Kombiniere Basis-Tabellenname mit Dateiname
                    String tableName = baseTableName + "_" + cleanFilename(fileName);
                    dataHandler.importCsv(gzFile.getAbsolutePath(), tableName);
                }

                importVariantAssignmentTable(baseTableName, variantDir);
            }
        }
        return null;
    }

    private void importTable(File fileToImport, String tableName) {
        if (fileToImport.exists()) {
            System.out.println("Importing table: " + tableName);
            dataHandler.importCsv(fileToImport.getAbsolutePath(), tableName);
        }
    }

    private void importVariantAssignmentTable(String baseTableName, File variantDir) {
        File variantAssignment = new File(variantDir, VARIANT_ASSIGNMENT_CSV);
        String tableName = baseTableName + VARIANT_ASSIGNMENT_TABLE;
        if (variantAssignment.exists()) {
            System.out.println("Importing table: " + tableName);
            dataHandler.importCsv(variantAssignment.getAbsolutePath(), tableName);
        }
    }

    private String createTableNameFromDir(String dirName) {

        if (dirName.startsWith("out-variant-")) {
            return VARIANT_TABLE_PREFIX + dirName.replace("out-variant-", "");
        } else if (dirName.startsWith("out-")) {
            return STATISTIC_RUN_PREFIX + dirName.replace("out-", "");
        } else {
            return dirName;
        }
    }

    private void cleanupTempFiles(File tempDir, File zipTemp) {
        // Rekursives Löschen des temporären Verzeichnisses
        deleteDirectory(tempDir);
        zipTemp.delete();
    }

    private void deleteDirectory(File directory) {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        directory.delete();
    }
}