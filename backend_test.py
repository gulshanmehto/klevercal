import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class KleverCalAPITester:
    def __init__(self, base_url="https://smartsched-12.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                self.log_result(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user_id')
            print(f"   Registered user: {test_email}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.token:
            return False
            
        # Try to get user info to verify token works
        success, response = self.run_test("Get User Info", "GET", "auth/me", 200)
        return success

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        return self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)

    def test_booking_types_crud(self):
        """Test booking types CRUD operations"""
        # Create booking type
        booking_data = {
            "title": "Test Meeting",
            "description": "A test meeting type",
            "duration": 30,
            "color": "#7c3aed",
            "is_active": True,
            "buffer_before": 0,
            "buffer_after": 15,
            "min_notice": 60
        }
        
        success, response = self.run_test("Create Booking Type", "POST", "booking-types", 200, booking_data)
        if not success:
            return False
            
        booking_type_id = response.get('booking_type_id')
        if not booking_type_id:
            self.log_result("Create Booking Type - Get ID", False, "No booking_type_id in response")
            return False

        # Get booking types
        success, _ = self.run_test("Get Booking Types", "GET", "booking-types", 200)
        if not success:
            return False

        # Get specific booking type
        success, _ = self.run_test("Get Specific Booking Type", "GET", f"booking-types/{booking_type_id}", 200)
        if not success:
            return False

        # Update booking type
        update_data = {**booking_data, "title": "Updated Test Meeting"}
        success, _ = self.run_test("Update Booking Type", "PUT", f"booking-types/{booking_type_id}", 200, update_data)
        if not success:
            return False

        # Delete booking type
        success, _ = self.run_test("Delete Booking Type", "DELETE", f"booking-types/{booking_type_id}", 200)
        return success

    def test_availability(self):
        """Test availability endpoints"""
        # Get availability
        success, response = self.run_test("Get Availability", "GET", "availability", 200)
        if not success:
            return False

        # Update availability
        availability_data = {
            "slots": [
                {"day": 0, "start_time": "09:00", "end_time": "17:00"},
                {"day": 1, "start_time": "09:00", "end_time": "17:00"},
                {"day": 2, "start_time": "09:00", "end_time": "17:00"},
                {"day": 3, "start_time": "09:00", "end_time": "17:00"},
                {"day": 4, "start_time": "09:00", "end_time": "17:00"}
            ]
        }
        
        success, _ = self.run_test("Update Availability", "PUT", "availability", 200, availability_data)
        return success

    def test_public_endpoints(self):
        """Test public booking endpoints"""
        if not self.user_id:
            self.log_result("Public Endpoints", False, "No user_id available")
            return False

        # Test public user endpoint
        success, _ = self.run_test("Get Public User", "GET", f"public/user/{self.user_id}", 200)
        if not success:
            return False

        # Test public booking types
        success, _ = self.run_test("Get Public Booking Types", "GET", f"public/booking-types/{self.user_id}", 200)
        if not success:
            return False

        # Test public availability
        success, _ = self.run_test("Get Public Availability", "GET", f"public/availability/{self.user_id}", 200)
        return success

    def test_ai_features(self):
        """Test AI features"""
        # Test NLP scheduling
        nlp_data = {
            "text": "Let's meet next Tuesday at 2 PM"
        }
        
        success, response = self.run_test("AI NLP Scheduling", "POST", "ai/parse-schedule", 200, nlp_data)
        if success:
            print(f"   AI Response: {response}")
        
        # Test lead scoring
        lead_data = {
            "guest_name": "John Doe",
            "guest_email": "john@company.com",
            "answers": [{"question": "Company size?", "answer": "50-100 employees"}],
            "booking_type_title": "Sales Call"
        }
        
        success2, response2 = self.run_test("AI Lead Scoring", "POST", "ai/lead-score", 200, lead_data)
        if success2:
            print(f"   Lead Score: {response2}")
            
        return success and success2

    def test_appointments(self):
        """Test appointments endpoints"""
        # Get appointments
        success, _ = self.run_test("Get Appointments", "GET", "appointments", 200)
        return success

    def test_google_calendar_integration(self):
        """Test Google Calendar OAuth integration endpoints"""
        print("\n🔗 Testing Google Calendar Integration...")
        
        # Test calendar connect endpoint
        success, response = self.run_test("Google Calendar Connect", "GET", "calendar/google/connect", 200)
        if success and 'authorization_url' in response:
            print(f"   Authorization URL received: {response['authorization_url'][:50]}...")
            auth_url_test = True
        else:
            auth_url_test = False
            
        # Test calendar status endpoint
        success2, response2 = self.run_test("Google Calendar Status", "GET", "calendar/google/status", 200)
        if success2 and 'connected' in response2:
            print(f"   Calendar status: Connected={response2.get('connected', False)}")
            status_test = True
        else:
            status_test = False
            
        return auth_url_test and status_test

    def test_email_functionality(self):
        """Test email sending functionality"""
        print("\n📧 Testing Email Functionality...")
        
        # Test email test endpoint
        success, response = self.run_test("Email Test", "POST", "test/email", 200)
        if success:
            print(f"   Email test result: {response}")
            return True
        return False

    def test_appointment_with_email_confirmation(self):
        """Test appointment creation with email confirmation"""
        print("\n📅 Testing Appointment Creation with Email...")
        
        # First create a booking type for testing
        booking_data = {
            "title": "Email Test Meeting",
            "description": "Testing email confirmation",
            "duration": 30,
            "color": "#7c3aed",
            "is_active": True,
            "buffer_before": 0,
            "buffer_after": 15,
            "min_notice": 60
        }
        
        success, response = self.run_test("Create Booking Type for Email Test", "POST", "booking-types", 200, booking_data)
        if not success:
            return False
            
        booking_type_id = response.get('booking_type_id')
        if not booking_type_id:
            return False

        # Create appointment (public endpoint)
        appointment_data = {
            "booking_type_id": booking_type_id,
            "host_user_id": self.user_id,
            "guest_name": "Test Guest",
            "guest_email": "test.guest@example.com",
            "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
            "notes": "Test appointment with email confirmation"
        }
        
        success, response = self.run_test("Create Appointment with Email", "POST", "appointments", 200, appointment_data)
        if success:
            print(f"   Appointment created: {response.get('appointment_id', 'Unknown ID')}")
            # Check if Google Calendar event was created
            if response.get('google_event_id'):
                print(f"   Google Calendar event created: {response['google_event_id']}")
            else:
                print("   No Google Calendar event (calendar not connected)")
            return True
        return False

    def test_public_slots_with_calendar_busy_times(self):
        """Test public slots endpoint considering Google Calendar busy times"""
        print("\n🗓️ Testing Public Slots with Calendar Integration...")
        
        if not self.user_id:
            return False
            
        # First create a booking type
        booking_data = {
            "title": "Slot Test Meeting",
            "description": "Testing slot availability",
            "duration": 30,
            "color": "#7c3aed",
            "is_active": True
        }
        
        success, response = self.run_test("Create Booking Type for Slots", "POST", "booking-types", 200, booking_data)
        if not success:
            return False
            
        booking_type_id = response.get('booking_type_id')
        if not booking_type_id:
            return False

        # Test getting available slots for tomorrow
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        success, response = self.run_test(
            "Get Available Slots", 
            "GET", 
            f"public/slots/{self.user_id}/{booking_type_id}?date={tomorrow}", 
            200
        )
        
        if success:
            slots = response.get('slots', [])
            print(f"   Available slots for {tomorrow}: {len(slots)} slots")
            if slots:
                print(f"   First slot: {slots[0].get('display', 'Unknown time')}")
            return True
        return False

    def test_google_calendar_busy_endpoint(self):
        """Test Google Calendar busy times endpoint"""
        print("\n⏰ Testing Google Calendar Busy Times...")
        
        # Test busy times endpoint
        start_date = datetime.now().isoformat()
        end_date = (datetime.now() + timedelta(days=7)).isoformat()
        
        success, response = self.run_test(
            "Google Calendar Busy Times", 
            "GET", 
            f"calendar/google/busy?start_date={start_date}&end_date={end_date}", 
            200
        )
        
        if success:
            busy_times = response.get('busy_times', [])
            print(f"   Found {len(busy_times)} busy time slots")
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting KleverCal API Tests")
        print("=" * 50)

        # Test sequence
        tests = [
            ("API Root", self.test_root_endpoint),
            ("User Registration", self.test_user_registration),
            ("User Authentication", self.test_user_login),
            ("Dashboard Stats", self.test_dashboard_stats),
            ("Booking Types CRUD", self.test_booking_types_crud),
            ("Availability Management", self.test_availability),
            ("Public Endpoints", self.test_public_endpoints),
            ("Google Calendar Integration", self.test_google_calendar_integration),
            ("Email Functionality", self.test_email_functionality),
            ("Google Calendar Busy Times", self.test_google_calendar_busy_endpoint),
            ("Public Slots with Calendar", self.test_public_slots_with_calendar_busy_times),
            ("Appointment with Email", self.test_appointment_with_email_confirmation),
            ("AI Features", self.test_ai_features),
            ("Appointments", self.test_appointments)
        ]

        for test_name, test_func in tests:
            print(f"\n📋 Running {test_name} tests...")
            try:
                test_func()
            except Exception as e:
                self.log_result(f"{test_name} (Exception)", False, str(e))

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
            # Print failed tests
            failed_tests = [r for r in self.test_results if not r['success']]
            if failed_tests:
                print("\n❌ Failed Tests:")
                for test in failed_tests:
                    print(f"   - {test['test']}: {test['details']}")
            
            return 1

def main():
    tester = KleverCalAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())