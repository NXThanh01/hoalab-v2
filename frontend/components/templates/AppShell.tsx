"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "@/frontend/components/organisms/AppHeader";
import { AppSidebar } from "@/frontend/components/organisms/AppSidebar";
import { DashboardView } from "@/frontend/features/dashboard/components/DashboardView";
import { InteractiveLessonView } from "@/frontend/features/learning/components/InteractiveLessonView";
import { useLearning } from "@/frontend/features/learning/model/LearningContext";
import { AITutorView } from "@/frontend/features/ai/components/AITutorView";
import { ChemistryToolsView } from "@/frontend/features/tools/components/ChemistryToolsView";
import { CourseCatalogView, PracticeHubView, VirtualLabView } from "@/frontend/features/hubs/components/FeatureHubViews";
import { AdminPortalShell } from "@/frontend/features/admin/components/AdminPortalShell";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";

export function AppShell() {
  const { view } = useLearning();
  const { isAdmin } = useAuth();

  if (isAdmin) return <AdminPortalShell />;

  const screens = {
    dashboard: <DashboardView />,
    lesson: <InteractiveLessonView />,
    ai: <AITutorView />,
    tools: <ChemistryToolsView />,
    courses: <CourseCatalogView />,
    practice: <PracticeHubView />,
    lab: <VirtualLabView />,
    admin: <DashboardView />,
  };

  return (
    <div className="min-h-screen bg-[var(--surface-app)] text-slate-900">
      <AppSidebar />
      <AppHeader />
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22 }}
        >
          {screens[view]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
