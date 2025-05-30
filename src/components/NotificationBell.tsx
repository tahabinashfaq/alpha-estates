/* eslint-disable @typescript-eslint/no-explicit-any */
// NotificationBell.tsx
"use client";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../app/context/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "user_notifications"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Notification[]
      );
    });
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, "user_notifications", n.id), { read: true });
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-blue-50 focus:outline-none"
        onClick={() => {
          setPanelOpen((open) => !open);
          if (unreadCount > 0) markAllAsRead();
        }}
        aria-label="Notifications"
      >
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {panelOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto animate-fade-in">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Notifications</span>
            <button className="text-xs text-blue-600 hover:underline" onClick={markAllAsRead}>
              Mark all as read
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-500 text-center">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className={`p-4 ${!n.read ? "bg-blue-50" : ""}`}>
                  <div className="font-medium text-gray-900">{n.title}</div>
                  <div className="text-gray-700 text-sm mt-1">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleString()}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
