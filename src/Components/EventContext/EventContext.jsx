// EventContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  // ✅ Single current event state (instead of events dictionary)
  const [eventData, setEventData] = useState({
    eventName: '',
    date: '',
    location: '',
    description: '',
    featureChoice: 'no-feature',
    flyer: null,
    flyerPreview: null,
    dressCode: '',
    time: '',
    venue: '',
    contactMethod: 'email',
    contactValue: '',
    link: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token')

  // ✅ Persist current event (without raw file objects) into localStorage
  useEffect(() => {
    const safeData = { ...eventData, flyer: null }; 
    localStorage.setItem('eventData', JSON.stringify(safeData));
  }, [eventData]);

  // ✅ Load saved event from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem('eventData');
    if (saved) {
      setEventData(prev => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  // ✅ Load event by ID from API
  const loadEvent = async (id) => {
    if (!id) throw new Error('loadEvent requires an id');
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/event/events/${id}`);
      const payload = res.data;

      const mappedData = {
        eventName: payload.event_name || '',
        date: payload.date || '',
        location: payload.state || '',
        description: payload.event_description || '',
        featureChoice: payload.is_featured ? 'yes-feature' : 'no-feature',
        flyer: null,
        flyerPreview: payload.flyer_url || null,
        dressCode: payload.dress_code || '',
        time: payload.time || '',
        venue: payload.venue || '',
        contactMethod: 'email',
        contactValue: '',
        link: '',
        id: payload.id || id,
      };

      setEventData(mappedData);
      setLoading(false);
      return mappedData;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // ✅ Update event (API + context state)
  const updateEvent = async (id, formData) => {
    if (!id) throw new Error('updateEvent requires an event ID');
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/event/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}`  },
      });
      const updated = res.data;

      const mappedData = {
        ...eventData,
        ...updated,
        id: updated.id || id,
        flyer: null,
        flyerPreview: updated.flyer_url || eventData.flyerPreview,
      };

      setEventData(mappedData);
      setLoading(false);
      return mappedData;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // ✅ Delete event
  const deleteEvent = async (id) => {
    if (!id) throw new Error('deleteEvent requires an event ID');
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/event/events/${id}`, {
        headers: { Authorization: `Bearer ${token}`}
      });
      clearEventData();
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // ✅ Clear state + storage
  const clearEventData = () => {
    setEventData({
      eventName: '',
      date: '',
      location: '',
      description: '',
      featureChoice: 'no-feature',
      flyer: null,
      flyerPreview: null,
      dressCode: '',
      time: '',
      venue: '',
      contactMethod: 'email',
      contactValue: '',
      link: ''
    });
    localStorage.removeItem('eventData');
  };

  return (
    <EventContext.Provider value={{
      eventData, setEventData,
      loadEvent, updateEvent, deleteEvent, clearEventData,
      loading, error
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
