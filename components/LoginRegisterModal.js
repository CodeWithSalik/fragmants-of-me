import { useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { FiX, FiMail, FiLock, FiUser, FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";

export default function LoginRegisterModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", res.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: res.user.uid,
          name: res.user.displayName,
          email: res.user.email,
          photoURL: res.user.photoURL,
          role: "user",
          createdAt: serverTimestamp(),
        });
      }
      toast.success(`Welcome, ${res.user.displayName}!`);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(res.user, { displayName: formData.name });
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          name: formData.name,
          email: formData.email,
          role: "user",
          createdAt: serverTimestamp(),
        });
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success("Welcome back!");
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-ink/20 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* The Premium Card */}
      <div className="relative w-full max-w-md surface p-8 md:p-10 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-accent transition-colors"
        >
          <FiX size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-ink mb-2">
            {isRegister ? "Join the Circle" : "Welcome Back"}
          </h2>
          <p className="text-sm text-muted">
            {isRegister ? "Begin your collection of fragments." : "Continue where you left off."}
          </p>
        </div>

        <div className="space-y-4">
          {/* <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-medium text-ink"
          >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button> */}

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs text-muted uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <FiUser className="absolute top-1/2 -translate-y-1/2 left-4 text-muted" />
                <input
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  required
                  className="pl-12" // Padding for icon
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="relative">
              <FiMail className="absolute top-1/2 -translate-y-1/2 left-4 text-muted" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="pl-12"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <FiLock className="absolute top-1/2 -translate-y-1/2 left-4 text-muted" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="pl-12"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-4"
            >
              {loading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-muted hover:text-ink hover:underline transition-all"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have an account? Join us"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}