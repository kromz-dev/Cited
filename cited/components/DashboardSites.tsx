"use client";

import { useState, useTransition } from "react";
import { addMonitoredSite, deleteMonitoredSite } from "@/app/actions/sites";
import { Plus, Trash2, Globe, Activity } from "lucide-react";

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
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return;
    
    startTransition(async () => {
      const response = await deleteMonitoredSite(id);
      
      if (response.error) {
        alert(response.error);
        return;
      }
      
      if (response.success) {
        setSites(sites.filter((s) => s.id !== id));
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "ERROR": return "bg-red-100 text-red-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Add a Monitored Site
        </h2>
        <form onSubmit={handleAddSite} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agency Website"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">URL to monitor</label>
            <input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto h-[42px]"
          >
            <Plus size={18} />
            {isPending ? "Adding..." : "Add Site"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Monitored Sites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p>No monitored sites yet. Add one above to get started.</p>
            </div>
          ) : (
            sites.map((site) => (
              <div key={site.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-lg text-gray-900 truncate" title={site.name}>{site.name}</h3>
                    <a href={site.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block max-w-full" title={site.url}>
                      {site.url}
                    </a>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${getStatusColor(site.status)}`}>
                    {site.status}
                  </span>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Added on {new Date(site.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                    title="Delete site"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
