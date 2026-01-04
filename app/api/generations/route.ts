import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "12");

    const generations = await prisma.generation.findMany({
      where: { userId: session.user.id },
      take: limit + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor
      }),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prompt: true,
        model: true,
        credits: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    const hasMore = generations.length > limit;
    const items = hasMore ? generations.slice(0, -1) : generations;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}
