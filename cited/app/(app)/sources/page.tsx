import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Sources | Cited",
};

export default async function SourcesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const citations = await db.citation.findMany({
    where: { brand: { userId } },
    include: {
      brand: { select: { name: true } },
    },
    orderBy: { position: "asc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-semibold">Sources citées</h1>
        <p className="mt-2 text-sm text-muted">
          Les pages retrouvées dans les réponses des moteurs suivis pour vos marques.
        </p>
      </header>
      {citations.length === 0 ? (
        <div className="rounded-lg border border-muted/40 p-12 text-center text-sm text-muted">
          Aucune source collectée. Lancez une campagne depuis une marque pour commencer.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-muted/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-muted/40 bg-muted/10 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Marque</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/40">
              {citations.map((citation) => (
                <tr key={citation.id}>
                  <td className="px-4 py-4 font-medium">{citation.brand.name}</td>
                  <td className="max-w-xl px-4 py-4">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-cited hover:underline"
                    >
                      <span className="truncate">{citation.title || citation.domain}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-4 text-muted">#{citation.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
