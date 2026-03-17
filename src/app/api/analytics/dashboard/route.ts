import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalOrders,
    confirmedOrders,
    cancelledOrders,
    pendingOrders,
    totalCalls,
    completedCalls,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "confirmed" } }),
    prisma.order.count({ where: { status: "cancelled" } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.call.count(),
    prisma.call.count({ where: { status: "completed" } }),
  ]);

  const feedbacks = await prisma.feedback.findMany();
  const orders = await prisma.order.findMany({ select: { totalAmount: true, status: true } });

  type OrderRow = (typeof orders)[number];
  type FeedbackRow = (typeof feedbacks)[number];

  const totalRevenue = orders
    .filter((o: OrderRow) => o.status === "confirmed" || o.status === "modified")
    .reduce((sum: number, o: OrderRow) => sum + o.totalAmount, 0);

  const avgFoodRating =
    feedbacks.length > 0
      ? feedbacks.reduce((s: number, f: FeedbackRow) => s + (f.foodRating || 0), 0) /
        feedbacks.filter((f: FeedbackRow) => f.foodRating).length
      : 0;

  const avgDeliveryRating =
    feedbacks.length > 0
      ? feedbacks.reduce((s: number, f: FeedbackRow) => s + (f.deliveryRating || 0), 0) /
        feedbacks.filter((f: FeedbackRow) => f.deliveryRating).length
      : 0;

  const confirmationRate =
    totalOrders > 0 ? ((confirmedOrders + (await prisma.order.count({ where: { status: "modified" } }))) / totalOrders) * 100 : 0;

  const feedbackRate =
    totalOrders > 0 ? (feedbacks.length / totalOrders) * 100 : 0;

  const sentimentBreakdown = {
    positive: feedbacks.filter((f: FeedbackRow) => f.overallSentiment === "positive").length,
    neutral: feedbacks.filter((f: FeedbackRow) => f.overallSentiment === "neutral").length,
    negative: feedbacks.filter((f: FeedbackRow) => f.overallSentiment === "negative").length,
  };

  // Recent calls
  const recentCalls = await prisma.call.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return NextResponse.json({
    totalOrders,
    confirmedOrders,
    cancelledOrders,
    pendingOrders,
    totalCalls,
    completedCalls,
    totalRevenue,
    avgFoodRating: Math.round(avgFoodRating * 10) / 10,
    avgDeliveryRating: Math.round(avgDeliveryRating * 10) / 10,
    confirmationRate: Math.round(confirmationRate * 10) / 10,
    feedbackRate: Math.round(feedbackRate * 10) / 10,
    feedbackCount: feedbacks.length,
    sentimentBreakdown,
    recentCalls,
  });
}
