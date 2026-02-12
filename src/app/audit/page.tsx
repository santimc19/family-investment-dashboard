import { getAuditLogs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Audit Log
        </h1>
        <p className="text-[13px] text-zinc-500 mt-1">
          Workflow execution history
        </p>
      </div>

      {logs.length > 0 ? (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === "success"
                        ? "bg-emerald-500"
                        : log.status === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      {log.workflow_name || "Manual execution"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {log.action}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-zinc-500">
                    {new Date(log.execution_date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      log.status === "success"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : log.status === "error"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
              {log.details && (
                <p className="text-[11px] font-mono text-zinc-600 mt-2 truncate">
                  {JSON.stringify(log.details).substring(0, 120)}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <div className="text-zinc-600 mb-2">
            <svg className="mx-auto" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-zinc-500 text-sm">No audit logs yet.</p>
          <p className="text-zinc-600 text-xs mt-1">
            Logs will appear after the first n8n workflow execution.
          </p>
        </div>
      )}
    </div>
  );
}
