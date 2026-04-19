export type UserType = "mom" | "dad" | "grandparent" | "guardian" | "other" | null;

export type StepKey =
  | "splash"
  | "login"
  | "existingUserLogin"
  | "findAccount"
  | "resetPassword"
  | "signUp"
  | "signUpCredentials"
  | "userType"
  | "profile"
  | "profileExtra"
  | "interest"
  | "signupComplete"
  | "done";

/** 한 명의 아이 프로필 (아이 여러 명 지원) */
export interface ChildProfileSlice {
  gender: "female" | "male" | "";
  birthDate: string;
  developmentStage: "infant" | "toddler" | "preschooler" | "";
  extraInfo: string;
}

/** 월 가구 소득 구간 — 육아용품 가격대 추천 가중치에 사용 */
export type IncomeBracket = "" | "lt400" | "400to700" | "700to1000" | "gte1000";

export interface ProfileInput {
  nickname: string;
  /** 휴대전화 (아이디·비밀번호 찾기에 사용) */
  phone1: string;
  phone2: string;
  phone3: string;
  addressSearch: string;
  addressDetail: string;
  /** 선택 — 미입력 시 추천은 기본(중립) 가중 */
  incomeBracket: IncomeBracket;
  /** 최소 1명 */
  children: ChildProfileSlice[];
}

export interface OnboardingState {
  currentStep: StepKey;
  isNewUser: boolean | null;
  userType: UserType;
  profile: ProfileInput;
  interests: string[];
  existingUser: {
    userId: string;
    password: string;
  };
  resetPassword: {
    newPassword: string;
    newPasswordConfirm: string;
  };
  signUp: {
    userId: string;
    password: string;
    passwordConfirm: string;
    provider: "kakao" | "naver" | "apple" | "google" | null;
    agreedToTerms: boolean;
  };
}

export type OnboardingAction =
  | { type: "SET_STEP"; payload: StepKey }
  | { type: "SET_IS_NEW_USER"; payload: boolean }
  | { type: "SET_USER_TYPE"; payload: Exclude<UserType, null> }
  | { type: "UPDATE_PROFILE"; payload: Partial<ProfileInput> }
  | { type: "TOGGLE_INTEREST"; payload: string }
  | { type: "UPDATE_EXISTING_USER"; payload: Partial<OnboardingState["existingUser"]> }
  | { type: "UPDATE_RESET_PASSWORD"; payload: Partial<OnboardingState["resetPassword"]> }
  | { type: "UPDATE_SIGN_UP"; payload: Partial<OnboardingState["signUp"]> }
  | { type: "RESET" };
