import { getBolnaCallDetails } from "@/lib/bolna";
import { prisma } from "@/lib/prisma";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickFirst(data: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in data && data[key] !== undefined && data[key] !== null) {
      return data[key];
    }
  }
  return null;
}

function normalizeCallStatus(rawStatus: string | null): string | null {
  if (!rawStatus) return null;
  const status = rawStatus.toLowerCase();

  if (["completed", "complete", "ended", "success", "successful"].includes(status)) {
    return "completed";
  }

  if (["failed", "error", "cancelled", "canceled", "no-answer"].includes(status)) {
    return "failed";
  }

  if (["in-progress", "in_progress", "ongoing", "ringing", "queued", "processing"].includes(status)) {
    return "in-progress";
  }

  return rawStatus;
}

function getExtractedData(data: Record<string, unknown>): Record<string, unknown> | null {
  const extracted = pickFirst(data, ["extracted_data", "extractedData", "structured_data"]);
  if (extracted && typeof extracted === "object" && !Array.isArray(extracted)) {
    return extracted as Record<string, unknown>;
  }
  return null;
}

function getConfirmationStatus(extractedData: Record<string, unknown> | null): string | null {
  const raw = extractedData?.confirmation_status;
  if (typeof raw !== "string") return null;
  const value = raw.toLowerCase();
  if (["confirmed", "modified", "cancelled"].includes(value)) return value;
  return null;
}

function getConfirmationStatusFromTranscript(transcript: string | null): string | null {
  if (!transcript) return null;

  const normalized = transcript.toLowerCase();
  const marker = "confirmation status:";
  const markerIndex = normalized.indexOf(marker);

  if (markerIndex >= 0) {
    const afterMarker = normalized
      .slice(markerIndex + marker.length)
      .replace(/^[\s*:_-]+/, "")
      .trim();
    if (afterMarker.startsWith("confirmed")) return "confirmed";
    if (afterMarker.startsWith("modified")) return "modified";
    if (afterMarker.startsWith("cancelled") || afterMarker.startsWith("canceled")) {
      return "cancelled";
    }
  }

  return null;
}

function parseNumberFromLine(line: string): number | null {
  const match = line.match(/\b([1-5])\b/);
  return match ? Number(match[1]) : null;
}

function parseFeedbackFromTranscript(transcript: string | null): {
  foodRating?: number;
  deliveryRating?: number;
  favoriteDish?: string;
  complaints?: string;
  overallSentiment?: string;
} | null {
  if (!transcript) return null;

  const lines = transcript
    .split("\n")
    .map((line) => line.replace(/^assistant:\s*/i, "").trim())
    .filter(Boolean);

  let foodRating: number | undefined;
  let deliveryRating: number | undefined;
  let favoriteDish: string | undefined;
  let complaints: string | undefined;

  for (const rawLine of lines) {
    const line = rawLine.toLowerCase();

    if (line.includes("food quality rating") || line.includes("food rating")) {
      const n = parseNumberFromLine(rawLine);
      if (n !== null) foodRating = n;
    }

    if (line.includes("delivery rating")) {
      const n = parseNumberFromLine(rawLine);
      if (n !== null) deliveryRating = n;
    }

    if (line.includes("delivery experience:")) {
      if (line.includes("excellent")) deliveryRating = 5;
      else if (line.includes("good") || line.includes("satisfactory")) deliveryRating = 4;
      else if (line.includes("average")) deliveryRating = 3;
      else if (line.includes("poor")) deliveryRating = 2;
      else if (line.includes("bad")) deliveryRating = 1;
    }

    if (line.includes("favorite dish:")) {
      const value = rawLine.split(":").slice(1).join(":").trim();
      if (value && value.toLowerCase() !== "none") favoriteDish = value;
    }

    if (line.includes("suggestions/complaints:") || line.includes("complaints:")) {
      const value = rawLine.split(":").slice(1).join(":").trim();
      if (value && !["none", "n/a", "na"].includes(value.toLowerCase())) {
        complaints = value;
      }
    }
  }

  if (
    foodRating === undefined &&
    deliveryRating === undefined &&
    favoriteDish === undefined &&
    complaints === undefined
  ) {
    return null;
  }

  let overallSentiment: string | undefined;
  const scoreBase = (foodRating ?? 0) + (deliveryRating ?? 0);
  if (complaints) overallSentiment = "negative";
  else if (scoreBase >= 8) overallSentiment = "positive";
  else if (scoreBase >= 5) overallSentiment = "neutral";
  else if (scoreBase > 0) overallSentiment = "negative";

  return {
    foodRating,
    deliveryRating,
    favoriteDish,
    complaints,
    overallSentiment,
  };
}

function parseFeedbackFromExtractedData(
  extractedData: Record<string, unknown> | null
): {
  foodRating?: number;
  deliveryRating?: number;
  favoriteDish?: string;
  complaints?: string;
  overallSentiment?: string;
} | null {
  if (!extractedData) return null;

  const foodRating = asNumber(extractedData.food_rating) ?? undefined;
  const deliveryRating = asNumber(extractedData.delivery_rating) ?? undefined;
  const favoriteDish = asString(extractedData.favorite_dish) ?? undefined;
  const complaints = asString(extractedData.complaints) ?? undefined;
  const overallSentiment = asString(extractedData.overall_sentiment) ?? undefined;

  if (!foodRating && !deliveryRating && !favoriteDish && !complaints && !overallSentiment) {
    return null;
  }

  return {
    foodRating,
    deliveryRating,
    favoriteDish,
    complaints,
    overallSentiment,
  };
}

export async function syncInProgressCallsFromBolna(limit = 8): Promise<void> {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const bolnaApiKey = settings?.bolnaApiKey || process.env.BOLNA_API_KEY || "";

  if (!bolnaApiKey) return;

  const calls = await prisma.call.findMany({
    where: {
      executionId: { not: null },
      OR: [
        { status: { in: ["queued", "in-progress", "initiated", "call-disconnected", "ringing"] } },
        { transcript: null },
        { extractedData: null },
      ],
    },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });

  for (const call of calls) {
    if (!call.executionId) continue;

    try {
      const details = (await getBolnaCallDetails(
        bolnaApiKey,
        call.executionId
      )) as Record<string, unknown>;

      const status = normalizeCallStatus(
        asString(pickFirst(details, ["status", "call_status", "execution_status"]))
      );
      const transcriptValue = pickFirst(details, ["transcript", "conversation", "dialogue"]);
      const extractedDataValue = getExtractedData(details);
      const summary = asString(pickFirst(details, ["summary", "call_summary"]));
      const duration = asNumber(pickFirst(details, ["conversation_duration", "duration", "call_duration"]));
      const cost = asNumber(pickFirst(details, ["total_cost", "cost", "price"]));
      const recordingUrl = asString(pickFirst(details, ["recording_url", "recordingUrl", "audio_url"]));

      const transcript = transcriptValue ? JSON.stringify(transcriptValue) : null;
      const extractedData = extractedDataValue ? JSON.stringify(extractedDataValue) : null;

      const updateData: Record<string, unknown> = {};
      if (status && status !== call.status) updateData.status = status;
      if (transcript && transcript !== call.transcript) updateData.transcript = transcript;
      if (extractedData && extractedData !== call.extractedData) updateData.extractedData = extractedData;
      if (summary && summary !== call.summary) updateData.summary = summary;
      if (duration !== null && duration !== call.duration) updateData.duration = duration;
      if (cost !== null && cost !== call.cost) updateData.cost = cost;
      if (recordingUrl && recordingUrl !== call.recordingUrl) updateData.recordingUrl = recordingUrl;

      if (Object.keys(updateData).length > 0) {
        await prisma.call.update({
          where: { id: call.id },
          data: updateData,
        });
      }

      if (call.orderId) {
        const confirmationStatus =
          getConfirmationStatus(extractedDataValue) ||
          getConfirmationStatusFromTranscript(
            typeof transcriptValue === "string" ? transcriptValue : transcript
          );

        if (confirmationStatus) {
          const specialInstructionsRaw = extractedDataValue?.special_instructions;
          const specialInstructions =
            typeof specialInstructionsRaw === "string" && specialInstructionsRaw.trim()
              ? specialInstructionsRaw
              : undefined;

          await prisma.order.update({
            where: { id: call.orderId },
            data: {
              status: confirmationStatus,
              specialInstructions,
            },
          });
        }
      }

      if (call.agentType === "feedback") {
        const existingFeedback = await prisma.feedback.findFirst({
          where: { callId: call.id },
          select: { id: true },
        });

        if (!existingFeedback) {
          const feedbackFromExtractedData = parseFeedbackFromExtractedData(extractedDataValue);
          const feedbackFromTranscript = parseFeedbackFromTranscript(
            typeof transcriptValue === "string" ? transcriptValue : transcript
          );
          const feedbackData = feedbackFromExtractedData || feedbackFromTranscript;

          if (feedbackData) {
            await prisma.feedback.create({
              data: {
                callId: call.id,
                orderId: call.orderId,
                customerName: call.customerName,
                customerPhone: call.customerPhone,
                foodRating: feedbackData.foodRating ?? null,
                deliveryRating: feedbackData.deliveryRating ?? null,
                favoriteDish: feedbackData.favoriteDish ?? null,
                complaints: feedbackData.complaints ?? null,
                wouldRecommend: null,
                overallSentiment: feedbackData.overallSentiment ?? null,
                verbatimFeedback: null,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to sync Bolna execution", {
        executionId: call.executionId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}