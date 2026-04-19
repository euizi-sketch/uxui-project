import { INTEREST_SELECTION_MAX } from "../interestCategories";
import { OnboardingAction, OnboardingState } from "../types";

export const initialOnboardingState: OnboardingState = {
  currentStep: "splash",
  isNewUser: null,
  userType: null,
  profile: {
    nickname: "",
    phone1: "010",
    phone2: "",
    phone3: "",
    addressSearch: "",
    addressDetail: "",
    incomeBracket: "",
    children: [
      {
        gender: "",
        birthDate: "",
        developmentStage: "",
        extraInfo: "",
      },
    ],
  },
  interests: [],
  existingUser: {
    userId: "",
    password: "",
  },
  resetPassword: {
    newPassword: "",
    newPasswordConfirm: "",
  },
  signUp: {
    userId: "",
    password: "",
    passwordConfirm: "",
    provider: null,
    agreedToTerms: false,
  },
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
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "TOGGLE_INTEREST":
      return state.interests.includes(action.payload)
        ? {
            ...state,
            interests: state.interests.filter((v) => v !== action.payload),
          }
        : state.interests.length >= INTEREST_SELECTION_MAX
          ? state
          : { ...state, interests: [...state.interests, action.payload] };
    case "UPDATE_EXISTING_USER":
      return { ...state, existingUser: { ...state.existingUser, ...action.payload } };
    case "UPDATE_RESET_PASSWORD":
      return {
        ...state,
        resetPassword: { ...state.resetPassword, ...action.payload },
      };
    case "UPDATE_SIGN_UP":
      return { ...state, signUp: { ...state.signUp, ...action.payload } };
    case "RESET":
      return initialOnboardingState;
    default:
      return state;
  }
}
