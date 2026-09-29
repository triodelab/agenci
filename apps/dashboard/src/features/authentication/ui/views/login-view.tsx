import { useState } from "react";
import SignInForm from "../components/sign-in-form";
import SignUpForm from "../components/sign-up-form";

export default function LoginView({ initialSignIn = false }: { initialSignIn?: boolean }) {
  const [showSignIn, setShowSignIn] = useState(initialSignIn);

  if (showSignIn) {
    return <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />;
  }

  return <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />;
}
