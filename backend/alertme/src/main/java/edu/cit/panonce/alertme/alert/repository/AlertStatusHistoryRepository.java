package edu.cit.panonce.alertme.alert.repository;

import edu.cit.panonce.alertme.alert.entity.AlertStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlertStatusHistoryRepository extends JpaRepository<AlertStatusHistory, UUID> {
}
