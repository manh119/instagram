package com.engineerpro.example.redis.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Post {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private int id;

  @ManyToOne
  @JoinColumn(name = "created_by_id", nullable = false)
  @JsonProperty("createdBy")
  private Profile createdBy;

  @Column(name = "image_url", length = 1000)
  private String imageUrl;
  
  @Column(name = "video_url", length = 1000)
  private String videoUrl;
  
  @Column(name = "caption", length = 2000)
  private String caption;
  
  @Column(name = "created_at")
  private Date createdAt;

  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("comments")
  private List<Comment> comments;

  @ManyToMany
  @JsonProperty("userLikes")
  private Set<Profile> userLikes;

  // Custom toString method to avoid circular references and lazy initialization
  // issues
  @Override
  public String toString() {
    return "Post{" +
        "id=" + id +
        ", createdBy="
        + (createdBy != null ? "Profile(id=" + createdBy.getId() + ", username=" + createdBy.getUsername() + ")"
            : "null")
        +
        ", imageUrl='" + imageUrl + '\'' +
        ", videoUrl='" + videoUrl + '\'' +
        ", caption='" + caption + '\'' +
        ", createdAt=" + createdAt +
        '}';
  }
}
