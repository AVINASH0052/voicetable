"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Star,
  MessageSquareHeart,
  Phone,
  TrendingUp,
  IndianRupee,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardData {
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalCalls: number;
  completedCalls: number;
  totalRevenue: number;
  avgFoodRating: number;
  avgDeliveryRating: number;
  confirmationRate: number;
  feedbackRate: number;
  feedbackCount: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  recentCalls: Array<{
    id: string;
    agentType: string;
    status: string;
    customerName: string;
    duration: number | null;
    createdAt: string;
    order?: { orderId: string } | null;
  }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    modified: "bg-purple-50 text-purple-700 border-purple-200",
    queued: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.queued}`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data)
    return <p className="text-muted-foreground">Failed to load dashboard</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of your restaurant AI operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={data.totalOrders}
          subtext={`${data.pendingOrders} pending`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmation Rate"
          value={`${data.confirmationRate}%`}
          subtext={`${data.confirmedOrders} confirmed`}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Star}
          label="Avg Food Rating"
          value={`${data.avgFoodRating}/5`}
          subtext={`${data.feedbackCount} reviews`}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={`₹${data.totalRevenue.toLocaleString()}`}
          subtext="Confirmed orders"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Phone}
          label="Total Calls"
          value={data.totalCalls}
          subtext={`${data.completedCalls} completed`}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={MessageSquareHeart}
          label="Feedback Rate"
          value={`${data.feedbackRate}%`}
          subtext={`${data.feedbackCount} collected`}
          color="bg-pink-50 text-pink-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Delivery Rating"
          value={`${data.avgDeliveryRating}/5`}
          subtext="Average score"
          color="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={Clock}
          label="Cancelled"
          value={data.cancelledOrders}
          subtext={`${data.totalOrders > 0 ? Math.round((data.cancelledOrders / data.totalOrders) * 100) : 0}% of orders`}
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Calls
            </h2>
            <a href="/calls" className="text-sm text-primary hover:underline">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {data.recentCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No calls yet. Trigger your first call from the Orders page.
              </p>
            ) : (
              data.recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        call.agentType === "confirmation"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-pink-50 text-pink-600"
                      }`}
                    >
                      {call.agentType === "confirmation" ? "C" : "F"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {call.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {call.order?.orderId || call.agentType}{" "}
                        {call.duration ? `• ${call.duration}s` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={call.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(call.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Customer Sentiment
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Positive",
                count: data.sentimentBreakdown.positive,
                color: "bg-emerald-500",
                bgColor: "bg-emerald-100",
              },
              {
                label: "Neutral",
                count: data.sentimentBreakdown.neutral,
                color: "bg-amber-500",
                bgColor: "bg-amber-100",
              },
              {
                label: "Negative",
                count: data.sentimentBreakdown.negative,
                color: "bg-red-500",
                bgColor: "bg-red-100",
              },
            ].map((s) => {
              const total =
                data.sentimentBreakdown.positive +
                data.sentimentBreakdown.neutral +
                data.sentimentBreakdown.negative;
              const pct =
                total > 0 ? Math.round((s.count / total) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {s.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className={`h-2.5 rounded-full ${s.bgColor}`}>
                    <div
                      className={`h-2.5 rounded-full ${s.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {data.avgFoodRating}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg Food Rating
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {data.avgDeliveryRating}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg Delivery Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
