import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#8b5cf6', '#ec4899', '#22d3ee', '#34d399'];

const Analytics = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventAnalytics(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [eventsRes, overviewRes] = await Promise.all([
        axios.get(`${API}/events/my/organized`, { headers }),
        axios.get(`${API}/analytics/overview`, { headers })
      ]);

      setEvents(eventsRes.data);
      setOverviewStats(overviewRes.data);
      
      if (eventsRes.data.length > 0) {
        setSelectedEvent(eventsRes.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAnalytics = async (eventId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/analytics/event/${eventId}`, { headers });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load event analytics');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div data-testid="loading-spinner" className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  if (events.length === 0) {
    return (
      <Layout>
        <div data-testid="no-events-analytics" className="space-y-6">
          <h1 className="text-4xl font-bold">Analytics</h1>
          <Card className="glass-card border-none">
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No events to analyze</h3>
              <p className="text-gray-600 dark:text-gray-400">Create events to see analytics!</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const pieData = analytics ? [
    { name: 'Registered', value: analytics.total_registrations },
    { name: 'Available', value: Math.max(0, analytics.total_capacity - analytics.total_registrations) }
  ] : [];

  return (
    <Layout>
      <div data-testid="analytics-container" className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="analytics-heading" className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Track event performance and insights</p>
          </div>
          
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger data-testid="event-select" className="w-64 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="total-events-stat" className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overviewStats?.total_events || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="total-registrations-stat" className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrations</CardTitle>
              <Users className="h-5 w-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overviewStats?.total_registrations || 0}</div>
            </CardContent>
          </Card>

          {analytics && (
            <>
              <Card data-testid="attendance-stat" className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance</CardTitle>
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.attendance || 0}</div>
                </CardContent>
              </Card>

              <Card data-testid="avg-rating-stat" className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</CardTitle>
                  <Star className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.average_rating || 0}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="capacity-chart-card" className="glass-card border-none">
              <CardHeader>
                <CardTitle>Event Capacity Overview</CardTitle>
                <CardDescription>Registration vs Available Capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="metrics-chart-card" className="glass-card border-none">
              <CardHeader>
                <CardTitle>Event Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Capacity', value: analytics.total_capacity },
                      { name: 'Registered', value: analytics.total_registrations },
                      { name: 'Attended', value: analytics.attendance },
                      { name: 'Feedback', value: analytics.feedback_count }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Stats */}
        {analytics && (
          <Card data-testid="detailed-stats-card" className="glass-card border-none">
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Capacity</p>
                  <p className="text-3xl font-bold">{analytics.total_capacity}</p>
                </div>
                <div className="p-6 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Registrations</p>
                  <p className="text-3xl font-bold">{analytics.total_registrations}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {((analytics.total_registrations / analytics.total_capacity) * 100).toFixed(1)}% filled
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendance</p>
                  <p className="text-3xl font-bold">{analytics.attendance}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {analytics.total_registrations > 0 ? ((analytics.attendance / analytics.total_registrations) * 100).toFixed(1) : 0}% attended
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Feedback Count</p>
                  <p className="text-3xl font-bold">{analytics.feedback_count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg: {analytics.average_rating} ⭐</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;