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

        initDatabase(filePath);
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

    public void importCsv(String filePath) {
        initDatabase(filePath);
    }

    private void initDatabase(String filePath) {
        System.out.println("Importing CSV into a DuckDB table...");
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

        // Erstelle einen Index für die Spalten pedID und time
        String createIndexQuery = "CREATE INDEX idx_floor_data_pedID_time ON floor_data (pedID, time);";
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
                "CREATE OR REPLACE TABLE velocity AS " +
                        "WITH LaggedData AS ( " +
                        "    SELECT " +
                        "        time AS current_time, " +
                        "        pedID, " +
                        "        posX, " +
                        "        posY, " +
                        "        LAG(posX) OVER (PARTITION BY pedID ORDER BY time) AS prev_posX, " +
                        "        LAG(posY) OVER (PARTITION BY pedID ORDER BY time) AS prev_posY, " +
                        "        LAG(time) OVER (PARTITION BY pedID ORDER BY time) AS prev_time " +
                        "    FROM floor_data " +
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