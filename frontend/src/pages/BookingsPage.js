import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardPage";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Calendar, Clock, Mail, User, X, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "../config";

const BookingsPage = () => {
  const { getAuthHeaders } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Fetch internal appointments
      const response = await fetch(`${API}/appointments`, {
        headers: getAuthHeaders(),
      });

      let allAppointments = [];
      if (response.ok) {
        allAppointments = await response.json();
      }

      // Fetch Google Calendar events
      try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const googleResponse = await fetch(`${API}/calendar/google/events?start_date=${today.toISOString().split('T')[0]}&end_date=${thirtyDaysLater.toISOString().split('T')[0]}`, {
          headers: getAuthHeaders(),
        });

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          const googleEvents = googleData.events.map(event => ({
            appointment_id: `google_${event.id}`,
            guest_name: event.summary,
            guest_email: "Google Calendar Event", // Placeholder
            start_time: event.start,
            end_time: event.end,
            status: "confirmed",
            notes: event.description,
            is_google_event: true,
            lead_score: null
          }));

          allAppointments = [...allAppointments, ...googleEvents];
        }
      } catch (err) {
        console.warn("Failed to fetch Google events", err);
      }

      // Sort by start time
      allAppointments.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setAppointments(allAppointments);

    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      const response = await fetch(`${API}/appointments/${appointmentId}/status?status=${status}`, {
        method: "PUT",
        headers: getAuthHeaders(),

      });
      if (response.ok) {
        toast.success(`Appointment ${status}`);
        fetchAppointments();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    a => new Date(a.start_time) > now && a.status === "confirmed"
  );
  const pastAppointments = appointments.filter(
    a => new Date(a.start_time) <= now || a.status === "completed"
  );
  const cancelledAppointments = appointments.filter(a => a.status === "cancelled");

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const AppointmentCard = ({ appointment, showActions = false }) => {
    const { date, time } = formatDateTime(appointment.start_time);
    const endTime = formatDateTime(appointment.end_time).time;

    return (
      <Card
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
        data-testid={`appointment-card-${appointment.appointment_id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${appointment.is_google_event
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                }`}>
                {appointment.is_google_event ? <Calendar className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{appointment.guest_name}</h3>
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  {appointment.is_google_event ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">External</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      {appointment.guest_email}
                    </>
                  )}
                </div>
              </div>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-500">Date</div>
                <div className="font-medium text-slate-900 dark:text-white">{date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-500">Time</div>
                <div className="font-medium text-slate-900 dark:text-white">{time} - {endTime}</div>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="mb-4">
              <div className="text-sm text-slate-500 mb-1">Notes</div>
              <p className="text-slate-700 dark:text-slate-300">{appointment.notes}</p>
            </div>
          )}

          {appointment.lead_score !== null && (
            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm text-slate-500">Lead Score:</div>
              <Badge className={`${appointment.lead_score >= 70
                ? "bg-emerald-100 text-emerald-700"
                : appointment.lead_score >= 40
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-700"
                }`}>
                {appointment.lead_score}/100
              </Badge>
            </div>
          )}

          {showActions && appointment.status === "confirmed" && (
            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                onClick={() => updateStatus(appointment.appointment_id, "completed")}
                data-testid={`complete-btn-${appointment.appointment_id}`}
              >
                <Check className="w-4 h-4 mr-1" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                onClick={() => updateStatus(appointment.appointment_id, "cancelled")}
                data-testid={`cancel-btn-${appointment.appointment_id}`}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bookings</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your appointments and meetings
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger
                value="upcoming"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                data-testid="tab-upcoming"
              >
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                data-testid="tab-past"
              >
                Past ({pastAppointments.length})
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                data-testid="tab-cancelled"
              >
                Cancelled ({cancelledAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <EmptyState message="No upcoming appointments" />
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointment_id}
                    appointment={appointment}
                    showActions={true}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastAppointments.length === 0 ? (
                <EmptyState message="No past appointments" />
              ) : (
                pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledAppointments.length === 0 ? (
                <EmptyState message="No cancelled appointments" />
              ) : (
                cancelledAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookingsPage;
