import { getAuditLogs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await getAuditLogs();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Workflow execution history
        </p>
      </div>

      {logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 text-xs uppercase tracking-widest text-zinc-500">
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-left py-3 pr-4">Workflow</th>
                <th className="text-left py-3 pr-4">Action</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-zinc-800/30 hover:bg-zinc-900/30"
                >
                  <td className="py-3 pr-4 text-zinc-400 font-mono text-xs">
                    {new Date(log.execution_date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">
                    {log.workflow_name || "—"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">{log.action}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        log.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.status === "error"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500 font-mono text-xs">
                    {log.details
                      ? JSON.stringify(log.details).substring(0, 80)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center text-zinc-500 rounded-xl bg-zinc-900/30 border border-zinc-800/40">
          <p>No audit logs yet.</p>
          <p className="text-sm mt-1">
            Logs will appear after the first n8n workflow execution.
          </p>
        </div>
      )}
    </div>
  );
}
