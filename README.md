# Sritha Hospitals Hospital CRM — Module 1: Patient Management

An enterprise-grade, modern Hospital CRM built for **Sritha Hospitals**. Module 1 provides complete, functional, responsive, and secure **Patient Management** capabilities, designed to connect seamlessly with future clinical modules (Appointments, Doctors, Prescriptions, Lab Reports, Follow-ups, Notifications, and AI Health Insights).

---

## 🚀 Key Features

* **Patient Registration**: Full demographic, contact, and emergency contact registration with inline validation (React Hook Form + Zod).
* **Automatic Unique Patient ID Generation**: Thread-safe sequential Patient ID generation (`PT-000001`, `PT-000002`, `PT-000003`) on the backend.
* **Patient Search & Filtering**: Fast, case-insensitive search by Patient ID, Name, Mobile, or Email + filtering by Gender, Status (`Active`, `Inactive`, `Follow-up`), Age Range, and Registration Date.
* **Comprehensive Patient Profile**: Tabbed profile interface containing 9 interactive modules:
  1. **Overview**: Key demographic details, emergency contacts, and quick stats summary counters.
  2. **Visits**: Clean OPD/IPD consultation visit history timeline.
  3. **Appointments**: Doctor appointments history and scheduling status (`Scheduled`, `Completed`, `Cancelled`, `No Show`).
  4. **Prescriptions**: Issued medication history with dosage, frequency, duration, and interactive RX modal.
  5. **Lab Reports**: Laboratory test results summary and report view modal.
  6. **Doctor Notes**: Clinical consultation notes recorded by authorized medical staff.
  7. **Follow-ups**: Clinical follow-up schedule and status (`Pending`, `Completed`, `Missed`, `Cancelled`).
  8. **AI Health Insights**: Safe, non-diagnostic AI placeholder UI with clinical disclaimer and demo decision support insights.
  9. **Activity Timeline**: Full compliance audit trail tracking registration, updates, and profile access events.
* **Patient Record Archival**: Soft-delete/archival workflow with confirmation safety modal and audit log entry.
* **Dual Database Architecture**: Native support for **PostgreSQL**, **Firebase Firestore**, and auto-configured **SQLite** for instant zero-config local development.
* **Role-Based Access Architecture**: Prepared structure for JWT authentication and role-based access control (Super Admin, Hospital Admin, Doctor, Nurse, Receptionist, Lab Staff, Pharmacy Staff).

---

## 🛠 Technology Stack

### Frontend
* **Framework**: React 18+ (Vite)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (Medical Enterprise visual theme)
* **Icons**: Lucide React
* **Form Management & Validation**: React Hook Form + Zod
* **HTTP Client**: Axios
* **Routing**: React Router DOM v6
* **Analytics / Visuals**: Recharts

### Backend
* **Language**: Python 3.10+
* **Framework**: FastAPI
* **ORM & Database**: SQLAlchemy 2.0 + PostgreSQL / SQLite fallback
* **Firebase**: Firebase Admin SDK & Google Cloud Firestore integration
* **Validation**: Pydantic v2
* **Testing**: Pytest + FastAPI TestClient

---

## 📁 Directory Structure

```text
hospital-crm/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Common UI (Badge, Button, Modal, Toast) & Patient components
│   │   ├── pages/            # PatientsPage, PatientDetailPage, PlaceholderPage
│   │   ├── layouts/          # MainLayout, Sidebar, Header
│   │   ├── services/         # Axios client (api.ts) & patientService.ts
│   │   ├── types/            # TypeScript interfaces for Patient domain
│   │   └── routes/           # AppRoutes configuration
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/v1/           # FastAPI routers (patients, stats)
│   │   ├── models/           # SQLAlchemy DB ORM models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Patient service, ID generator, audit logger
│   │   ├── database/         # Session setup, seed data, Firebase config
│   │   ├── auth/             # RBAC architecture structure
│   │   └── main.py           # FastAPI entrypoint
│   ├── tests/                # Pytest API test suite
│   ├── requirements.txt      # Python dependencies
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Quick Start Installation

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* PostgreSQL (Optional — auto falls back to SQLite if PostgreSQL service is inactive)

---

### 1. Start the Backend API

Navigate to the `backend` directory:

```bash
cd hospital-crm/backend
```

Create and activate a virtual environment (optional but recommended):

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Initialize backend server and seed sample data:

```bash
uvicorn app.main:app --reload --port 8000
```

The FastAPI backend will start at `http://localhost:8000`. On first launch, it automatically seeds 20 sample patients, 30 visits, 20 appointments, 20 prescriptions, 20 lab reports, and 15 follow-up records.

You can inspect the interactive OpenAPI documentation at:
👉 **Swagger UI**: `http://localhost:8000/docs`

---

### 2. Run Backend Unit Tests

To verify backend endpoints and Patient ID generation:

```bash
pytest tests
```

---

### 3. Start the Frontend Application

Navigate to the `frontend` directory:

```bash
cd hospital-crm/frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open your browser at:
👉 `http://localhost:5173`

---

## 🔑 Demo Staff Credentials (RBAC Placeholder)

| Role | Default Name | Access Scope |
| :--- | :--- | :--- |
| **Receptionist** | Staff Receptionist | Patient Registration, Search, Edit, Profile View |
| **Doctor** | Dr. Raj Kumar (Cardiology) | Doctor Notes, Prescriptions, Lab Reports |
| **Super Admin** | Sritha Administrator | Full Enterprise Privileges & Audit Logs |

---

## 🔌 API Reference (v1)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/patients` | List patients with pagination, search, and filters |
| `POST` | `/api/v1/patients` | Register new patient (Auto-generates `PT-xxxxxx` ID) |
| `GET` | `/api/v1/patients/{id}` | Get patient detail by integer ID or `PT-xxxxxx` |
| `PUT` | `/api/v1/patients/{id}` | Update patient record |
| `DELETE` | `/api/v1/patients/{id}` | Soft delete / archive patient record |
| `GET` | `/api/v1/patients/{id}/visits` | Get patient visit history |
| `GET` | `/api/v1/patients/{id}/appointments` | Get patient appointments |
| `GET` | `/api/v1/patients/{id}/prescriptions` | Get patient prescription records |
| `GET` | `/api/v1/patients/{id}/lab-reports` | Get laboratory reports |
| `GET` | `/api/v1/patients/{id}/consultations` | Get clinical doctor notes |
| `GET` | `/api/v1/patients/{id}/follow-ups` | Get clinical follow-up schedule |
| `GET` | `/api/v1/patients/{id}/activity` | Get audit log activity timeline |
| `GET` | `/api/v1/stats` | Get dashboard summary metrics |

---

## 🔮 Future Modules Integration Roadmap

```text
Module 1: Patient Management (COMPLETED)
   │
   ├── Module 2: Appointments & Doctor Scheduling
   ├── Module 3: Doctor & Staff Directory
   ├── Module 4: OPD Consultation & Clinical EMR
   ├── Module 5: Prescriptions & Pharmacy Integration
   ├── Module 6: Laboratory Information System (LIS)
   ├── Module 7: Clinical Follow-up Automation
   ├── Module 8: Multi-channel Notifications (SMS/WhatsApp)
   └── Module 9: AI Health Insights & Predictive Monitoring
```
