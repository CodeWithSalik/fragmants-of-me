import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { FiUser, FiMail, FiPhone, FiAward } from "react-icons/fi";

export default function Profile() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };

    if (user) fetchProfile();
    else if (!loading) router.push("/login");
  }, [user, loading, router]);

  if (loading || !profile) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="aura-card reading-mode">
        <div className="aura-card-content p-10">
          
          <div className="flex items-center gap-6 mb-10 border-b border-black/5 dark:border-white/5 pb-8">
            <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center text-3xl shadow-lg">
              {profile.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ink">{profile.name}</h1>
              <p className="text-muted capitalize">{profile.role} Account</p>
            </div>
          </div>

          <div className="space-y-6">
            <InfoRow icon={<FiMail />} label="Email" value={user.email} />
            <InfoRow icon={<FiPhone />} label="Mobile" value={profile.mobile || "Not set"} />
            <InfoRow icon={<FiAward />} label="Role" value={profile.role || "User"} />
          </div>

          {/* Role-Specific Actions */}
          <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5">
            {profile.role === "user" && (
              <button onClick={() => router.push("/apply-author")} className="btn-primary w-full">
                Apply to become an Author
              </button>
            )}
            {(profile.role === "author" || profile.role === "admin") && (
              <button onClick={() => router.push("/write")} className="btn-primary w-full">
                Write New Entry
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 text-ink/80">
      <div className="text-accent text-xl">{icon}</div>
      <div className="flex-grow">
        <p className="text-xs font-bold uppercase tracking-widest text-muted/60">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}