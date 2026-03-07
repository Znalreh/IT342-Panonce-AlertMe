package edu.cit.panonce.alertme.config;

import edu.cit.panonce.alertme.entity.User;
import edu.cit.panonce.alertme.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        String passwordHash = user.getPasswordHash() == null ? "" : user.getPasswordHash();

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(passwordHash)
            .authorities(authorities)
            .disabled(!user.isActive())
            .build();
    }
}
