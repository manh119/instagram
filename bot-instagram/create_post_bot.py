#!/usr/bin/env python3
"""
Instagram Bot - Auto Post Creator
Automatically creates posts for coffee_addict account with random images
"""

import requests
import json
import time
import random
import os
from datetime import datetime
import urllib.request
from PIL import Image
import io

class CreatePostBot:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        
        # General captions for posts
        self.captions = [
            "✨ Life is beautiful! #life #beautiful",
            "🌟 Making memories every day #memories #life",
            "💫 Every moment is a new beginning #new #beginning",
            "🌺 Finding beauty in the little things #beauty #life",
            "🌈 Life is what happens while you're busy making plans #life #plans",
            "🎭 Living my best life! #bestlife #living",
            "🌻 Happiness is a choice #happiness #choice",
            "🎨 Creativity flows like a river #creativity #art",
            "🌍 Exploring the world one day at a time #explore #world",
            "💝 Love what you do, do what you love #love #passion",
            "🎯 Goals are dreams with deadlines #goals #dreams",
            "🚀 Taking life one step at a time #life #progress",
            "🎪 Life is a beautiful journey #journey #beautiful",
            "🌙 Dream big, work hard #dreams #hardwork",
            "⭐ Every day is a new adventure #adventure #newday"
        ]
        
        # Image source info
        self.image_source = "Picsum Photos"
    
    def login(self):
        """Login to coffee_addict account"""
        try:
            print("🔐 Logging in to coffee_addict account...")
            
            login_data = {
                "username": "sleepy_dev",
                "password": "password123"
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
                    print(f"✅ Login successful! User ID: {self.user_id}")
                    # Set auth header for future requests
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}",
                        "Content-Type": "application/json"
                    })
                    return True
                else:
                    print("❌ No token received in response")
                    return False
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def get_random_image(self):
        """Get a random image from Picsum Photos"""
        try:
            # Use Picsum Photos for reliable random images
            # Random number ensures different images each time
            random_id = random.randint(1, 1000)
            image_url = f"https://picsum.photos/800/800?random={random_id}"
            
            print(f"📸 Getting random image from Picsum Photos (ID: {random_id})...")
            
            # Download the image
            response = requests.get(image_url, stream=True)
            if response.status_code == 200:
                # Generate unique filename
                timestamp = int(time.time())
                filename = f"random_image_{timestamp}.jpg"
                
                # Save image temporarily
                image_path = f"temp_{filename}"
                with open(image_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                print(f"✅ Downloaded image: {filename}")
                return image_path, filename
            else:
                print(f"❌ Failed to download image: {response.status_code}")
                return None, None
                
        except Exception as e:
            print(f"❌ Error getting random image: {str(e)}")
            return None, None
    
    def get_presigned_url(self, filename, content_type):
        """Get pre-signed URL for image upload"""
        try:
            print(f"🔗 Getting pre-signed URL for {filename}...")
            
            data = {
                "fileName": filename,
                "contentType": content_type
            }
            
            response = self.session.post(
                f"{self.base_url}/api/presigned/upload/post-image",
                json=data
            )
            
            if response.status_code == 200:
                presigned_data = response.json()
                upload_url = presigned_data.get("uploadUrl")
                object_key = presigned_data.get("objectKey")
                
                print(f"✅ Pre-signed URL received")
                return upload_url, object_key
            else:
                print(f"❌ Failed to get pre-signed URL: {response.status_code}")
                return None, None
                
        except Exception as e:
            print(f"❌ Error getting pre-signed URL: {str(e)}")
            return None, None
    
    def upload_image_to_minio(self, image_path, upload_url):
        """Upload image directly to MinIO using pre-signed URL"""
        try:
            print(f"📤 Uploading image to MinIO...")
            
            with open(image_path, 'rb') as f:
                response = requests.put(upload_url, data=f)
            
            if response.status_code == 200:
                print("✅ Image uploaded successfully to MinIO")
                return True
            else:
                print(f"❌ Upload failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error uploading image: {str(e)}")
            return False
    
    def create_post(self, image_path, filename):
        """Create a post with the uploaded image"""
        try:
            print(f"📝 Creating post with image: {filename}")
            
            # Get pre-signed URL
            upload_url, object_key = self.get_presigned_url(filename, "image/jpeg")
            if not upload_url:
                return False
            
            # Upload image to MinIO
            if not self.upload_image_to_minio(image_path, upload_url):
                return False
            
            # Generate final image URL using the object key from pre-signed URL response
            # The object_key contains the full path like "posts/filename.jpg"
            # We need to extract just the filename for the /images/ endpoint
            if object_key and '/' in object_key:
                # Extract filename from object_key (e.g., "posts/filename.jpg" -> "filename.jpg")
                filename_from_object_key = object_key.split('/')[-1]
                image_url = f"{self.base_url}/images/{filename_from_object_key}"
            else:
                # Fallback to original filename if object_key is not available
                image_url = f"{self.base_url}/images/{filename}"
            
            # Create post
            post_data = {
                "caption": random.choice(self.captions),
                "imageUrl": image_url,
                "videoUrl": None
            }
            
            response = self.session.post(
                f"{self.base_url}/posts",
                json=post_data
            )
            
            if response.status_code in [200, 201]:  # Accept both 200 (OK) and 201 (Created)
                post_result = response.json()
                post_id = post_result.get("post", {}).get("id")
                print(f"✅ Post created successfully! ID: {post_id}")
                return True
            else:
                print(f"❌ Failed to create post: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating post: {str(e)}")
            return False
    
    def cleanup_temp_file(self, image_path):
        """Remove temporary image file"""
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
                print(f"🧹 Cleaned up temporary file: {image_path}")
        except Exception as e:
            print(f"⚠️ Warning: Could not remove temp file {image_path}: {str(e)}")
    
    def run_bot(self, post_interval=300):  # 5 minutes between posts
        """Main bot loop"""
        print("🤖 Instagram Bot Starting...")
        print(f"📱 Account: coffee_addict")
        print(f"⏰ Post interval: {post_interval} seconds")
        print("=" * 50)
        
        if not self.login():
            print("❌ Bot cannot start without successful login")
            return
        
        post_count = 0
        
        try:
            while True:
                print(f"\n🔄 Bot cycle #{post_count + 1} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                # Get random image
                image_path, filename = self.get_random_image()
                if not image_path:
                    print("⚠️ Skipping this cycle due to image download failure")
                    time.sleep(60)  # Wait 1 minute before retry
                    continue
                
                # Create post
                if self.create_post(image_path, filename):
                    post_count += 1
                    print(f"🎉 Total posts created: {post_count}")
                else:
                    print("⚠️ Post creation failed, will retry next cycle")
                
                # Clean up temp file
                self.cleanup_temp_file(image_path)
                
                # Wait before next post
                print(f"⏳ Waiting {post_interval} seconds until next post...")
                time.sleep(post_interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Bot stopped by user")
        except Exception as e:
            print(f"❌ Bot error: {str(e)}")
        finally:
            print(f"📊 Bot finished. Total posts created: {post_count}")
            print("🤖 Instagram Bot stopped.")

if __name__ == "__main__":
    bot = CreatePostBot()
    
    # You can adjust the post interval (in seconds)
    # 300 = 5 minutes, 600 = 10 minutes, 1800 = 30 minutes
    bot.run_bot(post_interval=5)  # 10 minutes between posts
