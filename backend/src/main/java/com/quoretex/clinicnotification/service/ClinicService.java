package com.quoretex.clinicnotification.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.quoretex.clinicnotification.model.Clinic;

@Service
public class ClinicService {

    public List<Clinic> getClinics() {
        return Arrays.asList(
                new Clinic("clinic-1", "client-1", "ABC Medical Center"),
                new Clinic("clinic-2", "client-1", "XYZ Dental Clinic"),
                new Clinic("clinic-3", "client-2", "ABC Health Center")
        );
    }
}