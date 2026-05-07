package edu.cit.panonce.alertme.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.panonce.alertme.user.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByGoogleSubject(String googleSubject);

    boolean existsByEmailIgnoreCase(String email);
}
