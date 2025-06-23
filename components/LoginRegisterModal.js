// components/LoginRegisterModal.js
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginRegisterModal({ onClose }) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  const handleRegister = () => {
    onClose();
    router.push("/register");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white text-ink p-6 rounded-xl shadow-lg max-w-md w-full mx-4 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2">Welcome to Fragments of Me</h2>
        <p className="mb-4 text-sm text-gray-600">
          Please log in or create an account to explore poems, monologues, and more.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-amber text-white px-4 py-2 rounded hover:bg-amber-dark"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="border border-amber px-4 py-2 rounded text-amber hover:bg-amber/10"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
