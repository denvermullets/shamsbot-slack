const config = require('dotenv').config();
const { App } = require('@slack/bolt');

const needle = require('needle');
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL =
  'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

const rules = [
  { value: 'from:denvermullets' },
  { value: 'from:ShamsCharania' },
  { value: 'from:wojespn' },
  { value: 'from:MarcJSpears' },
  { value: 'from:JeffPassan' },
  { value: 'from:Ken_Rosenthal' },
  { value: 'from:JonHeyman' },
  { value: 'from:BNightengale' },
  { value: 'from:adamschefter' },
  { value: 'from:RapSheet' },
  { value: 'from:JasonLaCanfora' },
  { value: 'from:JayGlazer' },
  { value: 'from:JosinaAnderson' },
  { value: 'from:MikeGarafolo' },
  { value: 'from:TSNBobMcKenzie' },
  { value: 'from:PierreVLeBrun' },
  { value: 'from:FriedgeHNIC' },
  { value: 'from:reporterchris' },
  { value: 'from:TheSteinLine' },
  { value: 'from:ChrisBHaynes' },
  { value: 'from:espn_macmahon' },
  // { value: 'from:MarcJSpears' },
  // { value: 'from:MarcJSpears' },
  // { value: 'from:MarcJSpears' },
  // { value: 'from:MarcJSpears' },
  // { value: 'from:MarcJSpears' },
];


// get rules
async function getRules() {
  const response = await needle('get', rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  return response.body;
}

// set rules
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

// delete rules
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
      // sendToSlack(json);
      console.log(json);
    } catch (error) {
      // twitter sends an empty response to signify no new tweets
      // it seems like after a short time the node app will just fail after
      // getting so many empty responses, which is less than ideal
      console.log('no new tweets found');
    }
  });
}

// initialize slack app w/token & secret key
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.message('hello', async ({ message, say }) => {
  await say(`sup buddy`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  let currentRules;

  try {
    // get our current list of rules
    currentRules = await getRules();

    // let's clear what rules have been set (just in case there's a change)
    await deleteRules(currentRules);

    // set new rules with twitter
    await setRules();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  streamTweets();

  console.log('⚡️ Bolt app is running!');
})();















// async function sendToSlack(json) {
//   const res = await axios.post(
//     slackURL,
//     {
//       type: 'interactive_message',
//       channel: '#shamsbot_test',
//       text: `https://twitter.com/${json.data.author_id}/status/${json.data.id}`,

//       // removing attachments for now until routes are set up properly
//       // attachments: [
//       //   {
//       //     fallback: 'Unsuccessful Tweet',
//       //     callback_id: 'shams_fail',
//       //     color: '#3AA3E3',
//       //     attachment_type: 'default',
//       //     actions: [
//       //       {
//       //         name: 'tweet',
//       //         text: 'Graded',
//       //         style: 'primary',
//       //         type: 'button',
//       //         value: 'graded',
//       //         response_type: 'ephemeral',
//       //         replace_original: true,
//       //         delete_original: true,
//       //       },
//       //       {
//       //         name: 'tweet',
//       //         text: 'Ignore',
//       //         style: 'danger',
//       //         type: 'button',
//       //         value: 'ignore',
//       //       },
//       //       {
//       //         name: 'tweet',
//       //         text: 'Close',
//       //         type: 'button',
//       //         value: 'closed',
//       //       },
//       //     ],
//       //   },
//       // ],
//     },
//     { headers: { authorization: `Bearer ${botToken}` } }
//   );
// }

// (async () => {

// })();
