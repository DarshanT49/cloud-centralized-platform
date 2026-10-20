package com.cloudBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class CloudBackendApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(CloudBackendApplication.class, args);
    }

    /**
     * Reads key=value pairs from .env file and sets them into System properties
     * so Spring Boot and application.properties can resolve them seamlessly.
     */
    private static void loadDotEnv() {
        File[] candidateFiles = new File[] {
                new File(".env"),
                new File("cloud-backend/.env"),
                new File("../.env")
        };

        for (File envFile : candidateFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(envFile.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // Strip surrounding single or double quotes
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (Exception e) {
                    System.err.println("Notice: Could not parse .env file at " + envFile.getAbsolutePath() + ": " + e.getMessage());
                }
            }
        }
    }
}
