import { getBrief } from "@/lib/store";
import { BriefView } from "../../components";
export const dynamic = "force-dynamic";
export default async function One({ params }: { params: Promise<{ id: string }> }) {
  const b = await getBrief((await params).id);
  if (!b) return <main className="wrap"><p>Brief not found.</p></main>;
  return <BriefView b={b} />;
}
