/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../app/context/AuthContext";
import { AlertScheduler, NotificationService } from "../app/services/notificationService";
import { Property } from "./PropertyList";

interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  criteria: {
    location: string;
    minPrice: number;
    maxPrice: number;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    features: string[];
    squareFeet?: { min: number; max: number };
    yearBuilt?: { min: number; max: number };
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  active: boolean;
  createdAt: string;
  lastNotified?: string;
  matchCount: number;
  lastChecked?: string;
}

interface PropertyAlertsProps {
  onClose: () => void;
}

interface MatchingProperty extends Property {
  matchedCriteria: string[];
}

export function PropertyAlerts({ onClose }: PropertyAlertsProps) {
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newAlert, setNewAlert] = useState<Partial<PropertyAlert>>({
    name: "",
    criteria: {
      location: "",
      minPrice: 0,
      maxPrice: 10000000,
      propertyType: "",
      bedrooms: 0,
      bathrooms: 0,
      features: [],
      squareFeet: { min: 0, max: 10000 },
      yearBuilt: { min: 1900, max: new Date().getFullYear() }
    },
    frequency: 'daily',
    active: true
  });
  const { user } = useAuth();
  // Fetch user's alerts from Firebase and setup alert scheduling
  useEffect(() => {
    if (!user) return;

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        // Request notification permission
        await NotificationService.requestNotificationPermission();

        const alertsQuery = query(
          collection(db, "propertyAlerts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
          const userAlerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as PropertyAlert[];

          setAlerts(userAlerts);

          // Schedule alerts for checking
          userAlerts.filter(alert => alert.active).forEach(alert => {
            AlertScheduler.scheduleAlert(alert.id, alert.frequency, () => {
              checkForMatches();
            });
          });

          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load alerts");
        setLoading(false);
      }
    };

    fetchAlerts();

    // Cleanup scheduled alerts when component unmounts
    return () => {
      AlertScheduler.clearAllAlerts();
    };
  }, [user]);
  // Check for matching properties for all active alerts
  const checkForMatches = useCallback(async () => {
    if (!user) return;

    try {
      const propertiesQuery = query(collection(db, "properties"));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const properties = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];

      // Update match counts for each alert
      for (const alert of alerts.filter(a => a.active)) {
        const matches = findMatchingProperties(properties, alert);

        // Update alert with new match count
        await updateDoc(doc(db, "propertyAlerts", alert.id), {
          matchCount: matches.length,
          lastChecked: new Date().toISOString()
        });

        // Send notifications if new matches found
        if (matches.length > alert.matchCount && alert.frequency === 'immediate') {
          await sendNotification(alert, matches.slice(alert.matchCount));
        }
      }
    } catch (err) {
      console.error("Error checking for matches:", err);
    }
  }, [user, alerts]);

  // Property matching logic
  const findMatchingProperties = (properties: Property[], alert: PropertyAlert): MatchingProperty[] => {
    return properties.filter(property => {
      const criteria = alert.criteria;
      const matches: string[] = [];

      // Location match
      if (criteria.location && property.location) {
        if (property.location.toLowerCase().includes(criteria.location.toLowerCase()) ||
          property.address?.toLowerCase().includes(criteria.location.toLowerCase())) {
          matches.push('location');
        } else {
          return false; // Location is required
        }
      }

      // Price range
      if (property.price >= criteria.minPrice && property.price <= criteria.maxPrice) {
        matches.push('price');
      } else {
        return false; // Price must be in range
      }

      // Property type
      if (!criteria.propertyType || property.type === criteria.propertyType) {
        matches.push('type');
      }

      // Bedrooms
      if (criteria.bedrooms === 0 || (property.beds && property.beds >= criteria.bedrooms)) {
        matches.push('bedrooms');
      }

      // Bathrooms
      if (criteria.bathrooms === 0 || (property.baths && property.baths >= criteria.bathrooms)) {
        matches.push('bathrooms');
      }

      // Square footage
      if (criteria.squareFeet && property.squareFeet) {
        if (property.squareFeet >= criteria.squareFeet.min &&
          property.squareFeet <= criteria.squareFeet.max) {
          matches.push('squareFeet');
        }
      }

      // Year built
      if (criteria.yearBuilt && property.yearBuilt) {
        if (property.yearBuilt >= criteria.yearBuilt.min &&
          property.yearBuilt <= criteria.yearBuilt.max) {
          matches.push('yearBuilt');
        }
      }

      // Features
      if (criteria.features.length > 0) {
        const propertyFeatures = property.features || [];
        const matchedFeatures = criteria.features.filter(feature =>
          propertyFeatures.includes(feature)
        );
        if (matchedFeatures.length > 0) {
          matches.push('features');
        }
      }

      return matches.length >= 3; // Require at least 3 matching criteria
    }).map(property => ({
      ...property,
      matchedCriteria: []
    }));
  };  // Send notification (enhanced with notification service)
  const sendNotification = useCallback(async (alert: PropertyAlert, newMatches: MatchingProperty[]) => {
    console.log(`Sending notification for alert "${alert.name}" with ${newMatches.length} new matches`);

    try {
      // Send notifications using the notification service
      await NotificationService.sendNotification({
        userId: alert.userId,
        alertId: alert.id,
        alertName: alert.name,
        properties: newMatches,
        userEmail: user?.email || undefined
      });

      // Update last notified timestamp
      await updateDoc(doc(db, "propertyAlerts", alert.id), {
        lastNotified: new Date().toISOString()
      });

      setSuccessMessage(`Notification sent for ${alert.name}!`);
    } catch (error) {
      console.error("Failed to send notification:", error);
      setError("Failed to send notification");
    }
  }, [user]);

  // Create new alert
  const handleCreateAlert = async () => {
    if (!newAlert.name || !newAlert.criteria?.location || !user) {
      setError("Please fill in required fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const alertData = {
        userId: user.uid,
        name: newAlert.name,
        criteria: newAlert.criteria,
        frequency: newAlert.frequency || 'daily',
        active: true,
        createdAt: new Date().toISOString(),
        matchCount: 0,
        lastChecked: new Date().toISOString()
      };

      await addDoc(collection(db, "propertyAlerts"), alertData);

      setSuccessMessage("Alert created successfully!");
      setShowCreateForm(false);
      setNewAlert({
        name: "",
        criteria: {
          location: "",
          minPrice: 0,
          maxPrice: 10000000,
          propertyType: "",
          bedrooms: 0,
          bathrooms: 0,
          features: [],
          squareFeet: { min: 0, max: 10000 },
          yearBuilt: { min: 1900, max: new Date().getFullYear() }
        },
        frequency: 'daily',
        active: true
      });

      // Check for matches immediately
      setTimeout(checkForMatches, 1000);
    } catch (err) {
      console.error("Error creating alert:", err);
      setError("Failed to create alert. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle alert active status
  const toggleAlert = async (alertId: string) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      await updateDoc(doc(db, "propertyAlerts", alertId), {
        active: !alert.active
      });

      setSuccessMessage(`Alert ${!alert.active ? 'activated' : 'paused'} successfully!`);
    } catch (err) {
      console.error("Error toggling alert:", err);
      setError("Failed to update alert");
    }
  };

  // Delete alert
  const deleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      await deleteDoc(doc(db, "propertyAlerts", alertId));
      setSuccessMessage("Alert deleted successfully!");
    } catch (err) {
      console.error("Error deleting alert:", err);
      setError("Failed to delete alert");
    }
  };

  // Handle feature toggle for new alert
  const handleFeatureToggle = (feature: string) => {
    const features = newAlert.criteria?.features || [];
    const updatedFeatures = features.includes(feature)
      ? features.filter(f => f !== feature)
      : [...features, feature];

    setNewAlert({
      ...newAlert,
      criteria: {
        ...newAlert.criteria!,
        features: updatedFeatures
      }
    });
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const availableFeatures = [
    "Pool", "Parking", "Garden", "Balcony", "Fireplace", "Air Conditioning",
    "Hardwood Floors", "Updated Kitchen", "Laundry Room", "Security System",
    "Garage", "Walk-in Closet", "Gym/Fitness", "Pet Friendly"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Alerts</h2>
            <p className="text-gray-600 mt-1">Get notified when properties matching your criteria become available</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Create New Alert Button */}
          {!showCreateForm && (
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Alert</span>
              </button>

              <button
                onClick={checkForMatches}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Check for Matches</span>
              </button>
            </div>
          )}

          {/* Create Alert Form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Property Alert</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alert Name *</label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Downtown Condos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={newAlert.criteria?.location}
                    onChange={(e) => setNewAlert({
                      ...newAlert,
                      criteria: { ...newAlert.criteria!, location: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="City, neighborhood, or ZIP code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={newAlert.criteria?.minPrice}
                    onChange={(e) => setNewAlert({
                      ...newAlert,
                      criteria: { ...newAlert.criteria!, minPrice: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={newAlert.criteria?.maxPrice}
                    onChange={(e) => setNewAlert({
                      ...newAlert,
                      criteria: { ...newAlert.criteria!, maxPrice: parseInt(e.target.value) || 10000000 }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    value={newAlert.criteria?.propertyType}
                    onChange={(e) => setNewAlert({
                      ...newAlert,
                      criteria: { ...newAlert.criteria!, propertyType: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="apartment">Apartment</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification</label>
                  <select
                    value={newAlert.frequency}
                    onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <select
                    value={newAlert.criteria?.bedrooms}
                    onChange={(e) => setNewAlert({
                      ...newAlert,
                      criteria: { ...newAlert.criteria!, bedrooms: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Any</option>
                    <option value={1}>1+</option>
                    <option value={2}>2+</option>
                    <option value={3}>3+</option>
                    <option value={4}>4+</option>
                    <option value={5}>5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <select
                    value={newAlert.criteria?.bathrooms}
                    onChange={(e) => setNewAlert({
                      ...newAlert,
                      criteria: { ...newAlert.criteria!, bathrooms: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Any</option>
                    <option value={1}>1+</option>
                    <option value={2}>2+</option>
                    <option value={3}>3+</option>
                    <option value={4}>4+</option>
                  </select>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Desired Features</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableFeatures.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAlert.criteria?.features?.includes(feature) || false}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateAlert}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? "Creating..." : "Create Alert"}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your alerts...</p>
            </div>
          )}

          {/* Existing Alerts */}
          <div className="space-y-4">
            {!loading && alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5V7a12.5 12.5 0 1 1 25 0v10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Alerts</h3>
                <p className="text-gray-600">Create your first alert to get notified about new properties</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                      <p className="text-gray-600 text-sm">{alert.criteria.location}</p>
                      {alert.lastChecked && (
                        <p className="text-gray-500 text-xs mt-1">
                          Last checked: {new Date(alert.lastChecked).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${alert.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {alert.active ? 'Active' : 'Paused'}
                      </span>
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={alert.active ? 'Pause Alert' : 'Activate Alert'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete Alert"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Price Range</span>
                      <p className="font-medium">${alert.criteria.minPrice.toLocaleString()} - ${alert.criteria.maxPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Bedrooms</span>
                      <p className="font-medium">{alert.criteria.bedrooms ? `${alert.criteria.bedrooms}+` : 'Any'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Frequency</span>
                      <p className="font-medium capitalize">{alert.frequency}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Matches</span>
                      <p className="font-medium text-blue-600">{alert.matchCount} properties</p>
                    </div>
                  </div>

                  {alert.criteria.features.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Features</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {alert.criteria.features.map(feature => (
                          <span key={feature} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.lastNotified && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last notification sent: {new Date(alert.lastNotified).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
