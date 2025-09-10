#!/usr/bin/env python3
"""
Instagram Engagement Bot - Auto Like & Comment Bot
Automatically likes and comments on random posts to generate engagement
"""

import requests
import json
import time
import random
import os
from datetime import datetime

class LikeAndCommentBot:
    def __init__(self):
        self.base_url = "http://localhost:8080/api"
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        
        # Fun comments for posts
        # Fun comments for posts
        self.comments = [
            "Great post! 👍",
            "Love this! ❤️",
            "Amazing! ✨",
            "So cool! 😎",
            "Wow, just wow! 🤩",
            "This is awesome! 🔥",
            "Beautiful! 🌸",
            "Lovely post 💕",
            "Fantastic! 🌟",
            "Superb shot 📸",
            "Stunning 😍",
            "Perfect! ✅",
            "Epic! 💯",
            "Adorable 🥰",
            "Very nice 👌",
            "Legendary ⚡",
            "So inspiring 🌈",
            "Wonderful ✨",
            "Keep it up 🙌",
            "Fabulous 💃",
            "Insane vibes 🔥",
            "Classic! 🎶",
            "Dreamy 🌙",
            "Iconic ⭐",
            "Golden ✨",
            "Outstanding 👏",
            "Really cool 🌊",
            "Sweet 💖",
            "Gorgeous 🌹",
            "Incredible 🌍",
            "Fantastic work 👏",
            "Magical ✨",
            "Top tier 🔝",
            "Insanely good 🤯",
            "Refreshing 🌿",
            "Brilliant 💡",
            "Love the energy ⚡",
            "Sharp! 🗡️",
            "Phenomenal 🔥",
            "Impressive 🏆",
            "Charming ✨",
            "Super cute 🐾",
            "Top notch 👍",
            "Mind-blowing 🤯",
            "Top vibes 🎶",
            "Bright 🌞",
            "Icon 💫",
            "Dazzling 💎",
            "Masterpiece 🎨",
            "Sweet vibes 🍭",
            "So chill ❄️",
            "Rockstar 🤘",
            "Insane energy ⚡",
            "So cool & clean ✨",
            "Glorious 🌟",
            "Delightful 🍀",
            "Fantastic vibes 🎉",
            "Love the style 👗",
            "Awesome mood ✨",
            "Golden vibes 🌟",
            "Too good 🔥",
            "Unreal 🌌",
            "Respect ✊",
            "Bomb 💣",
            "Wow factor 💥",
            "Super stylish 👑",
            "So peaceful 🕊️",
            "Big mood 😎",
            "Insane drip 💧",
            "Such beauty 🌺",
            "Classy 💼",
            "Aesthetic ✨",
            "Simply perfect 💯",
            "Vibing 🎶",
            "Slaying 🔥",
            "Such a mood 😍",
            "Too fresh 🥶",
            "Lovely capture 📷",
            "Brave 💪",
            "Super clean 🧼",
            "Vibrant 🌈",
            "Cheerful 😊",
            "Golden hour 🌅",
            "Sooo cute 🐶",
            "Love this vibe 🌸",
            "Sharp look 👀",
            "Dope 🔥",
            "Fresh ✨",
            "Spectacular 🌠",
            "Breathtaking 🌊",
            "Very aesthetic 🎨",
            "Killing it 🔥",
            "Rocking it 🎸",
            "Magnetizing 🌀",
            "High energy ⚡",
            "Top look 👑",
            "Lit 🔥",
            "Crushing it 💯",
            "Super vibe 🎶",
            "Legend ❤️",
            "Queen 👑",
            "King 🤴",
            "Royal 👸",
            "Boss move 💼",
            "Major win 🏅",
        ]

        
        # Bot accounts to use (you can add more)
        self.bot_accounts = [
            {"username": "coffee_addict11", "password": "coffee_addict11"},
            # Add more accounts here if you have them
        ]
        
        # Current bot account
        self.current_bot = None
        
    def login_random_bot(self):
        """Login to a random bot account"""
        try:
            # Choose a random bot account
            self.current_bot = random.choice(self.bot_accounts)
            username = self.current_bot["username"]
            password = self.current_bot["password"]
            
            print(f"🔐 Logging in to {username} account...")
            
            login_data = {
                "username": username,
                "password": password
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("token")
                self.user_id = data.get("userId")
                
                if self.auth_token:
                    print(f"✅ Login successful! User: {username}, ID: {self.user_id}")
                    print(f"🔑 Token preview: {self.auth_token[:20]}...")
                    
                    # Set auth header for future requests
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}",
                        "Content-Type": "application/json"
                    })
                    
                    # Debug: Print current headers
                    print(f"📋 Headers set: Authorization: Bearer {self.auth_token[:20]}...")
                    print(f"📋 Content-Type: {self.session.headers.get('Content-Type')}")
                    
                    return True
                else:
                    print("❌ No token received in response")
                    print(f"📄 Response data: {data}")
                    return False
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def get_random_posts(self, limit=10):
        """Get random posts from the feed"""
        try:
            print(f"📱 Fetching {limit} random posts...")
            print(f"🔗 URL: {self.base_url}/dynamic-feeds?page=0&limit=20")
            print(f"📋 Current headers: {dict(self.session.headers)}")
            
            # Use the correct endpoint that matches your frontend
            response = self.session.get(f"{self.base_url}/dynamic-feeds?page=0&limit=20")
            
            if response.status_code == 200:
                posts_data = response.json()
                posts = posts_data.get("posts", [])
                
                if posts:
                    # Filter out posts by the current bot user
                    other_posts = [post for post in posts if post.get("createdBy", {}).get("username") != self.current_bot["username"]]
                    
                    if other_posts:
                        # Get random posts (up to limit)
                        random_posts = random.sample(other_posts, min(limit, len(other_posts)))
                        print(f"✅ Found {len(random_posts)} posts to engage with")
                        return random_posts
                    else:
                        print("⚠️ No posts from other users found")
                        return []
                else:
                    print("⚠️ No posts found in feed")
                    return []
            else:
                print(f"❌ Failed to fetch posts: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Error fetching posts: {str(e)}")
            return []
    
    def like_post(self, post_id):
        """Like a post"""
        try:
            print(f"❤️ Liking post {post_id}...")
            
            response = self.session.post(f"{self.base_url}/posts/like/{post_id}")
            
            if response.status_code in [200, 201]:
                print(f"✅ Post {post_id} liked successfully!")
                return True
            else:
                print(f"❌ Failed to like post {post_id}: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error liking post: {str(e)}")
            return False
    
    def comment_on_post(self, post_id):
        """Comment on a post"""
        try:
            comment_text = random.choice(self.comments)
            print(f"💬 Commenting on post {post_id}: '{comment_text}'")
            
            comment_data = {
                "postId": post_id,
                "comment": f"{comment_text}",
            }
            
            response = self.session.post(
                f"{self.base_url}/comments",
                json=comment_data
            )
            
            if response.status_code in [200, 201]:
                comment_result = response.json()
                comment_id = comment_result.get("comment", {}).get("id")
                print(f"✅ Comment posted successfully! ID: {comment_id}")
                return True
            else:
                print(f"❌ Failed to comment on post {post_id}: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error commenting on post: {str(e)}")
            return False
    
    def engage_with_post(self, post):
        """Engage with a single post (like and/or comment)"""
        try:
            post_id = post.get("id")
            if not post_id:
                print("⚠️ Post has no ID, skipping")
                return False
            
            print(f"\n🎯 Engaging with post {post_id}")
            print(f"📝 Caption: {post.get('caption', 'No caption')[:50]}...")
            print(f"👤 Created by: {post.get('createdBy', {}).get('username', 'Unknown')}")
            
            # Randomly decide what actions to take
            actions = []
            
            # 70% chance to like
            if random.random() < 0.7:
                actions.append("like")
            
            # 50% chance to comment
            if random.random() < 0.5:
                actions.append("comment")
            
            if not actions:
                print("🎲 No actions selected for this post")
                return False
            
            success_count = 0
            
            # Perform selected actions
            if "like" in actions:
                if self.like_post(post_id):
                    success_count += 1
                time.sleep(1)  # Small delay between actions
            
            if "comment" in actions:
                if self.comment_on_post(post_id):
                    success_count += 1
                time.sleep(1)  # Small delay between actions
            
            print(f"✅ Successfully performed {success_count}/{len(actions)} actions on post {post_id}")
            return success_count > 0
            
        except Exception as e:
            print(f"❌ Error engaging with post: {str(e)}")
            return False
    
    def run_engagement_cycle(self):
        """Run one complete engagement cycle"""
        try:
            print(f"\n🔄 Starting engagement cycle - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Get random posts
            posts = self.get_random_posts(limit=5)  # Engage with up to 5 posts
            
            if not posts:
                print("⚠️ No posts to engage with, skipping cycle")
                return 0
            
            # Engage with posts
            successful_engagements = 0
            for post in posts:
                if self.engage_with_post(post):
                    successful_engagements += 1
                
                # Random delay between posts (2-5 seconds)
                delay = random.uniform(2, 5)
                print(f"⏳ Waiting {delay:.1f} seconds before next post...")
                time.sleep(delay)
            
            print(f"🎉 Engagement cycle completed! {successful_engagements}/{len(posts)} successful engagements")
            return successful_engagements
            
        except Exception as e:
            print(f"❌ Error in engagement cycle: {str(e)}")
            return 0
    
    def run_bot(self, engagement_interval=300):  # 5 minutes between cycles
        """Main bot loop"""
        print("🤖 Instagram Engagement Bot Starting...")
        print(f"⏰ Engagement interval: {engagement_interval} seconds")
        print("=" * 50)
        
        if not self.login_random_bot():
            print("❌ Bot cannot start without successful login")
            return
        
        engagement_count = 0
        cycle_count = 0
        
        try:
            while True:
                cycle_count += 1
                print(f"\n🔄 Engagement Cycle #{cycle_count} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                # Run engagement cycle
                successful_engagements = self.run_engagement_cycle()
                engagement_count += successful_engagements
                
                print(f"📊 Total engagements: {engagement_count}")
                print(f"📊 Total cycles: {cycle_count}")
                
                # Randomly switch accounts every few cycles for variety
                if cycle_count % 3 == 0:
                    print("🔄 Switching to different bot account...")
                    if not self.login_random_bot():
                        print("⚠️ Failed to switch accounts, continuing with current account")
                
                # Wait before next cycle
                print(f"⏳ Waiting {engagement_interval} seconds until next engagement cycle...")
                time.sleep(engagement_interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Bot stopped by user")
        except Exception as e:
            print(f"❌ Bot error: {str(e)}")
        finally:
            print(f"📊 Bot finished. Total engagements: {engagement_count}")
            print(f"📊 Total cycles: {cycle_count}")
            print("🤖 Instagram Engagement Bot stopped.")

if __name__ == "__main__":
    bot = LikeAndCommentBot()
    
    # You can adjust the engagement interval (in seconds)
    # 300 = 5 minutes, 600 = 10 minutes, 1800 = 30 minutes
    bot.run_bot(engagement_interval=10)  # 5 minutes between cycles
