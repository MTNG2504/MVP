
import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart3, TrendingUp, Shield, Zap, Brain, Globe, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI Market Analysis",
      description: "Machine learning models surface patterns and price signals across thousands of assets in real time.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live market data with millisecond precision and intuitive charts built for fast decisions.",
    },
    {
      icon: TrendingUp,
      title: "Predictive Modeling",
      description: "Historical data pipelines forecast trends and highlight opportunities before they move.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Automated stop-loss, position sizing, and portfolio exposure tools keep risk in check.",
    },
    {
      icon: Zap,
      title: "Lightning Execution",
      description: "Direct exchange connectivity so you can act on signals the moment they appear.",
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Unified portfolio view across worldwide exchanges and on-chain assets.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Landing-only nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Coin Rich</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-slate-300 hover:text-white hover:bg-slate-800/60"
            >
              Sign in
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30"
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-powered crypto portfolio platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Trade smarter with </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Coin Rich
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Advanced technical analysis, portfolio tracking, and AI insights — built for the next generation of crypto traders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 text-base shadow-lg shadow-emerald-900/40"
            >
              Start free
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="lg"
              className="border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 hover:text-white px-8 h-12 text-base"
            >
              View dashboard
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </div>

          {/* Tuffy card */}
          <div className="mt-16 mx-auto max-w-sm">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 shadow-xl shadow-black/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-emerald-500/30">
                  <img src="/lovable-uploads/tuffy.png" alt="Tuffy AI" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">Tuffy AI</p>
                  <p className="text-sm text-slate-400">Your trading assistant</p>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to stay ahead
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Professional-grade tools in a clean, focused interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to take control of your portfolio?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join traders using Coin Rich to track assets, analyze markets, and make informed decisions.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 h-12 text-base shadow-lg shadow-emerald-900/40"
          >
            Create your account
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-8 px-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Coin Rich. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
