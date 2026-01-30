import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function ApplyAuthor() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [sample, setSample] = useState("");
  const [intent, setIntent] = useState("");

  // Role Logic: Redirect if already author
  useEffect(() => {
    if (!user && !loading) router.push("/login");
    
    const checkRole = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.data()?.role;
        if (role === "author" || role === "admin") {
          toast.success("You are already an author!");
          router.push("/write");
        }
      }
    };
    checkRole();
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !bio || !sample || !intent) return toast.error("Please fill all fields");

    await addDoc(collection(db, "authorRequests"), {
      uid: user.uid, email: user.email, name, bio, sample, intent, status: "pending", createdAt: serverTimestamp()
    });

    toast.success("Application submitted successfully!");
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="aura-card reading-mode">
        <div className="aura-card-content p-8 md:p-12">
          
          <h1 className="text-3xl font-serif font-bold text-ink mb-2">Join the Circle</h1>
          <p className="text-muted mb-8">Apply to become a contributing author.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Pen Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we call you?" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Short Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself..." className="h-24" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Writing Sample</label>
              <textarea value={sample} onChange={(e) => setSample(e.target.value)} placeholder="Paste a poem or short excerpt here..." className="h-40 font-serif" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Why do you want to join?</label>
              <textarea value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="Your intent..." className="h-24" />
            </div>

            <button type="submit" className="btn-primary w-full py-3">Submit Application</button>
          </form>

        </div>
      </div>
    </div>
  );
}