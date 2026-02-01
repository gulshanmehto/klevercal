import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_URL as API } from "../config";
import { Lock, Mail } from "lucide-react";
import { Button } from "../components/ui/button";

const AdminLoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                // Backend returns: {token, user_id, email, name}
                // Construct user object from response
                const user = {
                    user_id: data.user_id,
                    email: data.email,
                    name: data.name
                };

                // Store token and user in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(user));

                // Check if user is admin
                const adminEmails = ["gulshanmehto15@gmail.com", "admin@deemeet.com", "gulshan@klevermarketing.in"];
                if (adminEmails.includes(user.email)) {
                    toast.success("Admin login successful!");
                    navigate("/admin", { state: { user } });
                } else {
                    toast.error("Access denied. Admin privileges required.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            } else {
                const error = await response.json();
                toast.error(error.detail || "Login failed");
            }
        } catch (error) {
            toast.error("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Security Badge */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4">
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Administrator Access</h1>
                    <p className="text-violet-200">DeeMeet Admin Panel</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-violet-500/20">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                                    placeholder="admin@deemeet.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                "Access Admin Panel"
                            )}
                        </Button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                            🔒 This area is restricted to authorized administrators only.
                        </p>
                    </div>
                </div>

                {/* Back to Site */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate("/")}
                        className="text-violet-200 hover:text-white transition-colors text-sm"
                    >
                        ← Back to DeeMeet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
