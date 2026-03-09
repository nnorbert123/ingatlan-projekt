import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { IoIosSend } from "react-icons/io";
import { FaHourglassEnd } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";

const Chat = () => {
  const { userId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showNewMessagesBanner, setShowNewMessagesBanner] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const inputRef = useRef(null);

  // Konténeren belüli scroll — NEM scrollIntoView, hogy az oldal ne mozduljon
  const scrollContainerToBottom = (behavior = 'auto') => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.warning('Jelentkezz be a chat-hez!');
      navigate('/bejelentkezes');
      return;
    }
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [user, authLoading, userId, navigate]);

  // Scroll to bottom ONLY on first load — konténeren belül
  useEffect(() => {
    if (!loading && messages.length > 0 && lastMessageCountRef.current === 0) {
      setTimeout(() => {
        scrollContainerToBottom('auto');
      }, 100);
    }
  }, [loading, messages]);

  // Detect new messages and show banner (only for received messages)
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
      const newMessages = messages.slice(lastMessageCountRef.current);
      const newFromOther = newMessages.filter(msg => msg.kuldo_id !== user.id);
      
      if (newFromOther.length > 0) {
        const container = messagesContainerRef.current;
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
          if (!isAtBottom) {
            setNewMessagesCount(newFromOther.length);
            setShowNewMessagesBanner(true);
          }
        }
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, user]);

  const fetchConversation = async () => {
    try {
      const res = await axios.get(`https://api.ingatlan-projekt.com/api/messages/conversation/${userId}`);
      const newMessages = res.data.data.messages;
      setMessages(newMessages);
      setOtherUser(res.data.data.otherUser);
      
      const unreadIds = newMessages
        .filter(msg => !msg.olvasott && msg.fogado_id === user.id)
        .map(msg => msg.id);
      if (unreadIds.length > 0) {
        await axios.put('https://api.ingatlan-projekt.com/api/messages/read-multiple', { messageIds: unreadIds });
      }
    } catch (error) {
      console.error('Beszélgetés betöltési hiba:', error);
      toast.error('Hiba a beszélgetés betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollContainerToBottom('smooth');
    setShowNewMessagesBanner(false);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (isAtBottom) {
        setShowNewMessagesBanner(false);
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      toast.error('Írj be egy üzenetet!');
      return;
    }
    setSending(true);
    try {
      await axios.post('https://api.ingatlan-projekt.com/api/messages', {
        fogado_id: parseInt(userId),
        uzenet: newMessage,
        targy: 'Chat'
      });
      setNewMessage('');
      await fetchConversation();
      
      // Üzenetküldés után konténeren belül scrollozunk — az oldal nem mozdul
      setTimeout(() => {
        scrollContainerToBottom('smooth');
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Üzenet küldése hiba:', error);
      if (error.response?.data?.message === 'Nem küldhetsz üzenetet saját magadnak') {
        toast.error('Nem küldhetsz üzenetet saját magadnak!');
      } else {
        toast.error('Hiba az üzenet küldésekor');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return 'Tegnap ' + date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (authLoading || loading) {
    return <div className="container loading"><p>Betöltés...</p></div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <button onClick={() => navigate('/uzenetek')} className="btn-back">
            <IoIosArrowBack />
          </button>
          <div className="chat-user-info">
            <div className="chat-avatar avatar-small">
              {otherUser?.profilkep && (
                <img
                  src={`https://api.ingatlan-projekt.com${otherUser.profilkep}`}
                  alt={otherUser?.nev}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              )}
              <span className="avatar-fallback">
                {otherUser?.nev?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2>{otherUser?.nev}</h2>
              <p className="chat-user-email">{otherUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="chat-messages" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="no-messages-chat">
              <p>Még nincs üzenet. Kezdeményezz beszélgetést!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`chat-message ${message.kuldo_id === user.id ? 'sent' : 'received'}`}
              >
                <div className="message-bubble">
                  {message.targy && message.targy !== 'Chat' && (
                    <p className="message-subject">{message.targy}</p>
                  )}
                  {message.ingatlan_cim && (
                    <p className="message-property">{message.ingatlan_cim}</p>
                  )}
                  <p className="message-text">{message.uzenet}</p>
                  <span className="message-time">{formatTime(message.kuldve)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* New Messages Banner */}
        {showNewMessagesBanner && (
          <div className="new-messages-banner" onClick={scrollToBottom}>
            {newMessagesCount} új üzenet • Ugrás az új üzenetekhez ↓
          </div>
        )}

        {/* Message Input */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Írj egy üzenetet..."
            disabled={sending}
            autoFocus
          />
          <button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? <FaHourglassEnd /> : <IoIosSend />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;