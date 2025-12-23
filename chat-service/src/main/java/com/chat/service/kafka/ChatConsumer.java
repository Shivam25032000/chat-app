package com.chat.service.kafka;

import com.chat.service.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "chat-topic", groupId = "chat-group")
    public void consumeMessage(ChatMessage message) {
        log.info("Consuming message from chat-topic: {}", message);
        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getRecipientId(),
                message);
    }
}
