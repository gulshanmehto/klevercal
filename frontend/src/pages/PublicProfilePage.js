import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL as API } from "../config";
import { Loader2, Clock, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const PublicProfilePage = () => {
    const { slug } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        fetchProfile();
    }, [slug]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/public/profile/${slug}`);
            if (!response.ok) {
                throw new Error("Profile not found");
            }
            const data = await response.json();
            setProfile(data);
        } catch (error) {
            toast.error("User not found or URL is incorrect");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User not found</h1>
                <p className="text-slate-500">The link you visited seems to be incorrect or expired.</p>
                <Link to="/" className="text-violet-600 hover:underline">Go to DeeMeet Home</Link>
            </div>
        );
    }

    const { user, booking_types } = profile;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4">
            {/* Branding Ribbon */}
            {user.use_branding && (
                <div className="absolute top-0 right-0 p-4">
                    {/* If you want a fixed badge like "Powered by DeeMeet" similar to Calendly */}
                    <div className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity">
                        Powered by DeeMeet
                    </div>
                </div>
            )}

            {/* Main Card */}
            <Card className="max-w-3xl w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800">
                <div className="p-12 text-center border-b border-slate-100 dark:border-slate-800">

                    {/* Avatar */}
                    <div className="mx-auto w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center overflow-hidden mb-6 shadow-md border-4 border-white dark:border-slate-800">
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>

                    {user.welcome_message && (
                        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
                            {user.welcome_message}
                        </p>
                    )}
                </div>

                <div className="p-8 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                    {booking_types.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No active event types found.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {booking_types.map((type) => (
                                <Link
                                    key={type.booking_type_id}
                                    to={`/book/${type.slug}`}
                                    className="group block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all shadow-sm"
                                    style={{ borderLeft: `6px solid ${type.color}` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 transition-colors">
                                                {type.title}
                                            </h3>
                                            <div className="flex items-center text-slate-500 text-sm gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {type.duration} mins
                                                </span>
                                                <span>
                                                    {type.description && type.description.length > 60 ? type.description.substring(0, 60) + "..." : type.description}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Footer Branding */}
            <div className="mt-8">
                <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium">
                    Create your own booking page with <span className="text-violet-600 font-bold">DeeMeet</span>
                </Link>
            </div>
        </div>
    );
};

export default PublicProfilePage;
