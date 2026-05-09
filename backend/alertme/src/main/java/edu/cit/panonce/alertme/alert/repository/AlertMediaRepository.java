package edu.cit.panonce.alertme.alert.repository;

import edu.cit.panonce.alertme.alert.entity.AlertMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AlertMediaRepository extends JpaRepository<AlertMedia, UUID> {
}