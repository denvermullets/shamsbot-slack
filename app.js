const config = require('dotenv').config();
const { App } = require('@slack/bolt');

const CHANNEL = process.env.CHANNEL
const botToken = process.env.SLACK_BOT_TOKEN
const needle = require('needle');
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL =
  'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

const rules = [
  // DO NOT USE EVER - the nba apparently has a bot that just
  // mentions EVERYONE and sends them a tweet to the ad of the day
  // { value: 'from:nba -is:retweet -is:reply' },
  { value: 'from:ShamsCharania -is:retweet -is:reply' },
  { value: 'from:wojespn -is:retweet -is:reply' },
  { value: 'from:MarcJSpears -is:retweet -is:reply' },
  { value: 'from:JeffPassan -is:retweet -is:reply' },
  { value: 'from:Ken_Rosenthal -is:retweet -is:reply' },
  { value: 'from:JonHeyman -is:retweet -is:reply' },
  { value: 'from:BNightengale -is:retweet -is:reply' },
  { value: 'from:adamschefter -is:retweet -is:reply' },
  { value: 'from:RapSheet -is:retweet -is:reply' },
  { value: 'from:JasonLaCanfora -is:retweet -is:reply' },
  { value: 'from:JayGlazer -is:retweet -is:reply' },
  { value: 'from:JosinaAnderson -is:retweet -is:reply' },
  { value: 'from:MikeGarafolo -is:retweet -is:reply' },
  { value: 'from:TSNBobMcKenzie -is:retweet -is:reply' },
  { value: 'from:PierreVLeBrun -is:retweet -is:reply' },
  { value: 'from:FriedgeHNIC -is:retweet -is:reply' },
  { value: 'from:reporterchris -is:retweet -is:reply' },
  { value: 'from:TheSteinLine -is:retweet -is:reply' },
  { value: 'from:ChrisBHaynes -is:retweet -is:reply' },
  { value: 'from:espn_macmahon -is:retweet -is:reply' },
  { value: 'from:BleacherReport -is:retweet -is:reply' },
  { value: 'from:espn -is:retweet -is:reply' },
  { value: 'from:SInow -is:retweet -is:reply' },
  { value: 'from:br_betting -is:retweet -is:reply' },
  { value: 'from:TheAthletic -is:retweet -is:reply' },

  // these are the max # of rules you can have in place right now
];

async function getRules() {
  const response = await needle('get', rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

async function deleteRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };
  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

function streamTweets() {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  stream.on('data', (data) => {
    try {
      const json = JSON.parse(data);
      sendToSlack(json);
      console.log(json);
      console.log(json.includes.users)
    } catch (error) {
      // twitter sends an empty response to signify no new tweets
      // it seems like after a short time the node app will just fail after
      // getting so many empty responses, which is less than ideal
      console.log(error);
    }
  });
}

async function sendToSlack(json) {
  try {
    const result = await app.client.chat.postMessage({
      token: botToken,
      channel: `#${CHANNEL}`,
      blocks: [
        {
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "New Tweet",
				"emoji": true
			}
		},
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          },
        },
        {
			"type": "actions",
			"block_id": "actionblock789",
			"elements": [
        {
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Graded"
					},
          // "style": "primary",
          "action_id": 'button_graded',
					"value": "button_graded"
				},
        {
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Closed"
					},
          // "style": "primary",
          "action_id": 'button_closed',
					"value": "button_closed"
				},
        {
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Prop Created"
					},
          "style": "primary",
          "action_id": 'button_prop_made',
					"value": "button_prop_made"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Delete Tweet"
        },
          "style": "danger",
          "action_id": 'button_delete',
          "value": "button_delete"
        },

			]
		}
      ],
      // Text in the notification
      text: `New Tweet From: ${json.includes.users[0].username}`
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }

}

// initialize slack app w/token & secret key
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.message('hello', async ({ message, say }) => {
  await say(`sup buddy  <@${message.user}>`);

});

app.action('button_closed', async ({ ack, body, context }) => {
  ack();

  try {
    const result = await app.client.chat.update({
      token: context.botToken,
      ts: body.message.ts,
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Closed by <@${body.user.name}>`
          }
        }
      ],
      text: 'Closed'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.action('button_graded', async ({ ack, body, context }) => {
  ack();

  try {
    const result = await app.client.chat.update({
      token: context.botToken,
      ts: body.message.ts,
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Graded by <@${body.user.name}>`
          }
        }
      ],
      text: 'Graded'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.action('button_prop_made', async ({ ack, body, context }) => {
  ack();

  try {
    const result = await app.client.chat.update({
      token: context.botToken,
      ts: body.message.ts,
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Prop(s) created by <@${body.user.name}>`
          }
        }
      ],
      text: 'Props Created'
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.action('button_delete', async ({ ack, body, context }) => {
  ack();

  try {
    const result = await app.client.chat.delete({
      token: context.botToken,
      ts: body.message.ts,
      channel: body.channel.id,
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);

  let currentRules;
  // get / clear / set rules for twitter results and open stream after bolt app is running
  try {
    currentRules = await getRules();
    await deleteRules(currentRules);
    await setRules();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  streamTweets();

  console.log('?????? Bolt app is running!');
})();
