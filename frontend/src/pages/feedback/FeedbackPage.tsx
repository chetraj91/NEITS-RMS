import {
  useEffect,
  useState,
} from "react";

import {
  getPublicFeedback,
  submitPublicFeedback,
} from "../../api/feedback";

export default function FeedbackPage() {
  const [token, setToken] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [jobNumber, setJobNumber] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

 const [, setDeviceType] =
  useState("");

  const [brand, setBrand] =
    useState("");

  const [model, setModel] =
    useState("");

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  // =====================================================
  // LOAD FEEDBACK
  // =====================================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const feedbackToken =
      params.get("token")?.trim() || "";

    if (!feedbackToken) {
      setError(
        "Invalid feedback link."
      );
      setLoading(false);
      return;
    }

    setToken(feedbackToken);

    async function loadFeedback() {
      try {
        const response =
          await getPublicFeedback(
            feedbackToken
          );

        const data =
          response?.data;

        if (!data) {
          throw new Error(
            "Feedback information not found."
          );
        }

        setJobNumber(
          data.jobNumber || ""
        );

        setCustomerName(
          data.customerName || ""
        );

        setDeviceType(
          data.deviceType || ""
        );

        setBrand(
          data.brand || ""
        );

        setModel(
          data.model || ""
        );

        if (
          data.submittedAt
        ) {
          setRating(
            data.rating || 0
          );

          setComment(
            data.comment || ""
          );

          setSubmitted(true);
        }

      } catch (err: any) {

        console.error(
          "LOAD FEEDBACK ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load feedback."
        );

      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, []);

  // =====================================================
  // SUBMIT FEEDBACK
  // =====================================================

  async function handleSubmit() {
    if (rating < 1 || rating > 5) {
      setError(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitPublicFeedback(
        token,
        {
          rating,
          comment:
            comment.trim() || undefined,
        }
      );

      setSubmitted(true);

    } catch (err: any) {

      console.error(
        "SUBMIT FEEDBACK ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit feedback."
      );

    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800">
            NEITS RMS
          </h1>

          <p className="mt-4 text-gray-500">
            Loading feedback...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !jobNumber) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800">
            NEITS RMS
          </h1>

          <div className="mt-6 text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // THANK YOU
  // =====================================================

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full max-w-md">

          <div className="text-5xl mb-4">
            ⭐
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Thank You!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for sharing your
            experience with NEITS RMS.
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-800">
              Job No: {jobNumber}
            </p>

            <div className="mt-3 text-2xl">
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // FEEDBACK FORM
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">

        {/* HEADER */}

        <div className="bg-gray-800 text-white p-6 text-center">

          <h1 className="text-2xl font-bold">
            NEITS RMS
          </h1>

          <p className="mt-2 text-gray-300">
            Customer Feedback
          </p>

        </div>

        {/* CONTENT */}

        <div className="p-6">

          {/* CUSTOMER / JOB */}

          <div className="bg-gray-50 rounded-xl p-4">

            <p className="text-sm text-gray-500">
              Customer
            </p>

            <p className="font-semibold text-gray-800">
              {customerName}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Job Number
            </p>

            <p className="font-semibold text-gray-800">
              {jobNumber}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Device
            </p>

            <p className="font-semibold text-gray-800">
              {brand} {model}
            </p>

          </div>

          {/* RATING */}

          <div className="mt-8 text-center">

            <h2 className="text-lg font-semibold text-gray-800">
              How was your experience?
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Please rate our service.
            </p>

            <div className="flex justify-center gap-2 mt-5">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRating(star)
                    }
                    className={`text-4xl transition ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } hover:scale-110`}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                )
              )}

            </div>

            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {rating} out of 5
              </p>
            )}

          </div>

          {/* COMMENT */}

          <div className="mt-8">

            <label className="block font-semibold text-gray-800 mb-2">
              Your Comment
              <span className="font-normal text-gray-400">
                {" "}
                (Optional)
              </span>
            </label>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Tell us about your experience..."
              className="w-full border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            {submitting
              ? "Submitting..."
              : "Submit Feedback"}
          </button>

        </div>

      </div>

    </div>
  );
}