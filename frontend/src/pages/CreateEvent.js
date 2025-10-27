import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateEvent = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    location: '',
    capacity: '',
    image_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API}/events`, {
        ...formData,
        capacity: parseInt(formData.capacity)
      }, { headers });
      
      toast.success('Event created successfully!');
      navigate(`/events/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div data-testid="create-event-container" className="max-w-3xl mx-auto space-y-6">
        <Button data-testid="back-btn" onClick={() => navigate('/dashboard')} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card data-testid="create-event-form-card" className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Event</CardTitle>
            <CardDescription>Fill in the details to create a new campus event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  data-testid="event-title"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Annual Tech Fest 2025"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  data-testid="event-description"
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger data-testid="event-category" id="category" className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    data-testid="event-capacity"
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleChange('capacity', e.target.value)}
                    placeholder="100"
                    min="1"
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    data-testid="event-date"
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    data-testid="event-time"
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  data-testid="event-location"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Main Auditorium"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  data-testid="event-image-url"
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="rounded-xl"
                />
              </div>

              <Button
                data-testid="create-event-submit-btn"
                type="submit"
                className="w-full py-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                disabled={loading}
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateEvent;