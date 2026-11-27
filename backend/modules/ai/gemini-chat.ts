import type { ChemistryChatInput } from "@/shared/chemistry-chat";

const modes: Record<ChemistryChatInput["mode"], string> = {
  explain: "Giải thích khái niệm bằng ví dụ ngắn và chỉ ra lỗi dễ nhầm.",
  solve: "Tóm tắt dữ kiện, trình bày cách giải từng bước và kiểm tra đơn vị.",
  balance: "Nêu hệ số nguyên tối giản và đối chiếu số nguyên tử hoặc điện tích ở hai vế.",
  quiz: "Soạn câu hỏi vừa sức theo chủ đề được yêu cầu. Chờ học sinh chọn rồi mới giải thích đáp án.",
};

export class GeminiChatError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

type GeminiTurn = { role: "user" | "model"; parts: Array<{ text: string }> };
type GeminiResponse = {
  promptFeedback?: { blockReason?: string };
  candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
};

export async function askGemini({ messages, mode }: ChemistryChatInput, signal: AbortSignal) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
  if (!apiKey) throw new GeminiChatError(503, "Trợ lý Hóa chưa được cấu hình Gemini.");
  if (!/^gemini-[\w.-]+$/.test(model)) throw new GeminiChatError(503, "Tên mô hình Gemini chưa hợp lệ.");

  const contents: GeminiTurn[] = [];
  for (const message of messages) {
    const role = message.role === "assistant" ? "model" : "user";
    const previous = contents.at(-1);
    if (!previous && role === "model") continue;
    const part = { text: message.content };
    if (previous?.role === role) previous.parts.push(part);
    else contents.push({ role, parts: [part] });
  }
  const timeout = AbortSignal.timeout(28_000);
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      signal: AbortSignal.any([signal, timeout]),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: [
          "Bạn là Trợ lý HóaLab, hướng dẫn Hóa học THPT Việt Nam. Trả lời tiếng Việt rõ ràng, đúng kiến thức, tập trung giúp học sinh tự hiểu.",
          modes[mode],
          "Hỏi lại khi thiếu dữ kiện, nói rõ điểm chưa chắc chắn. Từ chối hướng dẫn thực hành nguy hiểm và gợi ý mô phỏng an toàn.",
          "Dùng văn bản thường, chia đoạn ngắn, tránh bảng Markdown hoặc LaTeX. Viết H_2O, SO_4^2-, Na^+ và mũi tên → để HóaLab hiển thị công thức.",
        ].join(" ") }] },
        contents,
        generationConfig: { maxOutputTokens: 2048 },
      }),
    });
  } catch (cause) {
    if (timeout.aborted) throw new GeminiChatError(504, "Gemini phản hồi quá lâu. Hãy thử lại.");
    throw cause;
  }
  if (response.status === 429) throw new GeminiChatError(429, "Gemini đang giới hạn lượt dùng. Hãy thử lại sau.");
  if ([400, 401, 403, 404].includes(response.status)) {
    throw new GeminiChatError(503, "Gemini chưa sẵn sàng. Quản trị viên cần kiểm tra khóa API và mô hình.");
  }
  if (!response.ok) throw new GeminiChatError(502, "Gemini tạm thời không phản hồi. Hãy thử lại.");
  const data = await response.json() as GeminiResponse;
  const candidate = data.candidates?.[0];
  if (data.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
    throw new GeminiChatError(422, "Gemini không thể trả lời nội dung này. Hãy thử diễn đạt lại như một câu hỏi học tập.");
  }
  const answer = candidate?.content?.parts?.filter((part) => !part.thought && part.text)
    .map((part) => part.text).join("\n").trim();
  if (!answer) throw new GeminiChatError(502, "Gemini chưa trả về câu trả lời. Hãy thử lại.");
  return { answer, model: "gemini" as const, truncated: candidate?.finishReason === "MAX_TOKENS" };
}
