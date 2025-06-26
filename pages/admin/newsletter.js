import { useState } from "react";
import { sendNewsletter } from "@/lib/admin/sendNewsletter";
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";

export default function NewsletterPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    setLoading(true);
    try {
      await sendNewsletter(subject, message);
      toast.success("📨 Newsletter sent!");
      setSubject("");
      setMessage("");
      setPreviewMode(false);
    } catch (err) {
      toast.error("❌ " + (err.message || "Failed to send newsletter"));
    } finally {
      setLoading(false);
    }
  };

  const insertSnippet = (html) => {
    setMessage((prev) => prev + html);
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🗞️ Send Newsletter</h1>

        <form onSubmit={handleSend} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => insertSnippet("<h2>Title</h2>")}
              className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              + Title
            </button>
            <button
              type="button"
              onClick={() => insertSnippet("<p>Your paragraph here</p>")}
              className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              + Paragraph
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('<a href="https://">Link</a>')}
              className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
            >
              + Link
            </button>
          </div>

          <textarea
            className="w-full p-3 border rounded h-40"
            placeholder="HTML Message Content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setPreviewMode((prev) => !prev)}
              className="text-sm text-blue-600 underline"
            >
              {previewMode ? "🔧 Edit Mode" : "👁️ Preview"}
            </button>

            <button
              type="submit"
              className="bg-amber text-white px-6 py-2 rounded hover:bg-amber-dark"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Newsletter"}
            </button>
          </div>
        </form>

        {previewMode && (
          <div className="mt-6 border border-gray-300 p-4 rounded bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-amber-dark mb-2">Preview</h2>
            <div dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
