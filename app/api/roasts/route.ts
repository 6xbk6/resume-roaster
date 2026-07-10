// GET    /api/roasts — 获取所有吐槽历史
// POST   /api/roasts — AI 吐槽生成

import { NextRequest, NextResponse } from "next/server";
import { generateRoast } from "@/lib/ai/roaster";
import { getResume, insertRoast, getAllRoasts } from "@/lib/store";
import { validateResumeText } from "@/lib/pdf/parser";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 秒超时

export async function GET() {
  try {
    const roasts = getAllRoasts();

    // 为每条吐槽附加简历文件名
    const history = roasts.map((roast) => {
      const resume = getResume(roast.resume_id);
      return {
        id: roast.id,
        resume_name: resume?.file_name || "未知简历",
        style: roast.style,
        overall_score: roast.overall_score,
        summary: roast.summary,
        created_at: roast.created_at,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: history,
      },
      {
        headers: {
          "Cache-Control": "max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Get roasts error:", error);
    return NextResponse.json(
      { success: false, error: "获取历史记录失败", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume_id, style } = body;

    // 参数验证
    if (!resume_id) {
      return NextResponse.json(
        { success: false, error: "缺少简历 ID", code: "MISSING_RESUME_ID" },
        { status: 400 }
      );
    }

    if (!style || !["savage", "versailles", "veteran", "cute"].includes(style)) {
      return NextResponse.json(
        { success: false, error: "吐槽风格无效", code: "INVALID_STYLE" },
        { status: 400 }
      );
    }

    // 查询简历
    const resume = getResume(resume_id);
    if (!resume) {
      return NextResponse.json(
        { success: false, error: "简历不存在或已过期", code: "RESUME_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 简历内容审核：确保是简历而非其他文档
    const validation = validateResumeText(resume.content_text);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.reason || "文件内容不像简历，请确认上传的是简历 PDF", code: "INVALID_CONTENT" },
        { status: 400 }
      );
    }

    // 调用 AI 生成吐槽
    let roastResult;
    try {
      roastResult = await generateRoast(resume.content_text, style);
    } catch (error) {
      console.error("AI generation failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "AI 生成失败，请重试",
          code: "AI_ERROR",
        },
        { status: 500 }
      );
    }

    // 存储吐槽结果
    const roast = insertRoast({
      resume_id,
      style,
      roasts: roastResult.roasts,
      overall_score: roastResult.overall_score,
      summary: roastResult.summary,
    });

    // 返回完整吐槽结果
    return NextResponse.json({
      success: true,
      data: {
        roast_id: roast.id,
        preview: {
          roasts: roastResult.roasts,
          overall_score: roastResult.overall_score,
          summary: roastResult.summary,
        },
      },
    });
  } catch (error) {
    console.error("Roast API error:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}