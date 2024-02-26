import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";

const Messages_Batch = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("conversation Id Missing", { status: 400 });
    }

    let messages: DirectMessage[] = [];

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: Messages_Batch,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: Messages_Batch,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    if (messages.length === Messages_Batch) {
      nextCursor = messages[Messages_Batch - 1].id;
    }

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("[DIRECT_MESSGAES_GET]", error);
    return new NextResponse("Interal Error", { status: 500 });
  }
}
