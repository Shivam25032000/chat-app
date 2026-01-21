package com.chat.ai.service;

import com.chat.ai.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiConsumer {

    private final GeminiService geminiService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "chat-topic", groupId = "ai-group")
    public void consume(ChatMessage message) {
        log.info("AI Service received message: {}", message);

        // Check if the message is intended for the AI
        if ("AI_BOT".equalsIgnoreCase(message.getRecipientId())) {
            log.info("Processing AI request for user: {}", message.getSenderId());

            String aiResponse = geminiService.generateResponse(message.getContent());

            ChatMessage reply = ChatMessage.builder()
                    .chatId(message.getChatId())
                    .senderId("AI_BOT")
                    .recipientId(message.getSenderId())
                    .content(aiResponse)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss:SSS a")))
                    .build();

            log.info("Sending AI response: {}", reply);
            kafkaTemplate.send("chat-topic", reply);
        }
    }
}
