export type CloudProgress = {
  lessonId: number;
  status: "not_started" | "in_progress" | "completed";
  bestScore: number;
  videoSecond: number;
  checkpoints: number[];
  updatedAt: string;
};

export async function getCloudProgress(): Promise<CloudProgress[]> {
  const response = await fetch("/api/progress", { cache: "no-store" });
  if (!response.ok) throw new Error("PROGRESS_FETCH_FAILED");
  const data = await response.json() as { progress: CloudProgress[] };
  return data.progress;
}

export async function saveCloudProgress(input: Omit<CloudProgress, "updatedAt">) {
  const response = await fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("PROGRESS_SAVE_FAILED");
  return response.json();
}
