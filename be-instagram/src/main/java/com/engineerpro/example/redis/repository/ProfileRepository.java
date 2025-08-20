package com.engineerpro.example.redis.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.User;

import java.util.List;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer> {
  Profile findOneByUser(User user);
  
  List<Profile> findByIdNotIn(List<Integer> ids);
  
  List<Profile> findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(String username, String displayName);
  
  java.util.Optional<Profile> findOneByUsername(String username);
}
