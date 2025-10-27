import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Ticket, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyEvents = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const registrationsRes = await axios.get(`${API}/registrations/my`, { headers });
      const registrations = registrationsRes.data;

      // Fetch event details for each registration
      const eventPromises = registrations.map(reg => 
        axios.get(`${API}/events/${reg.event_id}`, { headers })
      );
      const eventResponses = await Promise.all(eventPromises);
      const eventsData = eventResponses.map(res => res.data);
      
      const enrichedRegistrations = registrations.map((reg, idx) => ({
        ...reg,
        event: eventsData[idx]
      }));

      setRegisteredEvents(enrichedRegistrations);

      // Fetch organized events if organizer or admin
      if (user.role === 'organizer' || user.role === 'admin') {
        const organizedRes = await axios.get(`${API}/events/my/organized`, { headers });
        setOrganizedEvents(organizedRes.data);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category) => {
    const classes = {
      'Technical': 'badge-technical',
      'Cultural': 'badge-cultural',
      'Sports': 'badge-sports',
      'Workshop': 'badge-workshop'
    };
    return classes[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div data-testid="loading-spinner" className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl">Loading your events...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div data-testid="my-events-container" className="space-y-8">
        <div>
          <h1 data-testid="my-events-heading" className="text-4xl font-bold mb-2">My Events</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your registered and organized events</p>
        </div>

        <Tabs defaultValue="registered" className="w-full">
          <TabsList className="grid w-full md:w-96 grid-cols-2">
            <TabsTrigger data-testid="registered-tab" value="registered">Registered Events</TabsTrigger>
            {(user.role === 'organizer' || user.role === 'admin') && (
              <TabsTrigger data-testid="organized-tab" value="organized">My Organized Events</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="registered" className="mt-6">
            {registeredEvents.length === 0 ? (
              <Card data-testid="no-registered-events-card" className="glass-card border-none">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No registered events</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start exploring and register for events!</p>
                  <Button data-testid="explore-events-btn" onClick={() => navigate('/events')}>
                    Explore Events
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEvents.map((reg, index) => (
                  <Card
                    key={reg.id}
                    data-testid={`registered-event-card-${index}`}
                    className="glass-card border-none card-hover"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`${getCategoryBadgeClass(reg.event.category)} text-white border-none`}>
                          {reg.event.category}
                        </Badge>
                        <Badge variant="outline" className="capitalize">{reg.status}</Badge>
                      </div>
                      <CardTitle className="line-clamp-1">{reg.event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{reg.event.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {reg.event.date} at {reg.event.time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          {reg.event.location}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`view-event-btn-${index}`}
                          onClick={() => navigate(`/events/${reg.event.id}`)}
                          variant="outline"
                          className="flex-1"
                        >
                          View Event
                        </Button>
                        <Button
                          data-testid={`view-ticket-btn-${index}`}
                          onClick={() => navigate(`/events/${reg.event.id}`)}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        >
                          <Ticket className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {(user.role === 'organizer' || user.role === 'admin') && (
            <TabsContent value="organized" className="mt-6">
              {organizedEvents.length === 0 ? (
                <Card data-testid="no-organized-events-card" className="glass-card border-none">
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No organized events</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first event!</p>
                    <Button data-testid="create-event-btn" onClick={() => navigate('/events/create')}>
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizedEvents.map((event, index) => (
                    <Card
                      key={event.id}
                      data-testid={`organized-event-card-${index}`}
                      className="glass-card border-none card-hover"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getCategoryBadgeClass(event.category)} text-white border-none`}>
                            {event.category}
                          </Badge>
                          <Badge variant="outline" className="capitalize">{event.status}</Badge>
                        </div>
                        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {event.date} at {event.time}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4" />
                            Capacity: {event.capacity}
                          </div>
                        </div>
                        <Button
                          data-testid={`view-organized-event-btn-${index}`}
                          onClick={() => navigate(`/events/${event.id}`)}
                          variant="outline"
                          className="w-full"
                        >
                          View & Manage
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyEvents;