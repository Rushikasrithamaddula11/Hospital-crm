import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Plus,
  Search,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Send,
  RefreshCw,
  Eye,
  ShieldCheck
} from 'lucide-react';
import apiClient from '../services/api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/Toast';

export interface NotificationItem {
  id: number;
  patient_id_str?: string;
  recipient_name: string;
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'System Alert';
  recipient: string;
  template_type: string;
  message: string;
  status: string;
  timestamp: string;
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');

  // Modal State
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [channelInput, setChannelInput] = useState<'SMS' | 'WhatsApp' | 'Email'>('SMS');
  const [recipientInput, setRecipientInput] = useState('9876543210');
  const [templateInput, setTemplateInput] = useState('Appointment Reminder');
  const [messageInput, setMessageInput] = useState(
    'Dear Patient, your upcoming appointment at Sritha Hospitals is scheduled for tomorrow at 10:30 AM.'
  );
  const [isSending, setIsSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (searchQuery.trim()) params.q = searchQuery;
      if (channelFilter !== 'All') params.channel = channelFilter;

      const res = await apiClient.get<{ items: NotificationItem[]; total: number }>('/notifications', { params });
      setNotifications(res.data.items);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification logs.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, channelFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientInput.trim()) {
      showToast('error', 'Validation Error', 'Recipient phone or email is required');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        patient_identifier: patientIdInput.trim() || undefined,
        channel: channelInput,
        recipient: recipientInput.trim(),
        template_type: templateInput,
        message: messageInput.trim()
      };
      const res = await apiClient.post('/notifications', payload);
      showToast('success', 'Notification Dispatched', `Sent ${channelInput} message to ${res.data.recipient_name}`);
      setIsSendModalOpen(false);
      setPatientIdInput('');
      fetchNotifications();
    } catch (err: any) {
      showToast('error', 'Dispatch Failed', err.message);
    } finally {
      setIsSending(false);
    }
  };

  const smsCount = notifications.filter((n) => n.channel === 'SMS').length;
  const whatsappCount = notifications.filter((n) => n.channel === 'WhatsApp').length;
  const emailCount = notifications.filter((n) => n.channel === 'Email').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff & Patient Notification Center</h1>
            <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
              {total} Alerts Sent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch multi-channel SMS, WhatsApp alerts, appointment reminders, and automated lab notification broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchNotifications} />
          <Button icon={<Send className="w-4 h-4" />} onClick={() => setIsSendModalOpen(true)}>
            + Send Notification
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Dispatches</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">SMS Reminders</p>
          <p className="text-2xl font-bold text-sky-600 mt-0.5">{smsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">WhatsApp Alerts</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{whatsappCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Delivery Rate</p>
          <p className="text-2xl font-bold text-indigo-600 mt-0.5">99.8% Success</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Recipient Name, Patient ID (PT-xxxxxx), Phone, or Message text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-transparent border-0 font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Channels</option>
              <option value="SMS">SMS</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
              <option value="System Alert">System Alert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      {isLoading ? (
        <LoadingState message="Loading notification logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notification records found"
          description="No notification dispatches match your search filters."
          actionLabel="+ Send Notification"
          onAction={() => setIsSendModalOpen(true)}
          icon={<Bell className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Category / Template</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Status & Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                        notif.channel === 'WhatsApp'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : notif.channel === 'SMS'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {notif.channel === 'WhatsApp' && <MessageSquare className="w-3 h-3" />}
                        {notif.channel === 'SMS' && <Smartphone className="w-3 h-3" />}
                        {notif.channel === 'Email' && <Mail className="w-3 h-3" />}
                        {notif.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{notif.recipient_name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{notif.recipient}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{notif.template_type}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 font-mono">{notif.message}</td>
                    <td className="py-3 px-4">
                      <Badge status={notif.status} />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(notif.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedNotif(notif)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Message Detail Modal */}
      {selectedNotif && (
        <Modal
          isOpen={Boolean(selectedNotif)}
          onClose={() => setSelectedNotif(null)}
          title={`Dispatched Message — ${selectedNotif.channel}`}
          subtitle={`Recipient: ${selectedNotif.recipient_name} (${selectedNotif.recipient})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">{selectedNotif.template_type}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Channel: {selectedNotif.channel}</p>
              </div>
              <Badge status={selectedNotif.status} />
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                Full Message Payload
              </span>
              <p className="text-slate-800 font-mono leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                {selectedNotif.message}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedNotif(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Notification Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Dispatch Notification"
        subtitle="Send SMS, WhatsApp, or Email message to patient or staff"
        maxWidth="md"
      >
        <form onSubmit={handleSendSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Notification Channel</label>
              <select
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Patient ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. PT-000001"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Recipient Phone / Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="9876543210 or patient@example.com"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Template Category</label>
            <select
              value={templateInput}
              onChange={(e) => {
                const val = e.target.value;
                setTemplateInput(val);
                if (val === 'Appointment Reminder') {
                  setMessageInput('Dear Patient, your upcoming appointment at Sritha Hospitals is scheduled for tomorrow at 10:30 AM.');
                } else if (val === 'Lab Report Ready') {
                  setMessageInput('Hello, your laboratory test report is now available for download in the Sritha Hospitals patient portal.');
                } else if (val === 'Prescription Summary') {
                  setMessageInput('Dear Patient, your electronic prescription has been dispatched by your attending doctor.');
                }
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="Appointment Reminder">Appointment Reminder</option>
              <option value="Lab Report Ready">Lab Report Ready</option>
              <option value="Prescription Summary">Prescription Summary</option>
              <option value="Custom Message">Custom Message</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Message Payload Text</label>
            <textarea
              rows={3}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsSendModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSending} icon={<Send className="w-4 h-4" />}>
              Dispatch Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
