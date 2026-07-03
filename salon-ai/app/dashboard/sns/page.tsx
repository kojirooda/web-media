"use client";

import { useState } from "react";
import { socialPosts } from "@/lib/demo-data";
import type { SocialPost } from "@/lib/types";

export default function SnsPage() {
  const drafts = socialPosts.filter((p) => p.status === "draft");
  const posted = socialPosts.filter((p) => p.status === "posted");

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div className="text-[13px] text-muted">今週のスケジュール</div>
        <div className="rounded-full bg-gold-light px-2.5 py-1.5 text-[11px] font-bold text-[#7a6540]">
          承認待ち {drafts.length}件
        </div>
      </div>

      {drafts.map((p) => (
        <DraftCard key={p.id} post={p} />
      ))}

      {posted.map((p) => (
        <div
          key={p.id}
          className="mx-4 my-2.5 overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
            <span className="rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-white">
              {p.day}
            </span>
            <span className="flex-1 text-xs text-muted">Instagram</span>
            <span className="text-[11px] font-semibold text-muted">投稿済み</span>
          </div>
          {p.engagement && (
            <div className="flex gap-4 px-3.5 py-3">
              <span className="text-xs text-muted">
                ❤️ <span className="font-bold text-navy">{p.engagement.likes}</span>
              </span>
              <span className="text-xs text-muted">
                💬 <span className="font-bold text-navy">{p.engagement.comments}</span>
              </span>
              <span className="text-xs text-muted">
                👁 <span className="font-bold text-navy">{p.engagement.reach}</span>
              </span>
            </div>
          )}
        </div>
      ))}

      <div className="h-4" />
    </div>
  );
}

function DraftCard({ post }: { post: SocialPost }) {
  const [caption, setCaption] = useState(post.caption ?? "");
  const [status, setStatus] = useState<"draft" | "approved">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: "縮毛矯正", season: "梅雨", point: "扱いやすさ" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setCaption(data.caption);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-4 my-2.5 overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
        <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-white">
          {post.day}
        </span>
        <span className="flex-1 text-xs text-muted">Instagram</span>
        <span
          className={
            status === "approved"
              ? "text-[11px] font-semibold text-success"
              : "text-[11px] font-semibold text-warning"
          }
        >
          ● {status === "approved" ? "承認済み" : "承認待ち"}
        </span>
      </div>
      <div className="p-3.5">
        <div className="mb-2.5 flex h-[90px] items-center justify-center rounded-xl bg-gradient-to-br from-[#f0e8e0] to-[#e8d4c0] text-3xl">
          {post.emoji}
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          className="mb-2.5 w-full resize-none rounded-lg border border-line p-2.5 text-xs leading-relaxed text-[#555] focus:border-gold focus:outline-none"
        />
        {error && <div className="mb-2 text-[11px] text-danger">{error}</div>}
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("approved")}
            disabled={status === "approved"}
            className="flex-1 rounded-xl bg-navy py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
          >
            {status === "approved" ? "✓ 承認済み" : "✓ 承認する"}
          </button>
          <button
            onClick={regenerate}
            disabled={loading}
            className="rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-navy disabled:opacity-50"
          >
            {loading ? "生成中…" : "AI再生成"}
          </button>
        </div>
      </div>
    </div>
  );
}
