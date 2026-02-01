import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Calendar, Clock, Users, BarChart3, Plus, ArrowRight,
  CalendarDays, CheckCircle2, TrendingUp, Sparkles,
  LayoutDashboard, Settings, LogOut, User, Zap
} from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "../config";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: CalendarDays, label: "Meeting Types", path: "/meeting-types" },
    { icon: Clock, label: "Availability", path: "/availability" },
    { icon: Users, label: "Bookings", path: "/bookings" },
    { icon: Sparkles, label: "AI Assistant", path: "/ai-assistant" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">DeeMeet</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <span className="text-violet-700 dark:text-violet-300 font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 dark:text-white truncate">{user?.name || "User"}</div>
              <div className="text-sm text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

const DashboardPage = () => {
  const { user, getAuthHeaders } = useAuth();
  const [stats, setStats] = useState({
    total_appointments: 0,
    upcoming_appointments: 0,
    this_week_appointments: 0,
    active_booking_types: 0
  });
  const [bookingTypes, setBookingTypes] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };

      const [statsRes, typesRes, appointmentsRes] = await Promise.all([
        fetch(`${API}/dashboard/stats`, { headers,  }),
        fetch(`${API}/booking-types`, { headers,  }),
        fetch(`${API}/appointments?status=confirmed`, { headers,  })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setBookingTypes(typesData);
      }
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        // Filter upcoming
        const now = new Date();
        const upcoming = appointmentsData
          .filter(a => new Date(a.start_time) > now)
          .slice(0, 5);
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: CalendarDays,
      label: "Total Meetings",
      value: stats.total_appointments,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
    },
    {
      icon: Clock,
      label: "Upcoming",
      value: stats.upcoming_appointments,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
    },
    {
      icon: TrendingUp,
      label: "This Week",
      value: stats.this_week_appointments,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    },
    {
      icon: BarChart3,
      label: "Active Types",
      value: stats.active_booking_types,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    }
  ];

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your calendar
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              data-testid={`stat-card-${index}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Types */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Your Meeting Types
              </CardTitle>
              <Link to="/meeting-types">
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookingTypes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No meeting types yet</p>
                  <Link to="/meeting-types">
                    <Button className="rounded-full bg-violet-600 hover:bg-violet-700" data-testid="create-meeting-type-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first
                    </Button>
                  </Link>
                </div>
              ) : (
                bookingTypes.slice(0, 4).map((type) => (
                  <div
                    key={type.booking_type_id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    data-testid={`booking-type-${type.booking_type_id}`}
                  >
                    <div
                      className="w-3 h-10 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white">{type.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{type.duration} min</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 dark:text-slate-400"
                      onClick={() => {
                        const link = `${window.location.origin}/book/${type.slug}`;
                        navigator.clipboard.writeText(link);
                        toast.success("Link copied!");
                      }}
                      data-testid={`copy-link-${type.booking_type_id}`}
                    >
                      Copy link
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Upcoming Meetings
              </CardTitle>
              <Link to="/bookings">
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">No upcoming meetings</p>
                </div>
              ) : (
                upcomingAppointments.map((appt) => {
                  const { date, time } = formatDateTime(appt.start_time);
                  return (
                    <div
                      key={appt.appointment_id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      data-testid={`appointment-${appt.appointment_id}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white">{appt.guest_name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{appt.guest_email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900 dark:text-white">{date}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{time}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 rounded-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Quick Schedule with AI</h3>
                  <p className="text-violet-100">Use natural language to find the best time</p>
                </div>
              </div>
              <Link to="/ai-assistant">
                <Button className="rounded-full bg-white text-violet-700 hover:bg-violet-50" data-testid="ai-assistant-btn">
                  Try AI Assistant
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export { DashboardLayout };
export default DashboardPage;
