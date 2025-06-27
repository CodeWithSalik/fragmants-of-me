import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { sendNewsletter } from "@/lib/admin/sendNewsletter";
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";

export default function NewsletterPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // ✅ Step 1: Validate Admin & PIN
  useEffect(() => {
    const verify = async () => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() ? snap.data().role : null;

      if (role !== "admin") {
        toast.error("Access denied");
        router.push("/");
        return;
      }

      const verified = sessionStorage.getItem("admin_pin_verified") === "true";
      if (!verified) {
        router.push("/admin/auth");
        return;
      }

      setIsAdmin(true);
    };

    if (!loading) verify();
  }, [user, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }

    setLoadingSubmit(true);
    try {
      await sendNewsletter(subject, message);
      toast.success("✅ Newsletter sent");
      setSubject("");
      setMessage("");
      setPreviewMode(false);
    } catch (err) {
      toast.error("❌ " + (err.message || "Failed to send newsletter"));
    } finally {
      setLoadingSubmit(false);
    }
  };

  const insertSnippet = (html) => {
    setMessage((prev) => prev + html);
  };

  if (loading || !user || !isAdmin) return <p className="p-6">Loading...</p>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto bg-[#0a0f0d] text-green-400 p-6 rounded shadow-lg">
        <h1 className="text-3xl font-mono font-bold mb-6 border-b border-green-500 pb-2">🗞️ Send Newsletter</h1>

        <form onSubmit={handleSend} className="space-y-4 font-mono">
          <input
            className="w-full p-2 bg-[#1a1f1d] text-green-300 border border-green-600 rounded outline-none"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => insertSnippet("<h2>Title</h2>")}
              className="bg-[#1a1f1d] px-2 py-1 border border-green-600 rounded hover:bg-green-900 transition"
            >
              + Title
            </button>
            <button
              type="button"
              onClick={() => insertSnippet("<p>Your paragraph here</p>")}
              className="bg-[#1a1f1d] px-2 py-1 border border-green-600 rounded hover:bg-green-900 transition"
            >
              + Paragraph
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('<a href="https://">Link</a>')}
              className="bg-[#1a1f1d] px-2 py-1 border border-green-600 rounded hover:bg-green-900 transition"
            >
              + Link
            </button>
          </div>

          <textarea
            className="w-full p-3 bg-[#1a1f1d] text-green-300 border border-green-600 rounded h-40 outline-none"
            placeholder="HTML Message Content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setPreviewMode((prev) => !prev)}
              className="text-sm underline text-cyan-400 hover:text-cyan-300"
            >
              {previewMode ? "🔧 Edit Mode" : "👁️ Preview"}
            </button>

            <button
              type="submit"
              className="bg-green-700 hover:bg-green-600 text-white px-6 py-2 rounded transition"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Sending..." : "Send Newsletter"}
            </button>
          </div>
        </form>

        {previewMode && (
          <div className="mt-6 bg-[#111] border border-green-700 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2 text-green-400">🔍 Preview</h2>
            <div
              className="prose prose-invert max-w-none text-white"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
