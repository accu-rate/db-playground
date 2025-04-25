package org.example.io;

import org.example.Main;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URL;
import java.nio.file.Paths;
import java.sql.*;

import static org.example.Main.DATABASE_NAME;

@Component
public class DataHandlerDuckDB implements CommandLineRunner, DataHandler {

    private static final String DEFAULT_TABLE_NAME = "sample_table";
    private static final String EXPORT_PATH = "";

    @Autowired
    public DataHandlerDuckDB() {
    }


    @Override
    public void run(String... args) throws Exception {
        resetDatabase();

        URL resource = Main.class.getResource("/testfile_res/out/floor-flo1.csv");
        if (resource == null) {
            throw new RuntimeException("Datei floor-flo1.csv nicht gefunden!");
        }
        String filePath = Paths.get(resource.toURI()).toString();

        initDatabase(filePath, DEFAULT_TABLE_NAME);
    }

    @Override
    public void resetDatabase() {
        System.out.println("Löschen der bisherigen Datenbankdatei...");
        File dbFile = new File(DATABASE_NAME);
        if (dbFile.exists() && dbFile.isFile()) {
            if (dbFile.delete()) {
                System.out.println("Datenbankdatei erfolgreich gelöscht.");
            } else {
                throw new RuntimeException("Datenbankdatei konnte nicht gelöscht werden.");
            }
        }
    }

    @Override
    public void exportDatabase() {
        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement()) {

            String exportQuery = "EXPORT DATABASE '" + EXPORT_PATH + "' (FORMAT PARQUET);";
            stmt.execute(exportQuery);

            System.out.println("Datenbank erfolgreich exportiert nach: " + EXPORT_PATH);
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Exportieren der Datenbank", e);
        }
    }

    @Override
    public void importCsv(String filePath, String tableName) {
        initDatabase(filePath, tableName);
    }


    private void initDatabase(String filePath, String tableName) {
        System.out.println("Importing CSV into a DuckDB table...");
        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
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