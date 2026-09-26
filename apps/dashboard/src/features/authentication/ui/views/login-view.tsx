import { useState } from "react";
import SignInForm from "../components/sign-in-form";
import SignUpForm from "../components/sign-up-form";

export default function LoginView() {
  const [showSignIn, setShowSignIn] = useState(false);

  if (showSignIn) {
    return <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />;
  }

  return <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />;
}
