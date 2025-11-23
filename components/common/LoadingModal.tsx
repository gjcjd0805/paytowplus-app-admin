"use client";

interface LoadingModalProps {
  isOpen: boolean;
}

export function LoadingModal({ isOpen }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 오버레이 (투명하게) */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 점 3개 애니메이션 */}
      <div className="relative flex gap-2">
        <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
