import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Users, TrendingUp, Plus, Clock, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, eventsRes, registrationsRes] = await Promise.all([
        axios.get(`${API}/analytics/overview`, { headers }),
        axios.get(`${API}/events`, { headers }),
        axios.get(`${API}/registrations/my`, { headers })
      ]);

      setStats(statsRes.data);
      setUpcomingEvents(eventsRes.data.slice(0, 6));
      setMyRegistrations(registrationsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
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
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div data-testid="dashboard-container" className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 data-testid="welcome-heading" className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Here's what's happening with campus events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="stats-total-events" className="glass-card border-none card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_events || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="stats-total-registrations" className="glass-card border-none card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">My Registrations</CardTitle>
              <Users className="h-5 w-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_registrations || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="stats-total-users" className="glass-card border-none card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {user?.role === 'admin' ? 'Total Users' : 'Events Available'}
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user?.role === 'admin' ? stats?.total_users || 0 : upcomingEvents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {(user?.role === 'admin' || user?.role === 'organizer') && (
          <Card data-testid="quick-actions-card" className="glass-card border-none">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your events efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="create-event-btn"
                  onClick={() => navigate('/events/create')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
                <Button
                  data-testid="view-analytics-btn"
                  onClick={() => navigate('/analytics')}
                  variant="outline"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <Button data-testid="view-all-events-btn" onClick={() => navigate('/events')} variant="outline">
              View All
            </Button>
          </div>

          {upcomingEvents.length === 0 ? (
            <Card data-testid="no-events-card" className="glass-card border-none">
              <CardContent className="py-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                <p className="text-gray-600 dark:text-gray-400">Check back later for new events!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card
                  key={event.id}
                  data-testid={`event-card-${index}`}
                  className="glass-card border-none card-hover cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  {event.image_url && (
                    <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover rounded-t-lg" />
                    </div>
                  )}
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
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        Capacity: {event.capacity}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;