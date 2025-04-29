package org.example;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Constants {

    public static String OUT_FOLDER_PREFIX;
    public static String VARIANT_TABLE_PREFIX;
    public static String STATISTIC_RUN_PREFIX;
    public static String VARIANTMAPPING_TABLE;
    public static String VARIANTRESULTSUMMARY_TABLE;
    public static String VARIANT_MAPPING_CSV;
    public static String VARIANT_RESULT_SUMMARY_CSV;

    public Constants(
            @Value("${app.prefix.out-folder}") String outFolderPrefix,
            @Value("${app.prefix.variant-table}") String variantTablePrefix,
            @Value("${app.prefix.statistic-run}") String statisticRunPrefix,
            @Value("${app.table.variantmapping}") String variantMappingTable,
            @Value("${app.table.variantresultsummary}") String variantResultSummaryTable,
            @Value("${app.file.variant-mapping}") String variantMappingCsv,
            @Value("${app.file.variant-result-summary}") String variantResultSummaryCsv
    ) {
        OUT_FOLDER_PREFIX = outFolderPrefix;
        VARIANT_TABLE_PREFIX = variantTablePrefix;
        STATISTIC_RUN_PREFIX = statisticRunPrefix;
        VARIANTMAPPING_TABLE = variantMappingTable;
        VARIANTRESULTSUMMARY_TABLE = variantResultSummaryTable;
        VARIANT_MAPPING_CSV = variantMappingCsv;
        VARIANT_RESULT_SUMMARY_CSV = variantResultSummaryCsv;
    }
}