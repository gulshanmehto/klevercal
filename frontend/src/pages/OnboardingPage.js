import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Camera, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "../config";
import { useAuth } from "../context/AuthContext";
import Confetti from "react-confetti";

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { user, getAuthHeaders, checkAuth } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Step 1: Username + Profile Picture
    const [username, setUsername] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState(user?.picture || "");

    // Step 2: Availability
    const [availability, setAvailability] = useState([
        { day: 0, enabled: false, start_time: "09:00", end_time: "17:00", label: "Sunday" },
        { day: 1, enabled: true, start_time: "09:00", end_time: "17:00", label: "Monday" },
        { day: 2, enabled: true, start_time: "09:00", end_time: "17:00", label: "Tuesday" },
        { day: 3, enabled: true, start_time: "09:00", end_time: "17:00", label: "Wednesday" },
        { day: 4, enabled: true, start_time: "09:00", end_time: "17:00", label: "Thursday" },
        { day: 5, enabled: true, start_time: "09:00", end_time: "17:00", label: "Friday" },
        { day: 6, enabled: false, start_time: "09:00", end_time: "17:00", label: "Saturday" },
    ]);

    useEffect(() => {
        if (user?.slug) {
            // User already completed onboarding
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setProfilePicture(file);
        setProfilePictureUrl(URL.createObjectURL(file));
    };

    const handleStep1Submit = async () => {
        if (!username) {
            toast.error("Please enter a username");
            return;
        }

        setLoading(true);
        try {
            // Upload profile picture if selected
            let pictureUrl = profilePictureUrl;
            if (profilePicture) {
                const uploadData = new FormData();
                uploadData.append("file", profilePicture);

                const uploadResponse = await fetch(`${API}/upload`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: uploadData,
                });

                if (uploadResponse.ok) {
                    const data = await uploadResponse.json();
                    pictureUrl = data.url;
                }
            }

            // Save username and picture
            const response = await fetch(`${API}/profile`, {
                method: "PUT",
                headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: username.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    picture: pictureUrl,
                }),
            });

            if (response.ok) {
                await checkAuth();
                setStep(2);
            } else {
                const error = await response.json();
                toast.error(error.detail || "Failed to save username");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async () => {
        setLoading(true);
        try {
            const slots = availability
                .filter((day) => day.enabled)
                .map((day) => ({
                    day: day.day,
                    start_time: day.start_time,
                    end_time: day.end_time,
                }));

            const response = await fetch(`${API}/availability`, {
                method: "PUT",
                headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ slots }),
            });

            if (response.ok) {
                setStep(3);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            } else {
                toast.error("Failed to save availability");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (index) => {
        setAvailability((prev) =>
            prev.map((day, i) => (i === index ? { ...day, enabled: !day.enabled } : day))
        );
    };

    const updateTime = (index, field, value) => {
        setAvailability((prev) =>
            prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-6">
            {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`flex-1 h-2 rounded-full mx-1 transition-all ${s <= step
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                                        : "bg-slate-200 dark:bg-slate-800"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step 1: Username + Profile Picture */}
                {step === 1 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-12 border border-slate-200 dark:border-slate-800">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Hi {user?.name} 👋 Welcome to DeeMeet
                        </h1>
                        <p className="text-slate-500 mb-8">First things first...let's set up your account.</p>

                        <div className="space-y-6">
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300 font-semibold mb-2">
                                    Username *
                                </Label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                    placeholder="yourname"
                                    className="h-12 text-lg"
                                />
                                <p className="text-sm text-slate-500 mt-2">
                                    Your link: deemeet.in/{username || "yourname"}
                                </p>
                            </div>

                            <div>
                                <Label className="text-slate-700 dark:text-slate-300 font-semibold mb-3 block">
                                    Profile Picture
                                </Label>
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                                            {profilePictureUrl ? (
                                                <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                            <Camera className="w-6 h-6" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleProfilePictureUpload}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <label>
                                            <Button variant="outline" className="rounded-full pointer-events-none">
                                                Upload Photo
                                            </Button>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleProfilePictureUpload}
                                            />
                                        </label>
                                        <p className="text-xs text-slate-400 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleStep1Submit}
                            disabled={loading || !username}
                            className="w-full mt-8 h-14 text-lg rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        >
                            {loading ? "Saving..." : "Next"}
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Step 2: Availability */}
                {step === 2 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-12 border border-slate-200 dark:border-slate-800">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Set your saved availability
                        </h1>
                        <p className="text-slate-500 mb-8">
                            Set your preferred weekly hours for new scheduling links.
                        </p>

                        <div className="space-y-3">
                            {availability.map((day, index) => (
                                <div
                                    key={day.day}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                                >
                                    <input
                                        type="checkbox"
                                        checked={day.enabled}
                                        onChange={() => toggleDay(index)}
                                        className="w-5 h-5 rounded accent-violet-600 cursor-pointer"
                                    />
                                    <div className="w-28 font-medium text-slate-700 dark:text-slate-300">
                                        {day.label}
                                    </div>
                                    {day.enabled && (
                                        <div className="flex items-center gap-3 flex-1">
                                            <input
                                                type="time"
                                                value={day.start_time}
                                                onChange={(e) => updateTime(index, "start_time", e.target.value)}
                                                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input
                                                type="time"
                                                value={day.end_time}
                                                onChange={(e) => updateTime(index, "end_time", e.target.value)}
                                                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button
                                onClick={() => setStep(1)}
                                variant="outline"
                                className="flex-1 h-14 text-lg rounded-full"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleStep2Submit}
                                disabled={loading}
                                className="flex-1 h-14 text-lg rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                {loading ? "Saving..." : "Let's go!"}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Welcome Celebration */}
                {step === 3 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Welcome to DeeMeet!
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                            You're all set! Let's start scheduling meetings.
                        </p>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="h-14 px-12 text-lg rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            Go to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingPage;
