package org.example.duckdb;

import org.example.Main;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.URL;
import java.nio.file.Paths;
import java.sql.*;

import static org.example.Main.DATABASE_NAME;

@Component
public class CsvImporterToDuckDB implements CommandLineRunner {

    private static final String DEFAULT_TABLE_NAME = "sample_table";

    @Autowired
    public CsvImporterToDuckDB() {
    }


    @Override
    public void run(String... args) throws Exception {
        deleteExistingDatabase();

        URL resource = Main.class.getResource("/testfile_res/out/floor-flo1.csv");
        if (resource == null) {
            throw new RuntimeException("Datei floor-flo1.csv nicht gefunden!");
        }
        String filePath = Paths.get(resource.toURI()).toString();

        initDatabase(filePath, DEFAULT_TABLE_NAME);
    }

    private void deleteExistingDatabase() {
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

    public void importCsv(String filePath, String tableName) {
        initDatabase(filePath, tableName);
    }


    private void initDatabase(String filePath, String tableName) {
        System.out.println("Importing CSV into a DuckDB table...");
        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement()) {
            createPopulationFloorData(filePath, stmt, tableName);
            createVelocityTable(stmt, tableName);
            conn.close();

        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der CSV-Datei in die Tabelle", e);
        }
    }

    private void createPopulationFloorData(String filePath, Statement stmt, String tableName) throws SQLException {
        String createTableQuery = "CREATE OR REPLACE TABLE " + tableName + " AS SELECT * FROM read_csv_auto('" + filePath + "')";

        stmt.execute(createTableQuery);
        String query = "SELECT COUNT(*) AS row_count FROM " + tableName;
        ResultSet rs = stmt.executeQuery(query);

        if (rs.next()) {
            int rowCount = rs.getInt("row_count");
            System.out.println("Anzahl der Zeilen in der Tabelle " + tableName + ":" + rowCount);
        }
    }


    private void createVelocityTable(Statement stmt, String tableName) throws SQLException {
        System.out.println("Creating table 'velocity' ...");

        // Erstelle einen Index für die Spalten pedID und time
        String createIndexQuery = "CREATE INDEX idx_" + tableName + "_pedID_time ON " + tableName + " (pedID, time);";
        stmt.execute(createIndexQuery);

        // mean velocity over 5 time steps
//        String createVelocityTableQuery =
//                "CREATE OR REPLACE TABLE velocity AS " +
//                        "SELECT " +
//                        "    t1.time AS current_time, " +
//                        "    t1.pedID, " +
//                        "    SQRT(POWER(t1.posX - t2.posX, 2) + POWER(t1.posY - t2.posY, 2)) / (t1.time - t2.time) AS speed " +
//                        "FROM " +
//                        "    (SELECT * FROM floor_data WHERE time <= (SELECT MAX(time) FROM floor_data) - 5) t1 " +
//                        "JOIN " +
//                        "    floor_data t2 " +
//                        "ON " +
//                        "    t1.pedID = t2.pedID AND t1.time > t2.time " +
//                        "WHERE " +
//                        "    t1.time - t2.time <= 5;";

        String createVelocityTableQuery =
                "CREATE OR REPLACE TABLE velocity_" + tableName + " AS " +
                        "WITH LaggedData AS ( " +
                        "    SELECT " +
                        "        time AS current_time, " +
                        "        pedID, " +
                        "        posX, " +
                        "        posY, " +
                        "        LAG(posX) OVER (PARTITION BY pedID ORDER BY time) AS prev_posX, " +
                        "        LAG(posY) OVER (PARTITION BY pedID ORDER BY time) AS prev_posY, " +
                        "        LAG(time) OVER (PARTITION BY pedID ORDER BY time) AS prev_time " +
                        "    FROM " + tableName +
                        ") " +
                        "SELECT " +
                        "    current_time, " +
                        "    pedID, " +
                        "    SQRT(POWER(posX - prev_posX, 2) + POWER(posY - prev_posY, 2)) / (current_time - prev_time) AS speed " +
                        "FROM LaggedData " +
                        "WHERE prev_time IS NOT NULL;";
        stmt.execute(createVelocityTableQuery);

        System.out.println("Tabelle 'velocity' wurde erfolgreich erstellt.");
    }
}