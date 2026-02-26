import Link from "next/link";
import comparisonData from "@/data/comparison-data.json";
import CompareClient from "./CompareClient";

export default function ComparePage() {
  // Keep it simple: pass the data straight through
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm underline underline-offset-4">
          ← Back to all countries
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold">Compare Countries</h1>
      <p className="mb-6 text-sm opacity-80">
        Use the URL like <code>?c=USA&amp;c=CAN</code> or pick countries below.
      </p>

      <CompareClient countries={comparisonData as any[]} />
    </main>
  );
}
