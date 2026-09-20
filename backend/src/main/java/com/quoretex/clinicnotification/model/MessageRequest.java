package com.quoretex.clinicnotification.model;

public class MessageRequest {

    private String clientId;
    private String clinicId;
    private String event;
    private String recipient;
    private String message;

    public MessageRequest() {
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

    public String getRecipient() {
        return recipient;
    }

    public String getMessage() {
        return message;
    }
}