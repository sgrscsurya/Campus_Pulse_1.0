import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Calendar, Clock, MapPin, Users, Star, ArrowLeft, Ticket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [eventRes, registrationsRes, feedbackRes] = await Promise.all([
        axios.get(`${API}/events/${id}`, { headers }),
        axios.get(`${API}/registrations/my`, { headers }),
        axios.get(`${API}/feedback/event/${id}`, { headers })
      ]);

      setEvent(eventRes.data);
      setFeedback(feedbackRes.data);

      const userReg = registrationsRes.data.find(r => r.event_id === id);
      if (userReg) {
        setIsRegistered(true);
        setRegistration(userReg);
      }
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API}/registrations/register`, { event_id: id }, { headers });
      setIsRegistered(true);
      setRegistration(response.data);
      toast.success('Successfully registered for the event!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/feedback`, { event_id: id, rating, comment }, { headers });
      toast.success('Feedback submitted successfully!');
      setShowFeedback(false);
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit feedback');
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
          <div className="text-xl">Loading event...</div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div data-testid="event-details-container" className="space-y-8">
        <Button data-testid="back-btn" onClick={() => navigate('/events')} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="event-info-card" className="glass-card border-none">
              {event.image_url && (
                <div className="h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getCategoryBadgeClass(event.category)} text-white border-none`}>
                    {event.category}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{event.status}</Badge>
                </div>
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                <CardDescription className="text-lg">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <Calendar className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <Clock className="h-6 w-6 text-pink-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-semibold">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <MapPin className="h-6 w-6 text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <Users className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold">{event.capacity} attendees</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card data-testid="feedback-card" className="glass-card border-none">
              <CardHeader>
                <CardTitle>Reviews & Feedback</CardTitle>
                <CardDescription>
                  {feedback.length} {feedback.length === 1 ? 'review' : 'reviews'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No feedback yet. Be the first to review!</p>
                ) : (
                  feedback.map((fb, index) => (
                    <div key={fb.id} data-testid={`feedback-item-${index}`} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                            {fb.user_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{fb.user_name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{fb.comment}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card data-testid="registration-card" className="glass-card border-none sticky top-24">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRegistered ? (
                  <>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-400 font-semibold flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        You're registered!
                      </p>
                    </div>
                    <Button
                      data-testid="view-ticket-btn"
                      onClick={() => setShowQR(true)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      View QR Ticket
                    </Button>
                    <Button
                      data-testid="submit-feedback-btn"
                      onClick={() => setShowFeedback(true)}
                      variant="outline"
                      className="w-full"
                    >
                      Submit Feedback
                    </Button>
                  </>
                ) : (
                  <Button
                    data-testid="register-btn"
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    Register Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent data-testid="qr-modal" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Event Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg">
              {registration?.ticket_qr_code && (
                <img src={registration.ticket_qr_code} alt="QR Code" className="w-full" />
              )}
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-gray-500">Show this QR code at the event entrance</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent data-testid="feedback-modal">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    data-testid={`rating-star-${star}`}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                data-testid="feedback-comment"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
            <Button
              data-testid="submit-feedback-submit-btn"
              onClick={handleSubmitFeedback}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EventDetails;