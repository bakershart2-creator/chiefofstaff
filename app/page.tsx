import { latestBrief } from "@/lib/store";
import { BriefView } from "./components";
export const dynamic = "force-dynamic";
export default async function Latest() {
  const b = await latestBrief();
  if (!b) return <main className="wrap"><p>No brief has been published yet.</p></main>;
  return <BriefView b={b} />;
}
