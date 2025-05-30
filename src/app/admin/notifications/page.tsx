'use client';

import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  InformationCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  target: 'all' | 'buyers' | 'sellers' | 'agents';
  status: 'draft' | 'sent' | 'scheduled';
  recipients?: number;
  sentAt?: Date;
  scheduledFor?: Date;
  createdAt: Date;
  createdBy: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('notifications'); const [showCreateModal, setShowCreateModal] = useState(false); const [newNotification, setNewNotification] = useState<{
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
    target: 'all' | 'buyers' | 'sellers' | 'agents';
    status: 'draft' | 'sent' | 'scheduled';
    scheduledFor: string;
  }>({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    status: 'draft',
    scheduledFor: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Check if user is admin
    if (user.email !== 'admin@alphaargons.com') {
      router.push('/');
      return;
    }

    fetchNotifications();
    fetchTemplates();
  }, [user, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsQuery = query(
        collection(db, 'admin_notifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(notificationsQuery);

      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        sentAt: doc.data().sentAt?.toDate(),
        scheduledFor: doc.data().scheduledFor?.toDate()
      })) as Notification[];

      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const templatesQuery = query(collection(db, 'notification_templates'));
      const snapshot = await getDocs(templatesQuery);

      const templatesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationTemplate[];

      setTemplates(templatesList);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        alert('Please fill in all required fields');
        return;
      }

      const notificationData = {
        ...newNotification,
        createdAt: Timestamp.now(),
        createdBy: user?.email || 'admin',
        scheduledFor: newNotification.scheduledFor ? Timestamp.fromDate(new Date(newNotification.scheduledFor)) : null
      };

      await addDoc(collection(db, 'admin_notifications'), notificationData);

      // If sending immediately, also create user notifications
      if (newNotification.status === 'sent') {
        await createUserNotifications(notificationData);
      }

      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        status: 'draft',
        scheduledFor: ''
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    }
  };

  const createUserNotifications = async (notificationData: {
    title: string;
    message: string;
    type: string;
    target: string;
  }) => {
    try {
      // Get users based on target
      let usersQuery = query(collection(db, 'users'));

      if (notificationData.target !== 'all') {
        usersQuery = query(
          collection(db, 'users'),
          where('role', '==', notificationData.target.slice(0, -1)) // Remove 's' from plural
        );
      }

      const usersSnapshot = await getDocs(usersQuery);
      const userNotifications = usersSnapshot.docs.map(userDoc => ({
        userId: userDoc.id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        read: false,
        createdAt: Timestamp.now()
      }));

      // Batch create user notifications
      const promises = userNotifications.map(notification =>
        addDoc(collection(db, 'user_notifications'), notification)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error creating user notifications:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteDoc(doc(db, 'admin_notifications', id));
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification');
      }
    }
  };

  const sendNotification = async (notification: Notification) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', notification.id), {
        status: 'sent',
        sentAt: Timestamp.now()
      });      // Create user notifications
      await createUserNotifications({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        target: notification.target
      });

      fetchNotifications();
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'buyers':
      case 'sellers':
      case 'agents':
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <HomeIcon className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
              <p className="text-gray-600">Manage and send notifications to users</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Notification
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Templates ({templates.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            </div>
            <div className="overflow-hidden">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600 mb-4">Create your first notification to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Notification
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(notification.type)}
                            <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                            {getStatusBadge(notification.status)}
                          </div>
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              {getTargetIcon(notification.target)}
                              <span>Target: {notification.target}</span>
                            </div>
                            <span>•</span>
                            <span>Created: {notification.createdAt.toLocaleDateString()}</span>
                            {notification.sentAt && (
                              <>
                                <span>•</span>
                                <span>Sent: {notification.sentAt.toLocaleDateString()}</span>
                              </>
                            )}
                            {notification.scheduledFor && (
                              <>
                                <span>•</span>
                                <span>Scheduled: {notification.scheduledFor.toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {notification.status === 'draft' && (
                            <button
                              onClick={() => sendNotification(notification)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Send now"
                            >
                              <BellIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => alert('Edit functionality coming soon')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notification Templates</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Templates Coming Soon</h3>
                <p className="text-gray-600">Template management will be available in the next update</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Notification</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as 'info' | 'success' | 'warning' | 'error' | 'announcement' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                  <select
                    value={newNotification.target}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, target: e.target.value as 'all' | 'buyers' | 'sellers' | 'agents' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="buyers">Buyers</option>
                    <option value="sellers">Sellers</option>
                    <option value="agents">Agents</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newNotification.status}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, status: e.target.value as 'draft' | 'sent' | 'scheduled' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="sent">Send Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>
                {newNotification.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For</label>
                    <input
                      type="datetime-local"
                      value={newNotification.scheduledFor}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNotification}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {newNotification.status === 'sent' ? 'Send Now' : 'Create Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
