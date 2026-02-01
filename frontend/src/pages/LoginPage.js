import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Calendar, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-indigo-600 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">KleverCal</span>
        </Link>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome back to smarter scheduling
          </h1>
          <p className="text-violet-100 text-lg">
            Your meetings, your way. AI-powered scheduling that works for you.
          </p>
        </div>
        <div className="text-violet-200 text-sm">
          © 2026 KleverCal. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
          <CardHeader className="space-y-2 pb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">KleverCal</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 flex items-center justify-center gap-3"
              onClick={loginWithGoogle}
              data-testid="google-login-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500"
                    required
                    data-testid="login-password-input"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-violet-600 hover:text-violet-700 font-medium" data-testid="signup-link">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
