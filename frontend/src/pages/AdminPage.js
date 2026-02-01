import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL as API } from "../config";
import { toast } from "sonner";
import {
    Users, TrendingUp, Calendar, DollarSign,
    Globe, Clock, Search, Plus, Trash2,
    Crown, BarChart3, Activity
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const AdminPage = () => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [demographics, setDemographics] = useState(null);
    const [growthData, setGrowthData] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(10);
    const [couponMaxUses, setCouponMaxUses] = useState("");
    const [couponExpires, setCouponExpires] = useState("");

    useEffect(() => {
        loadData();
    }, [activeTab, currentPage, searchQuery]);

    const loadData = async () => {
        await fetchStats();
        if (activeTab === "users") {
            await fetchUsers();
        } else if (activeTab === "analytics") {
            await fetchAnalytics();
        } else if (activeTab === "coupons") {
            await fetchCoupons();
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API}/admin/stats`, { headers: getAuthHeaders() });
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
                setUsers(data.users || []);
                setUsersTotal(data.total || 0);
            }
        } catch (error) {
            toast.error("Error loading users");
        }
    };

    const fetchAnalytics = async () => {
        try {
            const demoResponse = await fetch(`${API}/admin/analytics/demographics`, { headers: getAuthHeaders() });
            const growthResponse = await fetch(`${API}/admin/analytics/growth`, { headers: getAuthHeaders() });

            if (demoResponse.ok) {
                const data = await demoResponse.json();
                setDemographics(data);
            }
            if (growthResponse.ok) {
                const data = await growthResponse.json();
                setGrowthData(data);
            }
        } catch (error) {
            toast.error("Error loading analytics");
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await fetch(`${API}/admin/coupons`, { headers: getAuthHeaders() });
            if (response.ok) {
                const data = await response.json();
                setCoupons(data.coupons || []);
            }
        } catch (error) {
            toast.error("Error loading coupons");
        }
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            const maxUsesParam = couponMaxUses ? `&max_uses=${couponMaxUses}` : "";
            const expiresParam = couponExpires ? `&expires_at=${couponExpires}` : "";
            const response = await fetch(`${API}/admin/coupons?code=${couponCode}&discount_percent=${couponDiscount}${maxUsesParam}${expiresParam}`, {
                method: "POST",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                toast.success("Coupon created successfully!");
                setShowCouponForm(false);
                setCouponCode("");
                setCouponDiscount(10);
                setCouponMaxUses("");
                setCouponExpires("");
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
        if (!window.confirm("Delete this coupon?")) return;
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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">🚀 Admin Panel</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your DeeMeet platform</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button onClick={() => setActiveTab("dashboard")} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "dashboard" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                        <Activity className="w-5 h-5" />Dashboard
                    </button>
                    <button onClick={() => setActiveTab("users")} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "users" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                        <Users className="w-5 h-5" />Users
                    </button>
                    <button onClick={() => setActiveTab("analytics")} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "analytics" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                        <BarChart3 className="w-5 h-5" />Analytics
                    </button>
                    <button onClick={() => setActiveTab("coupons")} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "coupons" ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                        <DollarSign className="w-5 h-5" />Coupons
                    </button>
                </div>

                {/* Dashboard Tab */}
                {activeTab === "dashboard" && stats && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.total_users}</div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Total Users</div>
                                <div className="text-xs text-slate-500">{stats.onboarded_users} completed onboarding</div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.bookings && stats.bookings.total ? stats.bookings.total : 0}</div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Total Bookings</div>
                                <div className="text-xs text-slate-500">{stats.bookings && stats.bookings.this_month ? stats.bookings.this_month : 0} this month</div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">${stats.revenue && stats.revenue.estimated_monthly ? stats.revenue.estimated_monthly : 0}</div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Revenue</div>
                                <div className="text-xs text-slate-500">Estimated monthly</div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.growth && stats.growth.new_users_this_week ? stats.growth.new_users_this_week : 0}</div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">New This Week</div>
                                <div className="text-xs text-slate-500">User growth</div>
                            </div>
                        </div>

                        {/* Plans */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Crown className="w-6 h-6 text-violet-600" />Plan Distribution
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.plans && stats.plans.free ? stats.plans.free : 0}</div>
                                    <div className="text-sm font-semibold">Free</div>
                                </div>
                                <div className="bg-violet-100 dark:bg-violet-900/30 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{stats.plans && stats.plans.pro ? stats.plans.pro : 0}</div>
                                    <div className="text-sm font-semibold">Pro</div>
                                </div>
                                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.plans && stats.plans.premium ? stats.plans.premium : 0}</div>
                                    <div className="text-sm font-semibold">Premium</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white" />
                            </div>
                        </div>

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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {users.map((user) => (
                                            <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 font-semibold">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                                                            {user.slug && <div className="text-sm text-slate-500">@{user.slug}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <select value={user.plan || "free"} onChange={(e) => updateUserPlan(user.user_id, e.target.value)} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 border-none font-semibold text-sm">
                                                        <option value="free">Free</option>
                                                        <option value="pro">Pro</option>
                                                        <option value="premium">Premium</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.booking_count || 0}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-slate-600 dark:text-slate-400">
                                Showing {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, usersTotal)} of {usersTotal}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                                <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * 50 >= usersTotal}>Next</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && demographics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-6 h-6 text-violet-600" />Top Countries
                                </h2>
                                <div className="space-y-3">
                                    {demographics.countries && demographics.countries.map((item) => (
                                        <div key={item.country} className="flex items-center justify-between">
                                            <span className="text-slate-700 dark:text-slate-300">{item.country || "Unknown"}</span>
                                            <span className="font-semibold text-violet-600">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-blue-600" />Top Timezones
                                </h2>
                                <div className="space-y-3">
                                    {demographics.timezones && demographics.timezones.map((item) => (
                                        <div key={item.timezone} className="flex items-center justify-between">
                                            <span className="text-slate-700 dark:text-slate-300">{item.timezone}</span>
                                            <span className="font-semibold text-blue-600">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {growthData && growthData.daily_signups && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-green-600" />User Growth (Last 30 Days)
                                </h2>
                                <div className="space-y-2">
                                    {growthData.daily_signups.map((item) => (
                                        <div key={item.date} className="flex items-center gap-3">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{item.date}</span>
                                            <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }} />
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
                        <Button onClick={() => setShowCouponForm(!showCouponForm)} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                            <Plus className="w-4 h-4 mr-2" />Create New Coupon
                        </Button>

                        {showCouponForm && (
                            <form onSubmit={createCoupon} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Coupon</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Coupon Code *</Label>
                                        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="SAVE20" required />
                                    </div>
                                    <div>
                                        <Label>Discount (%) *</Label>
                                        <Input type="number" value={couponDiscount} onChange={(e) => setCouponDiscount(parseInt(e.target.value))} min="1" max="100" required />
                                    </div>
                                    <div>
                                        <Label>Max Uses (optional)</Label>
                                        <Input type="number" value={couponMaxUses} onChange={(e) => setCouponMaxUses(e.target.value)} placeholder="Unlimited" />
                                    </div>
                                    <div>
                                        <Label>Expires At (optional)</Label>
                                        <Input type="date" value={couponExpires} onChange={(e) => setCouponExpires(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600">Create Coupon</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCouponForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coupons.map((coupon) => (
                                <div key={coupon.coupon_id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="text-2xl font-bold text-violet-600">{coupon.code}</div>
                                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{coupon.discount_percent}% OFF</div>
                                        </div>
                                        <button onClick={() => deleteCoupon(coupon.coupon_id)} className="text-red-500 hover:text-red-600">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        {coupon.max_uses && <div>Used: {coupon.current_uses} / {coupon.max_uses}</div>}
                                        {coupon.expires_at && <div>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</div>}
                                        <div className="text-xs text-slate-500">Created: {new Date(coupon.created_at).toLocaleDateString()}</div>
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

export default AdminPage;
