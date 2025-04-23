package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.URL;
import java.nio.file.Paths;
import java.sql.*;
import java.util.zip.GZIPInputStream;

import static org.example.Main.DATABASE_NAME;

@Component
public class CsvImporter implements CommandLineRunner {

    private final ResultService resultService;

    @Autowired
    public CsvImporter(ResultService resultService) {
        this.resultService = resultService;
    }

    public void importCsv(String filePath) {

        if (filePath.endsWith(".gz")) {
            String gzipFilePath = filePath;
            String outputCsvFilePath = filePath.replace(".gz", "");

            unzipAndSaveAsCsv(gzipFilePath, outputCsvFilePath);
            filePath = outputCsvFilePath;
        }

        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement()) {

            String createTableQuery = "CREATE OR REPLACE TABLE floor_data AS SELECT * FROM read_csv_auto('" + filePath + "')";
            stmt.execute(createTableQuery);
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der CSV-Datei in die Tabelle", e);
        }
    }

    public void unzipAndSaveAsCsv(String gzipFilePath, String outputCsvFilePath) {
        try (GZIPInputStream gzipInputStream = new GZIPInputStream(new FileInputStream(gzipFilePath), 1024 * 8);
             InputStreamReader inputStreamReader = new InputStreamReader(gzipInputStream);
             BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
             FileWriter fileWriter = new FileWriter(outputCsvFilePath)) {

            String line;
            while ((line = bufferedReader.readLine()) != null) {
                fileWriter.write(line + System.lineSeparator());
            }

            System.out.println("Datei erfolgreich entpackt und als CSV gespeichert: " + outputCsvFilePath);

        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Entpacken und Speichern der Datei", e);
        }
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Löschen der Datenbankdatei...");
        File dbFile = new File(DATABASE_NAME);
        if (dbFile.exists() && dbFile.isFile()) {
            if (dbFile.delete()) {
                System.out.println("Datenbankdatei erfolgreich gelöscht.");
            } else {
                throw new RuntimeException("Datenbankdatei konnte nicht gelöscht werden.");
            }
        }

        System.out.println("Importing CSV into a DuckDB table...");
        URL resource = Main.class.getResource("/testfile_res/out/floor-Veranstaltungsfläche.csv");
        if (resource == null) {
            throw new RuntimeException("Datei floor-flo0.csv nicht gefunden!");
        }
        String filePath = Paths.get(resource.toURI()).toString();

        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement()) {
            createPopulationFloorData(filePath, stmt);
            createVelocityTable(stmt);

        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der CSV-Datei in die Tabelle", e);
        }
    }

    private void createPopulationFloorData(String filePath, Statement stmt) throws SQLException {
        String createTableQuery = "CREATE OR REPLACE TABLE floor_data AS SELECT * FROM read_csv_auto('" + filePath + "')";

        stmt.execute(createTableQuery);
        String query = "PRAGMA table_info('floor_data');";
        ResultSet rs = stmt.executeQuery(query);

        System.out.println("Spalteninformationen für Tabelle: " + "floor_data");
        while (rs.next()) {
            String columnName = rs.getString("name");
            String columnType = rs.getString("type");
            System.out.println("Spalte: " + columnName + ", Typ: " + columnType);
        }

        query = "SELECT COUNT(*) AS row_count FROM floor_data;";
        rs = stmt.executeQuery(query);

        if (rs.next()) {
            int rowCount = rs.getInt("row_count");
            System.out.println("Anzahl der Zeilen in der Tabelle 'floor_data': " + rowCount);
        }
    }

    private void createVelocityTable(Statement stmt) throws SQLException {
        System.out.println("Creating table 'velocity' ...");
        String createVelocityTableQuery =
                "CREATE OR REPLACE TABLE velocity AS " +
                        "SELECT " +
                        "    t1.time AS current_time, " +
                        "    t1.pedID, " +
                        "    SQRT(POWER(t1.posX - t2.posX, 2) + POWER(t1.posY - t2.posY, 2)) / (t1.time - t2.time) AS speed " +
                        "FROM floor_data t1 " +
                        "JOIN floor_data t2 " +
                        "ON t1.pedID = t2.pedID AND t1.time > t2.time " +
                        "WHERE t1.time - t2.time <= 5;";
        stmt.execute(createVelocityTableQuery);
        System.out.println("Tabelle 'velocity' wurde erfolgreich erstellt.");
    }
}