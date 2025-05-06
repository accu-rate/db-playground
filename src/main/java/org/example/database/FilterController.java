package org.example.database;

import org.example.database.utils.DatabaseException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.example.Constants.VARIANTMAPPING_TABLE;
import static org.example.Constants.VARIANT_ASSIGNMENT_TABLE;
import static org.example.database.utils.ErrorHandler.handleError;

@RestController
public class FilterController {

    private final DatabaseService resultService;

    public FilterController(DatabaseService resultService) {
        this.resultService = resultService;
    }


    @GetMapping("/api/get-filter-types")
    public QueryResponse getFilterTypes() {
        try {
            List<String> tables = resultService.getTables();
            List<Map<String, Object>> result = new ArrayList<>();
            if (tables.contains(VARIANTMAPPING_TABLE)) {
                result = resultService.getDistinctValuesFromVariantMapping("type");
            }
            return new QueryResponse(result);
        } catch (DatabaseException e) {
            return handleError(e);
        }
    }


    @GetMapping("/api/get-filter-values")
    public QueryResponse getFilterValues(@RequestParam String type) {
        try {
            return new QueryResponse(resultService.getDistinctValuesForType(type));
        } catch (DatabaseException e) {
            return handleError(e);
        }
    }

    @GetMapping("/api/get-objects-for-filter")
    public QueryResponse getFilterValues(@RequestParam String type, @RequestParam String assignment) {
        try {
            return new QueryResponse(resultService.getDistinctObjectsFor(type, assignment));
        } catch (DatabaseException e) {
            return handleError(e);
        }
    }


    @GetMapping("/api/get-type-assignment-pairs")
    public QueryResponse getTypeAssignmentPairs() {
        try {
            return new QueryResponse(resultService.getTypeAssignmentPair());
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Filterzuweisungen: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-constraint-value-pairs")
    public QueryResponse getConstraintValuePairs() {
        try {
            return new QueryResponse(resultService.getConstraintValuePairs());
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Constraint values: " + e.getMessage());
        }
    }

    @PostMapping("/api/filter-data")
    public QueryResponse filterData(@RequestBody List<Map<String, String>> filters) {
        try {
            Map<String, String> columnTableMap = resultService.getColumnTableMapping();
            Map<String, String> updatedFilters = new HashMap<>();

            for (Map<String, String> filter : filters) {
                String columnName = filter.get("key");
                String operator = filter.get("operator");
                String value = filter.get("value");
                String tableName = columnTableMap.get(columnName);

                if (tableName != null) {
                    String quotedColumnName = columnName.contains(" ") ? "\"" + columnName + "\"" : columnName;
                    updatedFilters.put(tableName + "." + quotedColumnName + " " + operator, value);
                } else {
                    throw new DatabaseException("Spalte " + columnName + " konnte keiner Tabelle zugeordnet werden.");
                }
            }
            return new QueryResponse(resultService.getFilteredTables(updatedFilters));
        } catch (DatabaseException e) {
            return handleError(e);
        }
   }


    @GetMapping("/api/get-variant-assignment")
    public QueryResponse getVariantAssignment(@RequestParam("table") String tableName) {
        try {
            // Extrahiere den Variantennamen (alles nach dem letzten Unterstrich)
            String variantName = tableName.substring(0, tableName.lastIndexOf('_'));
            String assignmentTable = variantName + VARIANT_ASSIGNMENT_TABLE;

            // SQL-Query für die Abfrage der Spalten ref, type und assignment
            String query = "SELECT ref, type, assignment FROM " + assignmentTable;

            return new QueryResponse(resultService.executeQuery(query));
        } catch (DatabaseException e) {
            return new QueryResponse("Fehler beim Laden der Zuweisungsdaten: " + e.getMessage());
        }
    }
}
