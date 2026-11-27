import { Algorithm, hash } from "@node-rs/argon2";
import postgres from "postgres";

const { env } = process;
if (!env.DATABASE_URL) throw new Error("Set DATABASE_URL before seeding auth.");
const explicitTarget = process.argv.includes("--allow-remote");
const host = new URL(env.DATABASE_URL).hostname;
if (!["localhost", "127.0.0.1", "[::1]"].includes(host) && !explicitTarget) {
  throw new Error("Remote database requires the explicit --allow-remote flag.");
}

const accounts = [
  { loginId: env.HOALAB_ADMIN_EMAIL || "admin@hoalab.local", password: env.HOALAB_ADMIN_PASSWORD, name: env.HOALAB_ADMIN_NAME || "Quản trị viên HóaLab", role: "admin", grade: 0 },
  { loginId: env.HOALAB_STUDENT_EMAIL || "student@hoalab.local", password: env.HOALAB_STUDENT_PASSWORD, name: env.HOALAB_STUDENT_NAME || "Học sinh HóaLab", role: "student", grade: Number(env.HOALAB_STUDENT_GRADE ?? 12) },
].filter((account) => account.password);

if (!accounts.some((account) => account.role === "admin")) throw new Error("Set HOALAB_ADMIN_PASSWORD before seeding auth.");
for (const account of accounts) {
  account.loginId = account.loginId.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._@+\-]{1,149}$/.test(account.loginId)) throw new Error("Invalid seed login ID.");
  if (account.password.length < 15 || account.password.length > 128) throw new Error("Seed passwords must be 15–128 characters.");
}
if (new Set(accounts.map((account) => account.loginId)).size !== accounts.length) throw new Error("Seed login IDs must differ.");

const sql = postgres(env.DATABASE_URL, { max: 1, prepare: false });
try {
  await sql.begin(async (tx) => {
    for (const { loginId, password, role, name, grade } of accounts) {
      const legacyId = `local:${role}:${loginId}`;
      const [existing] = await tx`select user_id from profiles where lower(email) = ${loginId} order by (user_id = ${legacyId}) desc limit 1`;
      const profileId = existing?.user_id ?? legacyId;
      if (!existing) await tx`insert into profiles (user_id, email, role, full_name, grade_level)
        values (${profileId}, ${loginId}, ${role}, ${name}, ${grade}) on conflict do nothing`;
      const passwordHash = await hash(password, { algorithm: Algorithm.Argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
      await tx`insert into users (profile_id, login_id, password_hash, role)
        values (${profileId}, ${loginId}, ${passwordHash}, ${role === "admin" ? "admin" : "user"}) on conflict do nothing`;
    }
  });
  console.log(`Auth seed checked ${accounts.length} configured account(s). Existing passwords were preserved.`);
} finally {
  await sql.end();
}
