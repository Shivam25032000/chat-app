package com.chat.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String generateResponse(String userMessage) {
        if ("demo-key".equals(apiKey)) {
            return "Gemini_BOT: I am a demo bot. Please configure a valid Google Gemini API Key in application.yml!";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Decode API Key
            String decodedKey = new String(Base64.getDecoder().decode(apiKey));

            // Gemini API Key is passed in the URL, not headers
            String finalUrl = apiUrl + decodedKey;

            // Request Structure: { "contents": [{ "parts": [{"text": "Hello"}] }] }
            Map<String, Object> requestBody = new HashMap<>();

            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();

            part.put("text", userMessage);
            parts.add(part);
            contentMap.put("parts", parts);
            contents.add(contentMap);

            requestBody.put("contents", contents);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(finalUrl, request, Map.class);

            // Response Structure: { "candidates": [ { "content": { "parts": [ { "text":
            // "Hi" } ] } } ] }
            if (response.getBody() != null && response.getBody().containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    List<Map<String, String>> responseParts = (List<Map<String, String>>) content.get("parts");
                    if (!responseParts.isEmpty()) {
                        return responseParts.get(0).get("text");
                    }
                }
            }
            return "Gemini_BOT: I couldn't think of a response.";
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback for Demo purposes (if API is down/quota exceeded)
            return "Gemini_BOT (Fallback): I am out of credits or offline, but I received your message: \""
                    + userMessage
                    + "\"";
        }
    }
}