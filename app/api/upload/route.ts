// POST /api/upload — 简历上传 + PDF 解析

import { NextRequest, NextResponse } from "next/server";
import { parsePdfBuffer, validateResumeText, getTextPreview } from "@/lib/pdf/parser";
import { insertResume } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // 验证文件存在
    if (!file) {
      return NextResponse.json(
        { success: false, error: "请选择要上传的简历文件", code: "NO_FILE" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "仅支持 PDF 格式的简历文件", code: "INVALID_FORMAT" },
        { status: 400 }
      );
    }

    // 验证文件大小（5MB）
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "文件大小不能超过 5MB", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 解析 PDF
    let parsedResult;
    try {
      parsedResult = await parsePdfBuffer(buffer);
    } catch {
      return NextResponse.json(
        { success: false, error: "无法解析 PDF，请确保文件是文字型 PDF（非扫描图片）", code: "PARSE_FAILED" },
        { status: 400 }
      );
    }

    // 验证文本内容
    const validation = validateResumeText(parsedResult.text);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.reason || "文件内容不像简历，请确认上传的是简历 PDF", code: "INVALID_CONTENT" },
        { status: 400 }
      );
    }

    // 存储到本地
    const resume = insertResume({
      file_name: file.name,
      file_size: file.size,
      content_text: parsedResult.text,
      storage_path: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        resume_id: resume.id,
        file_name: resume.file_name,
        text_preview: getTextPreview(parsedResult.text),
      },
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}