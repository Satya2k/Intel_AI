'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bell, CheckCheck, ExternalLink, ShieldAlert, 
  Ticket, CheckCircle2, XCircle, AlertTriangle, UserCheck
} from 'lucide-react';
import { InAppNotification, NotificationType } from '@/lib/database/types';
import { usePersona } from './PersonaContext';

export function NotificationCenter() {
  const { currentPersona } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${currentPersona.employee_id}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentPersona.employee_id]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: currentPersona.employee_id }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'TICKET_CREATED':
      case 'TICKET_ASSIGNED':
      case 'TICKET_STATUS_CHANGED':
        return <Ticket className="w-4 h-4 text-blue-400" />;
      case 'APPROVAL_REQUESTED':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      case 'APPROVAL_COMPLETED':
      case 'ACCESS_PROVISIONED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'APPROVAL_REJECTED':
      case 'ACCESS_REVOKED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'MAJOR_INCIDENT_BROADCAST':
        return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'SECURITY_RISK_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredNotifs = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1.5 border-b border-slate-800/80 bg-slate-900/50">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 no-scrollbar">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-40" />
                <p className="text-xs text-slate-400">No notifications to display</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Automated alerts and approval requests will appear here</p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  className={`p-3 transition-colors flex items-start gap-3 cursor-pointer ${
                    n.is_read ? 'hover:bg-slate-800/40 opacity-75' : 'bg-blue-950/20 hover:bg-blue-950/30'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    {getNotificationIcon(n.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.link_url && (
                        <Link
                          href={n.link_url}
                          onClick={() => setIsOpen(false)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Outbox link */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-center">
            <Link
              href="/admin/email"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5"
            >
              <span>Email Outbox & Delivery Console</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
