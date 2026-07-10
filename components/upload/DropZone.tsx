"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection, type DropEvent } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { motion } from "framer-motion";
import { formatFileSize } from "@/lib/utils";

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function DropZone({ onFileSelected, selectedFile, onClear }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: readonly FileRejection[], _event: DropEvent) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const code = rejection.errors[0]?.code;
        if (code === "file-too-large") {
          setError("文件不能超过 5MB");
        } else if (code === "file-invalid-type") {
          setError("仅支持 PDF 格式");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          setError("仅支持 PDF 格式的简历文件");
          return;
        }
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const borderColor = isDragReject
    ? "border-red-500 bg-red-500/5"
    : isDragAccept
      ? "border-green-500 bg-green-500/5"
      : isDragActive
        ? "border-purple-500 bg-purple-500/5"
        : "border-gray-600 hover:border-purple-400 hover:bg-purple-500/5";

  if (selectedFile) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center gap-4 p-5 bg-gray-800/50 rounded-xl border border-gray-700 shadow-3d">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 ${borderColor}`}
      >
        <input {...getInputProps()} />

        {/* 3D 光晕 */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`p-4 rounded-full transition-all duration-500 ${isDragActive ? "bg-purple-500/20 scale-110" : "bg-gray-800 group-hover:bg-purple-500/10"}`}
          >
            <Upload className={`w-8 h-8 transition-colors duration-500 ${isDragActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-400"}`} />
          </motion.div>
          <div>
            <p className="text-lg text-white font-medium">
              {isDragActive ? "松开文件开始上传" : "拖拽简历 PDF 到此处"}
            </p>
            <p className="text-gray-400 mt-1">或点击选择文件，支持 PDF 格式，最大 5MB</p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  );
}