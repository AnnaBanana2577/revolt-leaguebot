import { BotClient } from "./BotClient";

const client = new BotClient({
  botToken: "",
  prefix: "!",
  commandsDirectory: "dist/commands",
});

client.start();
