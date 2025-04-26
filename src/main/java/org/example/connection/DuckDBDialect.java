package org.example.connection;

import org.hibernate.dialect.Dialect;
import org.springframework.stereotype.Component;

@Component
public class DuckDBDialect extends Dialect {
    public DuckDBDialect() {
        super();
    }

    @Override
    public String getTableTypeString() {
        return "CREATE TABLE";
    }

}
