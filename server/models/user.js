export class User {
  constructor({ userId, email, name, createdAt }) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  // Serialize for storing into DynamoDB
  toDB() {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }

  // Serialize for sending back to client
  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
    };
  }

  static fromDB(item) {
    return new User(item);
  }
}