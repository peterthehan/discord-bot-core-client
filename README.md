# Discord Bot Core Client

[![Discord](https://discord.com/api/guilds/258167954913361930/embed.png)](https://discord.gg/WjEFnzC) [![Twitter Follow](https://img.shields.io/twitter/follow/peterthehan.svg?style=social)](https://twitter.com/peterthehan)

Core client for create-discord-bot.

## Getting started

```
npm i discord-bot-core-client
```

```ts
// src/index.ts

import "dotenv/config";
import path from "path";
import { CoreClient } from "discord-bot-core-client";

const client = new CoreClient({
  token: process.env.DISCORD_BOT_TOKEN as string,
});

client.registerBotsIn(path.resolve(__dirname, "bots")).start();
```
