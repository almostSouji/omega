import { Client, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";

export type Options = {
  debug?: boolean;
};

export default class extends Client {
  public ws: WebSocketManager;
  public constructor(
    token: string,
    intents: GatewayIntentBits,
    options?: Options
  ) {
    const rest = new REST({ version: "10" }).setToken(token);
    const gateway = new WebSocketManager({
      token,
      intents,
      rest,
    });

    if (options?.debug) {
      gateway.on(WebSocketShardEvents.Debug, (message) => {
        console.log(message);
      });
    }

    super({ gateway, rest });
    this.ws = gateway;
  }
}
