"use client"

import { useState } from "react"
import { createSite } from "./actions"
import { Loader2 } from "lucide-react"

export default function NewSitePage() {
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    
    try {
      await createSite({ name, domain });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-heading font-semibold mb-8">Ajouter un site à scanner</h1>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom du site</label>
          <input name="name" required className="w-full border border-muted/40 rounded px-3 py-2 bg-paper text-ink" placeholder="Ex: Pennylane" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Domaine</label>
          <input name="domain" required className="w-full border border-muted/40 rounded px-3 py-2 bg-paper text-ink" placeholder="Ex: pennylane.com" />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-ink text-paper py-2 rounded font-medium flex items-center justify-center gap-2 hover:bg-ink/90 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter le site"}
        </button>
      </form>
    </div>
  )
}
