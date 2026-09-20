package com.quoretex.clinicnotification.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.quoretex.clinicnotification.model.MessageRequest;
import com.quoretex.clinicnotification.model.NotificationSetting;

@Service
public class MessageService {

    private final SettingsService settingsService;

    public MessageService(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    public Map<String, Object> processMessage(MessageRequest messageRequest) {

        if (messageRequest.getClientId() == null
                || messageRequest.getClinicId() == null
                || messageRequest.getEvent() == null
                || messageRequest.getRecipient() == null
                || messageRequest.getMessage() == null
                || messageRequest.getClientId().isBlank()
                || messageRequest.getClinicId().isBlank()
                || messageRequest.getEvent().isBlank()
                || messageRequest.getRecipient().isBlank()
                || messageRequest.getMessage().isBlank()) {

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "All message fields are required");

            return response;
        }

        NotificationSetting setting = null;

        for (NotificationSetting item : settingsService.getSettings()) {

            if (item.getClientId().equals(messageRequest.getClientId())
                    && item.getClinicId().equals(messageRequest.getClinicId())
                    && item.getEvent().equals(messageRequest.getEvent())) {

                setting = item;
                break;
            }
        }

        if (setting == null) {

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "No notification setting found");

            return response;
        }

        List<String> channels = new ArrayList<>();

        if (setting.isWhatsapp()) {
            channels.add("WhatsApp");
        }

        if (setting.isSms()) {
            channels.add("SMS");
        }

        if (channels.isEmpty()) {

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "No communication channel is enabled");

            return response;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("channels", channels);
        response.put("status", "Message processed successfully");
        response.put("message", messageRequest.getMessage());

        return response;
    }
}