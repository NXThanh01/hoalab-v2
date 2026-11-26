import { AppRoot } from "@/frontend/components/templates/AppRoot";
import { getSessionUser } from "@/backend/modules/auth/session";
import { AuthProvider } from "@/frontend/features/auth/model/AuthContext";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  return (
    <AuthProvider initialUser={user}>
      <AppRoot />
    </AuthProvider>
  );
}
