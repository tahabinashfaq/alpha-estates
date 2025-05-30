/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { app } from "../../../firebase";

interface ContactAgentFormProps {
  propertyId: string;
  realtorId: string;
}

export default function ContactAgentForm({ propertyId, realtorId }: ContactAgentFormProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      const senderEmail = user?.email || email;
      if (!senderEmail) throw new Error("Please provide your email.");
      await addDoc(collection(db, "inquiries"), {
        propertyId,
        realtorId,
        message,
        senderEmail,
        createdAt: serverTimestamp(),
      });
      setStatus("Message sent!");
      setMessage("");
      setEmail("");
    } catch (err) {
      setStatus("Failed to send message.");
    }
    setLoading(false);
  };
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Agent</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!auth.currentUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500 resize-none"
            placeholder="I'm interested in this property. Please provide more information."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            "Send Message"
          )}
        </button>
        {status && (
          <div className={`text-sm mt-2 p-3 rounded-lg ${status === 'Message sent!'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
