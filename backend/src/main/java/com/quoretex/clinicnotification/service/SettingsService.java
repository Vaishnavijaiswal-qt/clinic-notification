package com.quoretex.clinicnotification.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.quoretex.clinicnotification.model.NotificationSetting;

@Service
public class SettingsService {

    private final List<NotificationSetting> notificationSettings = new ArrayList<>();

    public List<NotificationSetting> getSettings() {
        return notificationSettings;
    }

    public NotificationSetting saveSettings(NotificationSetting newSetting) {

        for (int i = 0; i < notificationSettings.size(); i++) {

            NotificationSetting existingSetting = notificationSettings.get(i);

            if (existingSetting.getClientId().equals(newSetting.getClientId())
                    && existingSetting.getClinicId().equals(newSetting.getClinicId())
                    && existingSetting.getEvent().equals(newSetting.getEvent())) {

                notificationSettings.set(i, newSetting);

                return newSetting;
            }
        }

        notificationSettings.add(newSetting);

        return newSetting;
    }
}