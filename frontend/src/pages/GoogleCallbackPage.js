import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../config";

const GoogleCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code || !state) {
                toast.error("Invalid response from Google");
                navigate('/integrations');
                return;
            }

            try {
                // Pass parameters to backend
                const response = await fetch(`${API_URL}/calendar/google/callback?code=${code}&state=${state}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Check if response is a redirect (which it is from the backend)
                if (response.redirected) {
                    window.location.href = response.url;
                    return;
                }

                // If not redirected automatically by fetch (unlikely for 307/302), handle JSON
                if (!response.ok) {
                    throw new Error('Failed to complete connection');
                }

                // If the backend returns JSON instead of redirecting
                const data = await response.json();

                // Refresh auth state to update UI
                await window.location.reload(); // Simple way to ensure auth state is fresh
                // navigate('/integrations'); // We'll reload instead to be safe

            } catch (error) {
                console.error('Callback error:', error);
                toast.error("Failed to connect Google Calendar");
                navigate('/integrations');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Connecting Google Calendar...</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Please wait while we finalize the setup.</p>
        </div>
    );
};

export default GoogleCallbackPage;
