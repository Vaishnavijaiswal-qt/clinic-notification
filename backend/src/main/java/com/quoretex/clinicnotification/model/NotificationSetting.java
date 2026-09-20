package com.quoretex.clinicnotification.model;

public class NotificationSetting {

    private String clientId;
    private String clinicId;
    private String event;
    private boolean whatsapp;
    private boolean sms;
    private boolean email;

    public NotificationSetting(
            String clientId,
            String clinicId,
            String event,
            boolean whatsapp,
            boolean sms,
            boolean email) {

        this.clientId = clientId;
        this.clinicId = clinicId;
        this.event = event;
        this.whatsapp = whatsapp;
        this.sms = sms;
        this.email = email;
    }

    public String getClientId() {
        return clientId;
    }

    public String getClinicId() {
        return clinicId;
    }

    public String getEvent() {
        return event;
    }

    public boolean isWhatsapp() {
        return whatsapp;
    }

    public boolean isSms() {
        return sms;
    }

    public boolean isEmail() {
        return email;
    }

    public void setWhatsapp(boolean whatsapp) {
        this.whatsapp = whatsapp;
    }

    public void setSms(boolean sms) {
        this.sms = sms;
    }

    public void setEmail(boolean email) {
        this.email = email;
    }
}