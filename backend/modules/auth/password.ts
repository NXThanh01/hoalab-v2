import { hash, verify } from "@node-rs/argon2";

const argon2id = { memoryCost: 19456, timeCost: 2, parallelism: 1 };
export const hashPassword = (password: string) => hash(password, argon2id);
export const verifyPassword = (passwordHash: string, password: string) => verify(passwordHash, password).catch(() => false);

// Keep failed lookups comparable to checks against a stored hash.
const dummyHash = "$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXktc2FsdC1mb3ItYXV0aA$QL3kGSbUJvCiCFdzqy9IBBkc1tFhKvjJTRCBeckRhxE";
export const verifyLoginPassword = (passwordHash: string | undefined, password: string) =>
  verifyPassword(passwordHash ?? dummyHash, password);
