package edu.cit.panonce.alertme.user.repository;

import edu.cit.panonce.alertme.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmailIgnoreCase_returnsUserForDifferentCaseEmail() {
        User user = new User();
        user.setFirstName("Kim");
        user.setLastName("Lee");
        user.setEmail("Kim.Lee@example.com");
        user.setRole(User.UserRole.STUDENT);
        user.setPasswordHash("password");
        user.setActive(true);
        userRepository.save(user);

        Optional<User> result = userRepository.findByEmailIgnoreCase("kim.lee@EXAMPLE.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("Kim.Lee@example.com");
    }

    @Test
    void existsByEmailIgnoreCase_returnsTrueForExistingEmail() {
        User user = new User();
        user.setFirstName("Sara");
        user.setLastName("Chan");
        user.setEmail("sara@example.com");
        user.setRole(User.UserRole.STUDENT);
        user.setPasswordHash("password");
        user.setActive(true);
        userRepository.save(user);

        boolean exists = userRepository.existsByEmailIgnoreCase("SARA@example.com");

        assertThat(exists).isTrue();
    }

    @Test
    void findByGoogleSubject_returnsUserWhenSubjectExists() {
        User user = new User();
        user.setFirstName("Sam");
        user.setLastName("Nguyen");
        user.setEmail("sam@example.com");
        user.setGoogleSubject("google-abc");
        user.setRole(User.UserRole.STUDENT);
        user.setPasswordHash("password");
        user.setActive(true);
        userRepository.save(user);

        Optional<User> result = userRepository.findByGoogleSubject("google-abc");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("sam@example.com");
    }
}
