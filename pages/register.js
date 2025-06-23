// pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function Register() {
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);

            // Save user profile to Firestore
            await setDoc(doc(db, "users", userCred.user.uid), {
                name,
                mobile,
                email,
                role: userCred.user.uid === "SIpfZSIJM5RKrvLahp7I4DLwiE93" ? "admin" : "user",
                createdAt: new Date(),
            });

            // Update Firebase Auth profile
            await updateProfile(userCred.user, {
                displayName: name,
            });

            // Send welcome email via New Year backend
            await fetch("https://newyear-backend.onrender.com/send-welcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });

            toast.success("✅ Account created! Welcome email sent.");
            router.push("/");
        } catch (err) {
            console.error("Registration error:", err);
            toast.error("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
            <form
                onSubmit={handleRegister}
                className="bg-white shadow-md rounded-xl p-8 w-full max-w-md border border-amber"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-amber-dark">Register</h2>

                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full mb-4 p-2 border rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Mobile Number"
                    className="w-full mb-4 p-2 border rounded"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber hover:bg-amber-dark text-white font-semibold py-2 rounded transition-all"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="text-sm text-center mt-4">
                    Already have an account?{" "}
                    <span
                        onClick={() => router.push("/login")}
                        className="text-blue-600 underline cursor-pointer"
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
}
