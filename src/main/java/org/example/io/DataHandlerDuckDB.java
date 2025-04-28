package org.example.io;

import com.zaxxer.hikari.HikariDataSource;
import org.example.io.utils.ZipUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import static org.example.Main.DATABASE_NAME;

@Component
public class DataHandlerDuckDB implements CommandLineRunner, DataHandler {
    private final HikariDataSource dataSource;
    @Value("${database.name}")
    private String databaseName;

    @Autowired
    public DataHandlerDuckDB(HikariDataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
  //      resetDatabase();
    }

    @Override
    public void resetDatabase() {
        System.out.println("Löschen der bisherigen Datenbankdatei...");
        File dbFile = new File(databaseName);
        if (dbFile.exists() && dbFile.isFile()) {
            if (dbFile.delete()) {
                System.out.println("Datenbankdatei erfolgreich gelöscht.");
            } else {
                throw new RuntimeException("Datenbankdatei konnte nicht gelöscht werden.");
            }
        }
    }

    @Override
    public File exportDatabase() {
        System.out.println("Datenbankdatei wird exportiert.");
        String exportDirPath = System.getProperty("java.io.tmpdir") + "database_export";
        File exportDir = new File(exportDirPath);

        // Verzeichnis erstellen, falls es nicht existiert
        if (!exportDir.exists()) {
            exportDir.mkdirs();
        }

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            String exportQuery = "EXPORT DATABASE '" + exportDirPath + "';";
            stmt.execute(exportQuery);

            System.out.println("Datenbank erfolgreich exportiert nach: " + exportDirPath);
            // Verzeichnis zippen
            File zipFile = new File(exportDirPath + ".zip");
            ZipUtils.zipDirectory(exportDir, zipFile);
            System.out.println("Exportiertes Verzeichnis erfolgreich gezippt: " + zipFile.getAbsolutePath());

            return zipFile;

        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Exportieren der Datenbank", e);
        }
    }

    @Override
    public void importDatabase(String zipFile) {
        resetDatabase();
        // Temporäres Verzeichnis erstellen
        String tempDirPath = System.getProperty("java.io.tmpdir") + "database_import";
        File tempDir = new File(tempDirPath);
        if (!tempDir.exists()) {
            tempDir.mkdirs();
        }

        // ZIP-Datei entpacken
        try {
            ZipUtils.unzip(new File(zipFile), tempDir);
            System.out.println("ZIP-Datei erfolgreich entpackt: " + tempDirPath);

            // In den Unterordner wechseln
            File[] subDirs = tempDir.listFiles(File::isDirectory);
            if (subDirs == null || subDirs.length == 0) {
                throw new RuntimeException("Kein Unterordner im entpackten Verzeichnis gefunden: " + tempDirPath);
            }

            File databaseFolder = subDirs[0]; // Erster Unterordner
            System.out.println("Gefundener Unterordner: " + databaseFolder.getAbsolutePath());

            // Datenbank importieren
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {

                String importQuery = "IMPORT DATABASE '" + databaseFolder.getAbsolutePath() + "';";
                stmt.execute(importQuery);
                System.out.println("Datenbank erfolgreich importiert.");
            }

        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Entpacken der ZIP-Datei", e);
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der Datenbank", e);
        }
    }

    @Override
    public void importCsv(String filePath, String tableName) {
        initDatabase(filePath, tableName);
    }


    private void initDatabase(String filePath, String tableName) {
        System.out.println("Importing CSV into a DuckDB table...");
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            createTable(filePath, stmt, tableName);


        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der CSV-Datei in die Tabelle", e);
        }
    }

    private void createTable(String filePath, Statement stmt, String tableName) throws SQLException {
        String createTableQuery = "CREATE OR REPLACE TABLE " + tableName + " AS SELECT * FROM read_csv_auto('" + filePath + "')";

        stmt.execute(createTableQuery);
        String query = "SELECT COUNT(*) AS row_count FROM " + tableName;
        ResultSet rs = stmt.executeQuery(query);

        if (rs.next()) {
            int rowCount = rs.getInt("row_count");
            System.out.println("Anzahl der Zeilen in der Tabelle " + tableName + ":" + rowCount);
        }
    }
}