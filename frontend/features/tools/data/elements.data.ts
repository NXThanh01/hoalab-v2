export type ElementInfo = {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  group: string;
  electrons: string;
  tone: string;
};

export const elements: ElementInfo[] = [
  { z: 1, symbol: "H", name: "Hydrogen", mass: 1.008, group: "Phi kim", electrons: "1s^1", tone: "bg-cyan-50 text-cyan-700" },
  { z: 2, symbol: "He", name: "Helium", mass: 4.003, group: "Khí hiếm", electrons: "1s^2", tone: "bg-violet-50 text-violet-700" },
  { z: 3, symbol: "Li", name: "Lithium", mass: 6.94, group: "Kim loại kiềm", electrons: "[He] 2s^1", tone: "bg-rose-50 text-rose-700" },
  { z: 4, symbol: "Be", name: "Beryllium", mass: 9.012, group: "Kiềm thổ", electrons: "[He] 2s^2", tone: "bg-orange-50 text-orange-700" },
  { z: 5, symbol: "B", name: "Boron", mass: 10.81, group: "Á kim", electrons: "[He] 2s^2 2p^1", tone: "bg-emerald-50 text-emerald-700" },
  { z: 6, symbol: "C", name: "Carbon", mass: 12.011, group: "Phi kim", electrons: "[He] 2s^2 2p^2", tone: "bg-cyan-50 text-cyan-700" },
  { z: 7, symbol: "N", name: "Nitrogen", mass: 14.007, group: "Phi kim", electrons: "[He] 2s^2 2p^3", tone: "bg-cyan-50 text-cyan-700" },
  { z: 8, symbol: "O", name: "Oxygen", mass: 15.999, group: "Phi kim", electrons: "[He] 2s^2 2p^4", tone: "bg-cyan-50 text-cyan-700" },
  { z: 9, symbol: "F", name: "Fluorine", mass: 18.998, group: "Halogen", electrons: "[He] 2s^2 2p^5", tone: "bg-lime-50 text-lime-700" },
  { z: 10, symbol: "Ne", name: "Neon", mass: 20.18, group: "Khí hiếm", electrons: "[He] 2s^2 2p^6", tone: "bg-violet-50 text-violet-700" },
  { z: 11, symbol: "Na", name: "Sodium", mass: 22.99, group: "Kim loại kiềm", electrons: "[Ne] 3s^1", tone: "bg-rose-50 text-rose-700" },
  { z: 12, symbol: "Mg", name: "Magnesium", mass: 24.305, group: "Kiềm thổ", electrons: "[Ne] 3s^2", tone: "bg-orange-50 text-orange-700" },
  { z: 13, symbol: "Al", name: "Aluminium", mass: 26.982, group: "Kim loại", electrons: "[Ne] 3s^2 3p^1", tone: "bg-slate-100 text-slate-700" },
  { z: 14, symbol: "Si", name: "Silicon", mass: 28.085, group: "Á kim", electrons: "[Ne] 3s^2 3p^2", tone: "bg-emerald-50 text-emerald-700" },
  { z: 15, symbol: "P", name: "Phosphorus", mass: 30.974, group: "Phi kim", electrons: "[Ne] 3s^2 3p^3", tone: "bg-cyan-50 text-cyan-700" },
  { z: 16, symbol: "S", name: "Sulfur", mass: 32.06, group: "Phi kim", electrons: "[Ne] 3s^2 3p^4", tone: "bg-cyan-50 text-cyan-700" },
  { z: 17, symbol: "Cl", name: "Chlorine", mass: 35.45, group: "Halogen", electrons: "[Ne] 3s^2 3p^5", tone: "bg-lime-50 text-lime-700" },
  { z: 18, symbol: "Ar", name: "Argon", mass: 39.948, group: "Khí hiếm", electrons: "[Ne] 3s^2 3p^6", tone: "bg-violet-50 text-violet-700" },
  { z: 26, symbol: "Fe", name: "Iron", mass: 55.845, group: "Kim loại chuyển tiếp", electrons: "[Ar] 3d^6 4s^2", tone: "bg-amber-50 text-amber-700" },
  { z: 29, symbol: "Cu", name: "Copper", mass: 63.546, group: "Kim loại chuyển tiếp", electrons: "[Ar] 3d^10 4s^1", tone: "bg-amber-50 text-amber-700" },
] as const;
