"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/src/components/ui/inputs/Button";
import { Dropdown } from "@/src/components/ui/inputs/Dropdown";
import { EnvironmentSelect } from "@/src/components/power-platform/EnvironmentSelect";
import { getImportTables, getImportColumns, runImport, type ImportTable, type ImportColumn } from "@/src/services/import/importApi";
import { showApiError } from "@/src/lib/errors/showApiError";
import type { ImportJob } from "@/src/types/powerPlatform";
import { parseCsvHeaders } from "./csvUtils";

interface ImportWizardProps {
  environmentUrl: string;
  onEnvironmentChange: (url: string) => void;
  onComplete: (job: ImportJob) => void;
  onCancel: () => void;
}

const DONT_IMPORT = "__skip__";

export function ImportWizard({ environmentUrl, onEnvironmentChange, onComplete, onCancel }: ImportWizardProps) {
  const [tables, setTables] = useState<ImportTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [targetTable, setTargetTable] = useState<ImportTable | null>(null);

  const [columns, setColumns] = useState<ImportColumn[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!environmentUrl) {
      setTables([]);
      return;
    }
    let cancelled = false;
    setTablesLoading(true);
    getImportTables(environmentUrl)
      .then((t) => { if (!cancelled) setTables(t); })
      .catch(() => { if (!cancelled) setTables([]); })
      .finally(() => { if (!cancelled) setTablesLoading(false); });
    return () => { cancelled = true; };
  }, [environmentUrl]);

  useEffect(() => {
    if (!targetTable || !environmentUrl) {
      setColumns([]);
      return;
    }
    let cancelled = false;
    setColumnsLoading(true);
    getImportColumns(environmentUrl, targetTable.logicalName)
      .then((c) => { if (!cancelled) setColumns(c); })
      .catch(() => { if (!cancelled) setColumns([]); })
      .finally(() => { if (!cancelled) setColumnsLoading(false); });
    return () => { cancelled = true; };
  }, [targetTable, environmentUrl]);

  const handleFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    const text = await f.text();
    const headers = parseCsvHeaders(text);
    if (headers.length === 0) {
      toast.error("Couldn't read any columns from that file");
      return;
    }
    setFile(f);
    setCsvContent(text);
    setCsvHeaders(headers);
    setMapping(Object.fromEntries(headers.map((h) => [h, DONT_IMPORT])));
  };

  const clearFile = () => {
    setFile(null);
    setCsvContent("");
    setCsvHeaders([]);
    setMapping({});
  };

  const columnOptions = useMemo(
    () => [
      { value: DONT_IMPORT, label: "— Don't import —" },
      ...columns.map((c) => ({ value: c.logicalName, label: `${c.logicalName} · ${c.type}` })),
    ],
    [columns],
  );

  const mappedCount = Object.values(mapping).filter((v) => v && v !== DONT_IMPORT).length;
  const canRun = !!environmentUrl && !!targetTable && !!file && mappedCount > 0;

  const handleRun = async () => {
    if (!canRun || !targetTable || !file) return;
    setRunning(true);
    try {
      const job = await runImport({
        environmentUrl,
        targetTable: targetTable.entitySetName,
        targetLogicalName: targetTable.logicalName,
        fileName: file.name,
        csvContent,
        mapping: csvHeaders
          .filter((h) => mapping[h] && mapping[h] !== DONT_IMPORT)
          .map((h) => ({ column: h, target: mapping[h] })),
      });
      onComplete(job);
    } catch (err) {
      showApiError(err, { title: "Import failed to start" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">1. Target Table</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <EnvironmentSelect value={environmentUrl} onChange={(v) => { onEnvironmentChange(v); setTargetTable(null); clearFile(); }} />
          <Dropdown
            variant="plain"
            value={targetTable?.logicalName ?? ""}
            onChange={(v) => { setTargetTable(tables.find((t) => t.logicalName === v) ?? null); clearFile(); }}
            options={tables.map((t) => ({ value: t.logicalName, label: `${t.displayName} (${t.logicalName})` }))}
            placeholder={tablesLoading ? "Loading tables…" : "Choose a table…"}
            disabled={!environmentUrl || tablesLoading}
            className="flex-1"
          />
        </div>
      </div>

      {targetTable && (
        <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">2. CSV File</p>
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) handleFile(dropped);
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                dragOver ? "border-info-400 bg-info/5" : "border-border/40 hover:border-border/70"
              }`}
            >
              <Upload size={20} className="text-muted-foreground" />
              <p className="text-sm text-foreground">Drop a CSV here, or click to browse</p>
              <p className="text-xs text-muted-foreground">The first row must be column headers</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-info/10 border border-info/20">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={16} className="text-info-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{csvHeaders.length} columns</p>
                </div>
              </div>
              <button type="button" onClick={clearFile} className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {file && (
        <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-2xl p-5 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">3. Map Columns</p>
          {columnsLoading ? (
            <p className="text-xs text-muted-foreground">Loading columns…</p>
          ) : (
            <div className="space-y-2">
              {csvHeaders.map((header) => (
                <div key={header} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 px-3 h-9 flex items-center bg-(--custom-table-bg) border border-(--custom-header-input-border) rounded-lg text-sm text-foreground truncate">
                    {header}
                  </div>
                  <span className="text-muted-foreground shrink-0">→</span>
                  <Dropdown
                    variant="plain"
                    value={mapping[header] ?? DONT_IMPORT}
                    onChange={(v) => setMapping((m) => ({ ...m, [header]: v }))}
                    options={columnOptions}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">{mappedCount} of {csvHeaders.length} columns mapped</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCancel} disabled={running}>
                Cancel
              </Button>
              <Button size="sm" leftIcon={<Upload size={14} />} onClick={handleRun} disabled={!canRun} loading={running}>
                Run Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
