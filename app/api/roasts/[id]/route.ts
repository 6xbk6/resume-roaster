// GET    /api/roasts/[id] — 获取吐槽详情
// DELETE /api/roasts/[id] — 删除单条吐槽记录

import { NextResponse } from "next/server";
import { getRoast, deleteRoast } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const roast = getRoast(id);

    if (!roast) {
      return NextResponse.json(
        { success: false, error: "吐槽记录不存在", code: "ROAST_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: roast,
    });
  } catch (error) {
    console.error("Get roast error:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteRoast(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "记录不存在", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete roast error:", error);
    return NextResponse.json(
      { success: false, error: "删除失败", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}