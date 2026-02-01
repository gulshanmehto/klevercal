import { useState, useEffect } from "react";
import { DashboardLayout } from "./DashboardPage";
import { useAuth } from "../context/AuthContext";
import { API_URL as API } from "../config";
import { toast } from "sonner";
import {
    Search,
    CheckCircle2,
    ExternalLink,
    Calendar,
    Info,
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const IntegrationCard = ({ id, name, description, icon: Icon, connected, onConnect, onDisconnect, color, loading }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-').replace('-100', '-600')}`} />
                </div>
                {connected ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-800">
                        Available
                    </Badge>
                )}
            </div>
            <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                    {name}
                </CardTitle>
                <CardDescription className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-violet-600 dark:text-slate-400"
                >
                    <Info className="w-4 h-4 mr-2" />
                    Learn more
                </Button>
                {connected ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/20"
                        onClick={() => onDisconnect(id)}
                        disabled={loading}
                    >
                        Disconnect
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-none"
                        onClick={() => onConnect(id)}
                        disabled={loading}
                    >
                        Connect
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
);

const IntegrationsPage = () => {
    const { user, getAuthHeaders, checkAuth } = useAuth();
    const [loadingId, setLoadingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("discover");

    const integrations = [
        {
            id: "google",
            name: "Google Calendar",
            description: "Sync events and check availability with your Google accounts.",
            icon: Globe,
            color: "bg-blue-100",
            connected: user?.google_calendar_connected || false
        },
        {
            id: "outlook",
            name: "Outlook Calendar",
            description: "Connect your Microsoft 365 or Outlook.com calendar for seamless scheduling.",
            icon: Calendar,
            color: "bg-sky-100",
            connected: user?.outlook_calendar_connected || false
        },
        {
            id: "apple",
            name: "Apple iCloud",
            description: "Connect your iCloud calendar to sync events with your Apple devices.",
            icon: ShieldCheck,
            color: "bg-slate-100",
            connected: user?.apple_calendar_connected || false
        },
        {
            id: "zoom",
            name: "Zoom",
            description: "Automatically create Zoom meetings for your scheduled events.",
            icon: ExternalLink,
            color: "bg-blue-50",
            connected: false
        }
    ];

    const handleConnect = async (id) => {
        setLoadingId(id);
        try {
            if (id === "google") {
                const response = await fetch(`${API}/calendar/google/connect`, {
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    const data = await response.json();
                    window.location.href = data.authorization_url;
                } else {
                    toast.error("Failed to initiate Google connection");
                }
            } else {
                // Outlook or Apple
                const response = await fetch(`${API}/calendar/${id}/connect`, {
                    method: "POST",
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} Calendar connected`);
                    await checkAuth();
                } else {
                    toast.error(`Failed to connect ${id} Calendar`);
                }
            }
        } catch (error) {
            toast.error(`Error connecting to ${id}`);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDisconnect = async (id) => {
        if (!window.confirm(`Disconnect ${id.charAt(0).toUpperCase() + id.slice(1)} Calendar?`)) return;
        setLoadingId(id);
        try {
            const response = await fetch(`${API}/calendar/${id}/disconnect`, {
                method: "POST",
                headers: getAuthHeaders()
            });
            if (response.ok) {
                toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} Calendar disconnected`);
                await checkAuth();
            } else {
                toast.error(`Failed to disconnect ${id} Calendar`);
            }
        } catch (error) {
            toast.error(`Error disconnecting ${id} Calendar`);
        } finally {
            setLoadingId(null);
        }
    };

    const filteredIntegrations = integrations.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                            Integrations & apps
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            Connect DeeMeet to your favorite calendars and tools to automate your workflow and avoid double-booking.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        3 Integrations available
                    </div>
                </div>

                {/* Tabs and Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab("discover")}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "discover"
                                ? "bg-white dark:bg-slate-800 text-violet-600 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            Discover
                        </button>
                        <button
                            onClick={() => setActiveTab("manage")}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "manage"
                                ? "bg-white dark:bg-slate-800 text-violet-600 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            Manage ({integrations.filter(i => i.connected).length})
                        </button>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Find integrations, apps, and more"
                            className="pl-12 py-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-violet-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Banner Section */}
                {activeTab === "discover" && searchQuery === "" && (
                    <div className="mb-12 relative overflow-hidden rounded-3xl bg-[#f7f9fc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 mb-4 px-3 py-1">Getting Started</Badge>
                                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">DeeMeet works where you work</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                    Connect DeeMeet to your favorite calendars, tools, and apps to enhance your scheduling automations and avoid overlapping in meetings.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button variant="outline" className="rounded-full px-8 py-6 font-semibold text-lg border-violet-200 text-violet-700 hover:bg-violet-50">
                                        <Info className="w-5 h-4 mr-2" />
                                        Learn more
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="w-80 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2"></div>
                                        <div className="w-12 h-6 rounded-full bg-violet-600"></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-sky-600" />
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3"></div>
                                        <div className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3"></div>
                                        <div className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    </div>
                                </div>
                                {/* Dynamic circles for effect */}
                                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-violet-200/50 rounded-full blur-2xl -z-10"></div>
                                <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-200/50 rounded-full blur-2xl -z-10"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(activeTab === "discover" ? filteredIntegrations : filteredIntegrations.filter(i => i.connected)).map(integration => (
                        <IntegrationCard
                            key={integration.id}
                            {...integration}
                            loading={loadingId === integration.id}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                        />
                    ))}
                    {activeTab === "manage" && integrations.filter(i => i.connected).length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No connected integrations</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">Go to 'Discover' to connect your first calendar.</p>
                            <Button
                                onClick={() => setActiveTab("discover")}
                                className="bg-violet-600 hover:bg-violet-700 rounded-full"
                            >
                                Browse Integrations
                            </Button>
                        </div>
                    )}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <p className="text-slate-500 mb-6 font-medium">Can't find what you're looking for?</p>
                    <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Request an integration
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default IntegrationsPage;
