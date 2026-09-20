package com.quoretex.clinicnotification.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.quoretex.clinicnotification.model.Client;

@Service
public class ClientService {

    public List<Client> getClients() {
        return Arrays.asList(
                new Client("client-1", "ABC Healthcare"),
                new Client("client-2", "XYZ Healthcare")
        );
    }
}