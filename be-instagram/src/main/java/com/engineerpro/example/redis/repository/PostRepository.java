package com.engineerpro.example.redis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
  List<Post> findByIdIn(List<Integer> ids);

  List<Post> findByCreatedBy(Profile createdBy);

  @Query(value = "select * from post where created_by_id in :ids order by created_at desc LIMIT :limit OFFSET :offset", nativeQuery = true)
  List<Post> findByCreatedBy(@Param("ids") List<Integer> createdByIdList, @Param(value = "limit") int limit,
      @Param(value = "offset") int offset);

  @Query(value = "select count(*) from post where created_by_id in :ids", nativeQuery = true)
  int countByCreatedByIn(@Param("ids") List<Integer> createdByIdList);

  int countByCreatedBy(Profile createdBy);

  // Custom query to fetch posts with Profile data
  @Query("SELECT p FROM Post p JOIN FETCH p.createdBy WHERE p.id IN :ids ORDER BY p.createdAt DESC")
  List<Post> findByIdInWithProfile(@Param("ids") List<Integer> ids);

  // Custom query to fetch posts by user with Profile data
  @Query("SELECT p FROM Post p JOIN FETCH p.createdBy WHERE p.createdBy.id = :profileId ORDER BY p.createdAt DESC")
  List<Post> findByCreatedByIdWithProfile(@Param("profileId") int profileId);

  // Custom query to fetch posts by user with all necessary relationships for profile page
  @Query("SELECT DISTINCT p FROM Post p " +
         "JOIN FETCH p.createdBy " +
         "LEFT JOIN FETCH p.comments " +
         "LEFT JOIN FETCH p.userLikes " +
         "WHERE p.createdBy.id = :profileId " +
         "ORDER BY p.createdAt DESC")
  List<Post> findByCreatedByIdWithAllRelationships(@Param("profileId") int profileId);

  // Custom query to fetch a single post with all relationships for comments modal
  @Query("SELECT DISTINCT p FROM Post p " +
         "JOIN FETCH p.createdBy " +
         "LEFT JOIN FETCH p.comments c " +
         "LEFT JOIN FETCH c.createdBy " +
         "LEFT JOIN FETCH p.userLikes " +
         "WHERE p.id = :postId")
  Post findByIdWithAllRelationships(@Param("postId") int postId);

  // Custom query to fetch posts with Profile data by profile IDs for feed
  @Query("SELECT p FROM Post p JOIN FETCH p.createdBy WHERE p.createdBy.id IN :profileIds ORDER BY p.createdAt DESC")
  List<Post> findByCreatedByProfileIdsWithProfile(@Param("profileIds") List<Integer> profileIds);
}
