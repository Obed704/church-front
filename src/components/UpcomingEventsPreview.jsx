import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Users,
  Star,
  Bell
} from "lucide-react";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/events`;

const UpcomingEventsPreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminders, setReminders] = useState({});

  useEffect(() => {
    fetchEvents();
    loadReminders();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ENDPOINT}?status=upcoming&limit=3`);
      setEvents(res.data.events || res.data.slice(0, 3));
    } catch (err) {
      setError("Failed to load events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = () => {
    const savedReminders = JSON.parse(localStorage.getItem('eventReminders')) || {};
    setReminders(savedReminders);
  };

  const handleSetReminder = (eventId, eventTitle) => {
    const newReminders = {
      ...reminders,
      [eventId]: {
        eventId,
        eventTitle,
        enabled: true,
        setAt: new Date().toISOString()
      }
    };
    
    setReminders(newReminders);
    localStorage.setItem('eventReminders', JSON.stringify(newReminders));
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Reminder set for ${eventTitle}`, {
        body: 'You will be notified 24 hours before the event',
        icon: '/favicon.ico'
      });
    }
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const date = new Date(eventDate);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return { label: 'Tomorrow', color: 'bg-red-500/20 text-red-300' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-yellow-500/20 text-yellow-300' };
    return { label: 'Upcoming', color: 'bg-green-500/20 text-green-300' };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          ✨ Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-4"></div>
              <div className="h-4 bg-white/20 rounded mb-3"></div>
              <div className="h-4 bg-white/20 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          ✨ Upcoming Events
        </h2>
        <div className="text-center py-8">
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            ✨ Upcoming Events
          </h2>
          <p className="text-blue-100">
            Don't miss out on our spiritual gatherings
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="flex items-center text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Users size={16} className="mr-2" />
            <span>{events.reduce((acc, event) => acc + (event.attendees?.length || 0), 0)} attending</span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {events.map((event) => {
          const status = getEventStatus(event.date);
          const hasReminder = reminders[event._id]?.enabled;
          
          return (
            <div
              key={event._id}
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 
                         border border-white/20 hover:border-blue-400/50
                         transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
            >
              {/* Event Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                  {event.isFeatured && (
                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                      <Star size={10} className="inline mr-1" /> Featured
                    </span>
                  )}
                </div>
               
                <button
                  onClick={() => handleSetReminder(event._id, event.title)}
                  disabled={hasReminder}
                  className={`p-2 rounded-full transition-colors ${
                    hasReminder 
                      ? 'text-green-400 cursor-default' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={hasReminder ? "Reminder set" : "Set reminder"}
                >
                  <Bell size={18} fill={hasReminder ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Event Title */}
              <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-blue-200 transition-colors">
                {event.title}
              </h3>

              {/* Event Description */}
              <p className="text-white/80 text-sm mb-5 line-clamp-2">
                {event.description || "Join us for this special upcoming event."}
              </p>

              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-white/70">
                  <CalendarDays size={16} className="mr-2 flex-shrink-0" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-white/70">
                  <Clock size={16} className="mr-2 flex-shrink-0" />
                  <span>
                    {new Date(event.date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                {event.location && (
                  <div className="flex items-center text-sm text-white/70">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {/* Attendees Count */}
                {(event.attendees?.length > 0 || event.capacity) && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center text-white/70">
                        <Users size={14} className="mr-1" />
                        {event.attendees?.length || 0} attending
                      </span>
                      {event.capacity && (
                        <span className="text-white/50">
                          {event.capacity - (event.attendees?.length || 0)} spots left
                        </span>
                      )}
                    </div>
                    {event.capacity && (
                      <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(100, ((event.attendees?.length || 0) / event.capacity) * 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link
          to="/upcomingEvents"
          className="inline-flex items-center justify-center gap-2 
                     px-6 py-3 rounded-xl font-medium
                     bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30
                     transition-all duration-300 hover:scale-105 group"
        >
          View All Upcoming Events
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="mt-4 text-sm text-white/60">
          {events.length} upcoming event{events.length !== 1 ? 's' : ''} • More coming soon
        </p>
      </div>
    </div>
  );
};

export default UpcomingEventsPreview;