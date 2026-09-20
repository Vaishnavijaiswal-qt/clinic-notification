package com.quoretex.clinicnotification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quoretex.clinicnotification.model.MessageTemplate;
import com.quoretex.clinicnotification.service.TemplateService;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "http://localhost:5173")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public List<MessageTemplate> getAllTemplates() {
        return templateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageTemplate> getTemplateById(@PathVariable Long id) {

        return templateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/find")
    public ResponseEntity<MessageTemplate> getActiveTemplate(
            @RequestParam String event,
            @RequestParam String channel) {

        return templateService.getActiveTemplate(event, channel)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MessageTemplate saveTemplate(
            @RequestBody MessageTemplate template) {

        return templateService.saveTemplate(template);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {

        templateService.deleteTemplate(id);

        return ResponseEntity.noContent().build();
    }
}