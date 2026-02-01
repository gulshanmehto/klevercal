import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import { Calendar as CalendarIcon, Clock, User, Mail, CheckCircle2, ArrowLeft, ArrowRight, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, isSameDay } from "date-fns";
import { API_URL as API } from "../config";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PublicBookingPage = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState(null);
  const [host, setHost] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState(1); // 1: Select date/time, 2: Enter details, 3: Confirmation
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  useEffect(() => {
    fetchBookingType();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && bookingType && host) {
      fetchAvailableSlots();
    }
  }, [selectedDate, bookingType, host]);

  const fetchBookingType = async () => {
    try {
      const response = await fetch(`${API}/public/booking-type/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setBookingType(data.booking_type);
        setHost(data.host);
      } else {
        toast.error("Booking type not found");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load booking page");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !bookingType || !host) return;

    setLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(
        `${API}/public/slots/${host.user_id}/${bookingType.booking_type_id}?date=${dateStr}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Fetch slots error:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !formData.guest_name || !formData.guest_email) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.guest_phone && !isValidPhoneNumber(formData.guest_phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_type_id: bookingType.booking_type_id,
          host_user_id: host.user_id,
          guest_name: formData.guest_name,
          guest_email: formData.guest_email,
          guest_phone: formData.guest_phone,
          start_time: selectedSlot.start,
          notes: formData.notes,
          answers: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConfirmedAppointment(data);
        setConfirmed(true);
        setStep(3);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to book appointment");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!bookingType || !host) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Booking page not found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This booking link may be invalid or no longer active.
            </p>
            <Link to="/">
              <Button className="rounded-full bg-violet-600 hover:bg-violet-700">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation screen
  if (confirmed && confirmedAppointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-12 px-6">
        <div className="max-w-lg mx-auto">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                You're all set!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your meeting with {host.name} has been scheduled.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-6">
                <div className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {bookingType.title}
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {format(new Date(confirmedAppointment.start_time), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatTime(confirmedAppointment.start_time)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                A confirmation email will be sent to {formData.guest_email}
              </p>

              <Link to="/">
                <Button className="rounded-full bg-violet-600 hover:bg-violet-700" data-testid="go-home-btn">
                  Return to Homepage
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">DeeMeet</span>
          </Link>
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-[320px_1fr]">
            {/* Left sidebar - Host info */}
            <div className="p-8 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              {host.logo_url && (
                <div className="mb-8 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <img src={host.logo_url} alt="Company Logo" className="max-h-12 object-contain" />
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                {host.picture ? (
                  <img
                    src={host.picture}
                    alt={host.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                    style={{ backgroundColor: host.brand_color }}
                  >
                    {host.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{host.name}</h2>
                </div>
              </div>

              <div
                className="h-1 w-16 rounded-full mb-6"
                style={{ backgroundColor: bookingType.color }}
              />

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {bookingType.title}
              </h3>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-4">
                <Clock className="w-5 h-5" />
                {bookingType.duration} minutes
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-4">
                <MapPin className="w-5 h-5" />
                {(() => {
                  switch (bookingType.location_type) {
                    case 'google_meet': return 'Google Meet';
                    case 'zoom': return 'Zoom';
                    case 'teams': return 'Microsoft Teams';
                    case 'custom': return bookingType.location_details || 'Custom Location';
                    default: return 'Google Meet';
                  }
                })()}
              </div>

              {bookingType.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {bookingType.description}
                </p>
              )}

              {host.welcome_message && (
                <div className="mt-6 p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/50">
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                    "{host.welcome_message}"
                  </p>
                </div>
              )}

              {selectedDate && selectedSlot && (
                <div className="mt-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-500 mb-2">Selected time</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="text-violet-600 dark:text-violet-400">
                    {selectedSlot.display}
                  </div>
                </div>
              )}
            </div>

            {/* Right content - Calendar/Form */}
            <div className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Select a date & time
                  </h3>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"
                        data-testid="booking-calendar"
                      />
                    </div>

                    {/* Time slots */}
                    <div>
                      {selectedDate ? (
                        <>
                          <div className="text-sm text-slate-500 mb-3">
                            {format(selectedDate, "EEEE, MMMM d")}
                          </div>
                          {loadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <p className="text-slate-500 py-8 text-center">
                              No available slots for this date
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                              {availableSlots.map((slot, index) => (
                                <Button
                                  key={index}
                                  variant={selectedSlot?.start === slot.start ? "default" : "outline"}
                                  className={`rounded-lg ${selectedSlot?.start === slot.start
                                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                                    : "hover:border-violet-300 hover:bg-violet-50"
                                    }`}
                                  onClick={() => setSelectedSlot(slot)}
                                  data-testid={`time-slot-${index}`}
                                >
                                  {slot.display}
                                </Button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">Select a date to see available times</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setStep(2)}
                        className="rounded-full bg-violet-600 hover:bg-violet-700"
                        data-testid="continue-btn"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Enter your details
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Your name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          value={formData.guest_name}
                          onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                          placeholder="John Doe"
                          className="pl-10 h-12 rounded-xl"
                          required
                          data-testid="guest-name-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="email"
                          value={formData.guest_email}
                          onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                          placeholder="you@example.com"
                          className="pl-10 h-12 rounded-xl"
                          required
                          data-testid="guest-email-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone number</Label>
                      <div className="phone-input-container">
                        <PhoneInput
                          placeholder="Enter phone number"
                          value={formData.guest_phone}
                          onChange={(value) => setFormData({ ...formData, guest_phone: value })}
                          defaultCountry="IN"
                          className="flex h-12 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional notes (optional)</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Anything you'd like the host to know..."
                        rows={3}
                        className="rounded-xl"
                        data-testid="guest-notes-input"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-violet-600 hover:bg-violet-700 h-12"
                    data-testid="confirm-booking-btn"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          {(host.use_branding !== false) ? (
            <>
              Powered by{" "}
              <Link to="/" className="text-violet-600 hover:text-violet-700 font-medium">
                DeeMeet
              </Link>
            </>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage;
