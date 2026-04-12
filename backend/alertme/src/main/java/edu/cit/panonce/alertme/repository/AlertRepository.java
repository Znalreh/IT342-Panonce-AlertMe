package edu.cit.panonce.alertme.repository;

import edu.cit.panonce.alertme.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
}
