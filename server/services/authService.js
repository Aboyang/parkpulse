import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/user.js";
import { dynamoAdapter } from "../db/index.js";
import { computeSecretHash, decodeIdToken } from "../helpers/authHelper.js";

dotenv.config({ path: path.resolve("../../.env") });

export class AuthService {
  constructor(adapter = dynamoAdapter) {
    this.region = process.env.AWS_REGION;
    this.userPoolId = process.env.USER_POOL_ID;
    this.appClientId = process.env.APP_CLIENT_ID;
    this.appClientSecret = process.env.APP_CLIENT_SECRET;
    this.usersTable = "users";

    this.cognitoClient = new CognitoIdentityProviderClient({ region: this.region });
    this.db = adapter;
  }

  async signUp(email, password, name) {
    const username = randomUUID();

    const command = new SignUpCommand({
      ClientId: this.appClientId,
      SecretHash: computeSecretHash(username, this.appClientId, this.appClientSecret),
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
      SecretHash: computeSecretHash(email, this.appClientId, this.appClientSecret),
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
        SECRET_HASH: computeSecretHash(email, this.appClientId, this.appClientSecret),
      },
    });

    const result = await this.cognitoClient.send(command);

    if (!result.AuthenticationResult) {
      throw new Error("Authentication failed");
    }

    const { IdToken, AccessToken } = result.AuthenticationResult;

    const { sub: userId } = decodeIdToken(IdToken);

    const userRecord = await this.db.get(this.usersTable, { userId });

    const user = User.fromDB(userRecord);

    console.log("login success:", { userId, email, name: user.name });

    return {
      token: IdToken,
      accessToken: AccessToken,
      userId: user.userId,
      name: user.name,
    };
  }

  async getUserProfile(userId) {
    const userRecord = await this.db.get(this.usersTable, { userId });

    if (!userRecord) return null;

    return User.fromDB(userRecord).toJSON();
  }

  async logout(accessToken) {
    if (!accessToken) throw new Error("Access token is required for logout");

    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await this.cognitoClient.send(command);

    console.log("User logged out successfully");
    return { message: "User logged out successfully" };
  }
}
