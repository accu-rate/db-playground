package org.example.sqlite;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.*;
import java.util.List;

@Component
public class CsvImporterSqlLite implements CommandLineRunner {

    private static final String DATABASE_NAME = "database.sqlite";

    @Autowired
    public CsvImporterSqlLite() {
    }

    @Override
    public void run(String... args) {
        deleteExistingDatabase();

        String filePath = "src/main/resources/testfile_res/out/floor-flo1.csv";
        if (!Files.exists(Paths.get(filePath))) {
            throw new RuntimeException("Datei floor-flo1.csv nicht gefunden!");
        }

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

    public void initDatabase(String filePath) {
        System.out.println("Importiere CSV in eine SQLite-Datenbank...");
        try (Connection conn = DriverManager.getConnection("jdbc:sqlite:" + DATABASE_NAME);
             Statement stmt = conn.createStatement()) {

            createPopulationFloorData(filePath, conn);
            createVelocityTable(stmt);

        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der CSV-Datei in die Tabelle", e);
        }
    }

    private void createPopulationFloorData(String filePath, Connection conn) throws SQLException, IOException {
        String createTableQuery = """
                CREATE TABLE IF NOT EXISTS floor_data (
                       time REAL,
                                        pedID INTEGER,
                    posX REAL,
                    posY REAL
                );
                """;

        try (Statement stmt = conn.createStatement()) {
            stmt.execute(createTableQuery);
        }

        String insertQuery = "INSERT INTO floor_data (pedID, time, posX, posY) VALUES (?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(insertQuery);
             BufferedReader reader = new BufferedReader(new FileReader(filePath))) {

            // Erste Zeile überspringen
            reader.readLine();

            String line;
            while ((line = reader.readLine()) != null) {
                String[] values = line.split(",");
                pstmt.setDouble(1, Double.parseDouble(values[0])); // time
                pstmt.setInt(2, Integer.parseInt(values[1])); // pedID
                pstmt.setDouble(3, Double.parseDouble(values[2])); // posX
                pstmt.setDouble(4, Double.parseDouble(values[3])); // posY
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        }

        System.out.println("Daten erfolgreich in die Tabelle 'floor_data' importiert.");
    }

    private void createVelocityTable(Statement stmt) throws SQLException {
        System.out.println("Erstelle Tabelle 'velocity'...");

        String createVelocityTableQuery = """
                CREATE TABLE IF NOT EXISTS velocity AS
                SELECT 
                    t1.time AS current_time,
                    t1.pedID,
                    SQRT(POWER(t1.posX - t2.posX, 2) + POWER(t1.posY - t2.posY, 2)) / (t1.time - t2.time) AS speed
                FROM 
                    floor_data t1
                JOIN 
                    floor_data t2
                ON 
                    t1.pedID = t2.pedID AND t1.time > t2.time
                WHERE 
                    t1.time - t2.time <= 5;
                """;

        stmt.execute(createVelocityTableQuery);
        System.out.println("Tabelle 'velocity' wurde erfolgreich erstellt.");
    }
}