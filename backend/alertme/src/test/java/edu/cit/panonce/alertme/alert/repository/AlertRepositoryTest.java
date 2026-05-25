package edu.cit.panonce.alertme.alert.repository;

import edu.cit.panonce.alertme.alert.entity.Alert;
import edu.cit.panonce.alertme.user.entity.User;
import edu.cit.panonce.alertme.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AlertRepositoryTest {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndRetrieveAlert_persistsReporterRelationship() {
        User reporter = new User();
        reporter.setFirstName("Iris");
        reporter.setLastName("Taylor");
        reporter.setEmail("iris@example.com");
        reporter.setRole(User.UserRole.STUDENT);
        reporter.setPasswordHash("password");
        reporter.setActive(true);
        userRepository.save(reporter);

        Alert alert = new Alert();
        alert.setReporter(reporter);
        alert.setCategory("Safety");
        alert.setPriority(Alert.AlertPriority.HIGH);
        alert.setDescription("Test alert details");
        alert.setLocationText("Building A");
        alert.setStatus(Alert.AlertStatus.RECEIVED);
        alertRepository.save(alert);

        List<Alert> results = alertRepository.findAll();

        assertThat(results).hasSize(1);
        Alert persisted = results.get(0);
        assertThat(persisted.getCategory()).isEqualTo("Safety");
        assertThat(persisted.getReporter().getEmail()).isEqualTo("iris@example.com");
        assertThat(persisted.getStatus()).isEqualTo(Alert.AlertStatus.RECEIVED);
    }
}
