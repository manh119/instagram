package com.engineerpro.example.redis.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
  
  @Column(unique = true, name = "userId", nullable = false)
  private String userId;
  
  private String profileImageUrl;
  private String displayName;
  private String username;
  private String bio;

  // Custom toString method to avoid circular references
  @Override
  public String toString() {
    return "Profile{" +
        "id=" + id +
        ", userId='" + userId + '\'' +
        ", username='" + username + '\'' +
        ", displayName='" + displayName + '\'' +
        ", bio='" + bio + '\'' +
        '}';
  }
}
