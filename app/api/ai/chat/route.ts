import { authJson } from "@/backend/modules/auth/auth-http";
import { getSessionUser } from "@/backend/modules/auth/session";
import { askGemini, GeminiChatError } from "@/backend/modules/ai/gemini-chat";
import { chemistryChatInput } from "@/shared/chemistry-chat";

export const maxDuration = 35;

export async function POST(request: Request) {
  if (!await getSessionUser()) return authJson({ error: "Hãy đăng nhập để dùng Trợ lý Hóa." }, 401);
  const parsed = chemistryChatInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authJson({ error: "Nội dung gửi chưa hợp lệ. Kiểm tra độ dài câu hỏi." }, 400);

  try {
    return authJson(await askGemini(parsed.data, request.signal));
  } catch (error) {
    if (error instanceof GeminiChatError) return authJson({ error: error.message }, error.status);
    return authJson({ error: "Chưa kết nối được với Gemini. Hãy thử lại." }, 502);
  }
}
