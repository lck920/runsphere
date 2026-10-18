import { TriangleAlert } from "lucide-react";

export default function Disclaimer() {
  return (
    <p role="note" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-fg">
      <TriangleAlert aria-hidden className="mr-1 inline size-4 align-[-3px] text-amber-600 dark:text-amber-400" />
      <strong>Not medical advice.</strong> This is general guidance for healthy beginners. If you have a heart,
      lung or joint condition, are pregnant, or feel chest pain, dizziness or unusual breathlessness, stop and talk to
      a doctor before continuing.
    </p>
  );
}
