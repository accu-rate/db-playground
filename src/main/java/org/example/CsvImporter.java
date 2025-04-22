package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URL;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

import static org.example.Main.DATABASE_NAME;

@Component
public class CsvImporter implements CommandLineRunner {

    private final ResultService resultService;

    @Autowired
    public CsvImporter(ResultService resultService) {
        this.resultService = resultService;
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
        URL resource = Main.class.getResource("/testfile_res/out/floor-flo0.csv");
        if (resource == null) {
            throw new RuntimeException("Datei floor-flo0.csv nicht gefunden!");
        }
        String filePath = Paths.get(resource.toURI()).toString();

        try (Connection conn = DriverManager.getConnection("jdbc:duckdb:" + DATABASE_NAME);
             Statement stmt = conn.createStatement()) {

            String createTableQuery = "CREATE TABLE floor_data AS SELECT * FROM read_csv_auto('" + filePath + "')";
            stmt.execute(createTableQuery);
        } catch (Exception e) {
            throw new RuntimeException("Fehler beim Importieren der CSV-Datei in die Tabelle", e);
        }
    }
}