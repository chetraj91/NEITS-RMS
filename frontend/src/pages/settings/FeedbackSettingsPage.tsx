import {
  useEffect,
  useState,
} from "react";

import {
  getFeedbackSettings,
  updateFeedbackSettings,
} from "../../api/feedbackSetting";

export default function FeedbackSettingsPage() {

  const [
    feedbackPageUrl,
    setFeedbackPageUrl,
  ] = useState("");

  const [
    websiteUrl,
    setWebsiteUrl,
  ] = useState("");

  const [
    facebookPageUrl,
    setFacebookPageUrl,
  ] = useState("");

  const [
    enabled,
    setEnabled,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  async function loadSettings() {
    try {

      setLoading(true);

      const response =
        await getFeedbackSettings();

      const settings =
        response?.data || {};

      setFeedbackPageUrl(
        settings.feedbackPageUrl || ""
      );

      setWebsiteUrl(
        settings.websiteUrl || ""
      );

      setFacebookPageUrl(
        settings.facebookPageUrl || ""
      );

      setEnabled(
        settings.enabled !== false
      );

    } catch (error: any) {

      console.error(
        "LOAD FEEDBACK SETTINGS ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load feedback settings."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  async function saveSettings() {

    try {

      setSaving(true);

      await updateFeedbackSettings({
        feedbackPageUrl:
          feedbackPageUrl.trim(),

        websiteUrl:
          websiteUrl.trim(),

        facebookPageUrl:
          facebookPageUrl.trim(),

        enabled,
      });

      alert(
        "Feedback settings saved successfully."
      );

      await loadSettings();

    } catch (error: any) {

      console.error(
        "SAVE FEEDBACK SETTINGS ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save feedback settings."
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        Loading feedback settings...
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="max-w-4xl mx-auto">

        {/* PAGE HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-800">
            Feedback Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage the feedback, website and Facebook links
            used by NEITS RMS.
          </p>

        </div>


        {/* SETTINGS CARD */}

        <div className="bg-white rounded-xl shadow p-8">

          {/* ENABLED */}

          <div className="flex items-center justify-between border-b pb-6 mb-6">

            <div>

              <h2 className="text-lg font-semibold">
                Feedback System
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Enable or disable feedback features.
              </p>

            </div>

            <label className="relative inline-flex items-center cursor-pointer">

              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) =>
                  setEnabled(
                    e.target.checked
                  )
                }
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />

            </label>

          </div>


          {/* FEEDBACK PAGE URL */}

          <div className="mb-6">

            <label className="block font-semibold mb-2">
              Feedback Page URL
            </label>

            <input
              type="url"
              value={feedbackPageUrl}
              onChange={(e) =>
                setFeedbackPageUrl(
                  e.target.value
                )
              }
              placeholder="https://yourwebsite.com/feedback"
              className="w-full border rounded-lg p-3"
            />

            <p className="text-sm text-gray-500 mt-2">
              Link where customers will submit their
              rating and feedback.
            </p>

          </div>


          {/* WEBSITE URL */}

          <div className="mb-6">

            <label className="block font-semibold mb-2">
              Website URL
            </label>

            <input
              type="url"
              value={websiteUrl}
              onChange={(e) =>
                setWebsiteUrl(
                  e.target.value
                )
              }
              placeholder="https://yourwebsite.com"
              className="w-full border rounded-lg p-3"
            />

            <p className="text-sm text-gray-500 mt-2">
              Your company website address.
            </p>

          </div>


          {/* FACEBOOK PAGE URL */}

          <div className="mb-6">

            <label className="block font-semibold mb-2">
              Facebook Page URL
            </label>

            <input
              type="url"
              value={facebookPageUrl}
              onChange={(e) =>
                setFacebookPageUrl(
                  e.target.value
                )
              }
              placeholder="https://www.facebook.com/yourpage"
              className="w-full border rounded-lg p-3"
            />

            <p className="text-sm text-gray-500 mt-2">
              Your official Facebook page address.
            </p>

          </div>


          {/* SAVE */}

          <div className="flex justify-end">

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving
                ? "Saving..."
                : "Save Feedback Settings"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}