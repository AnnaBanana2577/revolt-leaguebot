import { Message } from "revolt.js";

export default {
  name: "test",
  description: "blah blah",
  run: async (message: Message) => {
    message.channel?.sendMessage("Bing bong");
  },
};
