import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MessageModal = ({ isOpen, onClose, recipientId, recipientName, propertyId, propertyTitle }) => {
  const [formData, setFormData] = useState({
    targy: propertyTitle ? `Érdeklődés: ${propertyTitle}` : '',
    uzenet: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.uzenet.trim()) {
      toast.error('Az üzenet nem lehet üres!');
      return;
    }

    setSending(true);

    try {
      await axios.post('https://api.ingatlan-projekt.com/api/messages', {
        fogado_id: recipientId,
        ingatlan_id: propertyId || null,
        targy: formData.targy,
        uzenet: formData.uzenet
      });

      toast.success('Üzenet sikeresen elküldve!');
      setFormData({ targy: '', uzenet: '' });
      onClose();
    } catch (error) {
      console.error('Üzenetküldési hiba:', error);
      if (error.response?.data?.message === 'Nem küldhetsz üzenetet saját magadnak') {
        toast.error('Nem küldhetsz üzenetet saját magadnak!');
      } else {
        toast.error('Hiba az üzenet küldésekor');
      }
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Üzenet küldése</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="recipient-info">Címzett: <strong>{recipientName}</strong></p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tárgy</label>
              <input
                type="text"
                name="targy"
                value={formData.targy}
                onChange={handleChange}
                placeholder="Üzenet tárgya"
                required
              />
            </div>

            <div className="form-group">
              <label>Üzenet *</label>
              <textarea
                name="uzenet"
                rows="6"
                value={formData.uzenet}
                onChange={handleChange}
                placeholder="Írja le üzenetét..."
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Mégse
              </button>
              <button type="submit" className="btn-send" disabled={sending}>
                {sending ? 'Küldés...' : 'Üzenet küldése'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
