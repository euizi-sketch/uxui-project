import { OnboardingAction, OnboardingState } from "../types";

export const initialOnboardingState: OnboardingState = {
  currentStep: "splash",
  isNewUser: null,
  userType: null,
  consentAccepted: false,
  profile: {
    childInfo: "",
    name: "",
    nickname: "",
    gender: "",
    birthDate: "",
    developmentStage: "",
    extraInfo: "",
  },
  interests: [],
  notificationAllowed: null,
  notificationTime: "08:30",
};

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_IS_NEW_USER":
      return { ...state, isNewUser: action.payload };
    case "SET_USER_TYPE":
      return { ...state, userType: action.payload };
    case "SET_CONSENT":
      return { ...state, consentAccepted: action.payload };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "TOGGLE_INTEREST":
      return state.interests.includes(action.payload)
        ? {
            ...state,
            interests: state.interests.filter((v) => v !== action.payload),
          }
        : { ...state, interests: [...state.interests, action.payload] };
    case "SET_NOTIFICATION_ALLOWED":
      return { ...state, notificationAllowed: action.payload };
    case "SET_NOTIFICATION_TIME":
      return { ...state, notificationTime: action.payload };
    case "RESET":
      return initialOnboardingState;
    default:
      return state;
  }
}
