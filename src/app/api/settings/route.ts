import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    return NextResponse.json({
      bolnaApiKey: process.env.BOLNA_API_KEY ? `${process.env.BOLNA_API_KEY.slice(0, 8)}...` : "",
      confirmationAgentId: process.env.CONFIRMATION_AGENT_ID || "",
      feedbackAgentId: process.env.FEEDBACK_AGENT_ID || "",
      restaurantName: process.env.RESTAURANT_NAME || "",
      restaurantPhone: "",
    });
  }
  // Mask API key for security
  return NextResponse.json({
    ...settings,
    bolnaApiKey: settings.bolnaApiKey ? `${settings.bolnaApiKey.slice(0, 8)}...` : "",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      ...(body.bolnaApiKey && !body.bolnaApiKey.includes("...") ? { bolnaApiKey: body.bolnaApiKey } : {}),
      ...(body.confirmationAgentId ? { confirmationAgentId: body.confirmationAgentId } : {}),
      ...(body.feedbackAgentId ? { feedbackAgentId: body.feedbackAgentId } : {}),
      ...(body.restaurantName ? { restaurantName: body.restaurantName } : {}),
      ...(body.restaurantPhone ? { restaurantPhone: body.restaurantPhone } : {}),
    },
    create: {
      id: "default",
      bolnaApiKey: body.bolnaApiKey || "",
      confirmationAgentId: body.confirmationAgentId || "",
      feedbackAgentId: body.feedbackAgentId || "",
      restaurantName: body.restaurantName || "",
      restaurantPhone: body.restaurantPhone || "",
    },
  });

  return NextResponse.json(settings);
}
