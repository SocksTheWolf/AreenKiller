# Areen Killer

## Who?

There is a series of accounts named Areen on Bluesky. They schlock a fraudulent gofundme link to everyone by retweeting every single message on bluesky.

You post anything? Areen will retweet it. He will spam your notifications.

Block him? He’ll make a new account to spam you.

It's annoying as hell.

## What the fuck?

This kills Areen. No one liked his fake ass anyways. Fuck that guy. He’s not real either, google the GFM fundraiser name and you’ll see this scam performed multiple times by the same person. The child’s name is always different. Same pictures, same bullshit story.

## How?

This listens to a very specific PDS, and then adds all accounts from said PDS to the given user mute list.

Run with `npm run watch`

## Config

These are stored in a `.env` file.

- `BSKY_USERNAME` - The username of who owns the mod list
- `BSKY_PASSWORD` - The app password of who owns the mod list
- `MOD_LIST` - The user list did that you want to add all accounts to.
- `FIREHOSE_URL` - The websocket to listen to.

——-
I swear to god, I fucking hate how garbage this is, but it works fast. I made it in about an hour because I was annoyed regarding how shit this was being handled.
