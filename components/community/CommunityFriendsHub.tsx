import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acceptFriendRequest,
  cancelOutgoingRequest,
  declineIncoming,
  DEMO_MOMS,
  getDmThread,
  getMomById,
  listDiscoverableMoms,
  loadFriendStateSnapshot,
  removeFriend,
  seedCommunityFriendsDemoIfNeeded,
  sendFriendRequest,
  type DemoMom,
} from "./communityMomFriendsModel";

type SubTab = "discover" | "friends" | "requests";

export default function CommunityFriendsHub({
  onOpenDm,
}: {
  onOpenDm: (peerId: string) => void;
}) {
  const [sub, setSub] = useState<SubTab>("discover");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    seedCommunityFriendsDemoIfNeeded();
  }, []);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener("momoA-community-friends-changed", h);
    window.addEventListener("momoA-community-dm-changed", h);
    return () => {
      window.removeEventListener("momoA-community-friends-changed", h);
      window.removeEventListener("momoA-community-dm-changed", h);
    };
  }, [refresh]);

  const state = useMemo(() => loadFriendStateSnapshot(), [tick]);

  const friendsList = useMemo(
    () => state.friends.map((id) => getMomById(id)).filter((m): m is DemoMom => Boolean(m)),
    [state.friends, tick]
  );

  const discoverList = useMemo(() => listDiscoverableMoms(), [tick]);

  const incomingList = useMemo(
    () => state.incoming.map((id) => getMomById(id)).filter((m): m is DemoMom => Boolean(m)),
    [state.incoming, tick]
  );

  const outgoingList = useMemo(
    () => state.outgoing.map((id) => getMomById(id)).filter((m): m is DemoMom => Boolean(m)),
    [state.outgoing, tick]
  );

  const tabBtn = (id: SubTab, label: string, badge?: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setSub(id)}
      className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${
        sub === id ? "bg-[#FF853E] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
      {badge != null && badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="sticky top-0 z-[5] border-b border-slate-100 bg-white/95 px-5 pb-3 pt-2 backdrop-blur-md sm:px-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#FF853E]">맘 친구</p>
        <h2 className="text-lg font-bold text-slate-900">함께 나누는 육아</h2>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
          관심사가 비슷한 맘에게 친구 요청을 보내고, 쪽지로 소통해 보세요. (로컬 데모)
        </p>
        <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
          {tabBtn("discover", "추천 맘")}
          {tabBtn("friends", "내 친구", friendsList.length)}
          {tabBtn("requests", "요청", state.incoming.length + state.outgoing.length)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4 sm:px-6">
        {sub === "discover" && (
          <ul className="space-y-3">
            {discoverList.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-[13px] font-medium text-slate-500">
                지금은 새로 추천할 맘이 없어요. 요청을 기다리거나 받은 요청을 확인해 보세요.
              </li>
            ) : (
              discoverList.map((m) => (
                <li
                  key={m.id}
                  className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/80"
                >
                  <img src={m.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-[#FFD2BF]/50" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{m.nickname}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {[m.childAgeLabel, m.region].filter(Boolean).join(" · ")}
                    </p>
                    {m.bio ? <p className="mt-1 line-clamp-2 text-[12px] text-slate-600">{m.bio}</p> : null}
                    <button
                      type="button"
                      onClick={() => {
                        sendFriendRequest(m.id);
                        refresh();
                      }}
                      className="mt-3 rounded-full bg-[#FF853E] px-4 py-2 text-[12px] font-bold text-white shadow-sm"
                    >
                      친구 요청
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        {sub === "friends" && (
          <ul className="space-y-3">
            {friendsList.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-[13px] font-medium text-slate-500">
                아직 맘 친구가 없어요. 추천 맘에서 요청을 보내 보세요!
              </li>
            ) : (
              friendsList.map((m) => {
                const dm = getDmThread(m.id);
                const preview = dm?.messages.length
                  ? dm.messages[dm.messages.length - 1].body
                  : "대화를 시작해 보세요";
                return (
                  <li
                    key={m.id}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/80"
                  >
                    <img src={m.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-emerald-200/70" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{m.nickname}</p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-slate-500">{preview}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenDm(m.id)}
                          className="rounded-full bg-slate-900 px-4 py-2 text-[12px] font-bold text-white"
                        >
                          쪽지
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`${m.nickname}님과 친구를 해제할까요?`)) {
                              removeFriend(m.id);
                              refresh();
                            }
                          }}
                          className="rounded-full border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600"
                        >
                          친구 끊기
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}

        {sub === "requests" && (
          <div className="space-y-6">
            <section>
              <p className="mb-2 text-[12px] font-bold text-slate-700">받은 요청</p>
              {incomingList.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[13px] text-slate-400">새 요청이 없어요</p>
              ) : (
                <ul className="space-y-3">
                  {incomingList.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4"
                    >
                      <img src={m.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900">{m.nickname}</p>
                        <p className="text-[11px] text-slate-600">{m.region}</p>
                      </div>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            acceptFriendRequest(m.id);
                            refresh();
                          }}
                          className="flex-1 rounded-full bg-[#FF853E] py-2.5 text-[12px] font-bold text-white sm:flex-none sm:px-5"
                        >
                          수락
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            declineIncoming(m.id);
                            refresh();
                          }}
                          className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 text-[12px] font-semibold text-slate-700 sm:flex-none sm:px-5"
                        >
                          거절
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="mb-2 text-[12px] font-bold text-slate-700">보낸 요청</p>
              {outgoingList.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[13px] text-slate-400">보낸 요청이 없어요</p>
              ) : (
                <ul className="space-y-2">
                  {outgoingList.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <img src={m.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                        <span className="truncate font-semibold text-slate-800">{m.nickname}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          cancelOutgoingRequest(m.id);
                          refresh();
                        }}
                        className="shrink-0 text-[12px] font-semibold text-slate-500 underline"
                      >
                        요청 취소
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="pb-8 text-[11px] leading-relaxed text-slate-400">
              데모 프로필은 {DEMO_MOMS.length}명입니다. 같은 닉네임이 피드 글과 겹칠 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
