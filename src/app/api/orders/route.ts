import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { orderId: { contains: search } },
      { customerPhone: { contains: search } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { calls: true },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order = await prisma.order.create({
    data: {
      orderId: body.orderId || `ORD-${Date.now().toString().slice(-4)}`,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: typeof body.items === "string" ? body.items : JSON.stringify(body.items),
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod || "COD",
      estimatedDelivery: body.estimatedDelivery || "30 mins",
      totalAmount: body.totalAmount || 0,
      status: "pending",
      specialInstructions: body.specialInstructions || null,
    },
  });
  return NextResponse.json(order, { status: 201 });
}
