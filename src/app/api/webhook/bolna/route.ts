import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Bolna webhook handler — receives call status updates, transcripts, extracted data
export async function POST(req: NextRequest) {
  const data = await req.json();

  console.log("[Bolna Webhook] Received:", JSON.stringify(data).slice(0, 500));

  const executionId = data.execution_id || data.executionId;

  if (!executionId) {
    return NextResponse.json({ received: true, note: "No execution_id" });
  }

  // Find existing call record
  const existingCall = await prisma.call.findUnique({
    where: { executionId },
  });

  if (!existingCall) {
    // Create a new call record if webhook arrives before our record
    await prisma.call.create({
      data: {
        executionId,
        agentType: data.agent_type || "confirmation",
        status: data.status || "completed",
        duration: data.conversation_duration || data.duration || null,
        transcript: data.transcript ? JSON.stringify(data.transcript) : null,
        extractedData: data.extracted_data ? JSON.stringify(data.extracted_data) : null,
        summary: data.summary || null,
        cost: data.total_cost || data.cost || null,
        recordingUrl: data.recording_url || null,
        customerPhone: data.recipient_phone_number || data.phone || "",
        customerName: data.user_data?.customer_name || "",
      },
    });
  } else {
    // Update existing call
    await prisma.call.update({
      where: { executionId },
      data: {
        status: data.status || "completed",
        duration: data.conversation_duration || data.duration || existingCall.duration,
        transcript: data.transcript ? JSON.stringify(data.transcript) : existingCall.transcript,
        extractedData: data.extracted_data
          ? JSON.stringify(data.extracted_data)
          : existingCall.extractedData,
        summary: data.summary || existingCall.summary,
        cost: data.total_cost || data.cost || existingCall.cost,
        recordingUrl: data.recording_url || existingCall.recordingUrl,
      },
    });

    // If this is a confirmation call with extracted data, update the order status
    if (existingCall.orderId && data.extracted_data?.confirmation_status) {
      const statusMap: Record<string, string> = {
        confirmed: "confirmed",
        modified: "modified",
        cancelled: "cancelled",
      };
      const newStatus = statusMap[data.extracted_data.confirmation_status];
      if (newStatus) {
        await prisma.order.update({
          where: { id: existingCall.orderId },
          data: {
            status: newStatus,
            specialInstructions: data.extracted_data.special_instructions || undefined,
          },
        });
      }
    }

    // If this is a feedback call, create a feedback record
    if (existingCall.agentType === "feedback" && data.extracted_data) {
      const ed = data.extracted_data;
      await prisma.feedback.create({
        data: {
          callId: existingCall.id,
          orderId: existingCall.orderId,
          customerName: existingCall.customerName,
          customerPhone: existingCall.customerPhone,
          foodRating: ed.food_rating ? parseInt(ed.food_rating) : null,
          deliveryRating: ed.delivery_rating ? parseInt(ed.delivery_rating) : null,
          favoriteDish: ed.favorite_dish || null,
          complaints: ed.complaints || null,
          wouldRecommend: ed.would_recommend ?? null,
          overallSentiment: ed.overall_sentiment || null,
          verbatimFeedback: ed.verbatim_feedback || null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
