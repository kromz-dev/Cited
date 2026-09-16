import { CoverageCell } from "./CoverageCell";

export type CoverageMatrixRow = {
  label: string;
  cells: Array<"cited" | "absent" | "pending" | "rival">;
};

export function CoverageMatrix({ rows, columns }: { rows: CoverageMatrixRow[]; columns: string[] }) {
  return <div className="overflow-x-auto rounded-md border border-line">
    <div className="min-w-[520px]">
      <div className="grid border-b border-line bg-paper px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted" style={{ gridTemplateColumns: `minmax(180px, 1.5fr) repeat(${columns.length}, minmax(48px, 1fr))` }}>
        <div>Requête</div>
        {columns.map((column) => <div className="text-center" key={column}>{column}</div>)}
      </div>
      {rows.map((row) => <div className="grid items-center border-b border-line px-4 py-3 last:border-0" style={{ gridTemplateColumns: `minmax(180px, 1.5fr) repeat(${columns.length}, minmax(48px, 1fr))` }} key={row.label}>
        <div className="truncate pr-4 text-sm text-ink" title={row.label}>{row.label}</div>
        {row.cells.map((state, index) => <CoverageCell key={`${row.label}-${index}`} state={state} label={`${row.label}, ${columns[index]}`} />)}
      </div>)}
    </div>
  </div>;
}
