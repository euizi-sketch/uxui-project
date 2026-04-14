import { useEffect, useMemo, useReducer, useState } from "react";
import OnboardingLayout from "./components/layout/OnboardingLayout";
import ConsentScreen from "./screens/ConsentScreen";
import InterestSelect from "./screens/InterestSelect";
import LoginScreen from "./screens/LoginScreen";
import NotificationPermission from "./screens/NotificationPermission";
import NotificationTimeSetting from "./screens/NotificationTimeSetting";
import ProfileForm from "./screens/ProfileForm";
import SplashScreen from "./screens/SplashScreen";
import UserTypeSelect from "./screens/UserTypeSelect";
import {
  initialOnboardingState,
  onboardingReducer,
} from "./state/onboardingReducer";
import { ProfileInput } from "./types";

const stepLabels = [
  "회원유형",
  "약관동의",
  "프로필",
  "관심사",
  "알림",
  "알림시간",
];

const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function validateProfile(profile: ProfileInput) {
  const errors: Partial<Record<keyof ProfileInput, string>> = {};
  if (!profile.childInfo.trim()) errors.childInfo = "아이 정보를 입력해 주세요.";
  if (!profile.name.trim()) errors.name = "이름은 필수입니다.";
  if (!profile.nickname.trim()) errors.nickname = "닉네임은 필수입니다.";
  if (!profile.gender) errors.gender = "성별을 선택해 주세요.";
  if (!birthDateRegex.test(profile.birthDate))
    errors.birthDate = "YYYY-MM-DD 형식으로 입력해 주세요.";
  if (!profile.developmentStage) errors.developmentStage = "발달 단계를 선택해 주세요.";
  return errors;
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<keyof ProfileInput, string>>
  >({});
  const [interestError, setInterestError] = useState("");

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
      userType: 0,
      consent: 1,
      profile: 2,
      interest: 3,
      notificationPermission: 4,
      notificationTime: 5,
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
      >
        <LoginScreen
          onExistingUser={() => {
            dispatch({ type: "SET_IS_NEW_USER", payload: false });
            dispatch({ type: "SET_STEP", payload: "done" });
          }}
          onNewUser={() => {
            dispatch({ type: "SET_IS_NEW_USER", payload: true });
            dispatch({ type: "SET_STEP", payload: "userType" });
          }}
        />
      </OnboardingLayout>
    );
  }

  if (state.currentStep === "done") {
    return (
      <OnboardingLayout title="온보딩 완료" showStep={false}>
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <p className="font-semibold">저장된 사용자 설정</p>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div><button 
          onClick={onComplete}
          className="w-full mt-6 py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors"
        >
          서비스 시작하기
        </button>
      </OnboardingLayout>
    );
  }

  const handleNext = () => {
    switch (state.currentStep) {
      case "userType":
        if (state.userType) dispatch({ type: "SET_STEP", payload: "consent" });
        break;
      case "consent":
        if (state.consentAccepted) dispatch({ type: "SET_STEP", payload: "profile" });
        break;
      case "profile": {
        const errors = validateProfile(state.profile);
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
          dispatch({ type: "SET_STEP", payload: "notificationPermission" });
        }
        break;
      case "notificationPermission":
        if (state.notificationAllowed === true) {
          dispatch({ type: "SET_STEP", payload: "notificationTime" });
        } else if (state.notificationAllowed === false) {
          dispatch({ type: "SET_STEP", payload: "done" });
        }
        break;
      case "notificationTime":
        if (state.notificationTime) dispatch({ type: "SET_STEP", payload: "done" });
        break;
      default:
        break;
    }
  };

  const screenMap = {
    userType: {
      title: "회원 유형 선택",
      description: "사용자 역할을 선택해 맞춤형 콘텐츠를 받으세요.",
      ctaLabel: "다음",
      ctaDisabled: !state.userType,
      content: (
        <UserTypeSelect
          value={state.userType}
          onSelect={(value) => dispatch({ type: "SET_USER_TYPE", payload: value })}
        />
      ),
    },
    consent: {
      title: "약관 및 개인정보 동의",
      description: "필수 약관에 동의해야 가입을 진행할 수 있습니다.",
      ctaLabel: "동의하고 계속",
      ctaDisabled: !state.consentAccepted,
      content: (
        <ConsentScreen
          consentAccepted={state.consentAccepted}
          onChange={(value) => dispatch({ type: "SET_CONSENT", payload: value })}
        />
      ),
    },
    profile: {
      title: "프로필 입력",
      description: "아이 정보와 보호자 프로필을 입력해 주세요.",
      ctaLabel: "프로필 저장",
      ctaDisabled: false,
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
    interest: {
      title: "관심 영역 선택",
      description: "최소 1개 이상의 관심사를 선택해 주세요.",
      ctaLabel: "다음",
      ctaDisabled: false,
      content: (
        <InterestSelect
          selected={state.interests}
          error={interestError}
          onToggle={(value) => dispatch({ type: "TOGGLE_INTEREST", payload: value })}
        />
      ),
    },
    notificationPermission: {
      title: "알림 설정",
      description: "맞춤 알림을 허용할지 선택하세요.",
      ctaLabel: "다음",
      ctaDisabled: state.notificationAllowed === null,
      content: (
        <NotificationPermission
          value={state.notificationAllowed}
          onSelect={(value) =>
            dispatch({ type: "SET_NOTIFICATION_ALLOWED", payload: value })
          }
        />
      ),
    },
    notificationTime: {
      title: "알림 시간 설정",
      description: "허용한 경우 알림 시간을 설정할 수 있습니다.",
      ctaLabel: "완료",
      ctaDisabled: !state.notificationTime,
      content: (
        <NotificationTimeSetting
          time={state.notificationTime}
          onChange={(value) =>
            dispatch({ type: "SET_NOTIFICATION_TIME", payload: value })
          }
        />
      ),
    },
  } as const;

  const currentScreen = screenMap[state.currentStep as keyof typeof screenMap];

  return (
    <OnboardingLayout
      title={currentScreen.title}
      description={currentScreen.description}
      stepLabels={stepLabels}
      currentStepIndex={stepIndex}
      ctaLabel={currentScreen.ctaLabel}
      ctaDisabled={currentScreen.ctaDisabled}
      onCtaClick={handleNext}
    >
      {currentScreen.content}
    </OnboardingLayout>
  );
}
