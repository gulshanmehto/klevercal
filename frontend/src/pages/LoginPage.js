import { useState, useEffect } from "react";
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
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
          <img src="/logo-dark.png" alt="DeeMeet" className="h-10 w-auto object-contain" />
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
          © 2026 DeeMeet. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
          <CardHeader className="space-y-2 pb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <img src="/logo-dark.png" alt="DeeMeet" className="h-10 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">


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
