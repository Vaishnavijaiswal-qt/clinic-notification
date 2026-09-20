package com.quoretex.clinicnotification.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quoretex.clinicnotification.model.NotificationSetting;
import com.quoretex.clinicnotification.service.SettingsService;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public List<NotificationSetting> getSettings() {
        return settingsService.getSettings();
    }

    @PostMapping
    public Map<String, Object> saveSettings(
            @RequestBody NotificationSetting setting) {

        NotificationSetting savedSetting =
                settingsService.saveSettings(setting);

        // Keep data properties in the required order
        Map<String, Object> data = new LinkedHashMap<>();

        data.put("clientId", savedSetting.getClientId());
        data.put("clinicId", savedSetting.getClinicId());
        data.put("event", savedSetting.getEvent());
        data.put("whatsapp", savedSetting.isWhatsapp());
        data.put("sms", savedSetting.isSms());
        data.put("email", savedSetting.isEmail());

        // Keep response properties in the required order
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", true);
        response.put("message", "Settings saved successfully");
        response.put("data", data);

        return response;
    }
}