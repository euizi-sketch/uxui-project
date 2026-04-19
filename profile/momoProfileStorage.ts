import {
  DEFAULT_AVATAR_STYLE,
  saveDefaultAvatarStyleToStorage,
} from "../components/CustomizableDefaultAvatar";
import { INTEREST_SELECTION_MAX } from "../onboarding/interestCategories";
import type { ChildProfileSlice, IncomeBracket, ProfileInput, UserType } from "../onboarding/types";
import { normalizeIncomeBracket } from "./gearIncomeRecommendation";

/** 마이페이지 프리셋과 동일 경로 (엄마→주부맘, 아빠→워킹파, 조부모→그랜마) */
const SIGNUP_DEFAULT_PRESET_IMAGE: Record<
  "mom" | "dad" | "grandparent",
  string
> = {
  mom: "/avatars/avatar-2.png",
  dad: "/avatars/avatar-working-pa.png",
  grandparent: "/avatars/avatar-grandma.png",
};

/**
 * 회원가입 완료 시 회원 유형에 맞는 기본 프로필 이미지를 한 번 설정합니다.
 * - 엄마: 주부맘 / 아빠: 워킹파 / 조부모: 그랜마 / 보호자·기타: 커스텀(기본 아바타 + 스타일 초기화)
 */
export function applySignupDefaultProfileImage(userType: Exclude<UserType, null>) {
  try {
    if (userType === "mom" || userType === "dad" || userType === "grandparent") {
      localStorage.setItem("momoA.profileImage", SIGNUP_DEFAULT_PRESET_IMAGE[userType]);
      return;
    }
    if (userType === "guardian" || userType === "other") {
      localStorage.removeItem("momoA.profileImage");
      saveDefaultAvatarStyleToStorage(DEFAULT_AVATAR_STYLE);
    }
  } catch {
    /* ignore */
  }
}

export type MyPageProfileSnapshot = {
  nickname: string;
  userType: string;
  childrenCount: number;
  gender: string;
  birthDate: string;
  developmentStage: string;
  extraInfo: string;
  addressSearch: string;
  addressDetail: string;
  /** 육아용품 가격대 추천 — `loadMyPageProfileFromStorage` */
  incomeBracket: IncomeBracket;
  interests: string[];
};

const USER_TYPE_KEYS = ["mom", "dad", "grandparent", "guardian", "other"] as const;

function parseInterests(): string[] {
  const interestsRaw = localStorage.getItem("momoA.interests");
  try {
    const parsed = interestsRaw ? (JSON.parse(interestsRaw) as unknown) : [];
    if (Array.isArray(parsed)) {
      return parsed
        .filter((x): x is string => typeof x === "string")
        .slice(0, INTEREST_SELECTION_MAX);
    }
  } catch {
    /* ignore */
  }
  return [];
}

function normalizeChild(raw: unknown): ChildProfileSlice {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const gender = o.gender === "female" || o.gender === "male" ? o.gender : "";
  const birthDate = typeof o.birthDate === "string" ? o.birthDate : "";
  const ds = o.developmentStage;
  const developmentStage =
    ds === "infant" || ds === "toddler" || ds === "preschooler" ? ds : "";
  const extraInfo = typeof o.extraInfo === "string" ? o.extraInfo : "";
  return { gender, birthDate, developmentStage, extraInfo };
}

function mergeFirstChildWithLegacyFlatKeys(children: ChildProfileSlice[]): ChildProfileSlice[] {
  if (children.length === 0) return children;
  const legacyGender = (localStorage.getItem("momoA.gender") as ChildProfileSlice["gender"]) || "";
  const legacyBirth = localStorage.getItem("momoA.birthDate") || "";
  const legacyStage =
    (localStorage.getItem("momoA.developmentStage") as ChildProfileSlice["developmentStage"]) || "";
  const legacyExtra = localStorage.getItem("momoA.extraInfo") || "";
  const first = children[0];
  const merged: ChildProfileSlice = {
    gender:
      first.gender === "female" || first.gender === "male"
        ? first.gender
        : legacyGender === "female" || legacyGender === "male"
          ? legacyGender
          : "",
    birthDate: first.birthDate.trim() ? first.birthDate : legacyBirth,
    developmentStage:
      first.developmentStage === "infant" ||
      first.developmentStage === "toddler" ||
      first.developmentStage === "preschooler"
        ? first.developmentStage
        : legacyStage === "infant" || legacyStage === "toddler" || legacyStage === "preschooler"
          ? legacyStage
          : "",
    extraInfo: first.extraInfo.trim() ? first.extraInfo : legacyExtra,
  };
  return [merged, ...children.slice(1)];
}

export function loadChildrenFromStorage(): ChildProfileSlice[] {
  try {
    const rawKids = localStorage.getItem("momoA.childrenProfiles");
    if (rawKids) {
      const parsed = JSON.parse(rawKids) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map(normalizeChild);
        return mergeFirstChildWithLegacyFlatKeys(normalized);
      }
    }
  } catch {
    /* ignore */
  }
  return [
    {
      gender: (localStorage.getItem("momoA.gender") as ChildProfileSlice["gender"]) || "",
      birthDate: localStorage.getItem("momoA.birthDate") || "",
      developmentStage:
        (localStorage.getItem("momoA.developmentStage") as ChildProfileSlice["developmentStage"]) ||
        "",
      extraInfo: localStorage.getItem("momoA.extraInfo") || "",
    },
  ];
}

export function loadMyPageProfileFromStorage(): MyPageProfileSnapshot {
  const nickname = localStorage.getItem("momoA.nickname") || "";
  const userType = localStorage.getItem("momoA.userType") || "";
  const addressSearch = localStorage.getItem("momoA.addressSearch") || "";
  const addressDetail = localStorage.getItem("momoA.addressDetail") || "";
  const incomeBracket = normalizeIncomeBracket(localStorage.getItem("momoA.incomeBracket"));
  const interests = parseInterests();

  const children = loadChildrenFromStorage();
  const childrenCount = Math.max(1, children.length);
  const first = children[0] ?? {
    gender: "",
    birthDate: "",
    developmentStage: "",
    extraInfo: "",
  };

  return {
    nickname,
    userType,
    childrenCount,
    gender: first.gender,
    birthDate: first.birthDate,
    developmentStage: first.developmentStage,
    extraInfo: first.extraInfo,
    addressSearch,
    addressDetail,
    incomeBracket,
    interests,
  };
}

export function loadUserTypeFromStorage(): UserType {
  const raw = localStorage.getItem("momoA.userType") || "";
  if (USER_TYPE_KEYS.includes(raw as (typeof USER_TYPE_KEYS)[number])) {
    return raw as Exclude<UserType, null>;
  }
  return null;
}

function splitStoredPhone(digits: string): Pick<ProfileInput, "phone1" | "phone2" | "phone3"> {
  const d = digits.replace(/\D/g, "");
  if (d.length >= 10) {
    const phone1 = d.slice(0, 3);
    const rest = d.slice(3);
    if (rest.length === 8) return { phone1, phone2: rest.slice(0, 4), phone3: rest.slice(4) };
    if (rest.length === 7) return { phone1, phone2: rest.slice(0, 3), phone3: rest.slice(3) };
  }
  return { phone1: "010", phone2: "", phone3: "" };
}

export function loadProfileEditDraft(): {
  userType: UserType;
  profile: ProfileInput;
  interests: string[];
} {
  const nickname = localStorage.getItem("momoA.nickname") || "";
  const storedPhone = localStorage.getItem("momoA.phone") || "";
  const addressSearch = localStorage.getItem("momoA.addressSearch") || "";
  const addressDetail = localStorage.getItem("momoA.addressDetail") || "";
  const incomeBracket = normalizeIncomeBracket(localStorage.getItem("momoA.incomeBracket"));
  let children = loadChildrenFromStorage();
  if (children.length === 0) {
    children = [{ gender: "", birthDate: "", developmentStage: "", extraInfo: "" }];
  }
  const phones = splitStoredPhone(storedPhone);
  return {
    userType: loadUserTypeFromStorage(),
    profile: { nickname, ...phones, addressSearch, addressDetail, incomeBracket, children },
    interests: parseInterests(),
  };
}

export function extractAddressParts(addressSearch: string) {
  const s = addressSearch.trim();
  if (!s) return { region: "", gu: "", dong: "" };
  const tokens = s.split(/\s+/).filter(Boolean);
  const pick = (suffixes: string[]) =>
    tokens.find((t) => suffixes.some((suf) => t.endsWith(suf))) ?? "";
  const region =
    pick(["특별시", "광역시", "특별자치시", "특별자치도", "도", "시"]) || tokens[0] || "";
  const gu = pick(["구", "군", "시"]) || "";
  const dong = pick(["동", "읍", "면"]) || "";
  return { region, gu, dong };
}

/** 온보딩 완료 시와 동일한 키로 저장 */
export function persistMomoProfile(
  userType: Exclude<UserType, null>,
  profile: ProfileInput,
  interests: string[]
) {
  localStorage.setItem("momoA.userType", userType);
  if (profile.nickname.trim()) localStorage.setItem("momoA.nickname", profile.nickname.trim());
  else localStorage.removeItem("momoA.nickname");

  const kids = profile.children?.length ? profile.children : [];
  if (kids.length > 0) {
    localStorage.setItem("momoA.childrenProfiles", JSON.stringify(kids));
    const first = kids[0];
    if (first?.gender) localStorage.setItem("momoA.gender", first.gender);
    else localStorage.removeItem("momoA.gender");
    if (first?.birthDate.trim()) localStorage.setItem("momoA.birthDate", first.birthDate.trim());
    else localStorage.removeItem("momoA.birthDate");
    if (first?.developmentStage)
      localStorage.setItem("momoA.developmentStage", first.developmentStage);
    else localStorage.removeItem("momoA.developmentStage");
    if (first?.extraInfo.trim()) localStorage.setItem("momoA.extraInfo", first.extraInfo.trim());
    else localStorage.removeItem("momoA.extraInfo");
  } else {
    localStorage.removeItem("momoA.childrenProfiles");
    localStorage.removeItem("momoA.gender");
    localStorage.removeItem("momoA.birthDate");
    localStorage.removeItem("momoA.developmentStage");
    localStorage.removeItem("momoA.extraInfo");
  }

  if (profile.addressSearch.trim()) {
    const { region, gu, dong } = extractAddressParts(profile.addressSearch);
    if (region) localStorage.setItem("momoA.region", region);
    else localStorage.removeItem("momoA.region");
    if (gu) localStorage.setItem("momoA.gu", gu);
    else localStorage.removeItem("momoA.gu");
    if (dong) localStorage.setItem("momoA.dong", dong);
    else localStorage.removeItem("momoA.dong");
    localStorage.setItem("momoA.addressSearch", profile.addressSearch);
    localStorage.setItem("momoA.addressDetail", profile.addressDetail);
  } else {
    localStorage.removeItem("momoA.region");
    localStorage.removeItem("momoA.gu");
    localStorage.removeItem("momoA.dong");
    localStorage.removeItem("momoA.addressSearch");
    localStorage.removeItem("momoA.addressDetail");
  }

  const interestsCapped = interests.slice(0, INTEREST_SELECTION_MAX);
  if (interestsCapped.length > 0)
    localStorage.setItem("momoA.interests", JSON.stringify(interestsCapped));
  else localStorage.removeItem("momoA.interests");

  const phoneDigits = `${profile.phone1}${profile.phone2}${profile.phone3}`.replace(/\D/g, "");
  if (phoneDigits.length >= 10) localStorage.setItem("momoA.phone", phoneDigits);
  else localStorage.removeItem("momoA.phone");

  {
    const inc = normalizeIncomeBracket(profile.incomeBracket);
    if (inc) localStorage.setItem("momoA.incomeBracket", inc);
    else localStorage.removeItem("momoA.incomeBracket");
  }

  try {
    window.dispatchEvent(new CustomEvent("momoA-profile-changed"));
  } catch {
    /* ignore */
  }
}
