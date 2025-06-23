// lib/pingBackend.js
export const pingBackend = async () => {
  try {
    await fetch("https://newyear-backend.onrender.com/");
  } catch (err) {
    console.log("Render backend ping failed:", err.message);
  }
};
