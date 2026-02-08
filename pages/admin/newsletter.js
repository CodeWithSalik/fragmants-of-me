import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore"; 
import AdminLayout from "@/components/admin/AdminLayout";
import toast from "react-hot-toast";
import { FiEye, FiEdit3, FiLayout, FiSend } from "react-icons/fi";

// ... (Keep your SYSTEM_UPDATE_TEMPLATE constant here) ...
const SYSTEM_UPDATE_TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="format-detection" content="telephone=no"/>
  <title>A Smoother Experience — Fragmants of Me</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #0b0906; color: #e8e1d4; font-family: 'Georgia', serif; -webkit-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    p { margin: 0 0 10px 0; }
    @media screen and (max-width: 600px) {
      .main-card { width: 100% !important; border: none !important; border-radius: 0 !important; }
      .mobile-pad { padding: 20px !important; }
      .header-text { font-size: 24px !important; }
      .body-text { font-size: 16px !important; line-height: 1.6 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0906;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 10px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 600px; background-color: #15100b; border: 1px solid #2a2218; border-radius: 8px;">
          <tr>
            <td align="center" style="padding: 25px 15px; border-bottom: 1px solid #2a2218;">
              <span class="header-text" style="font-size: 26px; font-weight: bold; color: #e6c58f; display: block;">Fragmants of Me</span>
              <span style="font-size: 12px; color: #b89b6d; display: block; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">System Update</span>
            </td>
          </tr>
          <tr>
            <td class="mobile-pad" style="padding: 30px 40px; font-size: 17px; line-height: 1.7; color: #e8e1d4;">
              <p class="body-text" style="margin-bottom: 15px;">Even quiet places need to be sturdy.</p>
              <p class="body-text" style="margin-bottom: 25px;">We noticed a few cracks in the experience, specifically for our mobile readers. We’ve just smoothed them out.</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-top: 1px solid #2a2218; height: 1px; line-height: 1px;"></td></tr></table>
              <div style="height: 20px; line-height: 20px;">&nbsp;</div>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="top" style="padding-bottom: 20px;">
                    <strong style="color: #e6c58f; font-size: 17px; display: block; margin-bottom: 4px;">📱 Mobile View Clarity</strong>
                    <span style="color: #c0b4a5; font-size: 15px;">The "Views" counter now displays perfectly on smaller screens (like the S24). No more squished text.</span>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 20px;">
                    <strong style="color: #e6c58f; font-size: 17px; display: block; margin-bottom: 4px;">🔔 Readable Whispers</strong>
                    <span style="color: #c0b4a5; font-size: 15px;">The notification dropdown is no longer transparent. It now has a solid, clean background for easier reading.</span>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 0;">
                    <strong style="color: #e6c58f; font-size: 17px; display: block; margin-bottom: 4px;">⚓ Stability</strong>
                    <span style="color: #c0b4a5; font-size: 15px;">Fixed a scrolling issue where the header would freeze when checking notifications. The flow is seamless again.</span>
                  </td>
                </tr>
              </table>
              <div style="height: 20px; line-height: 20px;">&nbsp;</div>
              <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-top: 1px solid #2a2218; height: 1px; line-height: 1px;"></td></tr></table>
              <p style="margin-top: 25px; margin-bottom: 5px; font-size: 15px;">Thank you for your patience.</p>
              <p style="margin: 0; color: #b89b6d; font-style: italic; font-size: 15px;">— Pirzada Salik<br><span style="font-size: 12px; font-style: normal; opacity: 0.8; text-transform: uppercase;">Founder</span></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #0e0b08; padding: 15px; font-family: sans-serif; font-size: 11px; color: #554a3e; border-top: 1px solid #2a2218;">
              You received this because you are part of Fragmants of Me.<br>
              <a href="#" style="color: #554a3e; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export default function NewsletterPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  // --- HANDLER: TEST MODE ---
  const handleTestSend = async () => {
    if (!subject.trim() || !message.trim()) return toast.error("Fill all fields first");
    
    setSending(true);
    const toastId = toast.loading("Sending test to " + user.email + "...");

    try {
      const res = await fetch("/api/newsletter-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject, 
          message, 
          testMode: true, 
          testEmail: user.email // Sending to current admin
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");

      toast.success("Test Email Sent!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  // --- HANDLER: REAL BROADCAST ---
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error("Fill all fields");
    
    if (!confirm("⚠️ Are you sure you want to send this to ALL users?")) return;

    setSending(true);
    const toastId = toast.loading("Broadcasting...");
    
    try {
      // 1. Get Emails (In a real app, do this server-side to avoid heavy payload)
      const userSnap = await getDocs(collection(db, "users"));
      const emails = userSnap.docs.map(doc => doc.data().email).filter(Boolean);

      // 2. Send API Call
      const res = await fetch("/api/newsletter-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, recipients: emails }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast failed");

      toast.success(`Sent to ${emails.length} users!`, { id: toastId });
      setSubject(""); 
      setMessage("");
      setPreviewMode(false);
    } catch (err) { 
      console.error(err);
      toast.error(err.message, { id: toastId }); 
    } finally { 
      setSending(false); 
    }
  };

  const insert = (tag) => setMessage(prev => prev + tag);

  const loadSystemUpdateTemplate = () => {
    setSubject("A Smoother Experience — Fragmants of Me");
    setMessage(SYSTEM_UPDATE_TEMPLATE);
    setPreviewMode(true);
    toast.success("Template Loaded!");
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-ink">Newsletter Broadcast</h1>
          
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button 
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${!previewMode ? "bg-white dark:bg-black text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <FiEdit3 /> Editor
            </button>
            <button 
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${previewMode ? "bg-white dark:bg-black text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <FiEye /> Preview
            </button>
          </div>
        </div>

        <div className="aura-card reading-mode">
          <div className="aura-card-content p-8">
            <form onSubmit={handleBroadcast} className="space-y-6">
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Subject Line</label>
                <input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="Weekly Fragmants..." 
                  className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted block">Content</label>
                  
                  {!previewMode && (
                    <div className="flex gap-2">
                      <button type="button" onClick={loadSystemUpdateTemplate} className="text-xs bg-accent/10 text-accent px-3 py-1 rounded hover:bg-accent hover:text-white transition flex items-center gap-1 font-bold">
                        <FiLayout /> Load "Bug Fix" Template
                      </button>
                      <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                      <button type="button" onClick={() => insert("<h2>Title</h2>")} className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Title</button>
                      <button type="button" onClick={() => insert("<p>Text</p>")} className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Para</button>
                      <button type="button" onClick={() => insert('<a href="">Link</a>')} className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded hover:bg-accent hover:text-white transition">+ Link</button>
                    </div>
                  )}
                </div>

                {previewMode ? (
                  <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                    <div className="bg-gray-200 dark:bg-[#252525] px-4 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-gray-300 dark:border-white/5">
                      Email Preview
                    </div>
                    <div className="p-8 bg-white text-black min-h-[300px]">
                      <div className="email-preview-wrapper" style={{ fontFamily: 'Georgia, serif', color: '#2b2118', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                        <div 
                          style={{ whiteSpace: 'pre-wrap' }} 
                          dangerouslySetInnerHTML={{ __html: message || "<p style='color:#ccc; font-style:italic;'>Start typing to see content...</p>" }} 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    className="font-mono text-sm h-96 w-full p-4 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-accent outline-none resize-none"
                    placeholder="<p>Dear Reader...</p>" 
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                
                {/* --- SEND TEST BUTTON --- */}
                <button 
                  type="button" 
                  onClick={handleTestSend} 
                  disabled={sending} 
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-ink hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  Send Test to Me
                </button>

                {/* --- BROADCAST BUTTON --- */}
                <button 
                  type="submit" 
                  disabled={sending} 
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  <FiSend /> {sending ? "Sending..." : "Send Broadcast"}
                </button>

              </div>

            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}