import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { BiSolidMessageRounded } from "react-icons/bi";
import { MdFavorite } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoMdCheckmark } from "react-icons/io";



const Notifications = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Jelentkezz be az értesítések megtekintéséhez!');
      navigate('/bejelentkezes');
      return;
    }
    
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, authLoading, navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('https://api.ingatlan-projekt.com/api/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter(n => !n.olvasott).length);
    } catch (error) {
      console.error('Értesítések betöltési hiba:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, olvasott: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Értesítés olvasottnak jelölése hiba:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('https://api.ingatlan-projekt.com/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, olvasott: true })));
      setUnreadCount(0);
      toast.success('Összes értesítés olvasottnak jelölve');
    } catch (error) {
      toast.error('Hiba történt');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`https://api.ingatlan-projekt.com/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Értesítés törölve');
    } catch (error) {
      toast.error('Hiba a törlés során');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Most';
    if (minutes < 60) return `${minutes} perce`;
    if (hours < 24) return `${hours} órája`;
    if (days < 7) return `${days} napja`;
    return date.toLocaleDateString('hu-HU');
  };

  const getNotificationIcon = (type) => {
  switch(type) {
    case 'message':
      return <BiSolidMessageRounded />;
    case 'favorite':
      return <MdFavorite />;
    case 'property_status':
      return <FaHome />;
    case 'new_message':
      return <IoMdMail />;
    case 'system':
      return <IoSettingsSharp />;
    default:
      return <IoMdMail />;
    } 
  };

  if (authLoading || loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <h1>Értesítések</h1>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary">
              <IoMdCheckmark /> Mind olvasottnak jelölése
            </button>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="unread-banner">
             {unreadCount} olvasatlan értesítésed van
          </div>
        )}

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>Nincsenek értesítések</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.olvasott ? 'unread' : ''}`}
                onClick={() => !notification.olvasott && markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.tipus)}
                </div>
                <div className="notification-content">
                  <h4>{notification.cim}</h4>
                  <p>{notification.uzenet}</p>
                  <span className="notification-time">{formatTime(notification.letrehozva)}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="btn-delete-notification"
                  title="Törlés"
                >
                  <FaRegTrashCan />
                </button>
                {!notification.olvasott && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
