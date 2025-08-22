#!/bin/bash

# Instagram Engagement Bot Runner Script
echo "🤖 Starting Instagram Engagement Bot..."

# Activate virtual environment
source instagram_bot_env/bin/activate

# Run the engagement bot
python3 auto_like_comment_bot.py

# Deactivate virtual environment when done
deactivate
