"use client"

import { useState } from "react"
import { detectBrand, createBrand } from "./actions"
import { Loader2 } from "lucide-react"

export default function NewBrandPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);

  async function handleDetect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const brandName = formData.get("brandName") as string;
    const domain = formData.get("domain") as string;
    const groundTruth = formData.get("groundTruth") as string;
    
    try {
      const result = await detectBrand(formData);
      setBrandData({
        brandName,
        domain,
        groundTruth,
        ...result
      });
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      await createBrand(brandData);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-title font-semibold mb-8">Ajouter une marque</h1>
      
      {step === 1 && (
        <form onSubmit={handleDetect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la marque</label>
            <input name="brandName" required className="w-full border border-muted/40 rounded px-3 py-2 bg-paper text-ink" placeholder="Ex: Pennylane" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Domaine</label>
            <input name="domain" required className="w-full border border-muted/40 rounded px-3 py-2 bg-paper text-ink" placeholder="Ex: pennylane.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vérité Terrain (Ground Truth)</label>
            <p className="text-xs text-muted mb-2">Décrivez votre produit factuellement. L'IA utilisera ce texte pour évaluer les "Hallucinations" et la "Précision" des réponses générées.</p>
            <textarea name="groundTruth" required rows={3} className="w-full border border-muted/40 rounded px-3 py-2 bg-paper text-ink" placeholder="Ex: Pennylane est un logiciel de comptabilité et de gestion financière tout-en-un pour les dirigeants et leurs experts-comptables..." />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-ink text-paper py-2 rounded font-medium flex items-center justify-center gap-2 hover:bg-ink/90 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Détecter le secteur et les concurrents"}
          </button>
        </form>
      )}

      {step === 2 && brandData && (
        <div className="space-y-6">
          <div className="bg-muted/10 p-4 rounded border border-muted/40">
            <h3 className="font-semibold mb-2">Secteur détecté</h3>
            <p className="text-sm text-muted">{brandData.industry}</p>
          </div>
          
          <div className="bg-muted/10 p-4 rounded border border-muted/40">
            <h3 className="font-semibold mb-2">Concurrents ({brandData.competitors.length})</h3>
            <ul className="text-sm space-y-1 text-muted">
              {brandData.competitors.map((c: any, i: number) => (
                <li key={i}>{c.name} ({c.domain})</li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/10 p-4 rounded border border-muted/40">
            <h3 className="font-semibold mb-2">Requêtes à suivre ({brandData.prompts.length})</h3>
            <div className="text-sm text-muted max-h-40 overflow-y-auto space-y-1">
              {brandData.prompts.map((p: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked readOnly /> {p}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="w-full bg-cited text-paper py-2 rounded font-medium flex items-center justify-center gap-2 hover:bg-cited/90 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider et créer la marque"}
          </button>
        </div>
      )}
    </div>
  )
}
