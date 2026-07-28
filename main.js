import { Agent, AppBskyGraphListRecord, CredentialSession } from '@atproto/api';
import dotenv from "dotenv";
import { Firehose } from "@skyware/firehose";

// load the dotenv files
dotenv.config({debug: false});

const pdsToWatch = process.env.FIREHOSE_URL;

// There's no real error handling here, I don't care.
async function getBskyAgent() {
  try
  {
    const session = new CredentialSession(new URL("https://bsky.social"));
    await session.login({
      identifier: process.env.BSKY_USERNAME,
      password: process.env.BSKY_PASSWORD
    });
    return new Agent(session);
  } catch(err) {
    console.error(`Could not get bsky agent ${err}`);
  }
  return null;
};

// fuck you areen, die.
async function addUserToList(agent, userDid) {
  try {
    const addToList = await agent.com.atproto.repo.createRecord({
      repo: agent.did,
      collection: 'app.bsky.graph.listitem',
      record: {
        $type: 'app.bsky.graph.listitem',
        subject: userDid,
        list: process.env.MOD_LIST,
        createdAt: new Date().toISOString()
      }
    });
    return addToList.success;
  } catch(ex) {
    console.error(ex);
  }
  return false;
};

// try to reduce damage
async function autoReportAreen(agent, userDid) {
  try {
    const reportPayload = {
      reasonType: "com.atproto.moderation.defs#reasonSpam",
      reason: "fake gofundme, mass retweets, areen spam",
      subject: {
        "$type": 'com.atproto.admin.defs#repoRef',
        did: userDid
      }
    };
    // for extra damage, automate the reports against the account
    const reportGen = await agent.createModerationReport(reportPayload);
    console.log(`reported ${userDid}`);
    return reportGen.success;
  } catch (ex) {
    console.error(ex);
  }
  return false;
}

// unused, but could be used if these handles were not did:web
async function resolveHandle(user) {
  return await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${user}`).then((resp) => {
    if (resp.ok) {
      return resp.json().then((jsonData) => {
        if (has(jsonData, "did")) {
          return jsonData.did;
        }
        return null;
      });
    }
    return null;
  });
}

// our bsky agent to manage adding to the list.
let ourAgentToRainDown = null;
const createBskyAgentNow = async () => {
  if (ourAgentToRainDown == null) {
    ourAgentToRainDown = await getBskyAgent();
    if (ourAgentToRainDown !== null) {
      console.log("Established bsky agent");
    } else {
      console.log("failed to establish bsky agent, will try again next loop");
    }
  }
};

// list of new areen accounts
let didList = [];
// process the list (do this after every message we receive)
const processDidList = async () => {
  const currentListSize = didList.length;
  for (let count = 0; count < currentListSize; ++count) {
    // if our agent became invalid, then recreate it before continuing
    if (ourAgentToRainDown == null) {
      await createBskyAgentNow();
    }
    // grab the first item in the list
    const accountToRemove = didList.shift();
    // check to see if we added to the list
    const didAddAccountToList = await addUserToList(ourAgentToRainDown, accountToRemove);
    // This is really bad but I don't really care, bad accounts get thrown in and tried again later
    if (!didAddAccountToList) {
      console.log("failed to add user, retrying again");
      didList.push(accountToRemove);
      ourAgentToRainDown = null;
    } else {
      await autoReportAreen(ourAgentToRainDown, accountToRemove);
    }
  }
};

// Listen to areen's bullshit pds. Note you are making a direct connection to their server
// it's better for you to go through a proxy tbh
const firehose = new Firehose({relay: pdsToWatch, autoReconnect: false});
firehose.on("commit", async (message) => {
  for (const op of message.ops) {
    // skip everything that isn't a profile
    if (!op.path.includes("app.bsky.actor.profile") || op.action != "create")
      continue;

    const recordName = op.record.displayName;
    console.log(`GOT NEW RECORD ${recordName}`);
    // we could probably do more to make sure this is a domain. like regex, but w/e
    // the displayname should also be piped to resolveHandle
    didList.push(`did:web:${recordName}`);
  }
  await processDidList();
});
firehose.on("open", () => {
  console.log("connection established");
});
firehose.on("close", (cur) => {
  console.error("connection was closed, starting again");
  firehose.start();
});
firehose.on("websocketError", () => {
  console.error("websocket had error, restarting...");
  firehose.start();
});
firehose.start();
