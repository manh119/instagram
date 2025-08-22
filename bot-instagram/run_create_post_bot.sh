#!/bin/bash

# Instagram Bot Runner Script
echo "🤖 Starting Instagram Bot..."

# Activate virtual environment
source instagram_bot_env/bin/activate

# Run the bot
python3 create_post_bot.py

# Deactivate virtual environment when done
deactivate
