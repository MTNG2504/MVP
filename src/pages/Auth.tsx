
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none border-0 p-0",
    headerTitle: "text-white text-2xl font-semibold",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton:
      "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-colors",
    socialButtonsBlockButtonText: "text-white font-medium",
    dividerLine: "bg-slate-700",
    dividerText: "text-slate-500",
    formFieldLabel: "text-slate-300",
    formFieldInput:
      "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20",
    formButtonPrimary:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30",
    footerActionText: "text-slate-400",
    footerActionLink: "text-emerald-400 hover:text-emerald-300",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-emerald-400",
    formFieldInputShowPasswordButton: "text-slate-400",
    alertText: "text-slate-300",
    formFieldErrorText: "text-red-400",
  },
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 border-r border-slate-800/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-violet-950/30" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-12">
            <ChevronLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Coin Rich</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your portfolio,<br />
            <span className="text-emerald-400">fully in control.</span>
          </h1>
          <p className="text-slate-400 max-w-sm leading-relaxed">
            Track holdings, analyze markets, and manage risk — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: BarChart3, text: "Real-time market analytics" },
            { icon: Shield, text: "Secure authentication via Clerk" },
            { icon: TrendingUp, text: "AI-assisted trading insights" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-slate-400 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center">
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-slate-950" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Coin Rich</span>
            </div>
            <p className="text-slate-400 text-sm">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(true)}
                className={
                  isLogin
                    ? "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white"
                    : "text-slate-400 hover:text-white hover:bg-transparent"
                }
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsLogin(false)}
                className={
                  !isLogin
                    ? "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white"
                    : "text-slate-400 hover:text-white hover:bg-transparent"
                }
              >
                Sign Up
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 md:p-8">
            {isLogin ? (
              <SignIn
                afterSignInUrl="/portfolio"
                appearance={clerkAppearance}
              />
            ) : (
              <SignUp
                afterSignUpUrl="/portfolio"
                appearance={clerkAppearance}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
