import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      model = "recraft-ai/recraft-v3-svg",
      style = "vector_illustration",
      size = "1024x1024"
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const output = await replicate.run(model as `${string}/${string}:${string}` | `${string}/${string}`, {
      input: {
        prompt,
        style,
        size,
      },
    });

    console.log("Output from Replicate:", output);

    // O output pode ser uma string direta ou um objeto
    const imageUrl = typeof output === "string" ? output : output?.toString();

    console.log("Image URL:", imageUrl);

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Error generating illustration:", error);
    return NextResponse.json(
      { error: "Failed to generate illustration" },
      { status: 500 }
    );
  }
}
