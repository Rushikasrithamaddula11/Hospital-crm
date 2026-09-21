import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.base import Base
from app.database.session import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_hospital_crm.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_create_patient_auto_id():
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "age": 40,
        "gender": "Male",
        "blood_group": "O+",
        "address": {
            "mobile": "9876543210",
            "email": "test.user@example.com",
            "address_line": "123 Medical Road",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001"
        },
        "emergency_contact": {
            "name": "Jane User",
            "relationship_type": "Spouse",
            "phone": "9876543211"
        }
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "Test"
    assert data["patient_id"].startswith("PT-")
    assert data["address"]["mobile"] == "9876543210"

def test_list_and_search_patients():
    # Register 2 patients
    p1 = {
        "first_name": "Ravi",
        "last_name": "Kumar",
        "age": 50,
        "gender": "Male",
        "blood_group": "A+",
        "address": {"mobile": "9876500001", "pincode": "560001"}
    }
    p2 = {
        "first_name": "Priya",
        "last_name": "Sharma",
        "age": 30,
        "gender": "Female",
        "blood_group": "B+",
        "address": {"mobile": "9876500002", "pincode": "400001"}
    }
    client.post("/api/v1/patients", json=p1)
    client.post("/api/v1/patients", json=p2)

    # Search for Ravi
    res = client.get("/api/v1/patients?q=Ravi")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["total"] == 1
    assert json_data["items"][0]["first_name"] == "Ravi"

    # Filter by gender
    res_female = client.get("/api/v1/patients?gender=Female")
    assert res_female.status_code == 200
    assert res_female.json()["total"] == 1
    assert res_female.json()["items"][0]["first_name"] == "Priya"

def test_soft_delete_patient():
    p = {
        "first_name": "Delete",
        "last_name": "Me",
        "age": 25,
        "gender": "Other",
        "address": {"mobile": "9876599999", "pincode": "110001"}
    }
    create_res = client.post("/api/v1/patients", json=p)
    pid = create_res.json()["patient_id"]

    # Delete
    del_res = client.delete(f"/api/v1/patients/{pid}")
    assert del_res.status_code == 200

    # Get should 404
    get_res = client.get(f"/api/v1/patients/{pid}")
    assert get_res.status_code == 404
