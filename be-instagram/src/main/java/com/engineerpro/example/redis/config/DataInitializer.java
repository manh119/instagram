package com.engineerpro.example.redis.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.repository.ProfileRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PostRepository postRepository;

    private final Random random = new Random();

    // Fun captions for posts
    private final List<String> funCaptions = Arrays.asList(
        "Just discovered that coffee is actually a food group! ☕",
        "My code has more bugs than a rainforest 🐛",
        "Today's mood: I should probably adult, but I'm going to nap instead 😴",
        "Plot twist: I'm not lazy, I'm just conserving energy for important things 🦥",
        "My plants are still alive, so I'm basically a botanist now 🌱",
        "Warning: May contain traces of sanity 🚨",
        "I'm not arguing, I'm just explaining why I'm right 💁‍♂️",
        "Life is short, make it awesome! ✨",
        "I'm not a morning person, I'm a coffee person ☕",
        "My diet is 90% coffee and 10% food that I forget to eat 🍕",
        "I'm not procrastinating, I'm prioritizing my mental health 🧘‍♀️",
        "Today's goal: Survive and maybe be productive 🤷‍♀️",
        "I'm not late, everyone else is just early ⏰",
        "My spirit animal is a sloth on a Monday 🦥",
        "I'm not weird, I'm limited edition 🎭",
        "Life is like a box of chocolates, but I ate them all 🍫",
        "I'm not short, I'm fun-sized! 🎈",
        "My superpower is finding the most comfortable position to sleep 😴",
        "I'm not lazy, I'm just conserving my awesomeness for later 🌟",
        "Today's forecast: 100% chance of awesome! 🌈"
    );

    // Fun usernames
    private final List<String> funUsernames = Arrays.asList(
        "coffee_addict", "code_ninja", "sleepy_dev", "bug_hunter", "lazy_genius",
        "coffee_master", "debug_warrior", "nap_enthusiast", "code_artist", "fun_coder"
    );

    @Override
    public void run(String... args) throws Exception {
        // Only run if no profiles exist (first time setup)
        if (profileRepository.count() == 0) {
            log.info("No profiles found, creating test profiles with posts...");
            createTestProfilesWithPosts();
        } else {
            log.info("Profiles already exist, skipping data initialization");
        }
    }

    private void createTestProfilesWithPosts() {
        try {
            // Create 5 test profiles with fun usernames
            List<Profile> profiles = new ArrayList<>();
            for (int i = 0; i < 5; i++) {
                Profile profile = Profile.builder()
                    .userId("user" + (i + 1))
                    .username(funUsernames.get(i))
                    .displayName("Fun User " + (i + 1))
                    .bio("Just a fun user with awesome posts! 🎉 User " + (i + 1))
                    .profileImageUrl("https://picsum.photos/200/200?random=" + (i + 1))
                    .build();
                
                profile = profileRepository.save(profile);
                profiles.add(profile);
                log.info("Created test profile: {}", profile.getUsername());
            }

            // Create 20 random posts distributed among the profiles
            for (int i = 0; i < 20; i++) {
                Profile creator = profiles.get(i % profiles.size()); // Distribute posts among profiles
                
                Post post = Post.builder()
                    .caption(funCaptions.get(random.nextInt(funCaptions.size())))
                    .imageUrl("https://picsum.photos/800/800?random=" + (i + 10))
                    .createdAt(new Date(System.currentTimeMillis() - (i * 86400000))) // Each post 1 day apart
                    .createdBy(creator)
                    .build();
                
                postRepository.save(post);
                log.info("Created post {} by {}: {}", i + 1, creator.getUsername(), post.getCaption());
            }

            log.info("✅ SUCCESS: Created {} test profiles with {} posts!", profiles.size(), 20);
            log.info("📱 TEST PROFILES CREATED:");
            for (Profile profile : profiles) {
                log.info("   - {} (@{}) - {}", profile.getDisplayName(), profile.getUsername(), profile.getBio());
            }
            log.info("🔗 These profiles will now appear in suggested users!");

        } catch (Exception e) {
            log.error("Error creating test profiles: ", e);
        }
    }
}
