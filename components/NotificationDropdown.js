import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { FiBell, FiMessageSquare, FiFileText, FiUserPlus, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function NotificationDropdown() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
  };

  // Helper to determine where the link should go
  const getNotificationLink = (notif) => {
    if (notif.type === "new_follower") {
      // FIX: Go to YOUR OWN profile to see the new count, 
      // instead of the follower's profile (which might not exist).
      return `/author/${user?.uid}`; 
    }
    if (notif.type === "comment" || notif.type === "reply" || notif.type === "new_post") {
      return `/entry/${notif.entryId}`;
    }
    return "/dashboard"; // Fallback
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-ink flex items-center justify-center">
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-paper"></span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-3 w-80 origin-top-right divide-y divide-black/5 dark:divide-white/5 rounded-xl bg-paper shadow-2xl ring-1 ring-black/5 focus:outline-none z-[100] border border-black/5 dark:border-white/5 overflow-hidden">
          
          <div className="px-4 py-3 bg-black/5 dark:bg-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Recent Whispers</h3>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted italic text-sm">
                No new whispers.
              </div>
            ) : (
              notifications.map((notif) => (
                <Menu.Item key={notif.id}>
                  {({ active }) => (
                    <div 
                      className={`px-4 py-3 flex gap-3 transition-colors cursor-pointer ${active ? "bg-black/5 dark:bg-white/5" : ""} ${!notif.read ? "bg-accent/5" : ""}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="mt-1 shrink-0">
                         {notif.type === "new_follower" && <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-full"><FiUserPlus size={14} /></div>}
                         {notif.type === "comment" && <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full"><FiMessageSquare size={14} /></div>}
                         {notif.type === "new_post" && <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><FiFileText size={14} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        
                        {/* USE THE HELPER FUNCTION HERE */}
                        <Link href={getNotificationLink(notif)}>
                           <p className="text-sm text-ink font-medium truncate">
                             {notif.type === "new_follower" ? `${notif.followerName} followed you` : 
                              notif.type === "comment" ? `${notif.commenterName} commented` : 
                              notif.title || "New Activity"}
                           </p>
                           <p className="text-[10px] text-muted/60 mt-1 uppercase">
                             {notif.createdAt?.toDate().toLocaleDateString()}
                           </p>
                        </Link>

                      </div>
                      {!notif.read && <div className="w-2 h-2 bg-accent rounded-full mt-2 shrink-0"></div>}
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>

          <div className="p-2 bg-black/5 dark:bg-white/5">
            <Link href="/notifications" className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

        </Menu.Items>
      </Transition>
    </Menu>
  );
}