import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardPage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Plus, Edit2, Trash2, Copy, ExternalLink, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "../config";

const MeetingTypesPage = () => {
  const { getAuthHeaders, user } = useAuth();
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    color: "#7c3aed",
    is_active: true,
    buffer_before: 0,
    buffer_after: 15,
    min_notice: 60,
    max_bookings_per_day: null,
    max_bookings_per_day: null,
    questions: [],
    location_type: "google_meet",
    location_details: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookingTypes();
  }, []);

  const fetchBookingTypes = async () => {
    try {
      const response = await fetch(`${API}/booking-types`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setBookingTypes(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load meeting types");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingType
        ? `${API}/booking-types/${editingType.booking_type_id}`
        : `${API}/booking-types`;

      const response = await fetch(url, {
        method: editingType ? "PUT" : "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingType ? "Meeting type updated!" : "Meeting type created!");
        setDialogOpen(false);
        resetForm();
        fetchBookingTypes();
      } else {
        toast.error(data.detail || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this meeting type?")) return;

    try {
      const response = await fetch(`${API}/booking-types/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast.success("Meeting type deleted");
        fetchBookingTypes();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 30,
      color: "#7c3aed",
      is_active: true,
      buffer_before: 0,
      buffer_after: 15,
      min_notice: 60,
      max_bookings_per_day: null,
      max_bookings_per_day: null,
      questions: [],
      location_type: "google_meet",
      location_details: ""
    });
    setEditingType(null);
  };

  const openEditDialog = (type) => {
    setEditingType(type);
    setFormData({
      title: type.title,
      description: type.description,
      duration: type.duration,
      color: type.color,
      is_active: type.is_active,
      buffer_before: type.buffer_before,
      buffer_after: type.buffer_after,
      min_notice: type.min_notice,
      max_bookings_per_day: type.max_bookings_per_day,
      max_bookings_per_day: type.max_bookings_per_day,
      questions: type.questions || [],
      location_type: type.location_type || "google_meet",
      location_details: type.location_details || ""
    });
    setDialogOpen(true);
  };

  const copyLink = (slug) => {
    const link = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Booking link copied!");
  };

  const colorOptions = [
    { value: "#7c3aed", label: "Violet" },
    { value: "#6366f1", label: "Indigo" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Emerald" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#ef4444", label: "Red" },
    { value: "#ec4899", label: "Pink" },
    { value: "#6b7280", label: "Gray" }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Meeting Types</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Create and manage your booking types
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-violet-600 hover:bg-violet-700" data-testid="create-meeting-type-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Meeting Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingType ? "Edit Meeting Type" : "Create Meeting Type"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="30 Minute Meeting"
                    required
                    data-testid="meeting-type-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="A quick call to discuss..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={formData.location_type}
                    onValueChange={(v) => setFormData({ ...formData, location_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_meet">Google Meet</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                      <SelectItem value="custom">Custom Text</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Connection Warnings */}
                  {formData.location_type === "google_meet" && !user?.google_calendar_connected && (
                    <div className="text-sm p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 mt-2">
                      Your account is not connected to Google Calendar.{" "}
                      <a href="/integrations" className="underline font-medium hover:text-rose-700" target="_blank" rel="noreferrer">
                        Connect Google Calendar
                      </a>
                    </div>
                  )}
                  {formData.location_type === "zoom" && !user?.zoom_connected && (
                    <div className="text-sm p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 mt-2">
                      Your account is not connected to Zoom.{" "}
                      <a href="/integrations" className="underline font-medium hover:text-rose-700" target="_blank" rel="noreferrer">
                        Connect Zoom
                      </a>
                    </div>
                  )}
                  {formData.location_type === "teams" && !user?.teams_connected && (
                    <div className="text-sm p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 mt-2">
                      Your account is not connected to Microsoft Teams.{" "}
                      <a href="/integrations" className="underline font-medium hover:text-rose-700" target="_blank" rel="noreferrer">
                        Connect Teams
                      </a>
                    </div>
                  )}
                </div>

                {formData.location_type === "custom" && (
                  <div className="space-y-2">
                    <Label>Location Details</Label>
                    <Input
                      value={formData.location_details}
                      onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                      placeholder="e.g. Phone call to +1 555..."
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(v) => setFormData({ ...formData, duration: parseInt(v) })}
                    >
                      <SelectTrigger data-testid="meeting-type-duration-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(v) => setFormData({ ...formData, color: v })}
                    >
                      <SelectTrigger data-testid="meeting-type-color-select">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Buffer before (min)</Label>
                    <Select
                      value={formData.buffer_before.toString()}
                      onValueChange={(v) => setFormData({ ...formData, buffer_before: parseInt(v) })}
                    >
                      <SelectTrigger data-testid="meeting-type-buffer-before-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Buffer after (min)</Label>
                    <Select
                      value={formData.buffer_after.toString()}
                      onValueChange={(v) => setFormData({ ...formData, buffer_after: parseInt(v) })}
                    >
                      <SelectTrigger data-testid="meeting-type-buffer-after-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum notice (hours)</Label>
                  <Select
                    value={formData.min_notice.toString()}
                    onValueChange={(v) => setFormData({ ...formData, min_notice: parseInt(v) })}
                  >
                    <SelectTrigger data-testid="meeting-type-min-notice-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No minimum</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                      <SelectItem value="2880">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-sm text-slate-500">Allow people to book this meeting type</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    data-testid="meeting-type-active-switch"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                    disabled={saving}
                    data-testid="meeting-type-save-btn"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingType ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : bookingTypes.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No meeting types yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Create your first meeting type to start accepting bookings
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="rounded-full bg-violet-600 hover:bg-violet-700"
                data-testid="create-first-meeting-type-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Meeting Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookingTypes.map((type) => (
              <Card
                key={type.booking_type_id}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                data-testid={`meeting-type-card-${type.booking_type_id}`}
              >
                <div className="h-2" style={{ backgroundColor: type.color }} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{type.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {type.duration} minutes
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${type.is_active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                      {type.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {type.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {type.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => copyLink(type.slug)}
                      data-testid={`copy-link-btn-${type.booking_type_id}`}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => window.open(`/book/${type.slug}`, "_blank")}
                      data-testid={`preview-btn-${type.booking_type_id}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => openEditDialog(type)}
                      data-testid={`edit-btn-${type.booking_type_id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-rose-600 hover:text-rose-700 hover:border-rose-300"
                      onClick={() => handleDelete(type.booking_type_id)}
                      data-testid={`delete-btn-${type.booking_type_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MeetingTypesPage;
