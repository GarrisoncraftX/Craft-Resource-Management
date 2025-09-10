package com.craftresourcemanagement.utils;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Component
public class OpenAIClient {

      private static final HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2) 
            .followRedirects(HttpClient.Redirect.NORMAL) 
            .connectTimeout(Duration.ofSeconds(10)) 
            .build();

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/completions";

    public String callOpenAIAPI(String apiKey, String prompt) throws IOException, InterruptedException {
        String requestBody = "{"
                + "\"model\": \"gpt-4o-mini\","
                + "\"prompt\": \"" + prompt.replace("\"", "\\\"") + "\","
                + "\"max_tokens\": 150,"
                + "\"temperature\": 0.7"
                + "}";

        // Build the HTTP request.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(OPENAI_API_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        // Send the request using the shared HttpClient instance.
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // Return the response body.
        return response.body();
    }
}
