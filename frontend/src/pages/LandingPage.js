import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Calendar, Users, TrendingUp, Star, Moon, Sun } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          data-testid="theme-toggle-btn"
          onClick={toggleTheme}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 glass-card border-none"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20" style={{ background: 'var(--gradient-1)' }}>
        <div className="max-w-7xl mx-auto text-center space-y-12 animate-fade-in">
          <div className="space-y-6">
            <h1 data-testid="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-bold gradient-text leading-tight">
              Campus Pulse
            </h1>
            <p data-testid="hero-subheading" className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              The Ultimate College Event Management Platform
            </p>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Organize, discover, and participate in campus events with seamless registration, QR ticketing, and real-time analytics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              data-testid="get-started-btn"
              onClick={handleGetStarted}
              size="lg"
              className="btn-hover text-lg px-10 py-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-none shadow-2xl"
            >
              Get Started
            </Button>
            <Button
              data-testid="explore-events-btn"
              onClick={() => navigate('/auth')}
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 rounded-full border-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Explore Events
            </Button>
          </div>

          {/* Floating Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {[
              { icon: Calendar, title: 'Event Management', desc: 'Create and manage events effortlessly', color: 'from-blue-400 to-cyan-400' },
              { icon: Users, title: 'Easy Registration', desc: 'Register for events with one click', color: 'from-purple-400 to-pink-400' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Track attendance and engagement', color: 'from-orange-400 to-red-400' },
              { icon: Star, title: 'Feedback System', desc: 'Rate and review events', color: 'from-green-400 to-emerald-400' }
            ].map((feature, index) => (
              <div
                key={index}
                data-testid={`feature-card-${index}`}
                className="glass-card p-8 rounded-3xl card-hover space-y-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 gradient-text">
            Everything You Need
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: 'QR Code Tickets', desc: 'Generate unique QR codes for each registration for quick check-ins', icon: '🎫' },
              { title: 'Event Categories', desc: 'Browse Technical, Cultural, Sports, and Workshop events', icon: '🎯' },
              { title: 'Role-Based Access', desc: 'Admin, Organizers, and Students with specific permissions', icon: '🔐' },
              { title: 'Search & Filter', desc: 'Find events quickly with advanced search and filters', icon: '🔍' },
              { title: 'Calendar View', desc: 'View all events in a beautiful calendar interface', icon: '📅' },
              { title: 'Real-time Updates', desc: 'Get instant notifications about event changes', icon: '⚡' }
            ].map((feature, index) => (
              <div key={index} data-testid={`info-card-${index}`} className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6" style={{ background: 'var(--gradient-1)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold gradient-text">
            Ready to Transform Your Campus Events?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Join thousands of students and organizers already using Campus Pulse
          </p>
          <Button
            data-testid="cta-btn"
            onClick={handleGetStarted}
            size="lg"
            className="btn-hover text-xl px-12 py-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-none shadow-2xl"
          >
            Start Now - It's Free!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p>© 2025 Campus Pulse. Powering the future of college events.</p>
      </footer>
    </div>
  );
};

export default LandingPage;