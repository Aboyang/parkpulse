import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto, { randomUUID } from "crypto";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/user.js";
import { dynamoAdapter } from "../db/index.js";

dotenv.config({ path: path.resolve("../../.env") });

export class AuthService {
  constructor(adapter = dynamoAdapter) {
    this.region = "ap-southeast-1";
    this.userPoolId = process.env.USER_POOL_ID;
    this.appClientId = process.env.APP_CLIENT_ID;
    this.appClientSecret = process.env.APP_CLIENT_SECRET;
    this.usersTable = "users";

    this.cognitoClient = new CognitoIdentityProviderClient({ region: this.region });
    this.db = adapter;
  }

  getSecretHash(username) {
    if (!this.appClientSecret) return undefined;
    return crypto
      .createHmac("SHA256", this.appClientSecret)
      .update(username + this.appClientId)
      .digest("base64");
  }

  async signUp(email, password, name) {
    const username = randomUUID();

    const command = new SignUpCommand({
      ClientId: this.appClientId,
      SecretHash: this.getSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
      ],
    });

    const result = await this.cognitoClient.send(command);

    const user = new User({ userId: result.UserSub, email, name });

    await this.db.put(this.usersTable, user.toDB());

    return user.toJSON();
  }

  async confirmSignUp(email, code) {
    const command = new ConfirmSignUpCommand({
      ClientId: this.appClientId,
      SecretHash: this.getSecretHash(email),
      Username: email,
      ConfirmationCode: code,
    });

    await this.cognitoClient.send(command);
    return { message: "User confirmed successfully" };
  }

  async login(email, password) {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.appClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(email),
      },
    });

    const result = await this.cognitoClient.send(command);

    if (!result.AuthenticationResult) {
      throw new Error("Authentication failed");
    }

    const { IdToken, AccessToken } = result.AuthenticationResult;

    const payload = JSON.parse(
      Buffer.from(IdToken.split(".")[1], "base64url").toString("utf8")
    );
    const userId = payload.sub;

    const item = await this.db.get(this.usersTable, { userId });

    const user = User.fromDB(item);

    console.log("login success:", { userId, email, name: user.name });

    return {
      token: IdToken,
      accessToken: AccessToken,
      userId: user.userId,
      name: user.name,
    };
  }

  async getUserProfile(userId) {
    const item = await this.db.get(this.usersTable, { userId });

    if (!item) return null;

    return User.fromDB(item).toJSON();
  }

  async logout(accessToken) {
    if (!accessToken) throw new Error("Access token is required for logout");

    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await this.cognitoClient.send(command);

    console.log("User logged out successfully");
    return { message: "User logged out successfully" };
  }
}