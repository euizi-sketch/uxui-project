export type UserType = "mom" | "dad" | "guardian" | null;

export type StepKey =
  | "splash"
  | "login"
  | "userType"
  | "consent"
  | "profile"
  | "interest"
  | "notificationPermission"
  | "notificationTime"
  | "done";

export interface ProfileInput {
  childInfo: string;
  name: string;
  nickname: string;
  gender: "female" | "male" | "other" | "";
  birthDate: string;
  developmentStage: "infant" | "toddler" | "preschooler" | "";
  extraInfo: string;
}

export interface OnboardingState {
  currentStep: StepKey;
  isNewUser: boolean | null;
  userType: UserType;
  consentAccepted: boolean;
  profile: ProfileInput;
  interests: string[];
  notificationAllowed: boolean | null;
  notificationTime: string;
}

export type OnboardingAction =
  | { type: "SET_STEP"; payload: StepKey }
  | { type: "SET_IS_NEW_USER"; payload: boolean }
  | { type: "SET_USER_TYPE"; payload: Exclude<UserType, null> }
  | { type: "SET_CONSENT"; payload: boolean }
  | { type: "UPDATE_PROFILE"; payload: Partial<ProfileInput> }
  | { type: "TOGGLE_INTEREST"; payload: string }
  | { type: "SET_NOTIFICATION_ALLOWED"; payload: boolean }
  | { type: "SET_NOTIFICATION_TIME"; payload: string }
  | { type: "RESET" };
