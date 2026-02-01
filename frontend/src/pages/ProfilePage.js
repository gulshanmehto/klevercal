import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardPage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../components/ui/select";
import {
  User, Camera, Trash2, Globe, Clock, Calendar,
  MapPin, Languages, Palette, Link2, ChevronLeft,
  Loader2, Save, ExternalLink, ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "../config";

const ProfilePage = () => {
  const { user, getAuthHeaders, checkAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  const [formData, setFormData] = useState({
    name: "",
    welcome_message: "",
    language: "English",
    date_format: "DD/MM/YYYY",
    time_format: "12h",
    country: "India",
    timezone: "UTC",
    brand_color: "#7c3aed",
    use_branding: true,
    picture: null,
    logo_url: null,
    slug: ""
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        welcome_message: user.welcome_message ?? "Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.",
        language: user.language ?? "English",
        date_format: user.date_format ?? "DD/MM/YYYY",
        time_format: user.time_format ?? "12h",
        country: user.country ?? "India",
        timezone: user.timezone ?? "UTC",
        brand_color: user.brand_color ?? "#7c3aed",
        use_branding: user.use_branding !== undefined ? user.use_branding : true,
        picture: user.picture,
        logo_url: user.logo_url,
        slug: user.slug ?? ""
      });
      setLoading(false);
    }
  }, [user]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size limits to 5MB");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch(`${API}/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: uploadData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url; // ImgBB returns full CDN URL
        if (type === "picture") {
          setFormData(prev => ({ ...prev, picture: imageUrl }));
        } else if (type === "logo") {
          setFormData(prev => ({ ...prev, logo_url: imageUrl }));
        }
        toast.success("Image uploaded successfully");
        // Save image to profile without updating slug
        await handleImageUpdate(imageUrl, type);
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
    }
  };

  const handleImageUpdate = async (imageUrl, type) => {
    try {
      const updateData = type === "picture" ? { picture: imageUrl } : { logo_url: imageUrl };
      const response = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        checkAuth();
      }
    } catch (error) {
      console.error("Failed to save image:", error);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },

        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Settings updated successfully!");
        checkAuth();
      } else {
        const data = await response.json();
        toast.error(data.detail || "Failed to update settings");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "mylink", label: "My Link", icon: Link2 },
  ];

  const timezones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney", "Asia/Kolkata"
  ];

  const languages = ["English", "Spanish", "French", "German", "Hindi", "Japanese", "Chinese"];
  const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
  const timeFormats = ["12h (am/pm)", "24h"];
  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France"];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Settings Sidebar */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 p-6 space-y-8 bg-white dark:bg-slate-900/50">
          <div>
            <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-violet-600 flex items-center gap-1 mb-6">
              <ChevronLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Account settings</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-violet-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-50/30 dark:bg-slate-950 p-12">
          <div className="max-w-3xl mx-auto">
            <header className="mb-10">
              <div className="text-sm text-slate-500 font-medium mb-1 capitalize">Account details</div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace("mylink", "My link")}</h1>
            </header>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-10">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg">
                      {formData.picture ? (
                        <img src={formData.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "picture")} />
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <label>
                      <Button variant="outline" className="rounded-full px-6 pointer-events-none">Update</Button>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "picture")} />
                    </label>
                    <Button
                      variant="ghost"
                      className="rounded-full text-slate-500 hover:text-rose-600"
                      onClick={() => setFormData({ ...formData, picture: null })}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-semibold">Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 bg-white dark:bg-slate-900 border-slate-200"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-semibold">Welcome Message</Label>
                      <Textarea
                        value={formData.welcome_message}
                        onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                        className="min-h-[120px] bg-white dark:bg-slate-900 border-slate-200 resize-none py-3"
                        placeholder="Welcome to my scheduling page..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Language</Label>
                        <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Country</Label>
                        <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Date Format</Label>
                        <Select value={formData.date_format} onValueChange={(v) => setFormData({ ...formData, date_format: v })}>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dateFormats.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Time Format</Label>
                        <Select value={formData.time_format} onValueChange={(v) => setFormData({ ...formData, time_format: v })}>
                          <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeFormats.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                        Time Zone
                        <span className="text-xs font-normal text-slate-500">(Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                      </Label>
                      <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
                        <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-start pt-6">
                    <Button
                      type="submit"
                      className="rounded-full bg-violet-600 hover:bg-violet-700 px-8 py-6 text-base font-semibold transition-all hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-none"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="space-y-10">
                <section className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Logo</h3>
                    <p className="text-sm text-slate-500">Your company branding will appear at the top-left corner of the scheduling page.</p>
                  </div>

                  <div className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 overflow-hidden relative">
                    {formData.logo_url ? (
                      <div className="relative w-full h-full group">
                        <img src={formData.logo_url} alt="Brand Logo" className="w-full h-full object-contain p-4" />
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <label>
                            <Button variant="secondary" className="pointer-events-none">Change Logo</Button>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-slate-400 font-medium text-lg mb-4">No Logo</span>
                        <label>
                          <Button variant="outline" className="rounded-full px-8 pointer-events-none">Upload image</Button>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
                        </label>
                        <p className="text-xs text-slate-400 mt-4">JPG, GIF or PNG. Max size of 5MB.</p>
                      </>
                    )}
                  </div>
                </section>

                <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Use DeeMeet branding</h3>
                      <p className="text-sm text-slate-500 max-w-md">DeeMeet's branding will be displayed on your scheduling page, notifications, and confirmations.</p>
                    </div>
                    <Switch
                      checked={formData.use_branding}
                      onCheckedChange={(checked) => setFormData({ ...formData, use_branding: checked })}
                    />
                  </div>
                </section>

                <div className="pt-8 flex gap-4">
                  <Button
                    onClick={handleUpdate}
                    className="rounded-full bg-violet-600 hover:bg-violet-700 px-8 py-6 text-base font-semibold"
                    disabled={saving}
                  >
                    Save Changes
                  </Button>
                  <Button variant="ghost" className="rounded-full px-8 py-6 text-base font-semibold text-slate-500">Cancel</Button>
                </div>
              </div>
            )}

            {/* My Link Tab */}
            {activeTab === "mylink" && (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    Changing your DeeMeet URL will mean that all of your copied links will no longer work and will need to be updated.
                  </div>
                </div>


                {formData.slug && (
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-semibold">Your Current Link</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                        <div className="text-violet-600 dark:text-violet-400 font-medium">https://deemeet.in/{formData.slug}</div>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl h-12 px-6"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://deemeet.in/${formData.slug}`);
                          toast.success("Link copied to clipboard!");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-slate-700 dark:text-slate-300 font-semibold">Change Your Link</Label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 h-12 rounded-xl flex items-center text-slate-500 font-medium">deemeet.in/</div>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      className="h-12 bg-white dark:bg-slate-900 border-slate-200 flex-1"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    onClick={handleUpdate}
                    className="rounded-full bg-violet-600 hover:bg-violet-700 px-8 py-6 text-base font-semibold"
                    disabled={saving}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
