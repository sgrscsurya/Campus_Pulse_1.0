import requests
import sys
import json
from datetime import datetime, timedelta

class CollegeEventAPITester:
    def __init__(self, base_url="https://campus-pulse-79.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.organizer_token = None
        self.student_token = None
        self.test_event_id = None
        self.test_registration_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_user_registration_and_login(self):
        """Test user registration and login for all roles"""
        print("\n" + "="*50)
        print("TESTING USER AUTHENTICATION")
        print("="*50)
        
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test Admin Registration
        admin_data = {
            "email": f"admin_{timestamp}@test.com",
            "password": "AdminPass123!",
            "name": f"Admin User {timestamp}",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "Admin Registration",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
        
        # Test Organizer Registration
        organizer_data = {
            "email": f"organizer_{timestamp}@test.com",
            "password": "OrganizerPass123!",
            "name": f"Organizer User {timestamp}",
            "role": "organizer"
        }
        
        success, response = self.run_test(
            "Organizer Registration",
            "POST",
            "auth/register",
            200,
            data=organizer_data
        )
        
        if success and 'access_token' in response:
            self.organizer_token = response['access_token']
            print(f"   Organizer token obtained: {self.organizer_token[:20]}...")
        
        # Test Student Registration
        student_data = {
            "email": f"student_{timestamp}@test.com",
            "password": "StudentPass123!",
            "name": f"Student User {timestamp}",
            "role": "student"
        }
        
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            200,
            data=student_data
        )
        
        if success and 'access_token' in response:
            self.student_token = response['access_token']
            print(f"   Student token obtained: {self.student_token[:20]}...")
        
        # Test Login
        login_data = {
            "email": admin_data["email"],
            "password": admin_data["password"]
        }
        
        self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        # Test Get Current User
        if self.admin_token:
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200,
                headers={'Authorization': f'Bearer {self.admin_token}'}
            )

    def test_event_management(self):
        """Test event CRUD operations"""
        print("\n" + "="*50)
        print("TESTING EVENT MANAGEMENT")
        print("="*50)
        
        if not self.organizer_token:
            print("❌ No organizer token available, skipping event tests")
            return
        
        # Test Create Event
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        event_data = {
            "title": "Test Tech Conference 2025",
            "description": "A comprehensive technology conference for students and professionals",
            "category": "Technical",
            "date": tomorrow,
            "time": "10:00",
            "location": "Main Auditorium",
            "capacity": 100,
            "image_url": "https://example.com/tech-conf.jpg"
        }
        
        success, response = self.run_test(
            "Create Event",
            "POST",
            "events",
            200,
            data=event_data,
            headers={'Authorization': f'Bearer {self.organizer_token}'}
        )
        
        if success and 'id' in response:
            self.test_event_id = response['id']
            print(f"   Event created with ID: {self.test_event_id}")
        
        # Test Get All Events
        self.run_test(
            "Get All Events",
            "GET",
            "events",
            200
        )
        
        # Test Get Specific Event
        if self.test_event_id:
            self.run_test(
                "Get Event by ID",
                "GET",
                f"events/{self.test_event_id}",
                200
            )
        
        # Test Search Events
        self.run_test(
            "Search Events",
            "GET",
            "events?search=Tech",
            200
        )
        
        # Test Filter Events by Category
        self.run_test(
            "Filter Events by Category",
            "GET",
            "events?category=Technical",
            200
        )
        
        # Test Update Event
        if self.test_event_id:
            update_data = {
                "title": "Updated Tech Conference 2025",
                "capacity": 150
            }
            
            self.run_test(
                "Update Event",
                "PUT",
                f"events/{self.test_event_id}",
                200,
                data=update_data,
                headers={'Authorization': f'Bearer {self.organizer_token}'}
            )

    def test_event_registration(self):
        """Test event registration functionality"""
        print("\n" + "="*50)
        print("TESTING EVENT REGISTRATION")
        print("="*50)
        
        if not self.student_token or not self.test_event_id:
            print("❌ Missing student token or event ID, skipping registration tests")
            return
        
        # Test Register for Event
        registration_data = {
            "event_id": self.test_event_id
        }
        
        success, response = self.run_test(
            "Register for Event",
            "POST",
            "registrations/register",
            200,
            data=registration_data,
            headers={'Authorization': f'Bearer {self.student_token}'}
        )
        
        if success and 'id' in response:
            self.test_registration_id = response['id']
            print(f"   Registration created with ID: {self.test_registration_id}")
            
            # Check if QR code was generated
            if 'ticket_qr_code' in response:
                print("   ✅ QR code generated successfully")
            else:
                print("   ❌ QR code not generated")
        
        # Test Get My Registrations
        self.run_test(
            "Get My Registrations",
            "GET",
            "registrations/my",
            200,
            headers={'Authorization': f'Bearer {self.student_token}'}
        )
        
        # Test Get Event Registrations (as organizer)
        if self.organizer_token and self.test_event_id:
            self.run_test(
                "Get Event Registrations",
                "GET",
                f"registrations/event/{self.test_event_id}",
                200,
                headers={'Authorization': f'Bearer {self.organizer_token}'}
            )

    def test_feedback_system(self):
        """Test feedback submission and retrieval"""
        print("\n" + "="*50)
        print("TESTING FEEDBACK SYSTEM")
        print("="*50)
        
        if not self.student_token or not self.test_event_id:
            print("❌ Missing student token or event ID, skipping feedback tests")
            return
        
        # Test Submit Feedback
        feedback_data = {
            "event_id": self.test_event_id,
            "rating": 5,
            "comment": "Excellent event! Very well organized and informative."
        }
        
        self.run_test(
            "Submit Feedback",
            "POST",
            "feedback",
            200,
            data=feedback_data,
            headers={'Authorization': f'Bearer {self.student_token}'}
        )
        
        # Test Get Event Feedback
        self.run_test(
            "Get Event Feedback",
            "GET",
            f"feedback/event/{self.test_event_id}",
            200
        )

    def test_analytics(self):
        """Test analytics endpoints"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS")
        print("="*50)
        
        if not self.organizer_token:
            print("❌ No organizer token available, skipping analytics tests")
            return
        
        # Test Overview Analytics
        self.run_test(
            "Get Overview Analytics",
            "GET",
            "analytics/overview",
            200,
            headers={'Authorization': f'Bearer {self.organizer_token}'}
        )
        
        # Test Event Analytics
        if self.test_event_id:
            self.run_test(
                "Get Event Analytics",
                "GET",
                f"analytics/event/{self.test_event_id}",
                200,
                headers={'Authorization': f'Bearer {self.organizer_token}'}
            )

    def test_organizer_management(self):
        """Test organizer management (admin only)"""
        print("\n" + "="*50)
        print("TESTING ORGANIZER MANAGEMENT")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available, skipping organizer management tests")
            return
        
        # Test Get My Organized Events
        if self.organizer_token:
            self.run_test(
                "Get My Organized Events",
                "GET",
                "events/my/organized",
                200,
                headers={'Authorization': f'Bearer {self.organizer_token}'}
            )

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting College Event Management System API Tests")
        print(f"Testing against: {self.base_url}")
        
        try:
            self.test_user_registration_and_login()
            self.test_event_management()
            self.test_event_registration()
            self.test_feedback_system()
            self.test_analytics()
            self.test_organizer_management()
            
            # Print final results
            print("\n" + "="*60)
            print("FINAL TEST RESULTS")
            print("="*60)
            print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
            print(f"📊 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
            
            if self.failed_tests:
                print(f"\n❌ Failed tests ({len(self.failed_tests)}):")
                for test in self.failed_tests:
                    error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                    print(f"   - {test['test']}: {error_msg}")
            
            return self.tests_passed == self.tests_run
            
        except Exception as e:
            print(f"❌ Test suite failed with error: {str(e)}")
            return False

def main():
    tester = CollegeEventAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())