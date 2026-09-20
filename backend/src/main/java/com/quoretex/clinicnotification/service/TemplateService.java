package com.quoretex.clinicnotification.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.quoretex.clinicnotification.model.MessageTemplate;
import com.quoretex.clinicnotification.repository.TemplateRepository;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    public List<MessageTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Optional<MessageTemplate> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    public Optional<MessageTemplate> getActiveTemplate(
            String event,
            String channel
    ) {
        return templateRepository
                .findByEventAndChannelAndActiveTrue(event, channel);
    }

    public MessageTemplate saveTemplate(MessageTemplate template) {
        return templateRepository.save(template);
    }

    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
}