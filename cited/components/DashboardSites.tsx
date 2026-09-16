"use client";

import { useState, useTransition } from "react";
import { addMonitoredSite, deleteMonitoredSite } from "@/app/actions/sites";
import { Loader2, Plus, AlertCircle, X, Download, ShieldAlert, CheckCircle2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type MonitoredSite = {
  id: string;
  name: string;
  url: string;
  status: string;
  createdAt: Date;
};

export function DashboardSites({ initialSites }: { initialSites: MonitoredSite[] }) {
  const [sites, setSites] = useState(initialSites);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    startTransition(async () => {
      const response = await addMonitoredSite({ name, url });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      if (response.data) {
        setSites([response.data as MonitoredSite, ...sites]);
        setName("");
        setUrl("");
        setShowAddForm(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce domaine ?")) return;
    
    startTransition(async () => {
      const response = await deleteMonitoredSite(id);
      
      if (response.error) {
        alert(response.error);
        return;
      }
      
      if (response.success) {
        setSites((prev) => prev.filter((s) => s.id !== id));
      }
    });
  };

  const activeAlerts = sites.filter(s => s.status === "ERROR" || s.status === "BLOCKED");
  const healthySites = sites.filter(s => s.status === "ACTIVE" || s.status === "OK");

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) || site.url.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "Tous" ? true :
      filter === "En alerte" ? (site.status === "ERROR" || site.status === "BLOCKED") :
      filter === "OK" ? (site.status === "ACTIVE" || site.status === "OK") : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mt-12 space-y-8">
      {/* Alert Banner (if any) */}
      {activeAlerts.length > 0 && (
        <div className="bg-signal text-white rounded-xl p-6 flex flex-wrap gap-5 justify-between items-center shadow-sm">
          <div>
            <div className="text-white/80 font-medium mb-2">{activeAlerts.length} {activeAlerts.length > 1 ? 'domaines' : 'domaine'} en alerte</div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight m-0">
              {activeAlerts[0].url} bloque les bots depuis peu
            </h2>
          </div>
          <Link href={`/sites/${activeAlerts[0].id}`} className="bg-white text-signal hover:bg-white/90 px-5 py-2.5 rounded-lg font-medium transition-colors">
            Voir le détail
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-paper p-5 rounded-xl border border-line flex flex-col justify-between">
          <div className="text-sm text-muted font-medium mb-2">Domaines surveillés</div>
          <div className="text-3xl font-semibold text-ink">{sites.length}<span className="text-muted text-lg font-normal"> / 20</span></div>
        </div>
        <div className="bg-paper p-5 rounded-xl border border-line flex flex-col justify-between">
          <div className="text-sm text-muted font-medium mb-2">Lisibles par l'IA</div>
          <div className="text-3xl font-semibold text-ink">{healthySites.length}</div>
        </div>
        <div className="bg-paper p-5 rounded-xl border border-line flex flex-col justify-between">
          <div className="text-sm text-signal font-medium mb-2">En alerte</div>
          <div className="text-3xl font-semibold text-signal">{activeAlerts.length}</div>
        </div>
        <div className="bg-paper p-5 rounded-xl border border-line flex flex-col justify-between">
          <div className="text-sm text-muted font-medium mb-2">Prochain scan</div>
          <div className="text-3xl font-semibold text-ink">04:12</div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Input 
            placeholder="Filtrer un domaine" 
            className="w-full md:w-[220px] bg-paper h-[42px]" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            aria-label="Filtrer les domaines"
          />
          <div className="flex bg-paper border border-line rounded-lg p-1 h-[42px] items-center shrink-0">
            {["Tous", "En alerte", "OK"].map((opt) => (
              <button 
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${filter === opt ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
                aria-pressed={filter === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Button variant="outline" className="h-[42px] flex-1 md:flex-none gap-2">
            <Download size={16} /> <span className="hidden sm:inline">Exporter</span>
          </Button>
          <Button className="h-[42px] flex-1 md:flex-none gap-2 bg-cited hover:bg-cited/90 text-white" onClick={() => setShowAddForm(!showAddForm)} aria-expanded={showAddForm}>
            <Plus size={16} /> Ajouter un domaine
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddSite} className="bg-paper p-5 rounded-xl border border-line shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-ink">Nouveau domaine à surveiller</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-muted hover:text-ink p-1 rounded-md" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 bg-signal/10 border border-signal/20 text-signal px-4 py-3 rounded-lg flex items-start gap-3" role="alert">
              <ShieldAlert className="shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-sm">Action refusée</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label htmlFor="name" className="block text-sm font-medium text-muted mb-1.5">Nom du projet</label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Mon Projet" className="bg-white" />
            </div>
            <div className="flex-1 w-full">
              <label htmlFor="url" className="block text-sm font-medium text-muted mb-1.5">URL</label>
              <Input id="url" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-white" />
            </div>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto h-[40px] bg-ink hover:bg-ink/90 text-paper min-w-[120px]">
              {isPending ? <Loader2 className="animate-spin" size={18} /> : "Ajouter"}
            </Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-paper rounded-xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <caption className="sr-only">Liste des domaines surveillés</caption>
            <thead className="border-b border-line bg-surface/50 text-muted">
              <tr>
                <th className="px-5 py-3.5 font-medium">Domaine</th>
                <th className="px-5 py-3.5 font-medium">Verdict IA</th>
                <th className="px-5 py-3.5 font-medium">Code</th>
                <th className="px-5 py-3.5 font-medium">Texte utile</th>
                <th className="px-5 py-3.5 font-medium">Depuis</th>
                <th className="px-5 py-3.5 font-medium">Dernier scan</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isPending && (
                 <tr className="animate-pulse bg-surface/30">
                   <td className="px-5 py-4"><div className="h-5 bg-line rounded w-3/4 mb-1"></div><div className="h-4 bg-line rounded w-1/2"></div></td>
                   <td className="px-5 py-4"><div className="h-6 w-20 bg-line rounded-full"></div></td>
                   <td className="px-5 py-4"><div className="h-4 bg-line rounded w-8"></div></td>
                   <td className="px-5 py-4"><div className="h-4 bg-line rounded w-16"></div></td>
                   <td className="px-5 py-4"><div className="h-4 bg-line rounded w-12"></div></td>
                   <td className="px-5 py-4"><div className="h-4 bg-line rounded w-20"></div></td>
                   <td className="px-5 py-4 text-right"><div className="h-8 w-8 bg-line rounded ml-auto"></div></td>
                 </tr>
              )}
              {filteredSites.length === 0 && !isPending ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Aucun domaine trouvé.
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => {
                  const isError = site.status === "ERROR" || site.status === "BLOCKED";
                  const isOk = site.status === "ACTIVE" || site.status === "OK";
                  const isPendingStatus = site.status === "PENDING";
                  
                  return (
                    <tr key={site.id} className="group hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">{site.url.replace(/^https?:\/\//, '')}</div>
                        <div className="text-muted text-xs mt-0.5">{site.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        {isError && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-signal/10 text-signal border border-signal/20">Bloqué</span>}
                        {isOk && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 border border-green-500/20">OK</span>}
                        {isPendingStatus && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-transparent text-muted border border-line">Scan en cours</span>}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">
                        {isError ? "403" : isOk ? "200" : "—"}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">
                        {isError ? "0 car." : isOk ? "4 210 car." : "—"}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {isError ? "6 jours" : "—"}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(site.id)}
                          disabled={isPending}
                          className="text-muted hover:text-signal hover:bg-signal/10 p-1.5 rounded-md transition-colors disabled:opacity-50"
                          aria-label={`Supprimer ${site.name}`}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
