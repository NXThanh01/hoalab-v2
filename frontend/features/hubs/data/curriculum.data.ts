export type VideoStatus = "ready" | "draft" | "missing";

export type CurriculumLesson = {
  id: string;
  number: number;
  title: string;
  videoStatus: VideoStatus;
  durationMinutes?: number;
  checkpointCount: number;
  progress: number;
};

export type CurriculumChapter = {
  id: string;
  number: number;
  title: string;
  lessons: CurriculumLesson[];
};

const lesson = (number: number, title: string, patch: Partial<CurriculumLesson> = {}): CurriculumLesson => ({
  id: `hoa-12-bai-${number}`,
  number,
  title,
  videoStatus: "missing",
  checkpointCount: 0,
  progress: 0,
  ...patch,
});

export const grade12Curriculum: CurriculumChapter[] = [
  { id: "ester-lipid", number: 1, title: "Ester – Lipid", lessons: [
    lesson(1, "Ester – Lipid", { videoStatus: "ready", durationMinutes: 18, checkpointCount: 2, progress: 42 }),
    lesson(2, "Xà phòng và chất giặt rửa", { videoStatus: "draft", durationMinutes: 12, checkpointCount: 1 }),
    lesson(3, "Ôn tập chương 1"),
  ] },
  { id: "carbohydrate", number: 2, title: "Carbohydrate", lessons: [
    lesson(4, "Giới thiệu về carbohydrate. Glucose và fructose"),
    lesson(5, "Saccharose và maltose"), lesson(6, "Tinh bột và cellulose"), lesson(7, "Ôn tập chương 2"),
  ] },
  { id: "nitrogen", number: 3, title: "Hợp chất chứa nitrogen", lessons: [
    lesson(8, "Amine"), lesson(9, "Amino acid và peptide"), lesson(10, "Protein và enzyme"), lesson(11, "Ôn tập chương 3"),
  ] },
  { id: "polymer", number: 4, title: "Polymer", lessons: [
    lesson(12, "Đại cương về polymer"), lesson(13, "Vật liệu polymer"), lesson(14, "Ôn tập chương 4"),
  ] },
  { id: "pin-dien-dien-phan", number: 5, title: "Pin điện và điện phân", lessons: [
    lesson(15, "Thế điện cực và nguồn điện hoá học"), lesson(16, "Điện phân"), lesson(17, "Ôn tập chương 5"),
  ] },
  { id: "dai-cuong-kim-loai", number: 6, title: "Đại cương về kim loại", lessons: [
    lesson(18, "Cấu tạo và liên kết trong tinh thể kim loại"), lesson(19, "Tính chất vật lí và tính chất hoá học của kim loại"),
    lesson(20, "Kim loại trong tự nhiên và phương pháp tách kim loại"), lesson(21, "Hợp kim"), lesson(22, "Sự ăn mòn kim loại"), lesson(23, "Ôn tập chương 6"),
  ] },
  { id: "nhom-ia-iia", number: 7, title: "Nguyên tố nhóm IA và nhóm IIA", lessons: [
    lesson(24, "Nguyên tố nhóm IA"), lesson(25, "Nguyên tố nhóm IIA"), lesson(26, "Ôn tập chương 7"),
  ] },
  { id: "kim-loai-chuyen-tiep", number: 8, title: "Kim loại chuyển tiếp và phức chất", lessons: [
    lesson(27, "Đại cương về kim loại chuyển tiếp dãy thứ nhất"), lesson(28, "Sơ lược về phức chất"),
    lesson(29, "Một số tính chất và ứng dụng của phức chất"), lesson(30, "Ôn tập chương 8"),
  ] },
];

export const gradeLibraries = [
  { grade: 10, label: "Hóa học 10", description: "Nền tảng cấu tạo chất và phản ứng", available: false },
  { grade: 11, label: "Hóa học 11", description: "Cân bằng, nitrogen và hữu cơ", available: false },
  { grade: 12, label: "Hóa học 12", description: "8 chương · 30 bài theo SGK", available: true },
] as const;

export const grade12Lessons = grade12Curriculum.flatMap((chapter) => chapter.lessons.map((item) => ({ ...item, chapterId: chapter.id, chapterTitle: chapter.title })));
