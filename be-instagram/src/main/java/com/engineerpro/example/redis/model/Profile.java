package com.engineerpro.example.redis.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Profile {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private int id;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "authorities", "password"})
  private User user;
  
  private String profileImageUrl;
  private String displayName;
  private String username;
  private String bio;

  // Getter for user ID to maintain frontend compatibility
  public Long getUserId() {
    return user != null ? user.getId() : null;
  }

  // Custom toString method to avoid circular references
  @Override
  public String toString() {
    return "Profile{" +
        "id=" + id +
        ", username='" + username + '\'' +
        ", displayName='" + displayName + '\'' +
        ", bio='" + bio + '\'' +
        '}';
  }
}
