"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotClient = void 0;
const revolt_js_1 = require("revolt.js");
const fs_1 = require("fs");
class BotClient extends revolt_js_1.Client {
    commands = new Map();
    prefix;
    commandsDirectory;
    botToken;
    constructor(options) {
        super();
        this.botToken = options.botToken;
        this.commandsDirectory = options.commandsDirectory;
        this.prefix = options.prefix;
        this.once("ready", () => {
            console.log(`Logged in as ${this.user?.username}`);
            //Set presence
            if (!this.user?.status)
                return;
            this.user.status.presence = "Online";
            this.user.status.text = "!help | Ninja.io Bot";
            //Load commands
            if (!(0, fs_1.existsSync)(this.commandsDirectory))
                return;
            if ((0, fs_1.readdirSync)(this.commandsDirectory).length == 0)
                return;
            this.scanCommands(this.commandsDirectory);
        });
        this.on("message", this.handleCommand);
    }
    handleCommand(message) {
        const msg = message.content?.trim();
        if (!msg?.startsWith(this.prefix))
            return;
    }
    parseArgs() { }
    async loadCommands() {
        if (!(0, fs_1.existsSync)(this.commandsDirectory))
            return;
        if ((0, fs_1.readdirSync)(this.commandsDirectory).length == 0)
            return;
    }
    async scanCommands(directory) {
        const files = (0, fs_1.readdirSync)(directory);
        for (const file of files) {
            const path = `${directory}/${file}`;
            if ((0, fs_1.lstatSync)(path).isDirectory())
                await this.scanCommands(path);
            if (!file.endsWith(".js"))
                continue;
            const module = await Promise.resolve().then(() => __importStar(require(path)));
            if (!module.default || !module.default.name)
                return;
            this.commands.set(module.default.name, module.default);
            console.log(`Loaded ${file}`);
        }
    }
}
exports.BotClient = BotClient;
