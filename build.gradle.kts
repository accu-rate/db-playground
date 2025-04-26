plugins {
    id("org.springframework.boot") version "3.4.4" // Aktuelle Version von Spring Boot
    id("io.spring.dependency-management") version "1.1.7"
    java
    application
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {

    implementation("org.springframework.boot:spring-boot-starter-web") // Für Webanwendungen
    implementation("org.springframework.boot:spring-boot-starter-data-jpa") // Für JPA und Datenbankzugriff
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf") // Für Thymeleaf (optional)
    implementation("org.xerial:sqlite-jdbc:3.42.0.0")
    implementation("com.zaxxer:HikariCP:5.1.0")

    runtimeOnly("org.springframework.boot:spring-boot-devtools") // Für Entwicklungszwecke
    runtimeOnly("com.h2database:h2") // Beispiel-Datenbank (H2)")

    implementation("jakarta.persistence:jakarta.persistence-api:3.1.0")
    implementation("org.hibernate.orm:hibernate-core:6.2.7.Final")
    implementation("org.duckdb:duckdb_jdbc:1.2.2.0")
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}
tasks.compileJava {
    options.encoding = "UTF-8"
}

tasks.test {
    useJUnitPlatform()
}