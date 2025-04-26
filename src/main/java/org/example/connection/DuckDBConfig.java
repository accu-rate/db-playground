package org.example.connection;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

@Configuration
public class DuckDBConfig {
    @Value("${database.name:duckdb.db}")
    private String databaseName;
    private HikariDataSource dataSource;

    @Bean
    public HikariDataSource hikariDataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.duckdb.DuckDBDriver");
        config.setJdbcUrl("jdbc:duckdb:" + databaseName);
        config.setPoolName("duckdb-pool");
        config.setMaximumPoolSize(10);

        dataSource = new HikariDataSource(config);
        return dataSource;
    }

    @PreDestroy
    public void cleanup() {
        if (dataSource != null && !dataSource.isClosed()) {
            try (Connection conn = dataSource.getConnection()) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("CHECKPOINT");
                    stmt.execute("FORCE_CHECKPOINT");
                }
            } catch (SQLException e) {
                // Logger hier verwenden, falls vorhanden
            } finally {
                dataSource.close();
            }
        }
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(HikariDataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("org.example");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setGenerateDdl(true);
        em.setJpaVendorAdapter(vendorAdapter);

        Properties properties = new Properties();
        properties.setProperty("hibernate.dialect", DuckDBDialect.class.getName());
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        properties.setProperty("hibernate.show_sql", "true");
        em.setJpaProperties(properties);

        return em;
    }

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}