interface UserRecord {
  userId: string;
  email: string;
  name: string;
  createdAt?: string;
}

export class User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;

  constructor({ userId, email, name, createdAt }: UserRecord) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  toDB(): { userId: string; email: string; name: string; createdAt: string } {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }

  toJSON(): { userId: string; email: string; name: string } {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
    };
  }

  static fromDB(item: Record<string, unknown>): User {
    return new User(item as unknown as UserRecord);
  }
}
