import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  type F = (typeof feedbacks)[number];

  // Rating distribution
  const ratingDist = [0, 0, 0, 0, 0]; // index 0=1star, 4=5star
  feedbacks.forEach((f: F) => {
    if (f.foodRating && f.foodRating >= 1 && f.foodRating <= 5) {
      ratingDist[f.foodRating - 1]++;
    }
  });

  // Sentiment over time (group by date)
  const sentimentByDate: Record<string, { positive: number; neutral: number; negative: number }> = {};
  feedbacks.forEach((f: F) => {
    const date = f.createdAt.toISOString().split("T")[0];
    if (!sentimentByDate[date]) {
      sentimentByDate[date] = { positive: 0, neutral: 0, negative: 0 };
    }
    if (f.overallSentiment === "positive") sentimentByDate[date].positive++;
    else if (f.overallSentiment === "neutral") sentimentByDate[date].neutral++;
    else if (f.overallSentiment === "negative") sentimentByDate[date].negative++;
  });

  // Top complaints
  const complaints = feedbacks
    .filter((f: F) => f.complaints)
    .map((f: F) => ({ complaint: f.complaints!, customer: f.customerName, rating: f.foodRating }));

  // Top praises
  const praises = feedbacks
    .filter((f: F) => f.favoriteDish)
    .map((f: F) => ({ dish: f.favoriteDish!, customer: f.customerName, rating: f.foodRating }));

  // Avg ratings
  const withFood = feedbacks.filter((f: F) => f.foodRating);
  const withDelivery = feedbacks.filter((f: F) => f.deliveryRating);
  const avgFood = withFood.length ? withFood.reduce((s: number, f: F) => s + f.foodRating!, 0) / withFood.length : 0;
  const avgDelivery = withDelivery.length ? withDelivery.reduce((s: number, f: F) => s + f.deliveryRating!, 0) / withDelivery.length : 0;

  return NextResponse.json({
    feedbacks,
    ratingDistribution: ratingDist.map((count, i) => ({ rating: i + 1, count })),
    sentimentByDate: Object.entries(sentimentByDate).map(([date, data]) => ({ date, ...data })),
    complaints,
    praises,
    avgFoodRating: Math.round(avgFood * 10) / 10,
    avgDeliveryRating: Math.round(avgDelivery * 10) / 10,
    totalFeedbacks: feedbacks.length,
    recommendRate:
      feedbacks.length > 0
        ? Math.round(
            (feedbacks.filter((f: F) => f.wouldRecommend).length / feedbacks.length) * 100
          )
        : 0,
  });
}
