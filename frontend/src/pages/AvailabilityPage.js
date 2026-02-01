import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardPage";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "../config";

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" }
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    TIME_OPTIONS.push(time);
  }
}

const AvailabilityPage = () => {
  const { getAuthHeaders } = useAuth();
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API}/availability`, {
        headers: getAuthHeaders(),
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        // Convert slots array to object keyed by day
        const availObj = {};
        DAYS.forEach(day => {
          const daySlot = data.slots.find(s => s.day === day.value);
          availObj[day.value] = daySlot
            ? { enabled: true, start_time: daySlot.start_time, end_time: daySlot.end_time }
            : { enabled: false, start_time: "09:00", end_time: "17:00" };
        });
        setAvailability(availObj);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert object back to slots array
      const slots = [];
      Object.entries(availability).forEach(([day, slot]) => {
        if (slot.enabled) {
          slots.push({
            day: parseInt(day),
            start_time: slot.start_time,
            end_time: slot.end_time
          });
        }
      });

      const response = await fetch(`${API}/availability`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slots })
      });

      if (response.ok) {
        toast.success("Availability saved!");
      } else {
        toast.error("Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Availability</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Set your working hours for each day of the week
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-violet-600 hover:bg-violet-700"
            data-testid="save-availability-btn"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day) => (
                <div
                  key={day.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${availability[day.value]?.enabled
                      ? "border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-900/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30"
                    }`}
                  data-testid={`availability-day-${day.value}`}
                >
                  <Switch
                    checked={availability[day.value]?.enabled || false}
                    onCheckedChange={(checked) => updateDay(day.value, "enabled", checked)}
                    data-testid={`day-switch-${day.value}`}
                  />
                  <div className="w-28 font-medium text-slate-900 dark:text-white">{day.label}</div>

                  {availability[day.value]?.enabled ? (
                    <div className="flex items-center gap-3 flex-1">
                      <Select
                        value={availability[day.value]?.start_time || "09:00"}
                        onValueChange={(v) => updateDay(day.value, "start_time", v)}
                      >
                        <SelectTrigger className="w-32" data-testid={`start-time-${day.value}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-slate-500">to</span>
                      <Select
                        value={availability[day.value]?.end_time || "17:00"}
                        onValueChange={(v) => updateDay(day.value, "end_time", v)}
                      >
                        <SelectTrigger className="w-32" data-testid={`end-time-${day.value}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex-1 text-slate-500 dark:text-slate-500">Unavailable</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 rounded-xl bg-slate-100 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tips</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Your availability will be checked against booked appointments</li>
            <li>• Buffer times are applied from individual meeting types</li>
            <li>• Times are shown in your local timezone</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AvailabilityPage;
