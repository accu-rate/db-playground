package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URL;
import java.nio.file.Paths;
import java.sql.*;


@SpringBootApplication
public class Main {
    public static final String DATABASE_NAME = "test-database.db";

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}