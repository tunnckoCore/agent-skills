---
name: twitter
description: Use when you need to interact with Twitter/X - post tweets, reply, like, retweet, manage DMs, read timelines, or search for tweets.
---

# Twitter Actions

## Overview

Use the `twitter` skill to manage a Twitter/X account via the `scripts/twitter-api.py` CLI script.

### Environment Variables
Ensure the following environment variables are set:
- `TWITTER_CONSUMER_KEY`
- `TWITTER_CONSUMER_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `TWITTER_USER_ID` (The numeric user ID of the bot account)
- `TWITTER_USER_HANDLE` (The username/handle without the @)

## Usage

Run the python script directly from the skill directory.

```bash
python3 {baseDir}/scripts/twitter-api.py <command> [args...]
```

## Best Practices (Twitter Algorithm)

Before posting, consider using the `twitter-algorithm` skill to optimize your content.
- Check with its `score-tweet.sh` script to validate your draft against ranking signals.
- Use its `best-time.sh` script to find optimal posting windows.
- Ensure you have native media (images/video) for better reach.
- Avoid using more than 1 hashtag.

## Actions

### Read Content

**Get recent mentions**
```bash
python3 {baseDir}/scripts/twitter-api.py mentions [count]
# Example: python3 {baseDir}/scripts/twitter-api.py mentions 5
```

**Read home timeline**
```bash
python3 {baseDir}/scripts/twitter-api.py timeline [count]
# Example: python3 {baseDir}/scripts/twitter-api.py timeline 10
```

**Search tweets**
```bash
python3 {baseDir}/scripts/twitter-api.py search "query" [count]
# Example: python3 {baseDir}/scripts/twitter-api.py search "AI agents" 5
```

**Get single tweet**
```bash
python3 {baseDir}/scripts/twitter-api.py get <tweet_id>
```

**Get own recent tweets**
```bash
python3 {baseDir}/scripts/twitter-api.py my-tweets [count]
```

### Create Content

**Post a tweet**
```bash
python3 {baseDir}/scripts/twitter-api.py tweet "Hello world"
```

**Post with media**
```bash
python3 {baseDir}/scripts/twitter-api.py tweet-media "Check this out" /path/to/image.png
```

**Reply to a tweet**
```bash
python3 {baseDir}/scripts/twitter-api.py reply <tweet_id> "This is a reply"
```

**Reply with media**
```bash
python3 {baseDir}/scripts/twitter-api.py reply-media <tweet_id> "Look at this" /path/to/image.png
```

### Engagement

**Like a tweet**
```bash
python3 {baseDir}/scripts/twitter-api.py like <tweet_id>
```

**Retweet**
```bash
python3 {baseDir}/scripts/twitter-api.py retweet <tweet_id>
```

**Delete a tweet**
```bash
python3 {baseDir}/scripts/twitter-api.py delete <tweet_id>
```

### Account & DMs

**Update Bio**
```bash
python3 {baseDir}/scripts/twitter-api.py bio "New bio text"
```

**Send DM (Direct Message)**
```bash
python3 {baseDir}/scripts/twitter-api.py dm <user_id> "Message content"
```

**Reply to DM Conversation**
```bash
python3 {baseDir}/scripts/twitter-api.py dm-conv <conversation_id> "Message content"
```

## Tips

- **Tweet IDs**: Always use the numeric ID when referencing tweets.
- **Media**: Provide absolute paths or paths relative to the working directory for images.
- **Quoting**: Ensure tweet text arguments are properly quoted to handle spaces and special characters.
