/**
 * 모모아 커뮤니티 — 맘카페·인스타 피드형: 방 접속·스토리 뷰어·검색까지 실제 화면 전환 (로컬 데모)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import NeighborhoodLocationControl from "../NeighborhoodLocationControl";
import CommunityCommentsSheet from "./CommunityCommentsSheet";
import CommunityComposeModal from "./CommunityComposeModal";
import CommunityDmModal from "./CommunityDmModal";
import CommunityFeedPost from "./CommunityFeedPost";
import CommunityFriendsHub from "./CommunityFriendsHub";
import CommunityStoryViewer from "./CommunityStoryViewer";
import type { FeedComment, FeedPost } from "./communityFeedModel";
import { loadComments, loadLikedIds, loadPosts } from "./communityFeedModel";
import { seedCommunityFriendsDemoIfNeeded, unreadIncomingRequestCount } from "./communityMomFriendsModel";
import { FEATURED_ROOMS, getRoomById } from "./communityRooms";

const STORY_RINGS = FEATURED_ROOMS.slice(0, 6);

const brandDisplayStyle = {
  fontFamily: '"GeekbleMalang2", "Pretendard Variable", system-ui, sans-serif',
} as const;

type CommunityTop = "feed" | "friends";

export default function CommunityEmpathyScreen() {
  const [topTab, setTopTab] = useState<CommunityTop>("feed");
  const [dmPeerId, setDmPeerId] = useState<string | null>(null);
  const [friendBell, setFriendBell] = useState(0);

  const [feedTab, setFeedTab] = useState<"all" | "following">("all");

  const [posts, setPosts] = useState<FeedPost[]>(() => loadPosts());
  const [comments, setComments] = useState<FeedComment[]>(() => loadComments());
  const [likedIds, setLikedIds] = useState<Set<string>>(() => loadLikedIds());

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeRoomPreset, setComposeRoomPreset] = useState<string | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [storyRoomId, setStoryRoomId] = useState<string | null>(null);

  const refreshFeed = useCallback(() => {
    setPosts(loadPosts());
    setComments(loadComments());
    setLikedIds(loadLikedIds());
  }, []);

  useEffect(() => {
    seedCommunityFriendsDemoIfNeeded();
  }, []);

  useEffect(() => {
    const syncBell = () => setFriendBell(unreadIncomingRequestCount());
    syncBell();
    window.addEventListener("momoA-community-friends-changed", syncBell);
    return () => window.removeEventListener("momoA-community-friends-changed", syncBell);
  }, []);

  useEffect(() => {
    const onFocus = () => refreshFeed();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshFeed]);

  const switchTopTab = (t: CommunityTop) => {
    setTopTab(t);
    if (t === "friends") {
      setActiveRoomId(null);
      setStoryRoomId(null);
    }
  };

  const sortedPosts = useMemo(() => {
    const list = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    if (feedTab === "following") {
      const f = list.filter(
        (p) =>
          p.tags.some((t) => /워킹|이유식|분리|맘/i.test(t)) ||
          /맘|워킹|연두|출근|초보/i.test(p.author)
      );
      return f.length ? f : list;
    }
    return list;
  }, [posts, feedTab]);

  const roomPosts = useMemo(() => {
    if (!activeRoomId) return [];
    return [...posts]
      .filter((p) => p.roomId === activeRoomId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, activeRoomId]);

  const storyRoom = storyRoomId ? getRoomById(storyRoomId) : undefined;
  const storyPosts = useMemo(() => {
    if (!storyRoomId) return [];
    return posts.filter((p) => p.roomId === storyRoomId);
  }, [posts, storyRoomId]);

  const commentCountByPost = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of comments) {
      m.set(c.postId, (m.get(c.postId) ?? 0) + 1);
    }
    return m;
  }, [comments]);

  const openCompose = (roomId: string | null = null) => {
    setComposeRoomPreset(roomId);
    setComposeOpen(true);
  };

  const activeRoom = activeRoomId ? getRoomById(activeRoomId) : undefined;

  return (
    <div className="flex min-h-dvh flex-col pb-safe-tab font-sans">
      {/* 타 탭과 동일 여백 — 상단은 MOMOA + 동네(알림·장바구니 자리) */}
      <div className="shrink-0 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
        <header className="mb-1.5 pt-[env(safe-area-inset-top,0px)]">
          <div className="flex w-full items-center py-0.5">
            <div className="flex min-h-10 w-full items-center justify-between gap-3">
              <p
                className="min-w-0 shrink whitespace-nowrap text-left text-lg font-bold leading-none tracking-tight text-[#FF853E] antialiased sm:text-xl"
                style={brandDisplayStyle}
              >
                MOMOA
              </p>
              <div className="relative z-[1] flex min-w-0 flex-1 items-center justify-end">
                <NeighborhoodLocationControl triggerClassName="max-w-[min(65vw,16.5rem)] justify-end" />
              </div>
            </div>
          </div>
        </header>

        <div className="mt-3 flex gap-2 border-b border-slate-100/80 pb-3">
          <button
            type="button"
            onClick={() => switchTopTab("feed")}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
              topTab === "feed" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            피드
          </button>
          <button
            type="button"
            onClick={() => switchTopTab("friends")}
            className={`relative rounded-full px-4 py-2 text-[13px] font-bold transition ${
              topTab === "friends"
                ? "bg-[#FF853E] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            친구 · 쪽지
            {friendBell > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black leading-none text-white">
                {friendBell > 9 ? "9+" : friendBell}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {topTab === "friends" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <CommunityFriendsHub
            onOpenDm={(id) => {
              setDmPeerId(id);
            }}
          />
        </div>
      )}

      {topTab === "feed" && !activeRoomId && (
        <>
          <section
            className="border-b border-slate-100/60 bg-white/90 px-0 pb-5 pt-2 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.06)]"
            aria-label="지금 뜨는 커뮤니티 방"
          >
            <div className="mb-3 flex items-end justify-between gap-2 px-5 sm:px-6">
              <h1 className="text-base font-bold tracking-tight text-slate-900">커뮤니티</h1>
              <span className="rounded-full bg-[#FFF1EA] px-2.5 py-1 text-[11px] font-semibold text-[#FF853E] ring-1 ring-[#FFD2BF]/50">
                지금 뜨는 방
              </span>
            </div>

            <div className="-mx-0 flex gap-3 overflow-x-auto overflow-y-visible px-5 pb-1 pt-0.5 [scrollbar-width:thin] snap-x snap-mandatory sm:px-6">
              {FEATURED_ROOMS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  className="w-[132px] shrink-0 snap-start text-left sm:w-[148px]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-200 shadow-md ring-1 ring-slate-200/80">
                    <img src={room.coverUrl} alt="" className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-black/35" />
                    <div className="absolute bottom-2.5 left-1/2 z-[1] -translate-x-1/2">
                      <span className="block rounded-full bg-white p-[3px] shadow-md ring-2 ring-[#FF6B9D]/90">
                        <img src={room.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10" />
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 min-h-[2.5rem] text-center text-[12px] font-bold leading-snug text-slate-800 line-clamp-2 sm:text-xs">
                    {room.name}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="border-b border-slate-100 bg-white px-5 py-4 sm:px-6" aria-label="오늘의 스토리">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">오늘의 맘 스토리</p>
            <div className="-mx-1 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STORY_RINGS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStoryRoomId(s.id)}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="rounded-full bg-[#FF853E] p-[3px]">
                    <span className="block rounded-full bg-white p-[2px]">
                      <img src={s.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" width={56} height={56} />
                    </span>
                  </span>
                  <span className="max-w-[5.5rem] text-center text-[10px] font-bold leading-snug text-slate-600 line-clamp-2">
                    {s.name}
                  </span>
                </button>
              ))}
              <button type="button" onClick={() => openCompose(null)} className="flex shrink-0 flex-col items-center gap-1.5">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#FFD2BF] bg-[#FFF8F4] text-2xl text-[#FF853E]">
                  +
                </span>
                <span className="text-[10px] font-bold text-[#FF853E]">내 스토리</span>
              </button>
            </div>
          </section>

          <main className="mx-auto max-w-app px-0">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-5 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setFeedTab("all")}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
                  feedTab === "all" ? "bg-[#FF853E] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                피드 전체
              </button>
              <button
                type="button"
                onClick={() => setFeedTab("following")}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
                  feedTab === "following" ? "bg-[#FF853E] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                맘테크 🍼
              </button>
              <span className="ml-auto text-[11px] font-normal text-slate-400">실시간 데모</span>
            </div>

            <div className="divide-y divide-slate-100 bg-white px-5 pb-28 pt-2 sm:px-6">
              {sortedPosts.length === 0 ? (
                <p className="py-16 text-center text-sm font-medium text-slate-400">아직 글이 없어요. 첫 글을 올려 보세요!</p>
              ) : (
                sortedPosts.map((post) => (
                  <CommunityFeedPost
                    key={post.id}
                    post={post}
                    liked={likedIds.has(post.id)}
                    commentCount={commentCountByPost.get(post.id) ?? 0}
                    onLikeChange={() => refreshFeed()}
                    onOpenComments={(id) => setCommentPostId(id)}
                  />
                ))
              )}
            </div>
          </main>
        </>
      )}

      {topTab === "feed" && activeRoomId && activeRoom && (
        <main className="mx-auto max-w-app px-0">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur-md sm:px-6">
            <button
              type="button"
              onClick={() => setActiveRoomId(null)}
              className="rounded-full px-2 py-2 text-lg font-bold text-slate-600 hover:bg-slate-100"
              aria-label="피드로 돌아가기"
            >
              ←
            </button>
            <img src={activeRoom.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFD2BF]/60" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-snug text-slate-900 line-clamp-2">{activeRoom.name}</p>
              <p className="text-[11px] font-medium text-slate-500">같은 고민 맘들과 수다 · 정보 나눠요</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 bg-white px-5 pb-28 pt-2 sm:px-6">
            {roomPosts.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm font-medium text-slate-500">아직 이 방에 글이 없어요.</p>
                <button
                  type="button"
                  onClick={() => openCompose(activeRoomId)}
                  className="mt-4 rounded-full bg-[#FF853E] px-6 py-3 text-sm font-bold text-white shadow-md"
                >
                  첫 글 남기기
                </button>
              </div>
            ) : (
              roomPosts.map((post) => (
                <CommunityFeedPost
                  key={post.id}
                  post={post}
                  liked={likedIds.has(post.id)}
                  commentCount={commentCountByPost.get(post.id) ?? 0}
                  onLikeChange={() => refreshFeed()}
                  onOpenComments={(id) => setCommentPostId(id)}
                />
              ))
            )}
          </div>
        </main>
      )}

      {topTab === "feed" && (
        <button
          type="button"
          onClick={() => openCompose(activeRoomId)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF853E] text-3xl font-light text-white shadow-[0_10px_40px_-8px_rgba(255,133,62,0.65)] ring-4 ring-white transition hover:brightness-[1.05] active:scale-95 sm:right-[max(1rem,calc(50%-215px+1.25rem))]"
          aria-label="새 글 작성"
        >
          +
        </button>
      )}

      <CommunityComposeModal
        open={composeOpen}
        onClose={() => {
          setComposeOpen(false);
          setComposeRoomPreset(null);
        }}
        onPosted={() => refreshFeed()}
        rooms={FEATURED_ROOMS}
        defaultRoomId={composeRoomPreset}
      />

      <CommunityCommentsSheet
        open={commentPostId !== null}
        postId={commentPostId}
        comments={comments}
        onClose={() => setCommentPostId(null)}
        onCommentsChange={() => refreshFeed()}
      />

      {storyRoom && (
        <CommunityStoryViewer room={storyRoom} posts={storyPosts} onClose={() => setStoryRoomId(null)} />
      )}

      <CommunityDmModal peerId={dmPeerId} open={dmPeerId !== null} onClose={() => setDmPeerId(null)} />
    </div>
  );
}
