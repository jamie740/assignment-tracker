export const COURSE_COLORS = [
  { value: "blue",   bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-300" },
  { value: "purple", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-300" },
  { value: "green",  bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  border: "border-green-300" },
  { value: "orange", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", border: "border-orange-300" },
  { value: "rose",   bg: "bg-rose-100",   text: "text-rose-700",   dot: "bg-rose-500",   border: "border-rose-300" },
  { value: "teal",   bg: "bg-teal-100",   text: "text-teal-700",   dot: "bg-teal-500",   border: "border-teal-300" },
  { value: "amber",  bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500",  border: "border-amber-300" },
  { value: "indigo", bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500", border: "border-indigo-300" },
  { value: "pink",   bg: "bg-pink-100",   text: "text-pink-700",   dot: "bg-pink-500",   border: "border-pink-300" },
  { value: "cyan",   bg: "bg-cyan-100",   text: "text-cyan-700",   dot: "bg-cyan-500",   border: "border-cyan-300" },
];

export function getColor(value: string) {
  return COURSE_COLORS.find((c) => c.value === value) ?? COURSE_COLORS[0];
}
