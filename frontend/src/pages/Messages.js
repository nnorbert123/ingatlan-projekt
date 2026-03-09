import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { BiMessageSquareAdd } from "react-icons/bi";
import { BiMessageSquareError } from "react-icons/bi";
import { FaRegTrashAlt } from "react-icons/fa";

const Messages = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.warning('Jelentkezz be az üzenetek megtekintéséhez!');
      navigate('/bejelentkezes');
      return;
    }
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 5000);
    return () => clearInterval(interval);
  }, [user, authLoading, navigate, activeTab]);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get('https://api.ingatlan-projekt.com/api/messages');
      const currentTab = activeTabRef.current;
      const filtered = currentTab === 'received'
        ? res.data.data.filter(msg => msg.fogado_id === user.id)
        : res.data.data.filter(msg => msg.kuldo_id === user.id);

      const conversationMap = new Map();
      filtered.forEach(msg => {
        const otherUserId = currentTab === 'received' ? msg.kuldo_id : msg.fogado_id;
        const existing = conversationMap.get(otherUserId);
        if (!existing || new Date(msg.kuldve) > new Date(existing.kuldve)) {
          conversationMap.set(otherUserId, msg);
        }
      });

      const uniqueConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.kuldve) - new Date(a.kuldve));
      setMessages(uniqueConversations);
    } catch (error) {
      console.error('Uzenetek betoltesi hiba:', error);
      if (showLoading) toast.error('Hiba az uzenetek betoltesekor');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`https://api.ingatlan-projekt.com/api/messages/${messageId}/read`);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, olvasott: true } : msg
      ));
    } catch (error) {
      console.error('Uzenet olvasottnak jelolese hiba:', error);
    }
  };

  const deleteConversation = async (e, otherUserId) => {
    e.stopPropagation();
    if (!window.confirm('Biztosan törölni szeretnéd az egész beszélgetést?')) return;
    try {
      await axios.delete(`https://api.ingatlan-projekt.com/api/messages/conversation/${otherUserId}`);
      setMessages(prev => prev.filter(msg => {
        const msgOtherUserId = activeTabRef.current === 'received' ? msg.kuldo_id : msg.fogado_id;
        return msgOtherUserId !== otherUserId;
      }));
      toast.success('Beszélgetés törölve');
    } catch (error) {
      toast.error('Hiba a törlés során');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Most';
    if (hours < 24) return `${hours} órája`;
    if (days < 7) return `${days} napja`;
    return date.toLocaleDateString('hu-HU');
  };

  if (authLoading || loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  const unreadCount = messages.filter(msg => !msg.olvasott && msg.fogado_id === user.id).length;

  return (
    <div className="messages-page">
      <div className="container">
        <h1>Üzenetek</h1>

        <div className="messages-tabs">
          <button
            className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            <BiMessageSquareAdd /> Beérkezett {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <BiMessageSquareError /> Elküldött
          </button>
        </div>

        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>{activeTab === 'received' ? 'Nincsenek beérkezett üzenetek' : 'Nincsenek elküldött üzenetek'}</p>
            </div>
          ) : (
            messages.map(message => {
              const otherUserId = activeTab === 'received' ? message.kuldo_id : message.fogado_id;
              return (
                <div
                  key={message.id}
                  className={`message-item ${!message.olvasott && activeTab === 'received' ? 'unread' : ''}`}
                  onClick={() => navigate(`/chat/${otherUserId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="message-header">
                    <div className="message-from">
                      <div className="avatar-small">
                        {(activeTab === 'received' ? message.kuldo_profilkep : message.fogado_profilkep) ? (
                          <img
                            src={`https://api.ingatlan-projekt.com${activeTab === 'received' ? message.kuldo_profilkep : message.fogado_profilkep}`}
                            alt={activeTab === 'received' ? message.kuldo_nev : message.fogado_nev}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="avatar-fallback">
                          {activeTab === 'received'
                            ? message.kuldo_nev?.charAt(0).toUpperCase() || 'U'
                            : message.fogado_nev?.charAt(0).toUpperCase() || 'U'
                          }
                        </span>
                      </div>
                      <div>
                        <h4>
                          {activeTab === 'received' ? message.kuldo_nev : message.fogado_nev}
                          {!message.olvasott && activeTab === 'received' && (
                            <span className="unread-dot">●</span>
                          )}
                        </h4>
                        {message.ingatlan_cim && (
                          <p className="message-property">{message.ingatlan_cim}</p>
                        )}
                      </div>
                    </div>
                    <div className="message-meta">
                      <span className="message-time">{formatDate(message.kuldve)}</span>
                      <button
                        onClick={(e) => deleteConversation(e, otherUserId)}
                        className="btn-delete-msg"
                        title="Beszélgetés törlése"
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  </div>
                  <div className="message-content">
                    {message.targy && <p className="message-subject">{message.targy}</p>}
                    <p className="message-text">{message.uzenet}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
