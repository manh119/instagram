# Database Setup Instructions

## Step 4: Sample Data
The application will automatically create sample data on first run:
- **10 user profiles** (user1, user2, ..., user10)
- **15 sample posts** with random images
- **Random likes** on posts (1-5 likes per post)
- **Sample comments** on posts (1-3 comments per post)
- **Follow relationships** between users

## Step 5: Test the API
Once the application is running, you can test the public endpoints:

1. **Get user posts** (no authentication required):
   ```bash
   curl http://localhost:8080/posts/user/1
   ```

2. **Get individual post** (no authentication required):
   ```bash
   curl http://localhost:8080/posts/1
   ```

3. **Get all posts for user 1**:
   ```bash
   curl http://localhost:8080/posts/user/1
   ```

## Database Schema
The following tables will be automatically created:
- `profile` - User profiles
- `post` - Instagram posts
- `comment` - Comments on posts
- `user_following` - Follow relationships
- `user` - User accounts
- `authority` - User roles/permissions

The `DataInitializer` will automatically detect an empty database and recreate all sample data.
