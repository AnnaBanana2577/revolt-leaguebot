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
  run: (message: Message) => any;
}

export class BotClient extends Client {
  public commands: Map<string, Command> = new Map();

  public prefix: string;
  private commandsDirectory: string;
  private botToken: string;

  constructor(options: BotClientOptions) {
    super();
    this.botToken = options.botToken;
    this.commandsDirectory = process.cwd() + options.commandsDirectory;
    this.prefix = options.prefix;

    this.once("ready", async () => {
      if (!this.user) return;
      console.log(`Logged in as ${this.user.username}`);

      this.user.status = {
        presence: "Online",
        text: "!help | Compteting in Ninja.io",
      };

      //Load commands
      if (!existsSync(this.commandsDirectory)) return;
      if (readdirSync(this.commandsDirectory).length == 0) return;
      await this.loadCommands(this.commandsDirectory);
    });

    this.on("message", this.handleCommand);
  }

  public start() {
    this.loginBot(this.botToken);
  }

  private async handleCommand(message: Message) {
    if (!message.content) return;
    const isACommand = this.parseMessage(message.content);
    if (!isACommand) return;
    const [command, args] = isACommand;

    if (!this.commands.get(command)) return;

    const cmd = this.commands.get(command); //cmd is Command object

    //Do checks here for roles, args, etc
    await cmd?.run(message).catch((err: any) => console.log(err));
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

  private async loadCommands(directory: string) {
    const files = readdirSync(directory);
    for (const file of files) {
      const path = `${directory}/${file}`;
      if (lstatSync(path).isDirectory()) await this.loadCommands(path);
      if (!file.endsWith(".js")) continue;
      const module = await import(path);
      if (!module.default || !module.default.name) return;
      this.commands.set(module.default.name, module.default);
      console.log(`Loaded ${file}`);
    }
  }
}
