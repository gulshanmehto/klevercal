import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Calendar, Clock, Users, Zap, CheckCircle2, ArrowRight, Play, Star } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Smart Calendar Sync",
      description: "Connect Google, Outlook, and Apple calendars. Never double-book again.",
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
    },
    {
      icon: Zap,
      title: "AI-Powered Scheduling",
      description: "Natural language understanding. Just say 'Let's meet Tuesday morning'.",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
    },
    {
      icon: Users,
      title: "Lead Qualification",
      description: "AI scores your leads based on form responses before they book.",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    },
    {
      icon: Clock,
      title: "Buffer & Limits",
      description: "Set buffer times, daily limits, and minimum notice periods.",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Sales Director",
      image: "https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc2OTg4MzM2MHww&ixlib=rb-4.1.0&q=85&w=100&h=100&fit=crop",
      quote: "DeeMeet cut my scheduling admin by 80%. The AI assistant is a game-changer."
    },
    {
      name: "Marcus Johnson",
      role: "Consultant",
      image: "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc2OTg4MzM2MHww&ixlib=rb-4.1.0&q=85&w=100&h=100&fit=crop",
      quote: "Finally, a scheduling tool that understands context. My clients love the experience."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-dark.png" alt="DeeMeet" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              data-testid="nav-login-btn"
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-violet-600 hover:bg-violet-700 text-white px-6"
              data-testid="nav-signup-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                <Zap className="w-4 h-4" />
                AI-Powered Scheduling
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white tracking-tight">
                Schedule smarter,<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  not harder
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                The intelligent scheduling platform that understands natural language, qualifies your leads, and syncs with all your calendars.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/signup")}
                  size="lg"
                  className="rounded-full bg-violet-600 hover:bg-violet-700 text-white px-8 h-12 text-base shadow-lg hover:shadow-xl hover:shadow-violet-500/25 transform hover:-translate-y-0.5 transition-transform"
                  data-testid="hero-get-started-btn"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-2 border-slate-200 dark:border-slate-700 px-8 h-12 text-base hover:border-violet-300 dark:hover:border-violet-700"
                  data-testid="hero-demo-btn"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch demo
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-violet-400 to-indigo-500"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">2,500+</span> professionals trust DeeMeet
                </div>
              </div>
            </div>
            <div>
              <img
                src="/feature-image.png"
                alt="DeeMeet Platform"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to schedule like a pro
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features that save you hours every week
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-shadow cursor-default"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Get started in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create your booking page", desc: "Set up your availability and meeting types" },
              { step: "2", title: "Share your link", desc: "Send your personal booking link to clients" },
              { step: "3", title: "Let AI handle the rest", desc: "Smart scheduling with automatic reminders" }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-violet-600 text-white font-bold text-xl flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-xl text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by professionals
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                data-testid={`testimonial-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-12 lg:p-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to schedule smarter?
            </h2>
            <p className="text-violet-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of professionals who save hours every week with DeeMeet.
            </p>
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full bg-white text-violet-700 hover:bg-violet-50 px-10 h-14 text-lg font-semibold shadow-lg"
              data-testid="cta-get-started-btn"
            >
              Get started for free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="flex items-center justify-center gap-6 mt-8 text-violet-200 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Free forever plan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-dark.png" alt="DeeMeet" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/privacy-policy" className="hover:text-violet-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-violet-600 transition-colors">Terms of Service</Link>
            <span>© 2026 DeeMeet. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
