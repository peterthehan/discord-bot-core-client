import fs from "fs";
import path from "path";
import {
  Client,
  ClientOptions,
  BitFieldResolvable,
  IntentsString,
  ClientEvents,
} from "discord.js";

type IntentsResolvable = BitFieldResolvable<IntentsString, number>;

type ClientEventNames = keyof ClientEvents;

type Handler = (...data: unknown[]) => Promise<void>;

type HandlerImport = {
  handlerName: ClientEventNames;
  handler: Handler;
};

type BaseHandlerMap = {
  [handlerName in ClientEventNames]?: Handler[];
};

interface HandlerMap extends BaseHandlerMap {
  ready: Handler[];
}

type CoreClientOptions = {
  token: string;
  clientOptions?: ClientOptions;
};

class CoreClient {
  token: string;
  clientOptions: ClientOptions;
  botsPath: string;
  handlersFolderName: string;
  intentsFileName: string;

  constructor(options: CoreClientOptions) {
    if (!options.token) {
      throw new Error("A bot token must be defined!");
    }

    this.token = options.token;
    this.clientOptions =
      !options.clientOptions || !options.clientOptions.intents
        ? { ...options.clientOptions, intents: [] }
        : options.clientOptions;

    // define defaults
    this.botsPath = "";
    this.handlersFolderName = "handlers";
    this.intentsFileName = "intents";
  }

  registerBotsIn(botsPath: string): CoreClient {
    this.botsPath = botsPath;
    return this;
  }

  registerHandlersFolderName(handlersFolderName: string): CoreClient {
    this.handlersFolderName = handlersFolderName;
    return this;
  }

  registerIntentsFileName(intentsFileName: string): CoreClient {
    this.intentsFileName = intentsFileName;
    return this;
  }

  start(): void {
    this._validate();

    const intents = this._getIntents();
    const client = new Client({ ...this.clientOptions, intents });

    this._loadListeners(client);

    client.login(this.token);
  }

  /* istanbul ignore next */
  private _validate(): void {
    const errorMessages: string[] = [];

    if (!this.botsPath) {
      errorMessages.push("A bot path must be defined!");
    }

    if (!this.handlersFolderName) {
      errorMessages.push("A handlers folder name must be defined!");
    }

    if (!this.intentsFileName) {
      errorMessages.push("An intents filename must be defined!");
    }

    if (errorMessages.length) {
      throw new Error(errorMessages.join(" "));
    }
  }

  /* istanbul ignore next */
  private _getIntents(): IntentsResolvable {
    const intents: IntentsResolvable = this._readFilenames(this.botsPath)
      .map((folderName) =>
        path.resolve(this.botsPath, folderName, this.intentsFileName)
      )
      .flatMap((intentsPath) => {
        try {
          return require(intentsPath);
        } catch (error) {
          console.warn(error);
          return [];
        }
      });

    return [...new Set([intents, this.clientOptions.intents].flat())];
  }

  /* istanbul ignore next */
  private _loadListeners(client: Client): void {
    process
      .on("unhandledRejection", console.warn)
      .on("uncaughtException", (error) => {
        console.error(error);
        process.exit(1);
      });

    const { ready, ...handlerMap } = this._getHandlerMap();

    // ready event should only be handled once when emitted by the client
    client.once("ready", () => this._run(ready, client));

    // load all other listeners
    Object.entries(handlerMap).forEach(([handlerName, handlers]) =>
      client.on(handlerName, (...data) => this._run(handlers, ...data))
    );
  }

  /* istanbul ignore next */
  private _getHandlerMap(): HandlerMap {
    return this._readFilenames(this.botsPath)
      .map((folderName) =>
        path.resolve(this.botsPath, folderName, this.handlersFolderName)
      )
      .flatMap((handlersPath) =>
        this._readFilenames(handlersPath).map(
          (handlerName) =>
            ({
              handlerName,
              handler: require(`${handlersPath}/${handlerName}`),
            } as HandlerImport)
        )
      )
      .reduce(
        (handlerMap, { handlerName, handler }) => {
          if (handlerName in handlerMap) {
            (handlerMap[handlerName] as Handler[]).push(handler);
          } else {
            handlerMap[handlerName] = [handler];
          }

          return handlerMap;
        },
        { ready: [] } as HandlerMap
      );
  }

  /* istanbul ignore next */
  private _run(handlers: Handler[], ...data: unknown[]): void {
    handlers.forEach((handler) => handler(...data));
  }

  /* istanbul ignore next */
  private _readFilenames(filePath: string): string[] {
    return fs.readdirSync(filePath).map((file) => path.parse(file).name);
  }
}

export { CoreClient, CoreClientOptions };
