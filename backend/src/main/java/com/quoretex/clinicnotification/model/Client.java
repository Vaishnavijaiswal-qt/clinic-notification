package com.quoretex.clinicnotification.model;

public class Client {

    private String id;
    private String name;

    public Client(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}