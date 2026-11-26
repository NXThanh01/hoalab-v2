/** Public contract shared by the learning UI and the AI grading API. */
export type AIGradeResult = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  model: "openai" | "mock";
};

export async function gradeWithAI(answer: string): Promise<AIGradeResult> {
  const response = await fetch("/api/ai/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "Viết phương trình ester hóa giữa acid acetic và ethanol, nêu điều kiện và đặc điểm phản ứng.",
      answer,
      maxScore: 4,
      rubric: [
        "Viết đúng hai chất tham gia CH₃COOH và C₂H₅OH",
        "Viết đúng sản phẩm CH₃COOC₂H₅ và H₂O",
        "Nêu xúc tác H₂SO₄ đặc và đun nóng",
        "Nhận ra phản ứng thuận nghịch hoặc cân bằng hóa học",
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Không thể kết nối dịch vụ chấm bài.");
  }

  return response.json();
}
