'use client';

import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'property' | 'account';
  userEmail: string;
  userName: string;
  assignedTo?: string;
  responses: Array<{
    id: string;
    message: string;
    sender: string;
    timestamp: Date;
    isAdmin: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  createdAt: Date;
}

export default function AdminSupport() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

  // Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [newResponse, setNewResponse] = useState('');

  // FAQ Management
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    isPublished: true
  });

  // Help Articles
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: 'getting-started',
    tags: [] as string[],
    isPublished: true
  }); useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }

    if (user.email !== 'admin@alphaargons.com') {
      router.push('/');
      return;
    }

    fetchSupportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTickets(),
        fetchFAQs(),
        fetchArticles()
      ]);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchTickets = async () => {
    try {
      const ticketsQuery = query(
        collection(db, 'support_tickets'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(ticketsQuery);

      const ticketsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responses: doc.data().responses?.map((resp: { message: string; author: string; createdAt: any }) => ({
          ...resp,
          timestamp: resp.createdAt && typeof resp.createdAt.toDate === 'function'
            ? resp.createdAt.toDate()
            : new Date()
        })) || []
      })) as SupportTicket[];

      setTickets(ticketsList);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const faqsQuery = query(
        collection(db, 'faqs'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(faqsQuery);

      const faqsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FAQItem[];

      setFaqs(faqsList);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const articlesQuery = query(
        collection(db, 'help_articles'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(articlesQuery);

      const articlesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as HelpArticle[];

      setArticles(articlesList);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status,
        updatedAt: Timestamp.now()
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const addTicketResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      const response = {
        id: Date.now().toString(),
        message: newResponse,
        sender: user?.email || 'admin',
        timestamp: Timestamp.now(),
        isAdmin: true
      };

      const updatedResponses = [...(selectedTicket.responses || []), response];

      await updateDoc(doc(db, 'support_tickets', selectedTicket.id), {
        responses: updatedResponses,
        status: 'in_progress',
        updatedAt: Timestamp.now()
      });

      setNewResponse('');
      fetchTickets();

      // Update selected ticket
      setSelectedTicket(prev => prev ? {
        ...prev,
        responses: updatedResponses.map(resp => ({
          ...resp,
          timestamp: resp.timestamp instanceof Date ? resp.timestamp : resp.timestamp.toDate()
        }))
      } : null);
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const createFAQ = async () => {
    try {
      if (!newFAQ.question || !newFAQ.answer) {
        alert('Please fill in all required fields');
        return;
      }

      await addDoc(collection(db, 'faqs'), {
        ...newFAQ,
        createdAt: Timestamp.now()
      });

      setShowFAQModal(false);
      setNewFAQ({
        question: '',
        answer: '',
        category: 'general',
        order: 0,
        isPublished: true
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
    }
  };

  const createArticle = async () => {
    try {
      if (!newArticle.title || !newArticle.content) {
        alert('Please fill in all required fields');
        return;
      }

      await addDoc(collection(db, 'help_articles'), {
        ...newArticle,
        views: 0,
        createdAt: Timestamp.now()
      });

      setShowArticleModal(false);
      setNewArticle({
        title: '',
        content: '',
        category: 'getting-started',
        tags: [],
        isPublished: true
      });
      fetchArticles();
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  const deleteFAQ = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteDoc(doc(db, 'faqs', id));
        fetchFAQs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const deleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteDoc(doc(db, 'help_articles', id));
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter === 'all') return true;
    return ticket.status === ticketFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support data...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Support & Help Center</h1>
              <p className="text-gray-600">Manage support tickets, FAQs, and help articles</p>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QuestionMarkCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total FAQs</p>
                <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MagnifyingGlassIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Help Articles</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'tickets', name: 'Support Tickets', count: tickets.length },
                { id: 'faqs', name: 'FAQs', count: faqs.length },
                { id: 'articles', name: 'Help Articles', count: articles.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tickets List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Tickets</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                      <p className="text-gray-600">No support tickets match the current filter</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</h4>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{ticket.userEmail}</span>
                            <span>{ticket.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-1">
              {selectedTicket ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{selectedTicket.subject}</h4>
                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusIcon(selectedTicket.status)}
                        <span className="text-sm text-gray-600">Status: {selectedTicket.status}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>Priority: {selectedTicket.priority}</span>
                        <span>Category: {selectedTicket.category}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{selectedTicket.message}</p>
                    </div>

                    {/* Status Actions */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Responses */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Responses ({selectedTicket.responses?.length || 0})</h5>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {selectedTicket.responses?.map((response) => (
                          <div key={response.id} className={`p-3 rounded-md text-sm ${response.isAdmin ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                            }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{response.sender}</span>
                              <span className="text-xs text-gray-500">{response.timestamp.toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Response */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Response</label>
                      <textarea
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your response..."
                      />
                      <button
                        onClick={addTicketResponse}
                        disabled={!newResponse.trim()}
                        className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Ticket</h3>
                  <p className="text-gray-600">Choose a ticket from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">FAQ Management</h3>
              <button
                onClick={() => setShowFAQModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add FAQ
              </button>
            </div>
            <div className="overflow-hidden">
              {faqs.length === 0 ? (
                <div className="text-center py-12">
                  <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
                  <p className="text-gray-600 mb-4">Create your first FAQ to help users</p>
                  <button
                    onClick={() => setShowFAQModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add FAQ
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h4>
                          <p className="text-gray-600 mb-3">{faq.answer}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {faq.category}</span>
                            <span>Order: {faq.order}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${faq.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {faq.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingFAQ(faq);
                              setNewFAQ({
                                question: faq.question,
                                answer: faq.answer,
                                category: faq.category,
                                order: faq.order,
                                isPublished: faq.isPublished
                              });
                              setShowFAQModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteFAQ(faq.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

        {/* Help Articles Tab */}
        {activeTab === 'articles' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Help Articles</h3>
              <button
                onClick={() => setShowArticleModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Article
              </button>
            </div>
            <div className="overflow-hidden">
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
                  <p className="text-gray-600 mb-4">Create your first help article</p>
                  <button
                    onClick={() => setShowArticleModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Article
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {articles.map((article) => (
                    <div key={article.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{article.title}</h4>
                          <p className="text-gray-600 mb-3 line-clamp-3">{article.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {article.category}</span>
                            <span>Views: {article.views}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${article.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {article.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          {article.tags.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              <TagIcon className="h-4 w-4 text-gray-400" />
                              <div className="flex space-x-1">
                                {article.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingArticle(article);
                              setNewArticle({
                                title: article.title,
                                content: article.content,
                                category: article.category,
                                tags: article.tags,
                                isPublished: article.isPublished
                              });
                              setShowArticleModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
      </div>

      {/* FAQ Modal */}
      {showFAQModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                <input
                  type="text"
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer *</label>
                <textarea
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the answer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="account">Account</option>
                    <option value="properties">Properties</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={newFAQ.order}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="faq-published"
                  checked={newFAQ.isPublished}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="faq-published" className="ml-2 text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                  setNewFAQ({
                    question: '',
                    answer: '',
                    category: 'general',
                    order: 0,
                    isPublished: true
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFAQ}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={newArticle.content}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter article content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="getting-started">Getting Started</option>
                    <option value="user-guide">User Guide</option>
                    <option value="troubleshooting">Troubleshooting</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newArticle.tags.join(', ')}
                    onChange={(e) => setNewArticle(prev => ({
                      ...prev,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="article-published"
                  checked={newArticle.isPublished}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="article-published" className="ml-2 text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowArticleModal(false);
                  setEditingArticle(null);
                  setNewArticle({
                    title: '',
                    content: '',
                    category: 'getting-started',
                    tags: [],
                    isPublished: true
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createArticle}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingArticle ? 'Update Article' : 'Create Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
