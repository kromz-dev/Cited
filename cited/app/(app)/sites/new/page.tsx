"use client"

import { useState } from "react"
import { createSite } from "./actions"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

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
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">Ajouter un site à scanner</h1>
      <p className="mt-2 text-sm text-ink-2">Renseignez le nom du projet et le domaine à surveiller.</p>

      <Card className="mt-8">
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">Nom du site</label>
              <Input id="name" name="name" required placeholder="Ex : Pennylane" />
            </div>
            <div>
              <label htmlFor="domain" className="mb-1.5 block text-sm font-medium text-ink">Domaine</label>
              <Input id="domain" name="domain" required placeholder="Ex : pennylane.com" />
            </div>
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter le site"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
