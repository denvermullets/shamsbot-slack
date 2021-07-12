# SHAMSBOT
pulling down tweets and throwing it into slack

### How to use

`npm install`
`npm start`

This Boltjs App will connect to Twitter and pull down live tweets from given users and output to Slack to specific channel. Once it's in Slack, users will be able to take action on those.

You'll need to replace values for these ENV vars:

```
SLACK_BOT_TOKEN=xoxb------YOUR_BOT_TOKEN
SLACK_VERIF_TOKEN=YOUR_TOKEN
SLACK_SIGNING_SECRET=YOUR_SEKRIT
SLACK_APP_TOKEN=xapp------YOUR_APP_TOKEN

TWITTER_BEARER_TOKEN=YOUR_TWITTER_TOKEN
```