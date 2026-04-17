import { useMemo, useState } from "react";
import ProfileExtraForm from "../onboarding/screens/ProfileExtraForm";
import ProfileForm from "../onboarding/screens/ProfileForm";
import InterestSelect from "../onboarding/screens/InterestSelect";
import UserTypeSelect from "../onboarding/screens/UserTypeSelect";
import { INTEREST_SELECTION_MAX } from "../onboarding/interestCategories";
import type { ChildProfileSlice, ProfileInput, UserType } from "../onboarding/types";
import { loadStoredAccount, saveStoredAccount } from "../profile/accountCredentialsStorage";
import { loadProfileEditDraft, persistMomoProfile } from "../profile/momoProfileStorage";

const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;

type ProfileErrorsState = Partial<
  Pick<ProfileInput, "nickname" | "phone1" | "phone2" | "phone3" | "addressSearch" | "addressDetail">
> & {
  children?: Array<Partial<Record<keyof ChildProfileSlice, string>>>;
  phone?: string;
};

function validateProfile(profile: ProfileInput): ProfileErrorsState {
  const errors: ProfileErrorsState = {};
  if (!profile.nickname.trim()) errors.nickname = "부모/보호자 닉네임을 입력해 주세요.";
  const phoneDigits = `${profile.phone1}${profile.phone2}${profile.phone3}`.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = "휴대전화 번호를 올바르게 입력해 주세요.";
  }
  return errors;
}

function validateProfileExtra(profile: ProfileInput): ProfileErrorsState {
  const children = profile.children?.length ? profile.children : [];
  const childrenErrors = children.map((child) => {
    const e: Partial<Record<keyof ChildProfileSlice, string>> = {};
    if (!child.gender) e.gender = "성별을 선택해 주세요.";
    if (!birthDateRegex.test(child.birthDate))
      e.birthDate = "YYYY-MM-DD 형식으로 입력해 주세요.";
    if (!child.developmentStage) e.developmentStage = "발달 단계를 선택해 주세요.";
    return e;
  });
  const hasError = childrenErrors.some((e) => Object.keys(e).length > 0);
  if (hasError) return { children: childrenErrors };
  return {};
}

type Props = {
  onBack: () => void;
  onSaved: () => void;
};

export default function ProfileEditPage({ onBack, onSaved }: Props) {
  const initial = useMemo(() => loadProfileEditDraft(), []);
  const [userType, setUserType] = useState<UserType>(initial.userType);
  const [profile, setProfile] = useState<ProfileInput>(initial.profile);
  const [interests, setInterests] = useState<string[]>(initial.interests);
  const [profileErrors, setProfileErrors] = useState<ProfileErrorsState>({});
  const [interestError, setInterestError] = useState("");

  const updateProfile = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const handleSave = () => {
    if (!userType) {
      window.alert("회원 유형을 선택해 주세요.");
      return;
    }
    const pErr = validateProfile(profile);
    const cErr = validateProfileExtra(profile);
    setProfileErrors({
      ...pErr,
      ...(cErr.children ? { children: cErr.children } : {}),
    });
    const childHasError = Boolean(
      cErr.children?.some((e) => e && Object.keys(e).length > 0)
    );
    if (Object.keys(pErr).length > 0 || childHasError) return;

    if (interests.length < 1) {
      setInterestError("관심사는 최소 1개 이상 선택해야 합니다.");
      return;
    }
    setInterestError("");

    persistMomoProfile(userType, profile, interests);
    const acc = loadStoredAccount();
    if (acc) {
      const phoneDigits = `${profile.phone1}${profile.phone2}${profile.phone3}`.replace(/\D/g, "");
      saveStoredAccount({
        ...acc,
        name: profile.nickname.trim(),
        phone: phoneDigits,
      });
    }
    onSaved();
  };

  const toggleInterest = (value: string) => {
    setInterests((prev) => {
      if (prev.includes(value)) {
        setInterestError("");
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= INTEREST_SELECTION_MAX) {
        setInterestError(
          `관심 영역은 최대 ${INTEREST_SELECTION_MAX}개까지 선택할 수 있어요.`
        );
        return prev;
      }
      setInterestError("");
      return [...prev, value];
    });
  };

  return (
    <div className="app-viewport-fixed z-[75] flex flex-col overflow-y-auto bg-[#E0F3F9]">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 hover:bg-slate-100"
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold text-slate-900">프로필 수정</h1>
            <p className="text-xs font-semibold leading-snug text-slate-500 line-clamp-2">
              가입 시 입력한 정보를 바꿀 수 있어요
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-safe-tab pt-5">
        <div className="mx-auto max-w-lg space-y-8">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">회원 유형</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">맞춤 콘텐츠에 반영돼요</p>
            <div className="mt-4">
              <UserTypeSelect value={userType} onSelect={(v) => setUserType(v)} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">부모 프로필</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">닉네임과 주소를 수정할 수 있어요</p>
            <div className="mt-4">
              <ProfileForm
                profile={profile}
                errors={profileErrors}
                onChange={(key, value) => updateProfile(key, value)}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">아이 프로필</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              성별, 생년월일, 발달 단계, 추가 정보
            </p>
            <div className="mt-4">
              <ProfileExtraForm
                profile={profile}
                childErrors={profileErrors.children ?? []}
                onUpdateChild={(index, patch) => {
                  const next = profile.children.map((c, i) => (i === index ? { ...c, ...patch } : c));
                  setProfile((p) => ({ ...p, children: next }));
                }}
                onAddChild={() => {
                  setProfile((p) => ({
                    ...p,
                    children: [
                      ...p.children,
                      { gender: "", birthDate: "", developmentStage: "", extraInfo: "" },
                    ],
                  }));
                }}
                onRemoveChild={(index) => {
                  if (profile.children.length <= 1) return;
                  setProfile((p) => ({
                    ...p,
                    children: p.children.filter((_, i) => i !== index),
                  }));
                }}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900">관심 영역</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              최소 1개 이상 · 최대 {INTEREST_SELECTION_MAX}개까지 선택해 주세요
            </p>
            <div className="mt-4">
              <InterestSelect selected={interests} onToggle={toggleInterest} error={interestError} />
            </div>
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl bg-[#FF853E] py-4 text-sm font-extrabold text-white shadow-md transition hover:bg-[#FF6F1F]"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
