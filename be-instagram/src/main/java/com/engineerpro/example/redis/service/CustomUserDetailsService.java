package com.engineerpro.example.redis.service;

import com.engineerpro.example.redis.model.User;
import com.engineerpro.example.redis.repository.UserRepository;
import com.engineerpro.example.redis.dto.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return UserPrincipal.create(user);
        } else {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
    }

    public UserDetails loadUserByProviderAndProviderId(String provider, String providerId) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByProviderAndProviderId(provider, providerId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return UserPrincipal.create(user);
        } else {
            throw new UsernameNotFoundException("User not found with provider: " + provider + " and providerId: " + providerId);
        }
    }
}

