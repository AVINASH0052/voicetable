import { prisma } from "@/lib/prisma";
import { triggerBolnaCall } from "@/lib/bolna";
import { syncInProgressCallsFromBolna } from "@/lib/call-sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await syncInProgressCallsFromBolna();

  const { searchParams } = new URL(req.url);
  const agentType = searchParams.get("agentType");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (agentType) where.agentType = agentType;
  if (status) where.status = status;

  const calls = await prisma.call.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return NextResponse.json(calls);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, agentType } = body;

  // Get settings
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const bolnaApiKey = settings?.bolnaApiKey || process.env.BOLNA_API_KEY || "";
  const confirmationAgentId =
    settings?.confirmationAgentId || process.env.CONFIRMATION_AGENT_ID || "";
  const feedbackAgentId = settings?.feedbackAgentId || process.env.FEEDBACK_AGENT_ID || "";
  const restaurantName = settings?.restaurantName || process.env.RESTAURANT_NAME || "Restaurant";

  if (!bolnaApiKey) {
    return NextResponse.json({ error: "Bolna API key not configured" }, { status: 400 });
  }

  const agentId = agentType === "feedback" ? feedbackAgentId : confirmationAgentId;

  if (!agentId) {
    return NextResponse.json({ error: `${agentType} agent ID not configured` }, { status: 400 });
  }

  // Get order if provided
  let order = null;
  if (orderId) {
    order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  }

  const phone = body.phone || order?.customerPhone;
  const name = body.customerName || order?.customerName || "Customer";

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  // Build user_data for Bolna agent context
  const userData: Record<string, string> = {
    customer_name: name,
    restaurant_name: restaurantName,
  };

  if (order) {
    userData.order_id = order.orderId;
    const items = JSON.parse(order.items);
    const orderItemsText = items
      .map((i: { name: string; quantity: number }) => `${i.quantity}x ${i.name}`)
      .join(", ");

    // Provide multiple aliases because different Bolna agent templates
    // often reference different variable names.
    userData.order_items = orderItemsText;
    userData.items = orderItemsText;
    userData.ordered_items = orderItemsText;
    userData.order_summary = orderItemsText;
    userData.delivery_address = order.deliveryAddress;
    userData.payment_method = order.paymentMethod;
    userData.delivery_time = order.estimatedDelivery;
    userData.total_amount = `₹${order.totalAmount}`;
  }

  try {
    const bolnaRes = await triggerBolnaCall(bolnaApiKey, agentId, phone, userData);

    // Create call record
    const call = await prisma.call.create({
      data: {
        executionId: bolnaRes.execution_id || null,
        orderId: order?.id || null,
        agentType,
        status: "in-progress",
        customerPhone: phone,
        customerName: name,
      },
    });

    return NextResponse.json({ call, bolnaResponse: bolnaRes }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to trigger Bolna call", {
      agentType,
      orderId,
      phone,
      message,
    });

    const status = message.includes("(503)") ? 503 : 500;
    return NextResponse.json(
      {
        error: message,
        hint:
          status === 503
            ? "Bolna upstream returned 503. Verify the agent can place outbound calls from the Bolna dashboard and retry."
            : undefined,
      },
      { status }
    );
  }
}
