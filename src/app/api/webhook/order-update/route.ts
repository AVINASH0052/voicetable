import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Tool calling webhook — Bolna agent calls this during conversation
export async function POST(req: NextRequest) {
  const data = await req.json();

  console.log("[Order Update Webhook] Received:", JSON.stringify(data));

  const { order_id, status, special_instructions } = data;

  if (!order_id || !status) {
    return NextResponse.json({ error: "order_id and status required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderId: order_id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      specialInstructions: special_instructions || order.specialInstructions,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Order ${order_id} updated to ${status}`,
  });
}
