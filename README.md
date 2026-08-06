# Areen Killer

This project is now archived. ~24hrs after this project was deployed, the botnet died. It has not come back since.

## Who?

Since the beginning of 2026, there was an automated series of accounts created across multiple PDSes named Areen. Each account would schlock a fraudulent gofundme **to everyone** on the ATProto network by retweeting every single post ever made on bluesky.

You post anything? Areen will retweet it. He will spam your notifications.

Block him? A new bot instance would appear within ten minutes (or less) to continue to harass the network.

It's annoying as hell.

## What the fuck?

This kills Areen. No one liked his fake ass anyways. Fuck that guy. He’s not real either, google the GFM fundraiser name and you’ll see this scam performed multiple times by the same person. Same pictures, same bullshit story, different location, different child name.

## How?

This listens to a very specific PDS, and then adds all accounts from said PDS to the given user mute list.

It'll then report every account to BSky moderation.

Run with `npm run watch`

## Config

These are stored in a `.env` file.

- `BSKY_USERNAME` - The username of who owns the mod list
- `BSKY_PASSWORD` - The app password of who owns the mod list
- `MOD_LIST` - The user list did that you want to add all accounts to.
- `FIREHOSE_URL` - The websocket to listen to.

---
I swear to god, I fucking hate how garbage this is, but it works fast. I made it in about an hour because I was annoyed regarding how shit this was being handled.
