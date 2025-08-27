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
            "⭐ Every day is a new adventure #adventure #newday",
            "🌞 Good vibes only #goodvibes #positive",
            "🍀 Lucky to be alive #grateful #life",
            "💎 Shine bright like yourself #shine #selflove",
            "🌸 Bloom where you are planted #bloom #growth",
            "🔥 Passion fuels everything #passion #energy",
            "🍂 Change is beautiful #change #life",
            "🎶 Life has its own rhythm #music #life",
            "🦋 Transform into the best version of you #growth #transformation",
            "🍎 Health is wealth #health #wellbeing",
            "📚 Learning never ends #learning #growth",
            "🌊 Flow with the tide of life #life #flow",
            "🌿 Nature heals the soul #nature #peace",
            "🥂 Cheers to new beginnings #celebration #new",
            "🎉 Small wins matter too #success #wins",
            "⏳ Time is precious #time #life",
            "💭 Positive thoughts create positive life #positivity #mindset",
            "📸 Capture the moment #moment #life",
            "👣 One step closer to dreams #dreams #progress",
            "⚡ Energy flows where attention goes #focus #energy",
            "🌃 Nights full of dreams #night #dreaming",
            "🍃 Simplicity is the ultimate sophistication #simple #life",
            "🏔️ Keep climbing #mountains #goals",
            "💡 Light up your world #light #hope",
            "🛤️ Choose your own path #path #journey",
            "🌟 Believe in magic #believe #magic",
            "🎈 Joy is contagious #joy #happiness",
            "☀️ Every sunrise brings hope #sunrise #hope",
            "🌌 Stars remind us to shine #stars #shine",
            "🚴 Keep moving forward #progress #life",
            "🌻 Smiles are free, share them #smile #joy",
            "💖 Self-love is the best love #selflove #love",
            "🎀 Kindness never goes out of style #kindness #love",
            "🌲 Breathe in the peace of nature #nature #calm",
            "🕊️ Peace begins with a smile #peace #smile",
            "🍫 Sweet moments matter most #sweet #moments",
            "🏖️ Collect memories, not things #memories #life",
            "🌊 Lost in the waves #ocean #peace",
            "🖼️ Your life is your canvas #art #life",
            "🥰 Grateful hearts are happy hearts #grateful #happy",
            "🎵 Sing your own song #song #life",
            "🌺 Choose happiness daily #happiness #choice",
            "💫 Create your own sunshine #sunshine #positive",
            "🎤 Speak your truth #truth #confidence",
            "🌉 Cross every bridge with courage #courage #journey",
            "🏝️ Escape into paradise #paradise #travel",
            "🚶 Walk at your own pace #life #journey",
            "🧘 Inner peace is real success #peace #success",
            "🌱 Growth takes time #growth #patience",
            "💐 Spread love everywhere #love #kindness",
            "🎬 Your story matters #life #story",
            "🏆 Celebrate small victories #success #celebrate",
            "✨ Sparkle with positivity #positivity #sparkle",
            "💼 Work hard, dream big #hardwork #dreams",
            "🥳 Live with intention #life #intention",
            "🛶 Go with the flow #life #flow",
            "🍹 Relax and unwind #relax #peace",
            "🌙 Dreams don’t work unless you do #dreams #work",
            "🖤 Find strength in struggles #strength #life",
            "🌟 You are your only limit #motivation #growth",
            "🥇 Be proud of how far you’ve come #success #growth",
            "🚪 Every end is a new beginning #new #beginning",
            "🌈 Good things take time #patience #goodvibes",
            "🛤️ Your journey is unique #journey #life",
            "📖 Write your own story #story #life",
            "🥾 Adventure awaits #adventure #explore",
            "🧭 Follow your heart #heart #life",
            "💎 Be your authentic self #authentic #life",
            "🌹 Beauty in every detail #beauty #life",
            "🍵 Find calm in the chaos #calm #peace",
            "⚓ Stay grounded, keep rising #balance #strength",
            "🍕 Enjoy the little joys #joy #life",
            "🐚 Collect moments, not things #moments #memories",
            "🌍 The world is your playground #explore #life",
            "🍯 Sweetness in simplicity #simple #sweet",
            "🎇 Light up the night #night #shine",
            "🏄 Ride the waves of life #waves #life",
            "🦄 Believe in yourself #believe #you",
            "🛎️ Be present in the moment #present #now",
            "💌 Love is the answer #love #life",
            "🥂 Celebrate yourself #selflove #celebrate",
            "🎶 Dance to your own beat #dance #life",
            "🚀 Keep reaching higher #goals #dreams",
            "🌞 Smile at the sun #smile #positive",
            "🧡 Gratitude changes everything #gratitude #life"
        ]

        
        # Image source info
        self.image_source = "Picsum Photos"
    
    def login(self):
        """Login to coffee_addict account"""
        try:
            print("🔐 Logging in to coffee_addict account...")
            
            login_data = {
                "username": "code_ninja",
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
