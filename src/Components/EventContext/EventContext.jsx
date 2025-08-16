import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  // Store multiple events keyed by id
  const [events, setEvents] = useState(() => {
    const savedData = localStorage.getItem('events');
    return savedData ? JSON.parse(savedData) : {};
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep localStorage in sync (ignoring raw File objects)
  useEffect(() => {
    const safeData = {};
    Object.keys(events).forEach(id => {
      safeData[id] = { ...events[id], flyer: null };
    });
    localStorage.setItem('events', JSON.stringify(safeData));
  }, [events]);

  // Load event by ID (returns mapped event)
  const loadEvent = async (id, { force = false } = {}) => {
    if (!id) throw new Error('loadEvent requires an id');
    if (events[id] && !force) return events[id];

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`https://lagos-turnup.onrender.com/event/events/${id}`);
      const payload = res.data;

      const mappedData = {
        eventName: payload.event_name || '',
        date: payload.date || '',
        location: payload.state || '',
        description: payload.event_description || '',
        featureChoice: payload.is_featured ? 'yes-feature' : 'no-feature',
        flyer: null,
        flyerPreview: payload.flyer_url || null,
        dresscode: payload.dress_code || '',
        time: payload.time || '',
        venue: payload.venue || '',
        id: payload.id || id,
      };

      setEvents(prev => ({ ...prev, [id]: mappedData }));
      setLoading(false);
      return mappedData;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // Update event by ID using FormData
  const updateEvent = async (id, formData) => {
    if (!id) throw new Error('updateEvent requires an event ID');

    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/event/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data;

      const mappedData = {
        ...events[id],
        ...updated,
        id: updated.id || id,
        flyer: null,
        flyerPreview: updated.flyer_url || events[id]?.flyerPreview,
      };

      setEvents(prev => ({ ...prev, [id]: mappedData }));
      setLoading(false);
      return mappedData;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    if (!id) throw new Error('deleteEvent requires an event ID');

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/event/events/${id}`);
      setEvents(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // Clear all cached events
  const clearEventData = () => {
    setEvents({});
    localStorage.removeItem('events');
  };

  return (
    <EventContext.Provider value={{
      events,
      loadEvent,
      updateEvent,
      deleteEvent,
      clearEventData,
      loading,
      error
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
