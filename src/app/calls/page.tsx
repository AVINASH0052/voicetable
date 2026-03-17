"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  User,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TranscriptMessage {
  role: string;
  text: string;
}

function normalizeRole(role: string): string {
  const value = role.toLowerCase();
  if (value === "assistant" || value === "agent" || value === "ai") return "agent";
  if (value === "user" || value === "customer" || value === "human") return "user";
  return "agent";
}

function parseTranscript(rawTranscript: string | null): TranscriptMessage[] {
  if (!rawTranscript) return [];

  try {
    const parsed = JSON.parse(rawTranscript) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const entry = item as Record<string, unknown>;
          const roleValue =
            typeof entry.role === "string"
              ? entry.role
              : typeof entry.speaker === "string"
                ? entry.speaker
                : "agent";
          const textValue =
            typeof entry.text === "string"
              ? entry.text
              : typeof entry.message === "string"
                ? entry.message
                : typeof entry.content === "string"
                  ? entry.content
                  : null;

          if (!textValue) return null;
          return { role: normalizeRole(roleValue), text: textValue };
        })
        .filter((entry): entry is TranscriptMessage => entry !== null);
    }

    if (typeof parsed === "string") {
      return parsed
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          if (line.toLowerCase().startsWith("assistant:")) {
            return {
              role: "agent",
              text: line.slice("assistant:".length).trim(),
            };
          }
          if (line.toLowerCase().startsWith("user:")) {
            return {
              role: "user",
              text: line.slice("user:".length).trim(),
            };
          }
          return { role: "agent", text: line };
        });
    }
  } catch {
    return [];
  }

  return [];
}

interface Call {
  id: string;
  executionId: string | null;
  agentType: string;
  status: string;
  duration: number | null;
  transcript: string | null;
  extractedData: string | null;
  summary: string | null;
  cost: number | null;
  recordingUrl: string | null;
  customerPhone: string;
  customerName: string;
  createdAt: string;
  order?: { orderId: string; status: string } | null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    queued: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || styles.queued}`}
    >
      {status}
    </span>
  );
}

function CallRow({ call }: { call: Call }) {
  const [expanded, setExpanded] = useState(false);
  const transcript = parseTranscript(call.transcript);
  let extractedData: Record<string, unknown> = {};

  try {
    if (call.extractedData) extractedData = JSON.parse(call.extractedData);
  } catch {
    /* empty */
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
              call.agentType === "confirmation"
                ? "bg-blue-50 text-blue-600"
                : "bg-pink-50 text-pink-600"
            }`}
          >
            {call.agentType === "confirmation" ? "C" : "F"}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {call.customerName}
              </p>
              <span className="text-xs text-muted-foreground">
                {call.customerPhone}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground capitalize">
                {call.agentType}
              </span>
              {call.order && (
                <span className="text-xs font-mono text-muted-foreground">
                  #{call.order.orderId}
                </span>
              )}
              {call.duration && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {call.duration}s
                </span>
              )}
              {call.cost && (
                <span className="text-xs text-muted-foreground">
                  ₹{call.cost.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={call.status} />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-6 py-4 bg-muted/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transcript */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Transcript
              </h4>
              {transcript.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${msg.role === "agent" ? "" : "justify-end"}`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                          msg.role === "agent"
                            ? "bg-blue-50 text-blue-900"
                            : "bg-emerald-50 text-emerald-900"
                        }`}
                      >
                        <p className="text-xs font-medium mb-0.5 opacity-70 capitalize">
                          {msg.role === "agent" ? "AI Agent" : "Customer"}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No transcript available
                </p>
              )}
            </div>

            {/* Extracted Data + Summary */}
            <div>
              {call.summary && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Summary
                  </h4>
                  <p className="text-sm text-muted-foreground bg-background rounded-lg p-3 border border-border">
                    {call.summary}
                  </p>
                </div>
              )}

              {Object.keys(extractedData).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Extracted Data
                  </h4>
                  <div className="bg-background rounded-lg p-3 border border-border space-y-2">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium text-foreground">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <span>
                  <strong>ID:</strong> {call.executionId || "—"}
                </span>
                <span>
                  <strong>Date:</strong>{" "}
                  {format(new Date(call.createdAt), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("agentType", filter);
    fetch(`/api/calls?${params}`)
      .then((r) => r.json())
      .then(setCalls)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Call Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View call history, transcripts, and extracted data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {["all", "confirmation", "feedback"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : calls.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border bg-card">
          <Phone className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">
            No calls yet. Trigger your first call from the Orders page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <CallRow key={call.id} call={call} />
          ))}
        </div>
      )}
    </div>
  );
}
