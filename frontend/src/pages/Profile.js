import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div data-testid="profile-container" className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 data-testid="profile-heading" className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your account information</p>
        </div>

        <Card data-testid="profile-info-card" className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl mb-2">{user?.name}</CardTitle>
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white capitalize">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="font-semibold text-lg">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-lg">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
                <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <p className="font-semibold text-lg capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                  ID
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                  <p className="font-semibold text-sm break-all">{user?.id?.substring(0, 16)}...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="role-info-card" className="glass-card border-none">
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>What you can do with your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.role === 'admin' && (
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Admin Privileges</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Create and manage all events</li>
                    <li>Add and manage event organizers</li>
                    <li>View analytics for all events</li>
                    <li>Manage all user registrations</li>
                  </ul>
                </div>
              )}
              {user?.role === 'organizer' && (
                <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                  <h4 className="font-semibold text-pink-900 dark:text-pink-200 mb-2">Organizer Privileges</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Create and manage your events</li>
                    <li>View analytics for your events</li>
                    <li>Manage event registrations</li>
                    <li>Register for other events as a student</li>
                  </ul>
                </div>
              )}
              {user?.role === 'student' && (
                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                  <h4 className="font-semibold text-cyan-900 dark:text-cyan-200 mb-2">Student Privileges</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Browse and discover campus events</li>
                    <li>Register for events</li>
                    <li>Access QR code tickets</li>
                    <li>Submit feedback and ratings</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;