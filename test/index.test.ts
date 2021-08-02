import { Client } from "discord.js";
import { CoreClient, CoreClientOptions, ClientOptions } from "../src/index";

describe("CoreClient", () => {
  describe.each([
    [
      { token: "DISCORD_BOT_TOKEN" },
      {
        token: "DISCORD_BOT_TOKEN",
        clientOptions: { intents: [] },
        botsPath: "",
        handlersFolderName: "handlers",
        intentsFileName: "intents",
      },
    ],
    [
      { token: "DISCORD_BOT_TOKEN", clientOptions: {} as ClientOptions },
      {
        token: "DISCORD_BOT_TOKEN",
        clientOptions: { intents: [] },
        botsPath: "",
        handlersFolderName: "handlers",
        intentsFileName: "intents",
      },
    ],
    [
      {
        token: "DISCORD_BOT_TOKEN",
        clientOptions: { intents: [] } as ClientOptions,
      },
      {
        token: "DISCORD_BOT_TOKEN",
        clientOptions: { intents: [] },
        botsPath: "",
        handlersFolderName: "handlers",
        intentsFileName: "intents",
      },
    ],
    [
      {
        token: "DISCORD_BOT_TOKEN",
        clientOptions: { intents: [123] } as ClientOptions,
      },
      {
        token: "DISCORD_BOT_TOKEN",
        clientOptions: { intents: [123] },
        botsPath: "",
        handlersFolderName: "handlers",
        intentsFileName: "intents",
      },
    ],
  ])(`new CoreClient(%j)`, (input, expected) => {
    test(`returns an instance with properties: ${JSON.stringify(
      expected
    )}`, () => {
      const client = new CoreClient(input);
      expect({ ...client }).toStrictEqual(expected);
    });
  });

  describe.each([
    [{}, new Error("A bot token must be defined!")],
    [{ token: "" }, new Error("A bot token must be defined!")],
  ])(`new CoreClient(%j)`, (input, expected) => {
    test(`throws an error when token is undefined`, () => {
      expect(() => new CoreClient(input as CoreClientOptions)).toThrow(
        expected
      );
    });
  });

  it("should set botsPath and return self when calling .registerBotsIn()", () => {
    const client = new CoreClient({ token: "DISCORD_BOT_TOKEN" });

    const returnValue = client.registerBotsIn("my_new_bots_path");

    expect(client.botsPath).toBe("my_new_bots_path");
    expect(returnValue).toBe(client);
  });

  it("should set handlersFolderName and return self when calling .registerHandlersFolderName()", () => {
    const client = new CoreClient({ token: "DISCORD_BOT_TOKEN" });

    const returnValue = client.registerHandlersFolderName(
      "my_new_handlers_folder_name"
    );

    expect(client.handlersFolderName).toBe("my_new_handlers_folder_name");
    expect(returnValue).toBe(client);
  });

  it("should set intentsFileName and return self when calling .registerIntentsFileName()", () => {
    const client = new CoreClient({ token: "DISCORD_BOT_TOKEN" });

    const returnValue = client.registerIntentsFileName(
      "my_new_intents_file_name"
    );

    expect(client.intentsFileName).toBe("my_new_intents_file_name");
    expect(returnValue).toBe(client);
  });

  describe("when calling .start()", () => {
    let client: CoreClient;
    let validateSpy: jest.SpyInstance;
    let getIntentsSpy: jest.SpyInstance;
    let loadListenersSpy: jest.SpyInstance;
    let loginSpy: jest.SpyInstance;

    beforeEach(() => {
      client = new CoreClient({ token: "DISCORD_BOT_TOKEN" });
      // @ts-expect-error _validate is private
      validateSpy = jest.spyOn(client, "_validate");
      // @ts-expect-error _getIntents is private
      getIntentsSpy = jest.spyOn(client, "_getIntents");
      // @ts-expect-error _loadListeners is private
      loadListenersSpy = jest.spyOn(client, "_loadListeners");
      loginSpy = jest.spyOn(Client.prototype, "login");
    });

    afterEach(() => {
      validateSpy.mockRestore();
      getIntentsSpy.mockRestore();
      loadListenersSpy.mockRestore();
      loginSpy.mockRestore();
    });

    it("should start normally", () => {
      client.registerBotsIn("my_new_bots_path");
      getIntentsSpy.mockImplementation(() => []);
      loadListenersSpy.mockImplementation();
      loginSpy.mockImplementation();

      client.start();

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(getIntentsSpy).toHaveBeenCalledTimes(1);
      expect(loadListenersSpy).toBeCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if bots path is undefined", () => {
      expect(() => client.start()).toThrow(
        new Error("A bot path must be defined!")
      );
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(getIntentsSpy).not.toHaveBeenCalled();
      expect(loadListenersSpy).not.toHaveBeenCalled();
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it("should throw an error if handlers folder name is undefined", () => {
      client.registerBotsIn("my_new_bots_path");
      client.handlersFolderName = "";

      expect(() => client.start()).toThrow(
        new Error("A handlers folder name must be defined!")
      );
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(getIntentsSpy).not.toHaveBeenCalled();
      expect(loadListenersSpy).not.toHaveBeenCalled();
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it("should throw an error if intents filename is undefined", () => {
      client.registerBotsIn("my_new_bots_path");
      client.intentsFileName = "";

      expect(() => client.start()).toThrow(
        new Error("An intents filename must be defined!")
      );
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(getIntentsSpy).not.toHaveBeenCalled();
      expect(loadListenersSpy).not.toHaveBeenCalled();
      expect(loginSpy).not.toHaveBeenCalled();
    });
  });
});
