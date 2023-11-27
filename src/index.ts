import "reflect-metadata";
import { GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import process from "process";
import { default as Client } from "./client.js";
import { createRuleCache, loadRules } from "./caches/rules.js";
import { handleSigmaRule } from "./handlers/sigma.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  process.exit(1);
}

const rulecache = createRuleCache();
await loadRules();

const client = new Client(
  token,
  GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.MessageContent
);

client.once(GatewayDispatchEvents.Ready, () => {
  console.log("(·) Client is ready.");
});

client.on(GatewayDispatchEvents.MessageCreate, ({ data: message }) => {
  for (const rule of rulecache.values()) {
    const result = handleSigmaRule(message.author, rule);
    if (result) {
      console.log(
        `(!) User ${message.author.username} (${message.author.id}) matched rule ${rule.title} (${rule.id})`
      );
    }
  }
});

client.ws.connect();
