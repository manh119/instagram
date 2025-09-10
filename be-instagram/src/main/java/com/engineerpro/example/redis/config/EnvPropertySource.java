package com.engineerpro.example.redis.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.core.env.EnumerablePropertySource;
import org.springframework.core.env.PropertySource;

import java.util.HashMap;
import java.util.Map;

public class EnvPropertySource extends EnumerablePropertySource<Map<String, String>> {

    private final Dotenv dotenv;
    private final Map<String, String> properties;

    public EnvPropertySource(String name, Dotenv dotenv) {
        super(name, new HashMap<>());
        this.dotenv = dotenv;
        this.properties = new HashMap<>();
        
        // Convert dotenv entries to Map
        dotenv.entries().forEach(entry -> {
            properties.put(entry.getKey(), entry.getValue());
        });
    }

    @Override
    public String[] getPropertyNames() {
        return properties.keySet().toArray(new String[0]);
    }

    @Override
    public Object getProperty(String name) {
        return properties.get(name);
    }
}
