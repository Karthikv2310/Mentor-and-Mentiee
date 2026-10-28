"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function BulkImportPage() {
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("students_import.csv");
  const [allowUpdates, setAllowUpdates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [commitResult, setCommitResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Template CSV content
  const sampleCsv = `institutionalId,fullName,institutionalEmail,departmentCode,programmeCode,admissionYear,currentSemester,section,admissionCategory,pcmPercentagePUC
4NM24CS201,Ananya Hegde,ananya.demo@nmamit.in,CSE,BTECH_CSE,2024,3,A,REGULAR,78.5
4NM24CS202,Rohan Bhat,rohan.demo@nmamit.in,CSE,BTECH_CSE,2024,3,A,REGULAR,61.0
NNM24CS203,Deepak Nayak,deepak.demo@nmamit.in,CSE,BTECH_CSE,2024,3,B,NRI,58.0
4NM24IS105,Sneha Rao,sneha.demo@nmamit.in,ISE,BTECH_ISE,2024,3,A,REGULAR,82.0`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "NMAMIT_Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      setPreviewData(null);
      setCommitResult(null);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleValidatePreview = async () => {
    if (!csvContent.trim()) {
      setError("Please paste or upload CSV data first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          fileName,
          dryRun: true,
          allowUpdates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Validation failed");
        return;
      }

      setPreviewData(data);
    } catch {
      setError("Network error while validating import data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          fileName,
          dryRun: false,
          allowUpdates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }

      setCommitResult(data);
      setPreviewData(null);
    } catch {
      setError("Network error during import commitment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!previewData?.rowErrors) return;
    const errorCsvHeader = "Row,USN,Name,Errors\n";
    const errorCsvRows = previewData.rowErrors
      .map((r: any) => `${r.rowNumber},"${r.data.institutionalId}","${r.data.fullName}","${r.errors.join("; ")}"`)
      .join("\n");
    const blob = new Blob([errorCsvHeader + errorCsvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Import_Errors_${fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Roster</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Institutional Batch Processing</span>
            </div>
            <h1 className="text-xl font-bold">Bulk Student Import (CSV)</h1>
            <p className="text-xs text-slate-300">
              Upload institutional student lists with dry-run validation, intra-file duplicate detection, and row-level error reporting.
            </p>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shrink-0 transition"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-semibold">Import Validation Failure</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {commitResult && (
          <div className="m-6 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Import Committed Successfully</span>
            </div>
            <p className="text-xs text-emerald-700">
              Imported {commitResult.summary.importedRows} of {commitResult.summary.totalRows} student records into the database.
              Audit event recorded under Job #{commitResult.importJobId}.
            </p>
            <div className="pt-2 flex gap-3">
              <Link
                href="/students"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
              >
                View Updated Student Directory
              </Link>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6 text-xs">
          {/* Upload and Paste Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                CSV Content / File Upload
              </label>
              <label className="cursor-pointer text-xs font-semibold text-rose-800 hover:text-rose-900">
                <span>Browse File (.csv)</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                setPreviewData(null);
                setCommitResult(null);
              }}
              placeholder={`Paste CSV data here or click 'Browse File'. Expected header:\ninstitutionalId,fullName,institutionalEmail,departmentCode,programmeCode,admissionYear,currentSemester,section,admissionCategory,pcmPercentagePUC`}
              className="w-full font-mono text-[11px] p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800 bg-slate-50"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowUpdates}
                  onChange={(e) => setAllowUpdates(e.target.checked)}
                  className="rounded text-rose-800 focus:ring-rose-800"
                />
                <span className="text-slate-700 font-semibold">
                  Allow updating existing students (Explicit confirmation)
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCsvContent(sampleCsv)}
                  className="text-slate-500 hover:text-slate-800 text-xs underline"
                >
                  Load Sample Data
                </button>
                <button
                  type="button"
                  onClick={handleValidatePreview}
                  disabled={loading || !csvContent.trim()}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Preview & Validate Rows</span>
                </button>
              </div>
            </div>
          </div>

          {/* Validation Summary and Preview Table */}
          {previewData && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Total Rows:</span>{" "}
                    <strong className="text-slate-900">{previewData.summary.totalRows}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Valid:</span>{" "}
                    <strong className="text-emerald-700">{previewData.summary.validRows}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Errors:</span>{" "}
                    <strong className="text-rose-700">{previewData.summary.invalidRows}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Existing Records:</span>{" "}
                    <strong className="text-amber-700">{previewData.summary.existingRows}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {previewData.summary.invalidRows > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadErrorReport}
                      className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold text-xs flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Error Report</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={loading || previewData.summary.validRows === 0}
                    className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit Import ({previewData.summary.validRows} valid rows)</span>
                  </button>
                </div>
              </div>

              {/* Row Level Preview */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">USN / ID</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Dept</th>
                        <th className="py-2.5 px-3">Sem & Sec</th>
                        <th className="py-2.5 px-3">Validation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {previewData.preview.map((row: any) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-500">{row.rowNumber}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{row.data.institutionalId}</td>
                          <td className="py-2.5 px-3">{row.data.fullName}</td>
                          <td className="py-2.5 px-3 font-semibold">{row.data.departmentCode}</td>
                          <td className="py-2.5 px-3">Sem {row.data.currentSemester} - {row.data.section}</td>
                          <td className="py-2.5 px-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {row.isExisting ? "Update Ready" : "Valid New"}
                              </span>
                            ) : (
                              <div className="text-rose-700 text-[11px] space-y-0.5">
                                {row.errors.map((err: string, i: number) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span>{err}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
