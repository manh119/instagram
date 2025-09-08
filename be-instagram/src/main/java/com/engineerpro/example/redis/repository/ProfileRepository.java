package com.engineerpro.example.redis.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer> {

  @Query("SELECT p FROM Profile p WHERE p.user = :user ORDER BY p.id ASC")
  List<Profile> findByUser(@Param("user") User user);

  Optional<Profile> findOneByUser(User user);

  List<Profile> findByIdNotIn(List<Integer> ids);

  List<Profile> findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(String username,
      String displayName);

  java.util.Optional<Profile> findOneByUsername(String username);
}
