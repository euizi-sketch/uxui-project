import { useEffect, useState } from "react";
import type { FeedPost } from "./communityFeedModel";
import { addPost } from "./communityFeedModel";
import type { FeaturedRoom } from "./communityRooms";

type Props = {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
  rooms: readonly FeaturedRoom[];
  /** 미리 선택된 방 (방 안에서 글쓸 때) */
  defaultRoomId?: string | null;
};

const presetPhoto =
  "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=600&q=80";

export default function CommunityComposeModal({
  open,
  onClose,
  onPosted,
  rooms,
  defaultRoomId = null,
}: Props) {
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [withPhoto, setWithPhoto] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setBody("");
      setTags("");
      setWithPhoto(false);
      setRoomId("");
      return;
    }
    setRoomId(defaultRoomId ?? "");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, defaultRoomId]);

  const submit = () => {
    const text = body.trim();
    if (text.length < 2) {
      window.alert("내용을 조금 더 적어 주세요.");
      return;
    }
    const tagList = tags
      .split(/[,\s#]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);

    const post: Omit<FeedPost, "id" | "createdAt" | "likeCount"> = {
      author: "오늘의 나",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80",
      images: withPhoto ? [presetPhoto] : [],
      body: text,
      tags: tagList.length ? tagList : ["일상"],
      roomId: roomId || undefined,
    };
    addPost(post);
    onPosted();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-[55] bg-slate-900/45 backdrop-blur-[2px]" aria-label="닫기" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[56] max-h-[min(88vh,640px)] w-[min(92vw,400px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.35rem] bg-white p-5 shadow-2xl ring-2 ring-[#FFD2BF]/40">
        <p className="text-base font-bold text-slate-900">오늘의 순간 공유하기</p>
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          방을 고르면 해당 토픽 피드에도 함께 올라가요. 이 기기에만 저장되는 데모예요.
        </p>

        <label className="mt-4 block text-[11px] font-semibold text-slate-700">올릴 방</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-800 outline-none ring-1 ring-slate-100 focus:border-[#FFD2BF] focus:ring-2 focus:ring-[#FF853E]/20"
        >
          <option value="">메인 피드만 (토픽 방에는 안 보임)</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="예: 오늘 처음 유모차 산책 나왔어요 ☀️"
          rows={5}
          className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-medium leading-relaxed text-slate-800 outline-none ring-1 ring-slate-100 focus:border-[#FFD2BF] focus:ring-2 focus:ring-[#FF853E]/20"
        />

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] font-normal text-slate-700">
          <input
            type="checkbox"
            checked={withPhoto}
            onChange={(e) => setWithPhoto(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-[#FF853E]"
          />
          대표 사진 하나 붙이기 (샘플 이미지)
        </label>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="태그 · 쉼표로 구분 (선택)"
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none ring-1 ring-slate-100 focus:border-[#FFD2BF]"
        />

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 rounded-full bg-[#FF853E] py-3 text-sm font-bold text-white shadow-md hover:brightness-[1.03]"
          >
            올리기
          </button>
        </div>
      </div>
    </>
  );
}
