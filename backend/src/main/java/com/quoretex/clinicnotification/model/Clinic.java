package com.quoretex.clinicnotification.model;

public class Clinic {

    private String id;
    private String clientId;
    private String name;

    public Clinic(String id, String clientId, String name) {
        this.id = id;
        this.clientId = clientId;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getClientId() {
        return clientId;
    }

    public String getName() {
        return name;
    }
}