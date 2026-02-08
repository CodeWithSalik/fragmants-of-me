import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { FiBell, FiMessageSquare, FiFileText, FiUserPlus, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function NotificationDropdown() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Manual open state
  const dropdownRef = useRef(null); // Ref for click-outside logic

  // 1. Fetch Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Handle Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getNotificationLink = (notif) => {
    if (notif.type === "new_follower") return `/author/${user?.uid}`; 
    if (["comment", "reply", "new_post"].includes(notif.type)) return `/entry/${notif.entryId}`;
    return "/dashboard";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* TRIGGER BUTTON */}
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-ink flex items-center justify-center focus:outline-none"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
        )}
      </button>

      {/* DROPDOWN MENU (Standard CSS, No Headless UI) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl ring-1 ring-black/5 border border-black/5 dark:border-white/5 z-[100] overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-800/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Recent Whispers</h3>
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted italic text-sm">
                No new whispers.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link 
                  key={notif.id}
                  href={getNotificationLink(notif)}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false); // Close on click
                  }}
                  className={`block px-4 py-3 transition-colors border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 ${!notif.read ? "bg-accent/5" : ""}`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="mt-1 shrink-0">
                       {notif.type === "new_follower" && <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-full"><FiUserPlus size={14} /></div>}
                       {(notif.type === "comment" || notif.type === "reply") && <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full"><FiMessageSquare size={14} /></div>}
                       {notif.type === "new_post" && <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><FiFileText size={14} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm text-ink font-medium leading-tight">
                         {notif.type === "new_follower" ? `${notif.followerName} followed you` : 
                          notif.type === "comment" ? `${notif.commenterName} commented` : 
                          notif.type === "reply" ? `${notif.replierName} replied` :
                          notif.title || "New Activity"}
                       </p>
                       <p className="text-[10px] text-muted/60 mt-1 uppercase">
                         {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString() : "Just now"}
                       </p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0"></div>}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-neutral-800/50">
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              View All <FiArrowRight />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}