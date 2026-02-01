import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL as API } from "../config";
import { toast } from "sonner";
import {
    Users, TrendingUp, Calendar, DollarSign,
    Globe, Clock, Languages, Search, Plus, Trash2,
    Crown, BarChart3, PieChart, Activity
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const AdminPage = () => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");

    // Dashboard stats
    const [stats, setStats] = useState(null);

    // Users data
    const [users, setUsers] = useState([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Analytics data
    const [demographics, setDemographics] = useState(null);
    const [growthData, setGrowthData] = useState(null);

    // Coupons data
    const [coupons, setCoupons] = useState([]);
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_percent: 10,
        max_uses: null,
        expires_at: "",
        plan_restriction: null
    });

    useEffect(() => {
        fetchStats();
        if (activeTab === "users") {
            fetchUsers();
        } else if (activeTab === "analytics") {
            fetchAnalytics();
        } else if (activeTab === "coupons") {
            fetchCoupons();
        }
    }, [activeTab, currentPage, searchQuery]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API}/admin/stats`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                toast.error("Failed to load admin stats");
            }
        } catch (error) {
            toast.error("Error loading stats");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const skip = (currentPage - 1) * 50;
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
            const response = await fetch(`${API}/admin/users?skip=${skip}&limit=50${searchParam}`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setUsersTotal(data.total);
            }
        } catch (error) {
            toast.error("Error loading users");
        }
    };

    const fetchAnalytics = async () => {
        try {
            const [demoResponse, growthResponse] = await Promise.all([
                fetch(`${API}/admin/analytics/demographics`, { headers: getAuthHeaders() }),
                fetch(`${API}/admin/analytics/growth`, { headers: getAuthHeaders() })
            ]);

            if (demoResponse.ok) {
                setDemographics(await demoResponse.json());
            }
            if (growthResponse.ok) {
                setGrowthData(await growthResponse.json());
            }
        } catch (error) {
            toast.error("Error loading analytics");
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await fetch(`${API}/admin/coupons`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setCoupons(data.coupons);
            }
        } catch (error) {
            toast.error("Error loading coupons");
        }
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API}/admin/coupons?code=${newCoupon.code}&discount_percent=${newCoupon.discount_percent}&max_uses=${newCoupon.max_uses || ""}&expires_at=${newCoupon.expires_at || ""}&plan_restriction=${newCoupon.plan_restriction || ""}`, {
                method: "POST",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                toast.success("Coupon created successfully!");
                setShowCouponForm(false);
                setNewCoupon({ code: "", discount_percent: 10, max_uses: null, expires_at: "", plan_restriction: null });
                fetchCoupons();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Failed to create coupon");
            }
        } catch (error) {
            toast.error("Error creating coupon");
        }
    };

    const deleteCoupon = async (couponId) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;

        try {
            const response = await fetch(`${API}/admin/coupons/${couponId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                toast.success("Coupon deleted");
                fetchCoupons();
            }
        } catch (error) {
            toast.error("Error deleting coupon");
        }
    };

    const updateUserPlan = async (userId, plan) => {
        try {
            const response = await fetch(`${API}/admin/users/${userId}/plan?plan=${plan}`, {
                method: "PUT",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                toast.success("User plan updated");
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            toast.error("Error updating plan");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        🚀 Admin Panel
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your DeeMeet platform
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: "dashboard", label: "Dashboard", icon: Activity },
                        { id: "users", label: "Users", icon: Users },
                        { id: "analytics", label: "Analytics", icon: BarChart3 },
                        { id: "coupons", label: "Coupons", icon: DollarSign }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Dashboard Tab */}
                {activeTab === "dashboard" && stats && (
                    <div className="space-y-6">
                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Users"
                                value={stats.total_users}
                                icon={Users}
                                color="violet"
                                subtitle={`${stats.onboarded_users} completed onboarding`}
                            />
                            <StatCard
                                title="Total Bookings"
                                value={stats.bookings.total}
                                icon={Calendar}
                                color="blue"
                                subtitle={`${stats.bookings.this_month} this month`}
                            />
                            <StatCard
                                title="Revenue"
                                value={`$${stats.revenue.estimated_monthly}`}
                                icon={DollarSign}
                                color="green"
                                subtitle="Estimated monthly"
                            />
                            <StatCard
                                title="New This Week"
                                value={stats.growth.new_users_this_week}
                                icon={TrendingUp}
                                color="pink"
                                subtitle="User growth"
                            />
                        </div>

                        {/* Plans Breakdown */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Crown className="w-6 h-6 text-violet-600" />
                                Plan Distribution
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <PlanCard plan="Free" count={stats.plans.free} color="slate" />
                                <PlanCard plan="Pro" count={stats.plans.pro} color="violet" />
                                <PlanCard plan="Premium" count={stats.plans.premium} color="gold" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Plan</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Bookings</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Joined</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {users.map((user) => (
                                            <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 font-semibold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                                                            {user.slug && <div className="text-sm text-slate-500">@{user.slug}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={user.plan || "free"}
                                                        onChange={(e) => updateUserPlan(user.user_id, e.target.value)}
                                                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 border-none font-semibold text-sm"
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="pro">Pro</option>
                                                        <option value="premium">Premium</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.booking_count}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="text-violet-600 hover:text-violet-700 font-semibold text-sm">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-slate-600 dark:text-slate-400">
                                Showing {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, usersTotal)} of {usersTotal}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage * 50 >= usersTotal}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && demographics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Countries */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-6 h-6 text-violet-600" />
                                    Top Countries
                                </h2>
                                <div className="space-y-3">
                                    {demographics.countries.map((item) => (
                                        <div key={item.country} className="flex items-center justify-between">
                                            <span className="text-slate-700 dark:text-slate-300">{item.country || "Unknown"}</span>
                                            <span className="font-semibold text-violet-600">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timezones */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                    Top Timezones
                                </h2>
                                <div className="space-y-3">
                                    {demographics.timezones.map((item) => (
                                        <div key={item.timezone} className="flex items-center justify-between">
                                            <span className="text-slate-700 dark:text-slate-300">{item.timezone}</span>
                                            <span className="font-semibold text-blue-600">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Growth Chart */}
                        {growthData && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                    User Growth (Last 30 Days)
                                </h2>
                                <div className="space-y-2">
                                    {growthData.daily_signups.map((item) => (
                                        <div key={item.date} className="flex items-center gap-3">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{item.date}</span>
                                            <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                    style={{ width: `${(item.count / 10) * 100}%` }}
                                                />
                                            </div>
                                            <span className="font-semibold text-green-600 w-12">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Coupons Tab */}
                {activeTab === "coupons" && (
                    <div className="space-y-6">
                        {/* Create Coupon Button */}
                        <Button
                            onClick={() => setShowCouponForm(!showCouponForm)}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Coupon
                        </Button>

                        {/* Coupon Form */}
                        {showCouponForm && (
                            <form onSubmit={createCoupon} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Coupon</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Coupon Code *</Label>
                                        <Input
                                            value={newCoupon.code}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                            placeholder="SAVE20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Discount (%) *</Label>
                                        <Input
                                            type="number"
                                            value={newCoupon.discount_percent}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: parseInt(e.target.value) })}
                                            min="1"
                                            max="100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Max Uses (optional)</Label>
                                        <Input
                                            type="number"
                                            value={newCoupon.max_uses || ""}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                    <div>
                                        <Label>Expires At (optional)</Label>
                                        <Input
                                            type="date"
                                            value={newCoupon.expires_at}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                                        Create Coupon
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCouponForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Coupons List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coupons.map((coupon) => (
                                <div key={coupon.coupon_id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="text-2xl font-bold text-violet-600">{coupon.code}</div>
                                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{coupon.discount_percent}% OFF</div>
                                        </div>
                                        <button
                                            onClick={() => deleteCoupon(coupon.coupon_id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        {coupon.max_uses && (
                                            <div>Used: {coupon.current_uses} / {coupon.max_uses}</div>
                                        )}
                                        {coupon.expires_at && (
                                            <div>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</div>
                                        )}
                                        {coupon.plan_restriction && (
                                            <div>Plan: {coupon.plan_restriction}</div>
                                        )}
                                        <div className="text-xs text-slate-500">
                                            Created: {new Date(coupon.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorClasses = {
        violet: "from-violet-500 to-purple-600",
        blue: "from-blue-500 to-cyan-600",
        green: "from-green-500 to-emerald-600",
        pink: "from-pink-500 to-rose-600"
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{title}</div>
            {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
    );
};

const PlanCard = ({ plan, count, color }) => {
    const colors = {
        slate: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
        violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
        gold: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
    };

    return (
        <div className={`${colors[color]} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm font-semibold">{plan}</div>
        </div>
    );
};

export default AdminPage;
