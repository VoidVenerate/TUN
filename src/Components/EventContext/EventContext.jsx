// EventContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { queryKeys } from '../../hooks/queries/queryKeys';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // single current event state
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
    link: '',
    phoneNo:'',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  // persist current event (no raw files) to localStorage
  useEffect(() => {
    const safeData = { ...eventData, flyer: null };
    localStorage.setItem('eventData', JSON.stringify(safeData));
  }, [eventData]);

  // load saved event on mount
  useEffect(() => {
    const saved = localStorage.getItem('eventData');
    if (saved) {
      setEventData(prev => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  // load event by id from API
  const loadEvent = async (id) => {
    if (!id) throw new Error('loadEvent requires an id');
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/event/events/${id}`);
      const payload = res.data;

      // map server fields into app state
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
        contactMethod: payload.contact_method || 'email',
        contactValue: payload.contact_value || '',
        link: payload.contact_link || '',
        id: payload.id || id,
        event_id: payload.id || id,
        featured_requested: !!payload.featured_requested,
        phoneNo: payload.phone_no,
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

  // update event (API + context state)
  const updateEvent = async (id, formData) => {
    if (!id) throw new Error('updateEvent requires an event ID');
    setLoading(true);
    setError(null);

    try {
      // build mappedFormData so we can ensure required server fields are present
      const mappedFormData = new FormData();

      // copy all entries
      for (let [key, value] of formData.entries()) {
        mappedFormData.append(key, value);
      }

      // prefer whatever the component submitted; if not present, fall back to context
        const providedIsFeatured = formData.get('is_featured');
        if (providedIsFeatured !== null && providedIsFeatured !== undefined) {
          // leave as-is (string 'true'/'false' or '1'/whatever the component sent)
          mappedFormData.set('is_featured', providedIsFeatured);
        } else {
          mappedFormData.set('is_featured', eventData.featureChoice === 'yes-feature');
        }

        // same for featured_requested if you want:
        const providedFeaturedReq = formData.get('featured_requested');
        if (providedFeaturedReq !== null && providedFeaturedReq !== undefined) {
          mappedFormData.set('featured_requested', providedFeaturedReq);
        } else {
          mappedFormData.set('featured_requested', eventData.featureChoice === 'yes-feature');
        }

      // DEBUG: optional log - comment out in production

      const res = await api.put(`/event/events/${id}`, mappedFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      const updated = res.data;

      // If server returned an object, use it. If it returned a minimal/string response,
      // re-fetch the event to get canonical state.
      let mappedData;
      if (updated && typeof updated === 'object') {
        mappedData = {
          ...eventData,
          ...updated,
          id: updated.id || id,
          event_id: updated.id || id,
          flyer: null,
          flyerPreview: updated.flyer_url || eventData.flyerPreview,
          featureChoice: updated.is_featured ? 'yes-feature' : 'no-feature',
          featured_requested: !!updated.featured_requested,
          contactMethod: updated.contact_method || eventData.contactMethod,
          contactValue: updated.contact_value || eventData.contactValue,
          link: updated.contact_link || eventData.link,
          phoneNo: updated.phone_no
        };
        setEventData(mappedData);
        setLoading(false);
        return mappedData;
      } else {
        // fallback: reload event from API
        const fresh = await loadEvent(id);
        setLoading(false);
        return fresh;
      }
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

  // delete event
  const deleteEvent = async (id) => {
    if (!id) throw new Error('deleteEvent requires an event ID');
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/event/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      clearEventData();
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setError(err);
      throw err;
    }
  };

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
      link: '',
      phoneNo:'',
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
