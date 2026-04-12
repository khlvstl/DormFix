package com.vestil.dormfix.service;

import com.vestil.dormfix.dto.RegistrationRequest;
import com.vestil.dormfix.dto.LoginRequest;
import com.vestil.dormfix.entity.User;
import com.vestil.dormfix.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client-id}")
    private String googleClientId;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public User createUser(User user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setRole(userDetails.getRole());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Register a new user
     * 
     * @param registrationRequest Registration details
     * @return Newly registered user
     * @throws IllegalArgumentException if email already exists or validation fails
     */
    public User register(RegistrationRequest registrationRequest) {
        // Check if email already exists
        if (existsByEmail(registrationRequest.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + registrationRequest.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setEmail(registrationRequest.getEmail());
        
        // Hash password
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        
        user.setRole(registrationRequest.getRole());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    /**
     * Login user with email and password
     * 
     * @param loginRequest Login credentials
     * @return User if credentials are valid
     * @throws IllegalArgumentException if credentials are invalid
     */
    public User login(LoginRequest loginRequest) {
        // Find user by email
        Optional<User> userOptional = getUserByEmail(loginRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        User user = userOptional.get();
        
        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        return user;
    }

    /**
     * Login or register a user using a Google ID token.
     *
     * @param idToken Google ID token from frontend
     * @return existing or newly created User
     */
    public User loginWithGoogle(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            String email = payload.getEmail();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");

            return userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User user = new User();
                        user.setEmail(email);
                        user.setFirstName(firstName != null ? firstName : "Google");
                        user.setLastName(lastName != null ? lastName : "User");
                        // Default role for Google users; adjust as needed
                        user.setRole("resident");
                        // Set a random password since Google users won't log in with password
                        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                        user.setCreatedAt(LocalDateTime.now());
                        user.setUpdatedAt(LocalDateTime.now());
                        return userRepository.save(user);
                    });
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google login failed: " + e.getMessage());
        }
    }
}
