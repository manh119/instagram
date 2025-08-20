package com.engineerpro.example.redis.dto;

import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.engineerpro.example.redis.model.User;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
public class UserPrincipal implements OAuth2User, UserDetails {

    private Long id;
    private String username;
    private String password;
    private String name;
    private String picture; // Added picture field for OAuth2
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    private String provider;
    private String providerId;
    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;

    public UserPrincipal(Long id, String username, String password,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getAuthorities().stream()
            .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
            .collect(Collectors.toList());

        UserPrincipal userPrincipal = new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                authorities);
        
        // Set additional fields from user
        userPrincipal.setName(user.getName());
        userPrincipal.setPicture(user.getPicture());
        userPrincipal.setProvider(user.getProvider());
        userPrincipal.setProviderId(user.getProviderId());
        userPrincipal.setEnabled(user.isEnabled());
        userPrincipal.setAccountNonExpired(user.isAccountNonExpired());
        userPrincipal.setAccountNonLocked(user.isAccountNonLocked());
        userPrincipal.setCredentialsNonExpired(user.isCredentialsNonExpired());
        
        return userPrincipal;
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }

    // OAuth2User methods
    @Override
    public String getName() {
        return this.username;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    // UserDetails methods
    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return this.accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return this.credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }
}
