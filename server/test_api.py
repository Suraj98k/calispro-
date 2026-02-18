import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_api():
    print("Testing Base Route...")
    try:
        r = requests.get("http://localhost:5000/")
        print(f"Status: {r.status_code}, Response: {r.text}")
    except Exception as e:
        print(f"Base Route failed: {e}")

    print("\nTesting GET /api/exercises...")
    try:
        r = requests.get(f"{BASE_URL}/exercises")
        print(f"Status: {r.status_code}, Count: {len(r.json())}")
    except Exception as e:
        print(f"Exercises failed: {e}")

    print("\nTesting GET /api/skills...")
    try:
        r = requests.get(f"{BASE_URL}/skills")
        print(f"Status: {r.status_code}, Count: {len(r.json())}")
    except Exception as e:
        print(f"Skills failed: {e}")

    print("\nTesting POST /api/auth/signup...")
    user_data = {
        "name": "Test User",
        "email": f"test_{int(requests.utils.time.time())}@example.com",
        "password": "password123"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/signup", json=user_data)
        print(f"Status: {r.status_code}, Response: {r.json().get('user', 'Error')}")
        token = r.json().get('token')
        
        if token:
            print("\nTesting GET /api/auth/me (Authenticated)...")
            headers = {"Authorization": f"Bearer {token}"}
            r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            print(f"Status: {r.status_code}, User: {r.json().get('name')}")
    except Exception as e:
        print(f"Auth Signup failed: {e}")

if __name__ == "__main__":
    test_api()
