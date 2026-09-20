package com.quoretex.clinicnotification.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quoretex.clinicnotification.model.MessageRequest;
import com.quoretex.clinicnotification.service.MessageService;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public Map<String, Object> sendMessage(
            @RequestBody MessageRequest messageRequest) {

        return messageService.processMessage(messageRequest);
    }
}