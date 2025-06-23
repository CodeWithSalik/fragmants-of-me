// pages/profile.js
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { FiUser } from "react-icons/fi";

export default function Profile() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
      setLoadingProfile(false);
    };

    if (user) fetchProfile();
    else if (!loading) router.push("/login");
  }, [user, loading]);

  if (loading || loadingProfile) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 bg-white border rounded-lg shadow border-amber mt-8">
      <div className="flex items-center mb-6">
        <FiUser className="text-3xl text-amber-dark mr-3" />
        <h1 className="text-2xl font-bold text-amber-dark">Your Profile</h1>
      </div>

      <div className="space-y-4 text-sm">
        <p><span className="font-semibold text-gray-700">Name:</span> {profile?.name || "—"}</p>
        <p><span className="font-semibold text-gray-700">Email:</span> {user?.email || "—"}</p>
        <p><span className="font-semibold text-gray-700">Mobile:</span> {profile?.mobile || "—"}</p>
        <p className="text-gray-700"><strong>Role:</strong> {profile?.role || "user"}</p>
      </div>
    </div>
  );
}
