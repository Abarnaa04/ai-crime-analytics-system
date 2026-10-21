import unittest
import os
import sys

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database import init_db

class TestCrimeAnalyticsApp(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        init_db()

    def test_home_endpoint(self):
        """Test that the system status endpoint responds."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['status'], 'online')
        self.assertIn('AI Crime Analytics System', json_data['system'])

    def test_metrics_calculation(self):
        """Verify that metrics are dynamically calculated from the SQLite database."""
        response = self.client.get('/api/metrics')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data['totalCrimes'], 0)
        self.assertIn('arrestResolutionRate', data)
        self.assertGreater(len(data['districtBreakdown']), 0)

    def test_incidents_filtering(self):
        """Test filtered incidents query."""
        response = self.client.get('/api/incidents?district=Central%2001&limit=10')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('incidents', data)
        for inc in data['incidents']:
            self.assertEqual(inc['district'], 'Central 01')

    def test_prediction_endpoint(self):
        """Verify that predictive machine learning inference succeeds."""
        payload = {
            "hour": 23,
            "dayOfWeek": "Saturday",
            "district": "North River 02",
            "locationDescription": "ALLEYWAY",
            "priorDensityIndex": "High",
            "domesticRiskFactor": False
        }
        response = self.client.post('/api/predict', json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('predictedCategory', data)
        self.assertIn('confidence', data)
        self.assertGreater(data['confidence'], 0)
        self.assertIn('contributingFactors', data)

    def test_hotspots_endpoint(self):
        """Verify Snap Map hotspot cluster endpoint."""
        response = self.client.get('/api/hotspots')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('hotspots', data)
        self.assertGreater(len(data['hotspots']), 0)
        self.assertIn('latitude', data['hotspots'][0])
        self.assertIn('totalIncidents', data['hotspots'][0])

    def test_patrol_units_endpoint(self):
        """Verify stationed cartoon patrol units endpoint."""
        response = self.client.get('/api/patrol_units')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('units', data)
        self.assertGreaterEqual(len(data['units']), 3)
        self.assertIn('badgeNumber', data['units'][0])

if __name__ == '__main__':
    unittest.main()
