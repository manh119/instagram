package com.engineerpro.example.redis.config;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.engineerpro.example.redis.model.Comment;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.User;
import com.engineerpro.example.redis.model.UserFollowing;
import com.engineerpro.example.redis.repository.CommentRepository;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.repository.ProfileRepository;
import com.engineerpro.example.redis.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FollowerRepository followerRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");
        
        // Check if data already exists
        if (profileRepository.count() > 0) {
            log.info("Database already contains data, skipping initialization");
            return;
        }

        try {
            createSampleData();
            log.info("Sample data created successfully!");
        } catch (Exception e) {
            log.error("Error creating sample data: ", e);
        }
    }

    private void createSampleData() {
        // Create sample profiles
        List<Profile> profiles = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Profile profile = Profile.builder()
                .username("user" + i)
                .displayName("User " + i)
                .bio("This is user " + i + "'s bio")
                .profileImageUrl("https://picsum.photos/200/200?random=" + i)
                .userId(UUID.randomUUID().toString())
                .build();
            profiles.add(profileRepository.save(profile));
        }

        // Create sample posts
        List<Post> posts = new ArrayList<>();
        for (int i = 1; i <= 15; i++) {
            Profile creator = profiles.get((i - 1) % profiles.size());
            
            Post post = Post.builder()
                .caption("This is post " + i + " by " + creator.getUsername())
                .createdBy(creator)
                .imageUrl("https://picsum.photos/800/600?random=" + (i + 100))
                .createdAt(new Date())
                .userLikes(new HashSet<>())
                .build();
            
            posts.add(postRepository.save(post));
        }

        // Add some likes to posts
        for (Post post : posts) {
            Set<Profile> likes = new HashSet<>();
            int likeCount = (int) (Math.random() * 5) + 1; // 1-5 likes per post
            List<Profile> shuffledProfiles = new ArrayList<>(profiles);
            Collections.shuffle(shuffledProfiles);
            
            for (int i = 0; i < likeCount && i < shuffledProfiles.size(); i++) {
                likes.add(shuffledProfiles.get(i));
            }
            post.setUserLikes(likes);
            postRepository.save(post);
        }

        // Create sample comments
        for (Post post : posts) {
            int commentCount = (int) (Math.random() * 3) + 1; // 1-3 comments per post
            for (int i = 0; i < commentCount; i++) {
                Profile commenter = profiles.get((int) (Math.random() * profiles.size()));
                Comment comment = Comment.builder()
                    .post(post)
                    .createdBy(commenter)
                    .comment("Great post! Comment " + (i + 1) + " by " + commenter.getUsername())
                    .createdAt(new Date())
                    .build();
                commentRepository.save(comment);
            }
        }

        // Create sample follow relationships
        for (int i = 1; i <= 5; i++) {
            Profile follower = profiles.get(i - 1);
            for (int j = 0; j < 3; j++) { // Each user follows 3 others
                Profile following = profiles.get((i + j) % profiles.size());
                if (!follower.equals(following)) {
                    UserFollowing userFollowing = new UserFollowing();
                    userFollowing.setFollowerUserId(follower.getId());
                    userFollowing.setFollowingUserId(following.getId());
                    userFollowing.setCreatedAt(new Date());
                    followerRepository.save(userFollowing);
                }
            }
        }

        log.info("Created {} profiles, {} posts, {} comments, and {} follow relationships", 
            profiles.size(), posts.size(), commentRepository.count(), followerRepository.count());
    }
}
