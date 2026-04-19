import { useEffect, useMemo, useReducer, useState } from "react";
import OnboardingLayout from "./components/layout/OnboardingLayout";
import ExistingUserLogin from "./screens/ExistingUserLogin";
import FindAccountScreen from "./screens/FindAccountScreen";
import InterestSelect from "./screens/InterestSelect";
import LoginScreen from "./screens/LoginScreen";
import ProfileExtraForm from "./screens/ProfileExtraForm";
import ProfileForm from "./screens/ProfileForm";
import ResetPasswordScreen, {
  validateResetPassword,
} from "./screens/ResetPasswordScreen";
import SignupCompleteScreen from "./screens/SignupCompleteScreen";
import SignUpCredentialsScreen, {
  validateSignUpCredentials,
} from "./screens/SignUpCredentialsScreen";
import SignUpScreen from "./screens/SignUpScreen";
import SplashScreen from "./screens/SplashScreen";
import UserTypeSelect from "./screens/UserTypeSelect";
import {
  applySignupDefaultProfileImage,
  persistMomoProfile,
} from "../profile/momoProfileStorage";
import {
  loadStoredAccount,
  saveStoredAccount,
  updateStoredPassword,
  verifyLogin,
} from "../profile/accountCredentialsStorage";
import { INTEREST_SELECTION_MAX } from "./interestCategories";
import {
  initialOnboardingState,
  onboardingReducer,
} from "./state/onboardingReducer";
import { ChildProfileSlice, ProfileInput } from "./types";

const stepLabels = [
  "회원가입",
  "회원유형",
  "부모 프로필",
  "아이 프로필",
  "관심사",
];

const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;

type ProfileErrorsState = Partial<
  Pick<ProfileInput, "nickname" | "phone1" | "phone2" | "phone3" | "addressSearch" | "addressDetail">
> & {
  children?: Array<Partial<Record<keyof ChildProfileSlice, string>>>;
  /** 휴대폰 3칸 묶음 오류 */
  phone?: string;
};

function validateProfile(profile: ProfileInput): ProfileErrorsState {
  const errors: ProfileErrorsState = {};
  if (!profile.nickname.trim())
    errors.nickname = "부모/보호자 닉네임을 입력해 주세요.";
  const phoneDigits = `${profile.phone1}${profile.phone2}${profile.phone3}`.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = "휴대전화 번호를 올바르게 입력해 주세요.";
  }
  // 주소는 선택 입력으로 두고, 성별/생년월일/발달단계는 다음 스텝에서 검증합니다.
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

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [profileErrors, setProfileErrors] = useState<ProfileErrorsState>({});
  const [interestError, setInterestError] = useState("");
  const [findAccountTab, setFindAccountTab] = useState<"id" | "pw">("pw");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (state.currentStep === "splash") {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_STEP", payload: "login" });
      }, 1400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.currentStep]);

  const stepIndex = useMemo(() => {
    const map = {
      signUp: 0,
      signUpCredentials: 0,
      userType: 1,
      profile: 2,
      profileExtra: 3,
      interest: 4,
    } as const;
    return map[state.currentStep as keyof typeof map] ?? 0;
  }, [state.currentStep]);

  if (state.currentStep === "splash") return <SplashScreen />;

  if (state.currentStep === "login") {
    return (
      <OnboardingLayout
        title="로그인"
        description="기존 사용자 또는 신규 사용자로 시작하세요."
        showStep={false}
        hideHeader
        containerClassName="bg-transparent px-5 pb-10"
        mainClassName="space-y-0"
      >
        <LoginScreen
          onExistingUser={() => {
            dispatch({ type: "SET_IS_NEW_USER", payload: false });
            dispatch({ type: "SET_STEP", payload: "existingUserLogin" });
          }}
          onNewUser={() => {
            dispatch({ type: "SET_IS_NEW_USER", payload: true });
            dispatch({ type: "SET_STEP", payload: "signUp" });
          }}
        />
      </OnboardingLayout>
    );
  }

  if (state.currentStep === "done") {
    return (
      <OnboardingLayout title="온보딩 완료" showStep={false}>
        <div className="space-y-4 rounded-2xl border border-slate-200 p-5 text-slate-800">
          <p className="text-lg font-bold">환영합니다!</p>
          <p className="text-sm text-slate-600">
            모든 절차가 완료되었습니다. 이제 서비스를 시작할 수 있어요.
          </p>
        </div>

        <button
          onClick={onComplete}
          className="mt-6 w-full rounded-xl bg-[#FF853E] py-4 font-bold text-white shadow-lg transition-colors hover:bg-[#FF6F1F]"
        >
          서비스 시작하기
        </button>
      </OnboardingLayout>
    );
  }

  const handleNext = () => {
    switch (state.currentStep) {
      case "existingUserLogin": {
        const uid = state.existingUser.userId.trim();
        const pw = state.existingUser.password;
        if (!uid || !pw) break;
        const stored = loadStoredAccount();
        if (stored && !verifyLogin(uid, pw)) {
          setLoginError("아이디 또는 비밀번호가 일치하지 않습니다.");
          break;
        }
        setLoginError("");
        onComplete();
        break;
      }
      case "findAccount":
        // 페이지 내부 버튼으로 진행(데모) 처리
        break;
      case "resetPassword": {
        const errors = validateResetPassword(state.resetPassword);
        if (Object.keys(errors).length === 0) {
          updateStoredPassword(state.resetPassword.newPassword);
          dispatch({ type: "SET_STEP", payload: "existingUserLogin" });
        }
        break;
      }
      case "signUp":
        if (state.signUp.provider && state.signUp.agreedToTerms) {
          dispatch({ type: "SET_STEP", payload: "signUpCredentials" });
        }
        break;
      case "signUpCredentials": {
        const errors = validateSignUpCredentials({
          userId: state.signUp.userId,
          password: state.signUp.password,
          passwordConfirm: state.signUp.passwordConfirm,
        });
        if (Object.keys(errors).length === 0) {
          dispatch({ type: "SET_STEP", payload: "userType" });
        }
        break;
      }
      case "userType":
        if (state.userType) dispatch({ type: "SET_STEP", payload: "profile" });
        break;
      case "profile": {
        const errors = validateProfile(state.profile);
        setProfileErrors(errors);
        if (Object.keys(errors).length === 0) {
          dispatch({ type: "SET_STEP", payload: "profileExtra" });
        }
        break;
      }
      case "profileExtra": {
        const errors = validateProfileExtra(state.profile);
        setProfileErrors(errors);
        if (Object.keys(errors).length === 0) {
          dispatch({ type: "SET_STEP", payload: "interest" });
        }
        break;
      }
      case "interest":
        if (state.interests.length < 1) {
          setInterestError("관심사는 최소 1개 이상 선택해야 합니다.");
        } else {
          setInterestError("");
          dispatch({ type: "SET_STEP", payload: "signupComplete" });
        }
        break;
      case "signupComplete": {
        if (state.userType) {
          applySignupDefaultProfileImage(state.userType);
          persistMomoProfile(state.userType, state.profile, state.interests);
          const phoneDigits = `${state.profile.phone1}${state.profile.phone2}${state.profile.phone3}`.replace(
            /\D/g,
            ""
          );
          saveStoredAccount({
            userId: state.signUp.userId.trim(),
            password: state.signUp.password,
            name: state.profile.nickname.trim(),
            phone: phoneDigits,
          });
        }
        onComplete();
        break;
      }
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (state.currentStep) {
      case "existingUserLogin":
        dispatch({ type: "SET_STEP", payload: "login" });
        break;
      case "findAccount":
        dispatch({ type: "SET_STEP", payload: "existingUserLogin" });
        break;
      case "resetPassword":
        dispatch({ type: "SET_STEP", payload: "findAccount" });
        break;
      case "signUp":
        dispatch({ type: "SET_STEP", payload: "login" });
        break;
      case "signUpCredentials":
        dispatch({ type: "SET_STEP", payload: "signUp" });
        break;
      case "userType":
        dispatch({ type: "SET_STEP", payload: "login" });
        break;
      case "profile":
        dispatch({ type: "SET_STEP", payload: "userType" });
        break;
      case "profileExtra":
        dispatch({ type: "SET_STEP", payload: "profile" });
        break;
      case "interest":
        dispatch({ type: "SET_STEP", payload: "profileExtra" });
        break;
      case "signupComplete":
        dispatch({ type: "SET_STEP", payload: "interest" });
        break;
      default:
        break;
    }
  };

  const screenMap = {
    signUp: {
      title: "회원가입",
      description: "계정을 선택하고 약관에 동의해 주세요.",
      ctaLabel: "다음",
      ctaDisabled: !state.signUp.provider || !state.signUp.agreedToTerms,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <SignUpScreen
          provider={state.signUp.provider}
          agreedToTerms={state.signUp.agreedToTerms}
          onSelectProvider={(provider) =>
            dispatch({
              type: "UPDATE_SIGN_UP",
              payload: {
                provider,
                agreedToTerms: false,
              },
            })
          }
          onSetAgreedToTerms={(value) =>
            dispatch({
              type: "UPDATE_SIGN_UP",
              payload: { agreedToTerms: value },
            })
          }
        />
      ),
    },
    signUpCredentials: {
      title: "아이디 생성",
      description: "아이디와 비밀번호를 설정해 주세요.",
      ctaLabel: "다음",
      ctaDisabled: (() => {
        const errors = validateSignUpCredentials({
          userId: state.signUp.userId,
          password: state.signUp.password,
          passwordConfirm: state.signUp.passwordConfirm,
        });
        return Object.keys(errors).length > 0;
      })(),
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <SignUpCredentialsScreen
          userId={state.signUp.userId}
          password={state.signUp.password}
          passwordConfirm={state.signUp.passwordConfirm}
          onChange={(next) => dispatch({ type: "UPDATE_SIGN_UP", payload: next })}
        />
      ),
    },
    existingUserLogin: {
      title: "기존 사용자 로그인",
      description: "아이디와 비밀번호를 입력해 주세요.",
      showStep: false,
      ctaLabel: "로그인",
      ctaDisabled: !state.existingUser.userId.trim() || !state.existingUser.password,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <ExistingUserLogin
          userId={state.existingUser.userId}
          password={state.existingUser.password}
          error={loginError}
          onChange={(next) => {
            setLoginError("");
            dispatch({ type: "UPDATE_EXISTING_USER", payload: next });
          }}
          onFindId={() => {
            setFindAccountTab("id");
            dispatch({ type: "SET_STEP", payload: "findAccount" });
          }}
          onFindPassword={() => {
            setFindAccountTab("pw");
            dispatch({ type: "SET_STEP", payload: "findAccount" });
          }}
        />
      ),
    },
    findAccount: {
      title: findAccountTab === "id" ? "아이디 찾기" : "비밀번호 찾기",
      showStep: false,
      hideHeader: true,
      content: (
        <FindAccountScreen
          tab={findAccountTab}
          title={findAccountTab === "id" ? "아이디 찾기" : "비밀번호 찾기"}
          onTabChange={setFindAccountTab}
          onBack={() => dispatch({ type: "SET_STEP", payload: "existingUserLogin" })}
          onFoundId={(foundId) =>
            dispatch({ type: "UPDATE_EXISTING_USER", payload: { userId: foundId } })
          }
          onGoResetPassword={() => {
            dispatch({
              type: "UPDATE_RESET_PASSWORD",
              payload: { newPassword: "", newPasswordConfirm: "" },
            });
            dispatch({ type: "SET_STEP", payload: "resetPassword" });
          }}
        />
      ),
    },
    resetPassword: {
      title: "비밀번호 재설정",
      description: "새 비밀번호를 입력해 주세요.",
      showStep: false,
      ctaLabel: "변경하기",
      ctaDisabled: (() => {
        const errors = validateResetPassword(state.resetPassword);
        return Object.keys(errors).length > 0;
      })(),
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <ResetPasswordScreen
          newPassword={state.resetPassword.newPassword}
          newPasswordConfirm={state.resetPassword.newPasswordConfirm}
          onChange={(next) =>
            dispatch({ type: "UPDATE_RESET_PASSWORD", payload: next })
          }
        />
      ),
    },
    userType: {
      title: "회원 유형 선택",
      description: "사용자 역할을 선택해 맞춤형 콘텐츠를 받으세요.",
      ctaLabel: "다음",
      ctaDisabled: !state.userType,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <UserTypeSelect
          value={state.userType}
          onSelect={(value) => dispatch({ type: "SET_USER_TYPE", payload: value })}
        />
      ),
    },
    profile: {
      title: "부모 프로필",
      description: "닉네임·휴대전화(찾기용)·주소를 입력해 주세요.",
      ctaLabel: "다음",
      ctaDisabled: false,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <ProfileForm
          profile={state.profile}
          errors={profileErrors}
          onChange={(key, value) =>
            dispatch({ type: "UPDATE_PROFILE", payload: { [key]: value } })
          }
        />
      ),
    },
    profileExtra: {
      title: "아이 프로필",
      description: "성별, 생년월일, 발달 단계, 추가 정보를 입력해 주세요.",
      ctaLabel: "다음",
      ctaDisabled: false,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <ProfileExtraForm
          profile={state.profile}
          childErrors={profileErrors.children ?? []}
          onUpdateChild={(index, patch) => {
            const next = state.profile.children.map((c, i) =>
              i === index ? { ...c, ...patch } : c
            );
            dispatch({ type: "UPDATE_PROFILE", payload: { children: next } });
          }}
          onAddChild={() => {
            dispatch({
              type: "UPDATE_PROFILE",
              payload: {
                children: [
                  ...state.profile.children,
                  {
                    gender: "",
                    birthDate: "",
                    developmentStage: "",
                    extraInfo: "",
                  },
                ],
              },
            });
          }}
          onRemoveChild={(index) => {
            if (state.profile.children.length <= 1) return;
            dispatch({
              type: "UPDATE_PROFILE",
              payload: {
                children: state.profile.children.filter((_, i) => i !== index),
              },
            });
          }}
        />
      ),
    },
    interest: {
      title: "관심 영역 선택",
      description: `최소 1개 이상 · 최대 ${INTEREST_SELECTION_MAX}개까지 선택할 수 있어요.`,
      ctaLabel: "다음",
      ctaDisabled: false,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: (
        <InterestSelect
          selected={state.interests}
          error={interestError}
          onToggle={(value) => {
            setInterestError("");
            if (
              !state.interests.includes(value) &&
              state.interests.length >= INTEREST_SELECTION_MAX
            ) {
              setInterestError(
                `관심 영역은 최대 ${INTEREST_SELECTION_MAX}개까지 선택할 수 있어요.`
              );
              return;
            }
            dispatch({ type: "TOGGLE_INTEREST", payload: value });
          }}
        />
      ),
    },
    signupComplete: {
      title: state.profile.nickname.trim()
        ? `${state.profile.nickname.trim()}님, 만나서 반가워요!`
        : "만나서 반가워요!",
      description:
        "가입해 주셔서 고마워요. 마음 담아 작은 선물도 챙겨 두었어요.",
      showStep: false,
      ctaLabel: "좋아요, 시작할게요",
      ctaDisabled: false,
      backLabel: "뒤로가기",
      onBackClick: handleBack,
      content: <SignupCompleteScreen />,
    },
  } as const;

  const currentScreen = screenMap[state.currentStep as keyof typeof screenMap];

  return (
    <OnboardingLayout
      title={currentScreen.title}
      description={"description" in currentScreen ? currentScreen.description : undefined}
      showStep={"showStep" in currentScreen ? currentScreen.showStep : undefined}
      hideHeader={"hideHeader" in currentScreen ? currentScreen.hideHeader : undefined}
      stepLabels={stepLabels}
      currentStepIndex={stepIndex}
      ctaLabel={"ctaLabel" in currentScreen ? currentScreen.ctaLabel : undefined}
      ctaDisabled={
        "ctaDisabled" in currentScreen ? currentScreen.ctaDisabled : undefined
      }
      onCtaClick={"ctaLabel" in currentScreen ? handleNext : undefined}
      backLabel={"backLabel" in currentScreen ? currentScreen.backLabel : undefined}
      onBackClick={
        "onBackClick" in currentScreen ? currentScreen.onBackClick : undefined
      }
    >
      {currentScreen.content}
    </OnboardingLayout>
  );
}
