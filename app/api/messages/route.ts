import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";

const Messages_Batch = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("channelId Missing", { status: 400 });
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: Messages_Batch,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
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
      messages = await db.message.findMany({
        take: Messages_Batch,
        where: {
          channelId,
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
    console.log("[MESSGAES_GET]", error);
    return new NextResponse("Interal Error", { status: 500 });
  }
}
