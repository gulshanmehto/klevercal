import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL as API } from "../config";
import { toast } from "sonner";
import { Users, TrendingUp, Calendar, DollarSign, Globe, Clock, Search, Plus, Trash2, Crown, BarChart3, Activity, LogOut, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const AdminPage = () => {
    const navigate = useNavigate();
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
        loadInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === "users") fetchUsers();
        else if (activeTab === "analytics") fetchAnalytics();
        else if (activeTab === "coupons") fetchCoupons();
    }, [activeTab, currentPage, searchQuery]);

    const loadInitialData = async () => {
        await fetchStats();
        setLoading(false);
    };

    const handleApiResponse = async (response) => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("klevercal_token");
            localStorage.removeItem("klevercal_user");
            toast.error("Session expired or unauthorized. Please login again.");
            navigate("/administrator-login");
            return false;
        }
        return response.ok;
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API}/admin/stats`, { headers: getAuthHeaders() });
            if (await handleApiResponse(response)) {
                const data = await response.json();
                setStats(data);
            } else if (response.ok) { // Should not happen if handleApiResponse returns false for non-ok
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            toast.error("Error loading stats");
        }
    };

    const fetchUsers = async () => {
        try {
            const skip = (currentPage - 1) * 50;
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
            const response = await fetch(`${API}/admin/users?skip=${skip}&limit=50${searchParam}`, { headers: getAuthHeaders() });
            if (await handleApiResponse(response)) {
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

            if (await handleApiResponse(demoResponse)) setDemographics(await demoResponse.json());
            if (await handleApiResponse(growthResponse)) setGrowthData(await growthResponse.json());
        } catch (error) {
            toast.error("Error loading analytics");
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await fetch(`${API}/admin/coupons`, { headers: getAuthHeaders() });
            if (await handleApiResponse(response)) {
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
                toast.success("Coupon created!");
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
            const response = await fetch(`${API}/admin/coupons/${couponId}`, { method: "DELETE", headers: getAuthHeaders() });
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

    const handleLogout = () => {
        localStorage.removeItem("klevercal_token");
        localStorage.removeItem("klevercal_user");
        toast.success("Logged out successfully");
        navigate("/administrator-login", { replace: true });
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

    const userEmail = JSON.parse(localStorage.getItem("klevercal_user") || "{}").email || "Admin";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">🚀 Admin Panel</h1>
                        <p className="text-slate-600 dark:text-slate-400">Manage your DeeMeet platform</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{userEmail}</p>
                                <p className="text-xs text-slate-500">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-all border border-red-200 dark:border-red-800"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={Activity} label="Dashboard" />
                    <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={Users} label="Users" />
                    <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon={BarChart3} label="Analytics" />
                    <TabButton active={activeTab === "coupons"} onClick={() => setActiveTab("coupons")} icon={DollarSign} label="Coupons" />
                </div>

                {activeTab === "dashboard" && stats && <DashboardTab stats={stats} />}
                {activeTab === "users" && <UsersTab users={users} usersTotal={usersTotal} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage={currentPage} setCurrentPage={setCurrentPage} updateUserPlan={updateUserPlan} />}
                {activeTab === "analytics" && demographics && <AnalyticsTab demographics={demographics} growthData={growthData} />}
                {activeTab === "coupons" && <CouponsTab coupons={coupons} showCouponForm={showCouponForm} setShowCouponForm={setShowCouponForm} couponCode={couponCode} setCouponCode={setCouponCode} couponDiscount={couponDiscount} setCouponDiscount={setCouponDiscount} couponMaxUses={couponMaxUses} setCouponMaxUses={setCouponMaxUses} couponExpires={couponExpires} setCouponExpires={setCouponExpires} createCoupon={createCoupon} deleteCoupon={deleteCoupon} />}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${active ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
        <Icon className="w-5 h-5" />{label}
    </button>
);

const DashboardTab = ({ stats }) => {
    const totalUsers = stats.total_users || 0;
    const onboardedUsers = stats.onboarded_users || 0;
    const totalBookings = stats.bookings ? stats.bookings.total || 0 : 0;
    const bookingsThisMonth = stats.bookings ? stats.bookings.this_month || 0 : 0;
    const revenue = stats.revenue ? stats.revenue.estimated_monthly || 0 : 0;
    const newUsersWeek = stats.growth ? stats.growth.new_users_this_week || 0 : 0;
    const freePlan = stats.plans ? stats.plans.free || 0 : 0;
    const proPlan = stats.plans ? stats.plans.pro || 0 : 0;
    const premiumPlan = stats.plans ? stats.plans.premium || 0 : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} title="Total Users" value={totalUsers} subtitle={`${onboardedUsers} completed onboarding`} color="violet" />
                <StatCard icon={Calendar} title="Total Bookings" value={totalBookings} subtitle={`${bookingsThisMonth} this month`} color="blue" />
                <StatCard icon={DollarSign} title="Revenue" value={`$${revenue}`} subtitle="Estimated monthly" color="green" />
                <StatCard icon={TrendingUp} title="New This Week" value={newUsersWeek} subtitle="User growth" color="pink" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-violet-600" />Plan Distribution
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <PlanCard plan="Free" count={freePlan} color="slate" />
                    <PlanCard plan="Pro" count={proPlan} color="violet" />
                    <PlanCard plan="Premium" count={premiumPlan} color="gold" />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
    const colors = { violet: "from-violet-500 to-purple-600", blue: "from-blue-500 to-cyan-600", green: "from-green-500 to-emerald-600", pink: "from-pink-500 to-rose-600" };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{title}</div>
            <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
    );
};

const PlanCard = ({ plan, count, color }) => {
    const colors = { slate: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300", violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", gold: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" };
    return (
        <div className={`${colors[color]} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm font-semibold">{plan}</div>
        </div>
    );
};

const UsersTab = ({ users, usersTotal, searchQuery, setSearchQuery, currentPage, setCurrentPage, updateUserPlan }) => (
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
                        {users.length > 0 ? users.map(user => <UserRow key={user.user_id} user={user} updateUserPlan={updateUserPlan} />) : <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No users found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400">Showing {((currentPage - 1) * 50) + 1} - {Math.min(currentPage * 50, usersTotal)} of {usersTotal}</p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * 50 >= usersTotal}>Next</Button>
            </div>
        </div>
    </div>
);

const UserRow = ({ user, updateUserPlan }) => {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A";
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 font-semibold">{initial}</div>
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
            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{joinDate}</td>
        </tr>
    );
};

const AnalyticsTab = ({ demographics, growthData }) => {
    const countries = demographics.countries || [];
    const timezones = demographics.timezones || [];
    const dailySignups = growthData && growthData.daily_signups ? growthData.daily_signups : [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-violet-600" />Top Countries
                    </h2>
                    <div className="space-y-3">
                        {countries.length > 0 ? countries.map(item => <CountryRow key={item.country} country={item.country || "Unknown"} count={item.count} />) : <p className="text-slate-500">No data</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />Top Timezones
                    </h2>
                    <div className="space-y-3">
                        {timezones.length > 0 ? timezones.map(item => <TimezoneRow key={item.timezone} timezone={item.timezone} count={item.count} />) : <p className="text-slate-500">No data</p>}
                    </div>
                </div>
            </div>

            {dailySignups.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />User Growth (Last 30 Days)
                    </h2>
                    <div className="space-y-2">
                        {dailySignups.map(item => <GrowthRow key={item.date} date={item.date} count={item.count} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

const CountryRow = ({ country, count }) => (
    <div className="flex items-center justify-between">
        <span className="text-slate-700 dark:text-slate-300">{country}</span>
        <span className="font-semibold text-violet-600">{count}</span>
    </div>
);

const TimezoneRow = ({ timezone, count }) => (
    <div className="flex items-center justify-between">
        <span className="text-slate-700 dark:text-slate-300">{timezone}</span>
        <span className="font-semibold text-blue-600">{count}</span>
    </div>
);

const GrowthRow = ({ date, count }) => {
    const widthPercent = Math.min((count / 10) * 100, 100);
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{date}</span>
            <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${widthPercent}%` }} />
            </div>
            <span className="font-semibold text-green-600 w-12">{count}</span>
        </div>
    );
};

const CouponsTab = ({ coupons, showCouponForm, setShowCouponForm, couponCode, setCouponCode, couponDiscount, setCouponDiscount, couponMaxUses, setCouponMaxUses, couponExpires, setCouponExpires, createCoupon, deleteCoupon }) => (
    <div className="space-y-6">
        <Button onClick={() => setShowCouponForm(!showCouponForm)} className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />Create New Coupon
        </Button>

        {showCouponForm && (
            <form onSubmit={createCoupon} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Coupon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Coupon Code *</Label><Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="SAVE20" required /></div>
                    <div><Label>Discount (%) *</Label><Input type="number" value={couponDiscount} onChange={(e) => setCouponDiscount(parseInt(e.target.value))} min="1" max="100" required /></div>
                    <div><Label>Max Uses (optional)</Label><Input type="number" value={couponMaxUses} onChange={(e) => setCouponMaxUses(e.target.value)} placeholder="Unlimited" /></div>
                    <div><Label>Expires At (optional)</Label><Input type="date" value={couponExpires} onChange={(e) => setCouponExpires(e.target.value)} /></div>
                </div>
                <div className="flex gap-3 mt-4">
                    <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600">Create Coupon</Button>
                    <Button type="button" variant="outline" onClick={() => setShowCouponForm(false)}>Cancel</Button>
                </div>
            </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.length > 0 ? coupons.map(coupon => <CouponCard key={coupon.coupon_id} coupon={coupon} deleteCoupon={deleteCoupon} />) : <p className="text-slate-500 col-span-3">No coupons yet</p>}
        </div>
    </div>
);

const CouponCard = ({ coupon, deleteCoupon }) => {
    const createdDate = new Date(coupon.created_at).toLocaleDateString();
    const expiresDate = coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : null;
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
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
                {expiresDate && <div>Expires: {expiresDate}</div>}
                <div className="text-xs text-slate-500">Created: {createdDate}</div>
            </div>
        </div>
    );
};

export default AdminPage;
