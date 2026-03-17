"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Key,
  Bot,
  Store,
  Webhook,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

interface SettingsData {
  bolnaApiKey: string;
  confirmationAgentId: string;
  feedbackAgentId: string;
  restaurantName: string;
  restaurantPhone: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    bolnaApiKey: "",
    confirmationAgentId: "",
    feedbackAgentId: "",
    restaurantName: "",
    restaurantPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhook/bolna`
      : "/api/webhook/bolna";

  const orderUpdateUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhook/order-update`
      : "/api/webhook/order-update";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure Bolna integration and restaurant details
        </p>
      </div>

      <div className="space-y-6">
        {/* Bolna API Configuration */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Key className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Bolna API
              </h2>
              <p className="text-sm text-muted-foreground">
                Connect your Bolna Voice AI account
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                API Key
              </label>
              <input
                type="password"
                value={settings.bolnaApiKey}
                onChange={(e) =>
                  setSettings({ ...settings, bolnaApiKey: e.target.value })
                }
                placeholder="bn_..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from{" "}
                <a
                  href="https://platform.bolna.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  platform.bolna.dev
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Agent Configuration */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Voice Agents
              </h2>
              <p className="text-sm text-muted-foreground">
                Agent IDs from Bolna platform
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Order Confirmation Agent ID
              </label>
              <input
                value={settings.confirmationAgentId}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    confirmationAgentId: e.target.value,
                  })
                }
                placeholder="uuid..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Feedback Collection Agent ID
              </label>
              <input
                value={settings.feedbackAgentId}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    feedbackAgentId: e.target.value,
                  })
                }
                placeholder="uuid..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Restaurant
              </h2>
              <p className="text-sm text-muted-foreground">
                Your restaurant details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Restaurant Name
              </label>
              <input
                value={settings.restaurantName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restaurantName: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                value={settings.restaurantPhone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restaurantPhone: e.target.value,
                  })
                }
                placeholder="+91..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Webhook URLs */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Webhook className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Webhook URLs
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure these in your Bolna agent settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bolna Webhook (Analytics Tab)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-mono text-foreground">
                  {webhookUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(webhookUrl, "webhook")}
                  className="rounded-lg border border-border p-2.5 hover:bg-muted transition-colors"
                >
                  {copied === "webhook" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Order Update (Custom Function URL)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-mono text-foreground">
                  {orderUpdateUrl}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(orderUpdateUrl, "orderUpdate")
                  }
                  className="rounded-lg border border-border p-2.5 hover:bg-muted transition-colors"
                >
                  {copied === "orderUpdate" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
