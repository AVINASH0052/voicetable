import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse error", details: parsed.errors },
      { status: 400 }
    );
  }

  const orders = [];
  for (const row of parsed.data as Record<string, string>[]) {
    const order = await prisma.order.create({
      data: {
        orderId: row.order_id || `ORD-${Date.now().toString().slice(-4)}`,
        customerName: row.customer_name || "Unknown",
        customerPhone: row.customer_phone || "",
        items: row.items || "[]",
        deliveryAddress: row.delivery_address || "",
        paymentMethod: row.payment_method || "COD",
        estimatedDelivery: row.estimated_delivery || "30 mins",
        totalAmount: parseFloat(row.total_amount) || 0,
        status: "pending",
      },
    });
    orders.push(order);
  }

  return NextResponse.json({ imported: orders.length, orders }, { status: 201 });
}
