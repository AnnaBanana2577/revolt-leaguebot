import { Client, Message } from "revolt.js";
import { existsSync, lstatSync, readdirSync } from "fs";

interface BotClientOptions {
  botToken: string;
  prefix: string;
  commandsDirectory: string;
}

interface Command {
  name: string;
  description: string;
  run: (message: Message) => void;
}

export class BotClient extends Client {
  public commands: Map<string, Command> = new Map();

  public prefix: string;
  private commandsDirectory: string;
  private botToken: string;

  constructor(options: BotClientOptions) {
    super();
    this.botToken = options.botToken;
    this.commandsDirectory = options.commandsDirectory;
    this.prefix = options.prefix;

    this.once("ready", () => {
      console.log(`Logged in as ${this.user?.username}`);

      //Set presence
      if (!this.user?.status) return;
      this.user.status.presence = "Online";
      this.user.status.text = "!help | Ninja.io Bot";

      //Load commands
      if (!existsSync(this.commandsDirectory)) return;
      if (readdirSync(this.commandsDirectory).length == 0) return;
      this.scanCommands(this.commandsDirectory);
    });

    this.on("message", this.handleCommand);
  }

  public start() {
    this.loginBot(this.botToken);
  }

  private handleCommand(message: Message) {
    if (!message.content) return;
    const isACommand = this.parseMessage(message.content);
    if (!isACommand) return;
    const [command, args] = isACommand;
  }

  private parseMessage(
    message: string
  ): [cmd: string, args: Array<string>] | null {
    if (!message.trim().startsWith(this.prefix)) return null;
    const msg = message.trim().slice(this.prefix.length);
    const msgArray = msg.match(/(?:[^\s"']+|['"][^'"]*["'])+/g);
    if (!msgArray) return null;

    const command = msgArray.shift(); //First item of message array
    if (!command) return null;

    const args = msgArray.map((arg: string) =>
      arg.replace("'", "").replace('"', "")
    );

    return [command, args];
  }

  private async loadCommands() {
    if (!existsSync(this.commandsDirectory)) return;
    if (readdirSync(this.commandsDirectory).length == 0) return;
  }

  private async scanCommands(directory: string) {
    const files = readdirSync(directory);
    for (const file of files) {
      const path = `${directory}/${file}`;
      if (lstatSync(path).isDirectory()) await this.scanCommands(path);
      if (!file.endsWith(".js")) continue;
      const module = await import(path);
      if (!module.default || !module.default.name) return;
      this.commands.set(module.default.name, module.default);
      console.log(`Loaded ${file}`);
    }
  }
}
