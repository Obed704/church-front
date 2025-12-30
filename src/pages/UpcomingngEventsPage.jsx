import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import EnhancedHeader from "../components/header";
import Footer from "../components/footer";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Bell,
  Share2,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Tag,
  Download,
  Printer,
  Heart,
  UserPlus,
  Users as UsersIcon,
  AlertCircle,
  Loader2,
  ChevronDown,
  Grid,
  List,
  Bookmark,
  BellOff,
} from "lucide-react";

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_EVENTS_ENDPOINT = `${API_BASE_URL}/api/events`;
const API_EVENTS_STATS = `${API_EVENTS_ENDPOINT}/stats/summary`;

const UpcomingEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminders, setReminders] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    category: "all",
    timeframe: "upcoming",
    search: "",
    featured: "all",
    sortBy: "date_asc",
  });
  const [stats, setStats] = useState(null);
  const [user] = useState({
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
  });
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  // Initialize styles — completely unchanged
  const styles = useMemo(
    () => ({
      container: "min-h-screen bg-gradient-to-b from-gray-50 to-blue-50",
      header:
        "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm",
      hero: "bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden",
      card: "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100",
      cardHover: "hover:-translate-y-1",
      button: {
        primary:
          "bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        secondary:
          "border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200",
        success:
          "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors",
        danger:
          "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors",
        warning:
          "bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors",
      },
      badge: {
        upcoming: "bg-green-100 text-green-800",
        tomorrow: "bg-red-100 text-red-800",
        thisWeek: "bg-yellow-100 text-yellow-800",
        past: "bg-gray-100 text-gray-800",
        featured: "bg-purple-100 text-purple-800",
      },
      notification: {
        success: "bg-green-50 border-l-4 border-green-500 text-green-800",
        error: "bg-red-50 border-l-4 border-red-500 text-red-800",
        info: "bg-blue-50 border-l-4 border-blue-500 text-blue-800",
        warning: "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800",
      },
    }),
    []
  );

  // Fetch events and stats on mount
  useEffect(() => {
    fetchEvents();
    fetchStats();
    loadUserData();
    checkNotificationPermission();
  }, []);

  // Apply filters when events or filters change
  useEffect(() => {
    filterEvents();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_EVENTS_ENDPOINT);
      setEvents(res.data.events || res.data);
    } catch (err) {
      setError("Failed to load events. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(API_EVENTS_STATS);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const loadUserData = () => {
    const savedReminders =
      JSON.parse(localStorage.getItem("eventReminders")) || {};
    const savedBookmarks =
      JSON.parse(localStorage.getItem("eventBookmarks")) || {};
    setReminders(savedReminders);
    setBookmarks(savedBookmarks);
  };

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const filterEvents = useCallback(() => {
    let filtered = [...events];

    // Timeframe filter
    const now = new Date();
    if (filters.timeframe === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.date) >= now);
    } else if (filters.timeframe === "past") {
      filtered = filtered.filter((event) => new Date(event.date) < now);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (event) => event.category === filters.category
      );
    }

    // Featured filter
    if (filters.featured === "featured") {
      filtered = filtered.filter((event) => event.isFeatured);
    } else if (filters.featured === "regular") {
      filtered = filtered.filter((event) => !event.isFeatured);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.verse?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Sort events
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      switch (filters.sortBy) {
        case "date_desc":
          return dateB - dateA;
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "popularity":
          return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        default: // date_asc
          return dateA - dateB;
      }
    });

    setFilteredEvents(filtered);
  }, [events, filters]);

  const getEventStatus = useCallback(
    (eventDate) => {
      const now = new Date();
      const date = new Date(eventDate);
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

      if (date < now)
        return { label: "Past", style: styles.badge.past, days: diffDays };
      if (diffDays <= 1)
        return {
          label: "Tomorrow",
          style: styles.badge.tomorrow,
          days: diffDays,
        };
      if (diffDays <= 7)
        return {
          label: "This Week",
          style: styles.badge.thisWeek,
          days: diffDays,
        };
      return {
        label: "Upcoming",
        style: styles.badge.upcoming,
        days: diffDays,
      };
    },
    [styles.badge]
  );

  const handleRegister = async (eventId) => {
    try {
      const response = await axios.post(
        `${API_EVENTS_ENDPOINT}/${eventId}/register`,
        {
          userId: user.id,
          userName: user.name,
          email: user.email,
        }
      );

      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId
            ? { ...event, attendees: response.data.event.attendees }
            : event
        )
      );

      showNotification(`Successfully registered for event!`, "success");

      if (reminders[eventId]?.enabled === false) {
        handleSetReminder(eventId);
      }
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Registration failed",
        "error"
      );
    }
  };

  const handleSetReminder = async (eventId) => {
    const event = events.find((e) => e._id === eventId);
    if (!event) return;

    const eventDate = new Date(event.date);
    const reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

    const newReminders = {
      ...reminders,
      [eventId]: {
        eventId,
        eventTitle: event.title,
        reminderTime: reminderTime.toISOString(),
        enabled: true,
        notified: false,
      },
    };

    setReminders(newReminders);
    localStorage.setItem("eventReminders", JSON.stringify(newReminders));

    scheduleBrowserNotification(event, reminderTime);

    showNotification(
      `Reminder set for 24 hours before "${event.title}"`,
      "success"
    );
  };

  const handleRemoveReminder = (eventId) => {
    const newReminders = { ...reminders };
    delete newReminders[eventId];
    setReminders(newReminders);
    localStorage.setItem("eventReminders", JSON.stringify(newReminders));
    showNotification("Reminder removed", "info");
  };

  const scheduleBrowserNotification = (event, reminderTime) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const now = new Date();
      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      if (timeUntilReminder > 0 && timeUntilReminder < 2147483647) {
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(`Reminder: ${event.title}`, {
              body: `Starts at ${new Date(event.date).toLocaleTimeString()} ${
                event.location ? `at ${event.location}` : ""
              }`,
              icon: "/favicon.ico",
              tag: `event-reminder-${event._id}`,
            });

            const updatedReminders = { ...reminders };
            if (updatedReminders[event._id]) {
              updatedReminders[event._id].notified = true;
              setReminders(updatedReminders);
              localStorage.setItem(
                "eventReminders",
                JSON.stringify(updatedReminders)
              );
            }
          }
        }, timeUntilReminder);
      }
    }
  };

  const handleBookmark = (eventId) => {
    const event = events.find((e) => e._id === eventId);
    if (!event) return;

    const newBookmarks = {
      ...bookmarks,
      [eventId]: bookmarks[eventId]
        ? null
        : {
            eventId,
            eventTitle: event.title,
            date: event.date,
            bookmarkedAt: new Date().toISOString(),
          },
    };

    if (bookmarks[eventId]) {
      delete newBookmarks[eventId];
    }

    setBookmarks(newBookmarks);
    localStorage.setItem("eventBookmarks", JSON.stringify(newBookmarks));

    const action = bookmarks[eventId] ? "removed from" : "added to";
    showNotification(
      `Event ${action} bookmarks`,
      bookmarks[eventId] ? "info" : "success"
    );
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === "granted") {
          showNotification("Browser notifications enabled!", "success");
          Object.values(reminders).forEach((reminder) => {
            if (reminder.enabled && !reminder.notified) {
              const event = events.find((e) => e._id === reminder.eventId);
              if (event) {
                const reminderTime = new Date(reminder.reminderTime);
                scheduleBrowserNotification(event, reminderTime);
              }
            }
          });
        }
      } catch (err) {
        showNotification("Failed to enable notifications", "error");
      }
    } else {
      showNotification("Browser does not support notifications", "warning");
    }
  };

  const handleShareEvent = async (event) => {
    const shareData = {
      title: event.title,
      text: `Join us for ${event.title} on ${new Date(
        event.date
      ).toLocaleDateString()}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          fallbackShare(event);
        }
      }
    } else {
      fallbackShare(event);
    }
  };

  const fallbackShare = (event) => {
    const text = `${event.title}\nDate: ${new Date(
      event.date
    ).toLocaleDateString()}\n${
      event.location ? `Location: ${event.location}\n` : ""
    }${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      showNotification("Event details copied to clipboard!", "success");
    });
  };

  const showNotification = (message, type = "info") => {
    const id = Date.now();
    const newNotification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const exportEvents = () => {
    const exportData = filteredEvents.map((event) => ({
      Title: event.title,
      Date: new Date(event.date).toLocaleDateString(),
      Time: new Date(event.date).toLocaleTimeString(),
      Location: event.location || "N/A",
      Description: event.description,
      Category: event.category,
      Attendees: event.attendees?.length || 0,
      Capacity: event.capacity || "Unlimited",
    }));

    const csv = [
      Object.keys(exportData[0]).join(","),
      ...exportData.map((row) =>
        Object.values(row)
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification("Events exported to CSV", "success");
  };

  const printEvents = () => {
    const printContent = filteredEvents
      .map(
        (event) => `
      <div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 20px;">
        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${
          event.title
        }</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(
          event.date
        ).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(
          event.date
        ).toLocaleTimeString()}</p>
        ${
          event.location
            ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${event.location}</p>`
            : ""
        }
        <p style="margin: 5px 0;">${event.description}</p>
      </div>
    `
      )
      .join("");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Events List - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>Events List</h1>
          <p>Printed on: ${new Date().toLocaleString()}</p>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const EventCard = ({ event }) => {
    const status = getEventStatus(event.date);
    const isRegistered = event.attendees?.some((a) => a.userId === user.id);
    const hasReminder = reminders[event._id]?.enabled;
    const isBookmarked = !!bookmarks[event._id];
    const daysUntil = Math.ceil(
      (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className={`${styles.card} ${styles.cardHover}`}>
        {/* Event Header with Image */}
        <div className="relative h-48 overflow-hidden">
          {event.imageUrl && (
            <img
              src={`${API_BASE_URL}${event.imageUrl}`}
              alt={event.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.style}`}
            >
              {status.label}
            </span>
            {event.isFeatured && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                <Star size={10} className="inline mr-1" /> Featured
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button
              onClick={() => handleBookmark(event._id)}
              className={`p-2 rounded-full ${
                isBookmarked
                  ? "bg-yellow-500 text-white"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
            >
              <Bookmark
                size={16}
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={() => handleShareEvent(event)}
              className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white"
              title="Share event"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
              {event.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Tag size={12} className="mr-1" />
              <span className="capitalize">
                {event.category?.replace("_", " ")}
              </span>
            </div>
          </div>

          {event.verse && (
            <p className="text-sm italic text-gray-600 mb-3 border-l-4 border-blue-500 pl-3 py-1">
              "{event.verse}"
            </p>
          )}

          <p className="text-gray-700 mb-4 line-clamp-2">
            {event.shortDescription || event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="mx-1">•</span>
              <span className="text-sm">
                {new Date(event.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{event.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                <span className="text-sm">
                  {event.attendees?.length || 0} attending
                  {event.capacity && (
                    <span className="ml-1 text-gray-500">
                      ({event.availableSpots || event.capacity} left)
                    </span>
                  )}
                </span>
              </div>
              {daysUntil >= 0 && (
                <span className="text-sm font-medium">
                  {daysUntil === 0
                    ? "Today"
                    : `${daysUntil} day${daysUntil === 1 ? "" : "s"} to go`}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
              <ChevronRight size={16} className="ml-1" />
            </button>

            {isRegistered ? (
              <button
                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg flex items-center"
                disabled
              >
                <CheckCircle size={16} className="mr-1" />
                Registered
              </button>
            ) : (
              <button
                onClick={() => handleRegister(event._id)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                disabled={
                  event.capacity && event.attendees?.length >= event.capacity
                }
              >
                <UserPlus size={16} className="mr-1" />
                Register
              </button>
            )}

            {daysUntil > 0 &&
              (hasReminder ? (
                <button
                  onClick={() => handleRemoveReminder(event._id)}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <BellOff size={16} className="mr-1" />
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => handleSetReminder(event._id)}
                  className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
                >
                  <Bell size={16} className="mr-1" />
                  Remind
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const EventListView = ({ event }) => {
    const status = getEventStatus(event.date);
    const isRegistered = event.attendees?.some((a) => a.userId === user.id);
    const daysUntil = Math.ceil(
      (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className={`${styles.card} flex`}>
        <div className="w-32 flex-shrink-0">
          <img
            src={
              event.imageUrl
                ? `${API_BASE_URL}${event.imageUrl}`
                : "/default-event.jpg"
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${status.style}`}
                >
                  {status.label}
                </span>
                {event.isFeatured && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
                <span className="text-sm text-gray-500 capitalize">
                  {event.category?.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBookmark(event._id)}
                className={`p-1 ${
                  bookmarks[event._id] ? "text-yellow-500" : "text-gray-400"
                }`}
              >
                <Bookmark
                  size={18}
                  fill={bookmarks[event._id] ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={() => handleShareEvent(event)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {event.shortDescription || event.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center">
              <CalendarDays size={14} className="mr-1" />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {new Date(event.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {event.location && (
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {event.location}
              </span>
            )}
            <span className="flex items-center">
              <Users size={14} className="mr-1" />
              {event.attendees?.length || 0} attending
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View
            </button>
            {!isRegistered && (
              <button
                onClick={() => handleRegister(event._id)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EventModal = () => {
    if (!selectedEvent) return null;

    const status = getEventStatus(selectedEvent.date);
    const isRegistered = selectedEvent.attendees?.some(
      (a) => a.userId === user.id
    );
    const hasReminder = reminders[selectedEvent._id]?.enabled;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEvent.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${status.style}`}
                >
                  {status.label}
                </span>
                {selectedEvent.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {selectedEvent.verse && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-lg italic text-blue-800">
                  "{selectedEvent.verse}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Event Image */}
              <div className="md:col-span-2">
                {selectedEvent.imageUrl && (
                  <img
                    src={`${API_BASE_URL}${selectedEvent.imageUrl}`}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CalendarDays size={16} className="mr-2 text-gray-500" />
                      <span>
                        {new Date(selectedEvent.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      <span>
                        {new Date(selectedEvent.date).toLocaleTimeString()}
                      </span>
                    </div>
                    {selectedEvent.endDate && (
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        <span>
                          Ends:{" "}
                          {new Date(selectedEvent.endDate).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-500" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    {selectedEvent.virtualLink && (
                      <div className="flex items-center">
                        <ExternalLink
                          size={16}
                          className="mr-2 text-gray-500"
                        />
                        <a
                          href={selectedEvent.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Virtually
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attendance */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Attendance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Registered:</span>
                      <span className="font-semibold">
                        {selectedEvent.attendees?.length || 0}
                      </span>
                    </div>
                    {selectedEvent.capacity && (
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-semibold">
                          {selectedEvent.capacity}
                        </span>
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((selectedEvent.attendees?.length || 0) /
                              (selectedEvent.capacity || 100)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="prose max-w-none">
                {selectedEvent.description
                  ?.split("\n")
                  .map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            {/* Tags */}
            {selectedEvent.tags && selectedEvent.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isRegistered ? (
                <button className="px-6 py-2 bg-green-100 text-green-800 rounded-lg flex items-center">
                  <CheckCircle size={18} className="mr-2" />
                  Already Registered
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(selectedEvent._id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Register for Event
                </button>
              )}

              {hasReminder ? (
                <button
                  onClick={() => handleRemoveReminder(selectedEvent._id)}
                  className="px-6 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <BellOff size={18} className="mr-2" />
                  Remove Reminder
                </button>
              ) : (
                <button
                  onClick={() => handleSetReminder(selectedEvent._id)}
                  className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
                >
                  <Bell size={18} className="mr-2" />
                  Set Reminder
                </button>
              )}

              <button
                onClick={() => handleShareEvent(selectedEvent)}
                className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <Share2 size={18} className="mr-2" />
                Share Event
              </button>

              <button
                onClick={() => handleBookmark(selectedEvent._id)}
                className={`px-6 py-2 rounded-lg flex items-center ${
                  bookmarks[selectedEvent._id]
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Bookmark
                  size={18}
                  className="mr-2"
                  fill={bookmarks[selectedEvent._id] ? "currentColor" : "none"}
                />
                {bookmarks[selectedEvent._id] ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NotificationToast = ({ notification }) => (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        styles.notification[notification.type]
      } animate-slideIn`}
    >
      <div className="flex items-center">
        {notification.type === "success" && "✅"}
        {notification.type === "error" && "❌"}
        {notification.type === "warning" && "⚠️"}
        {notification.type === "info" && "ℹ️"}
        <span className="ml-2">{notification.message}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <EnhancedHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <EnhancedHeader />

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl mb-6 opacity-90">
            Join our community for worship, fellowship, and spiritual growth
          </p>

          {/* Quick Stats */}
          {stats && (
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">
                  {stats.upcomingEvents || 0}
                </div>
                <div className="text-sm opacity-90">Upcoming</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">
                  {events.reduce(
                    (sum, event) => sum + (event.attendees?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm opacity-90">Total Attendees</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <div className="text-2xl font-bold">
                  {stats.featuredEvents || 0}
                </div>
                <div className="text-sm opacity-90">Featured</div>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    placeholder="Search events..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="worship">Worship</option>
                  <option value="bible_study">Bible Study</option>
                  <option value="prayer">Prayer</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="outreach">Outreach</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Timeframe */}
              <div>
                <select
                  value={filters.timeframe}
                  onChange={(e) =>
                    setFilters({ ...filters, timeframe: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past Events</option>
                  <option value="all">All Events</option>
                </select>
              </div>

              {/* Featured */}
              <div>
                <select
                  value={filters.featured}
                  onChange={(e) =>
                    setFilters({ ...filters, featured: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <option value="featured">Featured Only</option>
                  <option value="regular">Regular Only</option>
                </select>
              </div>
            </div>

            {/* Second Row Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Sort By */}
              <div>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date_asc">Date (Earliest First)</option>
                  <option value="date_desc">Date (Latest First)</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <List size={20} />
                </button>
                <span className="text-sm text-gray-600 ml-2">View:</span>
              </div>

              {/* Export/Print */}
              <div className="flex gap-2">
                <button
                  onClick={exportEvents}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={printEvents}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>

              {/* Clear Filters */}
              <div>
                <button
                  onClick={() =>
                    setFilters({
                      category: "all",
                      timeframe: "upcoming",
                      search: "",
                      featured: "all",
                      sortBy: "date_asc",
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredEvents.length} Event
              {filteredEvents.length !== 1 ? "s" : ""} Found
            </h2>
            {filters.search && (
              <p className="text-gray-600 mt-1">
                Search results for: "{filters.search}"
              </p>
            )}
          </div>

          {/* Notification Permission Button */}
          {notificationPermission !== "granted" && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Bell size={18} />
              {notificationPermission === "default"
                ? "Enable Notifications"
                : "Allow Notifications"}
            </button>
          )}
        </div>

        {/* Events Display */}
        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">Error Loading Events</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new events.
            </p>
            <button
              onClick={() =>
                setFilters({
                  category: "all",
                  timeframe: "upcoming",
                  search: "",
                  featured: "all",
                  sortBy: "date_asc",
                })
              }
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Events Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {filteredEvents.map((event) => (
                  <EventListView key={event._id} event={event} />
                ))}
              </div>
            )}

            {/* User Stats */}
            <div className="bg-white rounded-xl p-6 shadow mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Your Event Activity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {
                      events.filter((e) =>
                        e.attendees?.some((a) => a.userId === user.id)
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Events Registered</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Object.values(reminders).filter((r) => r.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">Reminders Set</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {Object.values(bookmarks).filter(Boolean).length}
                  </div>
                  <div className="text-sm text-gray-600">Bookmarked</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {events.filter((e) => e.isFeatured).length}
                  </div>
                  <div className="text-sm text-gray-600">Featured Events</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Event Modal */}
      {isModalOpen && <EventModal />}

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        .prose {
          max-width: 100%;
        }
        
        .prose p {
          margin-top: 0;
          margin-bottom: 1em;
        }
      `}</style>

      <Footer />
    </>
  );
};

export default UpcomingEventsPage;