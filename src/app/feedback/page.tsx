"use client";

import { useEffect, useState } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FeedbackAnalytics {
  feedbacks: Array<{
    id: string;
    customerName: string;
    foodRating: number | null;
    deliveryRating: number | null;
    favoriteDish: string | null;
    complaints: string | null;
    overallSentiment: string | null;
    verbatimFeedback: string | null;
    createdAt: string;
  }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  sentimentByDate: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  complaints: Array<{
    complaint: string;
    customer: string;
    rating: number | null;
  }>;
  praises: Array<{
    dish: string;
    customer: string;
    rating: number | null;
  }>;
  avgFoodRating: number;
  avgDeliveryRating: number;
  totalFeedbacks: number;
  recommendRate: number;
}

const SENTIMENT_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [data, setData] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/feedback")
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
    return (
      <p className="text-muted-foreground">Failed to load feedback data</p>
    );

  const sentimentPieData = [
    {
      name: "Positive",
      value: data.feedbacks.filter((f) => f.overallSentiment === "positive")
        .length,
    },
    {
      name: "Neutral",
      value: data.feedbacks.filter((f) => f.overallSentiment === "neutral")
        .length,
    },
    {
      name: "Negative",
      value: data.feedbacks.filter((f) => f.overallSentiment === "negative")
        .length,
    },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Feedback Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customer sentiment, ratings, and actionable insights
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Food Rating</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.avgFoodRating}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-2">
            <StarRating rating={Math.round(data.avgFoodRating)} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Avg Delivery Rating
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.avgDeliveryRating}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-2">
            <StarRating rating={Math.round(data.avgDeliveryRating)} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Would Recommend
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.recommendRate}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ThumbsUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Feedbacks
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {data.totalFeedbacks}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating Distribution */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="rating"
                tickFormatter={(v) => `${v}★`}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Pie */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sentiment Breakdown
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sentimentPieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={SENTIMENT_COLORS[i % SENTIMENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {[
              { label: "Positive", color: "#22c55e" },
              { label: "Neutral", color: "#f59e0b" },
              { label: "Negative", color: "#ef4444" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Complaints & Praises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Complaints */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Issues Reported
          </h3>
          {data.complaints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No complaints — great job!
            </p>
          ) : (
            <div className="space-y-3">
              {data.complaints.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-100 bg-red-50/50 p-3"
                >
                  <p className="text-sm text-red-800">{c.complaint}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-red-600">
                      — {c.customer}
                    </span>
                    {c.rating && (
                      <span className="text-xs text-red-600">
                        {c.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Praises / Favorite Dishes */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Favorite Dishes
          </h3>
          {data.praises.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No praises yet
            </p>
          ) : (
            <div className="space-y-3">
              {data.praises.map((p, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3"
                >
                  <p className="text-sm font-medium text-emerald-800">
                    {p.dish}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-emerald-600">
                      — {p.customer}
                    </span>
                    {p.rating && (
                      <span className="text-xs text-emerald-600">
                        {p.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verbatim Feedback */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Customer Voices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.feedbacks
            .filter((f) => f.verbatimFeedback)
            .map((f) => (
              <div
                key={f.id}
                className={`rounded-lg border p-4 ${
                  f.overallSentiment === "positive"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : f.overallSentiment === "negative"
                      ? "border-red-200 bg-red-50/30"
                      : "border-amber-200 bg-amber-50/30"
                }`}
              >
                <p className="text-sm text-foreground italic">
                  &ldquo;{f.verbatimFeedback}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {f.customerName}
                  </span>
                  {f.foodRating && <StarRating rating={f.foodRating} />}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
