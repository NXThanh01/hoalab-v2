export const PASS_SCORE = 8;
export const VIDEO_DURATION = 320;

export type Checkpoint = {
  id: number;
  time: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export const checkpoints: Checkpoint[] = [
  { id: 1, time: 90, question: "Nhóm chức đặc trưng của ester đơn chức là", options: ["-COO-", "-COOH", "-OH", "-CHO"], correct: 0, explanation: "Ester đơn chức chứa nhóm -COO- nối giữa gốc acyl và gốc hydrocarbon." },
  { id: 2, time: 225, question: "Xà phòng hóa CH_3COOC_2H_5 bằng NaOH tạo ra chất nào?", options: ["CH_3COOH và C_2H_5ONa", "CH_3COONa và C_2H_5OH", "HCOONa và CH_3OH", "CH_3COONa và CH_3OH"], correct: 1, explanation: "Ester phản ứng với NaOH tạo muối carboxylate và alcohol: CH_3COONa, C_2H_5OH." },
];

export type PracticeQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export const practiceQuestions: PracticeQuestion[] = [
  { id: "q1", question: "Ester no, đơn chức, mạch hở có công thức chung là", options: ["C_nH_2nO_2", "C_nH_2n+2O_2", "C_nH_2n-2O_2", "C_nH_2nO"], correct: 0, explanation: "Một liên kết π ở nhóm carbonyl làm công thức giảm 2H so với hợp chất no tương ứng." },
  { id: "q2", question: "Phản ứng thủy phân ester trong môi trường kiềm còn gọi là", options: ["hydrogen hóa", "xà phòng hóa", "trùng ngưng", "oxi hóa"], correct: 1, explanation: "Thủy phân ester bằng base tạo muối carboxylate và alcohol, gọi là xà phòng hóa." },
  { id: "q3", question: "Chất béo là triester của glycerol với", options: ["acid béo", "amino acid", "alcohol đơn chức", "acid vô cơ"], correct: 0, explanation: "Chất béo là triacylglycerol tạo bởi glycerol và các acid béo." },
];

export const notebookTabs = {
  "Trọng tâm": [
    { title: "Khái niệm ester", text: "Ester đơn chức thường có dạng RCOOR′; nhóm chức đặc trưng là -COO-." },
    { title: "Ester hóa", text: "Acid carboxylic + alcohol ⇌ ester + H_2O, xúc tác H_2SO_4 đặc và đun nóng." },
    { title: "Chất béo", text: "Chất béo là triester của glycerol với acid béo, còn gọi là triglyceride." },
  ],
  "Công thức": [
    { title: "Ester no, đơn chức", text: "C_nH_2nO_2 (n ≥ 2)." },
    { title: "Xà phòng hóa", text: "RCOOR′ + NaOH → RCOONa + R′OH." },
    { title: "Chỉ số ester", text: "n_ester = n_base với ester đơn chức phản ứng vừa đủ." },
  ],
  "Bẫy hay gặp": [
    { title: "Phản ứng thuận nghịch", text: "Ester hóa với acid là thuận nghịch; xà phòng hóa trong kiềm được coi là một chiều." },
    { title: "Ester của phenol", text: "RCOOC_6H_5 phản ứng với 2 mol NaOH cho mỗi mol ester trong điều kiện phù hợp." },
    { title: "Chất béo không no", text: "Liên kết C=C trong gốc acid béo có thể cộng H_2 và làm mất màu bromine." },
  ],
} as const;
