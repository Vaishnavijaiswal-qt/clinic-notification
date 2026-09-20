package com.quoretex.clinicnotification.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quoretex.clinicnotification.model.MessageTemplate;

public interface TemplateRepository extends JpaRepository<MessageTemplate, Long> {

    Optional<MessageTemplate> findByEventAndChannelAndActiveTrue(
            String event,
            String channel
    );
}