import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from "amazon-cognito-identity-js";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";

/* =============================
   AWS CONFIG
============================= */

const REGION = "ap-southeast-1";

// Cognito config (replace with your values)
const poolData = {
  UserPoolId: "YOUR_USER_POOL_ID",
  ClientId: "YOUR_CLIENT_ID",
};

const userPool = new CognitoUserPool(poolData);

// DynamoDB
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const USERS_TABLE = "Users";

/* =============================
   SIGN UP
============================= */

export const signUp = (email, password, name) => {
  return new Promise((resolve, reject) => {
    userPool.signUp(
      email,
      password,
      [],
      null,
      async (err, result) => {
        if (err) return reject(err);

        const userId = result.userSub;

        // Save profile in DynamoDB
        try {
          await docClient.send(
            new PutCommand({
              TableName: USERS_TABLE,
              Item: {
                userId,
                email,
                name,
                createdAt: new Date().toISOString(),
              },
            })
          );

          resolve({ userId, email, name });
        } catch (dbError) {
          reject(dbError);
        }
      }
    );
  });
};

/* =============================
   LOGIN
============================= */

export const login = (email, password) => {
  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        const idToken = result.getIdToken().getJwtToken();

        // Fetch profile from DynamoDB
        try {
          const data = await docClient.send(
            new GetCommand({
              TableName: USERS_TABLE,
              Key: { userId: user.getUsername() },
            })
          );

          resolve({
            token: idToken,
            user: data.Item,
          });
        } catch (err) {
          reject(err);
        }
      },
      onFailure: (err) => reject(err),
    });
  });
};

/* =============================
   GET USER PROFILE
============================= */

export const getUserProfile = async (userId) => {
  const data = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    })
  );

  return data.Item;
};