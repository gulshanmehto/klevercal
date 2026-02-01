import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardPage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { User, Save, Loader2, Palette, Globe, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfilePage = () => {
  const { user, getAuthHeaders, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    brand_color: "#7c3aed",
    timezone: "UTC"
  });
  const [saving, setSaving] = useState(false);
  const [bookingTypes, setBookingTypes] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        brand_color: user.brand_color || "#7c3aed",
        timezone: user.timezone || "UTC"
      });
    }
    fetchBookingTypes();
  }, [user]);

  const fetchBookingTypes = async () => {
    try {
      const response = await fetch(`${API}/booking-types`, {
        headers: getAuthHeaders(),
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setBookingTypes(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Profile updated!");
        checkAuth(); // Refresh user data
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const colorOptions = [
    "#7c3aed", "#6366f1", "#3b82f6", "#10b981", 
    "#f59e0b", "#ef4444", "#ec4899", "#6b7280"
  ];

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney"
  ];

  const copyLink = (slug) => {
    const link = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account and branding settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800"
                    data-testid="profile-email-input"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    data-testid="profile-name-input"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="rounded-full bg-violet-600 hover:bg-violet-700"
                  data-testid="save-profile-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-600" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Brand Color</Label>
                <div className="flex gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, brand_color: color });
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                        formData.brand_color === color 
                          ? "border-slate-900 dark:border-white scale-110" 
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      data-testid={`color-${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Timezone
                </Label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3"
                  data-testid="timezone-select"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={saving}
                className="rounded-full bg-violet-600 hover:bg-violet-700"
                data-testid="save-branding-btn"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Branding
              </Button>
            </CardContent>
          </Card>

          {/* Booking Links */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-violet-600" />
                Your Booking Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookingTypes.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400">No meeting types created yet</p>
              ) : (
                bookingTypes.map((type) => (
                  <div 
                    key={type.booking_type_id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    data-testid={`booking-link-${type.booking_type_id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-8 rounded-full" style={{ backgroundColor: type.color }} />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{type.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {window.location.origin}/book/{type.slug}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(type.slug)}
                        data-testid={`copy-link-${type.booking_type_id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/book/${type.slug}`, "_blank")}
                        data-testid={`open-link-${type.booking_type_id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
