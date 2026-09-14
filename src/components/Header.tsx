import React, { useState } from 'react';
import { Upload, UserPlus, Bell, ArrowLeft, X } from 'lucide-react';
import { ZolveLogo } from './ZolveLogo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenBulkUpload: () => void;
  onOpenNewLead: () => void;
  activeOverdueCount: number;
  onSelectOverdueFilter: () => void;
  currentView: 'dashboard' | 'manager' | 'leads_list' | 'detail' | 'education_loan';
  onChangeView: (view: 'dashboard' | 'manager' | 'leads_list') => void;
  onBackToDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenBulkUpload,
  onOpenNewLead,
  activeOverdueCount,
  onSelectOverdueFilter,
  currentView,
  onChangeView,
  onBackToDashboard,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Generate mixed notifications
  const notifications = [
    {
      id: 1,
      title: 'KPI Breached',
      description: '3 leads require immediate action',
      type: 'breach',
      severity: 'high',
      timestamp: '2 min ago',
      icon: '🔴',
    },
    {
      id: 2,
      title: 'Calls Scheduled Today',
      description: '13 calls scheduled for today at various times',
      type: 'schedule',
      severity: 'medium',
      timestamp: '5 min ago',
      icon: '📞',
    },
    {
      id: 3,
      title: 'New Leads Assigned',
      description: '7 fresh leads assigned to you for qualification',
      type: 'assignment',
      severity: 'medium',
      timestamp: '15 min ago',
      icon: '👤',
    },
    {
      id: 4,
      title: 'Not Attempted Calls',
      description: '12 leads have not been contacted yet',
      type: 'pending',
      severity: 'low',
      timestamp: '1 hour ago',
      icon: '⏳',
    },
    {
      id: 5,
      title: 'Callback Scheduled',
      description: '8 leads awaiting callback',
      type: 'callback',
      severity: 'low',
      timestamp: '2 hours ago',
      icon: '📅',
    },
  ];

  // Count by type
  const totalNotifications = notifications.length;
  const breachCount = notifications.filter(n => n.type === 'breach').length;
  return (
    <header id="zolve-main-header" className="sticky top-0 z-30 bg-white border-b border-slate-200/80 py-2.5">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={onBackToDashboard}
            className="flex items-center gap-2 focus:outline-hidden text-left cursor-pointer"
            id="header-brand-btn"
          >
            <ZolveLogo size="md" showTagline={false} />
          </button>

          {/* Back to Dashboard breadcrumb (only in detail view) */}
          {currentView === 'detail' && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={onBackToDashboard}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                id="header-back-to-dashboard-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="text-slate-300">/</span>
              <button
                onClick={() => onChangeView('leads_list')}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Lead Management
              </button>
            </div>
          )}
        </div>

        {/* Center: Empty space */}
        <div className="flex-1"></div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                breachCount > 0 
                  ? 'bg-rose-50 border-rose-200 text-[#D91C24] hover:bg-rose-100' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={`${totalNotifications} notifications`}
              id="header-kpi-notification-btn"
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D91C24] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Notifications Popup */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{totalNotifications} updates</p>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-500 text-xs">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif) => {
                        const borderColor = notif.severity === 'high' ? 'border-[#D91C24]' : notif.severity === 'medium' ? 'border-amber-400' : 'border-blue-400';
                        const bgColor = notif.severity === 'high' ? 'bg-rose-50' : notif.severity === 'medium' ? 'bg-amber-50' : 'bg-blue-50';
                        
                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:${bgColor} transition-colors cursor-pointer border-l-3 ${borderColor}`}
                            onClick={() => setIsNotificationOpen(false)}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{notif.icon}</span>
                                <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">{notif.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 ml-6">{notif.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={() => {
                        onSelectOverdueFilter();
                        setIsNotificationOpen(false);
                      }}
                      className="text-xs font-semibold text-[#D91C24] hover:text-[#B30018] transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create Lead (Single button that opens popup to choose Manual or Bulk Upload) */}
          <button
            onClick={onOpenNewLead}
            id="header-create-lead-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#D91C24] hover:bg-[#B30018] rounded-lg shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Create Lead</span>
          </button>

          {/* User profile icon & Username */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              V
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <span className="font-semibold text-slate-800 block">Virendra</span>
              <span className="text-[10px] text-slate-500">Manager / RM</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

