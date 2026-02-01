import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardPage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, Send, Calendar, Clock, Loader2, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIAssistantPage = () => {
  const { getAuthHeaders } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const exampleQueries = [
    "Let's meet next Tuesday morning",
    "Schedule a call for Friday afternoon",
    "How about Wednesday at 3pm?",
    "I'm free next week Monday or Tuesday"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API}/ai/parse-schedule`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: query })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setHistory(prev => [
          { query, result: data, timestamp: new Date() },
          ...prev.slice(0, 9)
        ]);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to process request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not detected";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-violet-600" />
            AI Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Schedule meetings using natural language
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Natural Language Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: 'Let's meet next Tuesday morning'"
                  className="h-14 pl-4 pr-14 text-lg rounded-xl"
                  data-testid="ai-query-input"
                />
                <Button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-2 rounded-xl bg-violet-600 hover:bg-violet-700 h-10 w-10 p-0"
                  data-testid="ai-submit-btn"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="px-3 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900/30 dark:hover:text-violet-300 transition-colors"
                    data-testid={`example-query-${index}`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl mb-6 animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                AI Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">{result.interpretation}</p>
              
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Suggested Date</div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {formatDate(result.suggested_date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Suggested Time</div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {result.suggested_time || "Not detected"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500">Confidence:</div>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {Math.round(result.confidence * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  data-testid={`history-item-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-slate-900 dark:text-white">"{item.query}"</div>
                    <div className="text-xs text-slate-500">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.result.suggested_date && item.result.suggested_time 
                      ? `→ ${formatDate(item.result.suggested_date)} at ${item.result.suggested_time}`
                      : item.result.interpretation
                    }
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How it works</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Type your scheduling request in natural language</li>
                <li>• AI analyzes your input and extracts date/time information</li>
                <li>• Results show the interpreted date, time, and confidence level</li>
                <li>• Works with phrases like "next Tuesday", "this Friday afternoon", etc.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
