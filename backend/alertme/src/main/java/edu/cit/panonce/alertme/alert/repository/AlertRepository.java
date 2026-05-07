package edu.cit.panonce.alertme.alert.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.panonce.alertme.alert.entity.Alert;

import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
}
