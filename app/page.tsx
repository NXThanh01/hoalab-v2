import { AppRoot } from "@/frontend/components/templates/AppRoot";
import { getSessionUser } from "@/backend/modules/auth/session";
import { AuthProvider } from "@/frontend/features/auth/model/AuthContext";
import { safeLearningView } from "@/shared/auth-input";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const user = await getSessionUser({ allowPasswordChange: true });
  const initialView = safeLearningView((await searchParams).view);
  return (
    <AuthProvider initialUser={user}>
      <AppRoot initialView={initialView} />
    </AuthProvider>
  );
}
