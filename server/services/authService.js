import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import crypto, { randomUUID } from "crypto";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/user.js";

dotenv.config({ path: path.resolve("../../.env") });

export class AuthService {
  constructor() {
    this.region = "ap-southeast-1";
    this.userPoolId = process.env.USER_POOL_ID;
    this.appClientId = process.env.APP_CLIENT_ID;
    this.appClientSecret = process.env.APP_CLIENT_SECRET;
    this.usersTable = "users";

    this.cognitoClient = new CognitoIdentityProviderClient({ region: this.region });
    const ddbClient = new DynamoDBClient({ region: this.region });
    this.docClient = DynamoDBDocumentClient.from(ddbClient);
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

    // Build User entity from Cognito result
    const user = new User({ userId: result.UserSub, email, name });

    await this.docClient.send(
      new PutCommand({
        TableName: this.usersTable,
        Item: user.toDB(),         // entity handles its own DB shape
      })
    );

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

    const data = await this.docClient.send(
      new GetCommand({ TableName: this.usersTable, Key: { userId } })
    );

    // Rehydrate User entity from DynamoDB row
    const user = User.fromDB(data.Item);

    console.log("login success:", { userId, email, name: user.name });

    return {
      token: IdToken,
      accessToken: AccessToken,
      userId: user.userId,
      name: user.name,
    };
  }

  async getUserProfile(userId) {
    const data = await this.docClient.send(
      new GetCommand({ TableName: this.usersTable, Key: { userId } })
    );

    if (!data.Item) return null;

    // Return as entity, toJSON() strips internal fields if needed
    return User.fromDB(data.Item).toJSON();
  }

  async logout(accessToken) {
    if (!accessToken) throw new Error("Access token is required for logout");

    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await this.cognitoClient.send(command);

    console.log("User logged out successfully");
    return { message: "User logged out successfully" };
  }
}