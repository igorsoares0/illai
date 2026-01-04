import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const CREDIT_COSTS = {
  "recraft-ai/recraft-20b-svg": 1,
  "recraft-ai/recraft-v3-svg": 2,
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      prompt,
      model = "recraft-ai/recraft-v3-svg",
      style = "vector_illustration",
      size = "1024x1024",
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get current user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const creditCost = CREDIT_COSTS[model as keyof typeof CREDIT_COSTS] || 1;

    // Check if user has enough credits
    if (user.credits < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: creditCost,
          available: user.credits,
        },
        { status: 402 }
      );
    }

    // Generate illustration
    const output = await replicate.run(
      model as `${string}/${string}:${string}` | `${string}/${string}`,
      {
        input: {
          prompt,
          style,
          size,
        },
      }
    );

    console.log("Output from Replicate:", output);

    const imageUrl = typeof output === "string" ? output : output?.toString();

    console.log("Image URL:", imageUrl);

    // Deduct credits and log generation in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: creditCost } },
      }),
      prisma.generation.create({
        data: {
          userId: session.user.id,
          prompt,
          model: model.replace("recraft-ai/", "").replace("-svg", ""),
          credits: creditCost,
          imageUrl: imageUrl || "",
        },
      }),
    ]);

    return NextResponse.json({
      url: imageUrl,
      creditsRemaining: user.credits - creditCost,
      creditsUsed: creditCost,
    });
  } catch (error) {
    console.error("Error generating illustration:", error);
    return NextResponse.json(
      { error: "Failed to generate illustration" },
      { status: 500 }
    );
  }
}
