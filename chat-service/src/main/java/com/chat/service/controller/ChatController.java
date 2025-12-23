package com.chat.service.controller;

import com.chat.service.entity.ChatMessage;
import com.chat.service.kafka.ChatProducer;
import com.chat.service.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatProducer producer;
    private final ChatMessageRepository repository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        if (chatMessage.getChatId() == null || chatMessage.getChatId().isEmpty()) {
            chatMessage.setChatId(getChatId(chatMessage.getSenderId(), chatMessage.getRecipientId()));
        }
        chatMessage.setTimestamp(new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:SSS a").format(new Date()));
        ChatMessage saved = repository.save(chatMessage);
        producer.sendMessage(saved);
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    @ResponseBody
    public List<ChatMessage> findChatMessages(
            @PathVariable String senderId,
            @PathVariable String recipientId) {
        String chatId = getChatId(senderId, recipientId);
        return repository.findByChatId(chatId);
    }

    private String getChatId(String senderId, String recipientId) {
        if (senderId.compareTo(recipientId) < 0) {
            return senderId + "_" + recipientId;
        } else {
            return recipientId + "_" + senderId;
        }
    }
}
