import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { randomUUID } from "crypto";
import { User } from "../models/user.js";
import { dynamoAdapter } from "../db/index.js";
import { computeSecretHash, decodeIdToken } from "../helpers/authHelper.js";
import type { DbAdapter } from "../types/db.js";

export class AuthService {
  private region: string | undefined;
  private userPoolId: string | undefined;
  private appClientId: string | undefined;
  private appClientSecret: string | undefined;
  private usersTable: string;
  private cognitoClient: CognitoIdentityProviderClient;
  private db: DbAdapter;

  constructor(adapter: DbAdapter = dynamoAdapter) {
    this.region = process.env.AWS_REGION;
    this.userPoolId = process.env.USER_POOL_ID;
    this.appClientId = process.env.APP_CLIENT_ID;
    this.appClientSecret = process.env.APP_CLIENT_SECRET;
    this.usersTable = "users";

    this.cognitoClient = new CognitoIdentityProviderClient({ region: this.region });
    this.db = adapter;
  }

  async signUp(email: string, password: string, name: string): Promise<ReturnType<User["toJSON"]>> {
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

    if (!result.UserSub) throw new Error("Sign up failed: missing user ID");

    const user = new User({ userId: result.UserSub, email, name });

    await this.db.put(this.usersTable, user.toDB());

    return user.toJSON();
  }

  async confirmSignUp(email: string, code: string): Promise<{ message: string }> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.appClientId,
      SecretHash: computeSecretHash(email, this.appClientId, this.appClientSecret),
      Username: email,
      ConfirmationCode: code,
    });

    await this.cognitoClient.send(command);
    return { message: "User confirmed successfully" };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; accessToken: string; userId: string; name: string }> {
    if (!this.appClientId) throw new Error("APP_CLIENT_ID is not configured");
    const secretHash = computeSecretHash(email, this.appClientId, this.appClientSecret);
    const authParams: Record<string, string> = { USERNAME: email, PASSWORD: password };
    if (secretHash) authParams["SECRET_HASH"] = secretHash;
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.appClientId!,
      AuthParameters: authParams,
    });

    const result = await this.cognitoClient.send(command);

    if (!result.AuthenticationResult) {
      throw new Error("Authentication failed");
    }

    const { IdToken, AccessToken } = result.AuthenticationResult;

    if (!IdToken) throw new Error("Authentication failed: missing IdToken");
    if (!AccessToken) throw new Error("Authentication failed: missing AccessToken");

    const { sub: userId } = decodeIdToken(IdToken);

    const userRecord = await this.db.get(this.usersTable, { userId });

    if (!userRecord) throw new Error("User record not found");

    const user = User.fromDB(userRecord);

    console.log("login success:", { userId, email, name: user.name });

    return {
      token: IdToken,
      accessToken: AccessToken,
      userId: user.userId,
      name: user.name,
    };
  }

  async getUserProfile(userId: string): Promise<ReturnType<User["toJSON"]> | null> {
    const userRecord = await this.db.get(this.usersTable, { userId });

    if (!userRecord) return null;

    return User.fromDB(userRecord).toJSON();
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    if (!accessToken) throw new Error("Access token is required for logout");

    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await this.cognitoClient.send(command);

    console.log("User logged out successfully");
    return { message: "User logged out successfully" };
  }
}
