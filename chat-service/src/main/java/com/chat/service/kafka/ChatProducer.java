package com.chat.service.kafka;

import com.chat.service.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendMessage(ChatMessage message) {
        log.info("Producing message to chat-topic: {}", message);
        kafkaTemplate.send("chat-topic", message);
    }
}
