import React, { useEffect, useState } from 'react';
import {
  Bell, ImagePlus, CalendarPlus, Star, ImageMinus,
  Send, Edit, Trash2, LogIn, LogOut
} from 'lucide-react';
import api from '../api';
import './NotificationComp.css';

const NotificationComp = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchNotifications(); // Initial fetch

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('https://lagos-turnup.onrender.com/event/notifications');
      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
    } catch (error) {
      console.error('Error fetching Notifications', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getIcon = (title) => {
    if (!title || typeof title !== 'string') {
      return <Bell size={18} />; // fallback icon
    }
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('banner uploaded')) return <ImagePlus size={18} />;
    if (lowerTitle.includes('banner deleted')) return <ImageMinus size={18} />;
    if (lowerTitle.includes('event submitted')) return <CalendarPlus size={18} />;
    if (lowerTitle.includes('event edited')) return <Edit size={18} />;
    if (lowerTitle.includes('event deleted')) return <Trash2 size={18} />;
    if (lowerTitle.includes('featured request')) return <Star size={18} />;
    if (lowerTitle.includes('newsletter sent')) return <Send size={18} />;
    if (lowerTitle.includes('logged in')) return <LogIn size={18} />;
    if (lowerTitle.includes('logged out')) return <LogOut size={18} />;
    return <Bell size={18} />;
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentNotifications = notifications.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>NOTIFICATIONS</h2>
        <button className="filter-btn">
          <Bell size={18} />
          Filter
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="no-notifications">🎉 You’re all caught up!</p>
      ) : (
        <>
          <div className="notifications-list">
            {currentNotifications.map((notif) => (
              <div key={notif.id} className="notification-card">
                <div className="notif-icon">
                  {getIcon(notif.title)}
                </div>
                <div className="notif-content">
                  <h3 className="notif-title">{notif.title}</h3>
                  <p className="notif-message">{notif.message}</p>
                </div>
                <span className="notif-time">{formatTimeAgo(notif.created_at)}</span>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationComp;
