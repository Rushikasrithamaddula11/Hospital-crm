import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.patient import (
    Patient, PatientAddress, EmergencyContact, Visit,
    Appointment, Prescription, LabReport, ConsultationNote,
    FollowUp, AuditLog
)
from app.database.session import SessionLocal, engine
from app.database.base import Base

def seed_database(db: Session):
    """Seed initial sample dataset for Mentneo Hospital CRM"""
    Base.metadata.create_all(bind=engine)

    if db.query(Patient).count() > 0:
        print("Database already contains records. Skipping seed.")
        return

    print("Seeding Mentneo Hospital CRM sample database...")

    sample_patients = [
        {"first_name": "Ravi", "last_name": "Kumar", "age": 58, "gender": "Male", "blood_group": "B+", "status": "Active", "mobile": "9876543210", "email": "ravi.kumar@example.com", "city": "Bangalore", "state": "Karnataka", "pincode": "560001", "ec_name": "Sunita Kumar", "ec_rel": "Spouse", "ec_phone": "9876543211"},
        {"first_name": "Priya", "last_name": "Sharma", "age": 34, "gender": "Female", "blood_group": "O+", "status": "Active", "mobile": "9876543221", "email": "priya.sharma@example.com", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "ec_name": "Rajesh Sharma", "ec_rel": "Spouse", "ec_phone": "9876543222"},
        {"first_name": "Arun", "last_name": "Rao", "age": 67, "gender": "Male", "blood_group": "A+", "status": "Follow-up", "mobile": "9876543245", "email": "arun.rao@example.com", "city": "Hyderabad", "state": "Telangana", "pincode": "500001", "ec_name": "Vikram Rao", "ec_rel": "Son", "ec_phone": "9876543246"},
        {"first_name": "Sunita", "last_name": "Patel", "age": 45, "gender": "Female", "blood_group": "AB+", "status": "Active", "mobile": "9876543250", "email": "sunita.patel@example.com", "city": "Ahmedabad", "state": "Gujarat", "pincode": "380001", "ec_name": "Mahesh Patel", "ec_rel": "Spouse", "ec_phone": "9876543251"},
        {"first_name": "Amit", "last_name": "Varma", "age": 29, "gender": "Male", "blood_group": "O-", "status": "Active", "mobile": "9876543260", "email": "amit.varma@example.com", "city": "Delhi", "state": "Delhi", "pincode": "110001", "ec_name": "Neha Varma", "ec_rel": "Sister", "ec_phone": "9876543261"},
        {"first_name": "Ananya", "last_name": "Roy", "age": 26, "gender": "Female", "blood_group": "A-", "status": "Active", "mobile": "9876543270", "email": "ananya.roy@example.com", "city": "Kolkata", "state": "West Bengal", "pincode": "700001", "ec_name": "Sanjay Roy", "ec_rel": "Father", "ec_phone": "9876543271"},
        {"first_name": "Karthik", "last_name": "Nair", "age": 52, "gender": "Male", "blood_group": "B-", "status": "Follow-up", "mobile": "9876543280", "email": "karthik.nair@example.com", "city": "Kochi", "state": "Kerala", "pincode": "682001", "ec_name": "Meera Nair", "ec_rel": "Spouse", "ec_phone": "9876543281"},
        {"first_name": "Meenakshi", "last_name": "Sundaram", "age": 61, "gender": "Female", "blood_group": "O+", "status": "Active", "mobile": "9876543290", "email": "meenakshi.s@example.com", "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001", "ec_name": "Sundaram K", "ec_rel": "Spouse", "ec_phone": "9876543291"},
        {"first_name": "Deepak", "last_name": "Chopra", "age": 41, "gender": "Male", "blood_group": "AB-", "status": "Inactive", "mobile": "9876543300", "email": "deepak.c@example.com", "city": "Pune", "state": "Maharashtra", "pincode": "411001", "ec_name": "Pooja Chopra", "ec_rel": "Spouse", "ec_phone": "9876543301"},
        {"first_name": "Kavita", "last_name": "Reddy", "age": 38, "gender": "Female", "blood_group": "B+", "status": "Active", "mobile": "9876543310", "email": "kavita.reddy@example.com", "city": "Hyderabad", "state": "Telangana", "pincode": "500002", "ec_name": "Pratap Reddy", "ec_rel": "Brother", "ec_phone": "9876543311"},
        {"first_name": "Sanjay", "last_name": "Gupta", "age": 64, "gender": "Male", "blood_group": "A+", "status": "Follow-up", "mobile": "9876543320", "email": "sanjay.gupta@example.com", "city": "Jaipur", "state": "Rajasthan", "pincode": "302001", "ec_name": "Aarti Gupta", "ec_rel": "Daughter", "ec_phone": "9876543321"},
        {"first_name": "Ritu", "last_name": "Singhania", "age": 31, "gender": "Female", "blood_group": "O+", "status": "Active", "mobile": "9876543330", "email": "ritu.s@example.com", "city": "Chandigarh", "state": "Punjab", "pincode": "160001", "ec_name": "Gaurav Singhania", "ec_rel": "Spouse", "ec_phone": "9876543331"},
        {"first_name": "Vikram", "last_name": "Deshmukh", "age": 50, "gender": "Male", "blood_group": "B+", "status": "Active", "mobile": "9876543340", "email": "vikram.d@example.com", "city": "Nagpur", "state": "Maharashtra", "pincode": "440001", "ec_name": "Shalini Deshmukh", "ec_rel": "Spouse", "ec_phone": "9876543341"},
        {"first_name": "Pooja", "last_name": "Bhatia", "age": 27, "gender": "Female", "blood_group": "A-", "status": "Active", "mobile": "9876543350", "email": "pooja.bhatia@example.com", "city": "Ludhiana", "state": "Punjab", "pincode": "141001", "ec_name": "Raman Bhatia", "ec_rel": "Father", "ec_phone": "9876543351"},
        {"first_name": "Manish", "last_name": "Tiwari", "age": 43, "gender": "Male", "blood_group": "O-", "status": "Follow-up", "mobile": "9876543360", "email": "manish.tiwari@example.com", "city": "Lucknow", "state": "Uttar Pradesh", "pincode": "226001", "ec_name": "Seema Tiwari", "ec_rel": "Spouse", "ec_phone": "9876543361"},
        {"first_name": "Swati", "last_name": "Mukherjee", "age": 36, "gender": "Female", "blood_group": "AB+", "status": "Active", "mobile": "9876543370", "email": "swati.m@example.com", "city": "Kolkata", "state": "West Bengal", "pincode": "700002", "ec_name": "Subhash Mukherjee", "ec_rel": "Spouse", "ec_phone": "9876543371"},
        {"first_name": "Nikhil", "last_name": "Saxena", "age": 32, "gender": "Male", "blood_group": "B+", "status": "Active", "mobile": "9876543380", "email": "nikhil.saxena@example.com", "city": "Bhopal", "state": "Madhya Pradesh", "pincode": "462001", "ec_name": "Kiran Saxena", "ec_rel": "Mother", "ec_phone": "9876543381"},
        {"first_name": "Divya", "last_name": "Menon", "age": 49, "gender": "Female", "blood_group": "O+", "status": "Follow-up", "mobile": "9876543390", "email": "divya.menon@example.com", "city": "Trivandrum", "state": "Kerala", "pincode": "695001", "ec_name": "Ramesh Menon", "ec_rel": "Spouse", "ec_phone": "9876543391"},
        {"first_name": "Rajesh", "last_name": "Kanna", "age": 55, "gender": "Male", "blood_group": "A+", "status": "Active", "mobile": "9876543400", "email": "rajesh.kanna@example.com", "city": "Coimbatore", "state": "Tamil Nadu", "pincode": "641001", "ec_name": "Latha Kanna", "ec_rel": "Spouse", "ec_phone": "9876543401"},
        {"first_name": "Archana", "last_name": "Joshi", "age": 42, "gender": "Female", "blood_group": "B-", "status": "Active", "mobile": "9876543410", "email": "archana.joshi@example.com", "city": "Indore", "state": "Madhya Pradesh", "pincode": "452001", "ec_name": "Suresh Joshi", "ec_rel": "Spouse", "ec_phone": "9876543411"}
    ]

    doctors = [
        ("Dr. Raj Kumar", "Cardiology"),
        ("Dr. Anil Sharma", "General Medicine"),
        ("Dr. Sneha Kulkarni", "Pediatrics"),
        ("Dr. Vivek Nambiar", "Orthopedics"),
        ("Dr. Farida Khan", "Dermatology"),
        ("Dr. Ramesh Sen", "Neurology"),
        ("Dr. Meera Merchant", "Oncology"),
        ("Dr. Alok Verma", "ENT"),
        ("Dr. Geeta Pillai", "Gynecology"),
        ("Dr. Harish Chandra", "Cardiology")
    ]

    created_patients = []

    for idx, pdata in enumerate(sample_patients, 1):
        pid_str = f"PT-{idx:06d}"
        initials = f"{pdata['first_name'][0]}{pdata['last_name'][0]}".upper()
        photo_url = f"https://api.dicebear.com/7.x/initials/svg?seed={initials}"

        pat = Patient(
            patient_id=pid_str,
            first_name=pdata["first_name"],
            last_name=pdata["last_name"],
            age=pdata["age"],
            gender=pdata["gender"],
            blood_group=pdata["blood_group"],
            status=pdata["status"],
            profile_photo=photo_url,
            occupation="Professional",
            marital_status="Married",
            preferred_language="English",
            is_existing_patient=True,
            is_deleted=False,
            created_at=datetime.utcnow() - timedelta(days=random.randint(5, 120))
        )
        db.add(pat)
        db.flush()

        addr = PatientAddress(
            patient_id=pat.id,
            mobile=pdata["mobile"],
            alt_mobile="9900" + pdata["mobile"][-6:],
            email=pdata["email"],
            address_line=f"Flat {random.randint(101, 909)}, Green Enclave",
            city=pdata["city"],
            state=pdata["state"],
            pincode=pdata["pincode"]
        )
        db.add(addr)

        ec = EmergencyContact(
            patient_id=pat.id,
            name=pdata["ec_name"],
            relationship_type=pdata["ec_rel"],
            phone=pdata["ec_phone"]
        )
        db.add(ec)

        # Audit Log for registration
        db.add(AuditLog(
            patient_id_str=pid_str,
            action="Patient Registered",
            performed_by="Receptionist R102",
            role="Receptionist",
            timestamp=pat.created_at,
            details=f"Registered patient {pat.first_name} {pat.last_name}"
        ))

        created_patients.append(pat)

    db.commit()

    # Create Visits (30 visits across patients)
    for i in range(30):
        pat = random.choice(created_patients)
        doc_name, dept = random.choice(doctors)
        visit_dt = (datetime.utcnow() - timedelta(days=random.randint(1, 90))).strftime("%d %b %Y")
        db.add(Visit(
            patient_id=pat.id,
            visit_date=visit_dt,
            department=dept,
            doctor_name=doc_name,
            visit_type="OP Consultation",
            status="Completed"
        ))

    # Create Appointments (20 appointments)
    app_statuses = ["Scheduled", "Completed", "Cancelled", "No Show"]
    for i in range(20):
        pat = random.choice(created_patients)
        doc_name, dept = random.choice(doctors)
        app_dt = (datetime.utcnow() + timedelta(days=random.randint(-10, 15))).strftime("%d %b %Y")
        db.add(Appointment(
            patient_id=pat.id,
            appointment_date=app_dt,
            appointment_time=f"{random.randint(9, 16)}:30 AM",
            doctor_name=doc_name,
            department=dept,
            type="Follow-up Review" if i % 2 == 0 else "Consultation",
            status=random.choice(app_statuses)
        ))

    # Create Prescriptions (20 prescriptions)
    med_samples = [
        [{"name": "Amlodipine 5mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "30 days"}, {"name": "Atorvastatin 10mg", "dosage": "1 tablet", "frequency": "Once daily at bedtime", "duration": "30 days"}],
        [{"name": "Paracetamol 650mg", "dosage": "1 tablet", "frequency": "Thrice daily after food", "duration": "5 days"}, {"name": "Amoxicillin 500mg", "dosage": "1 capsule", "frequency": "Twice daily", "duration": "7 days"}],
        [{"name": "Metformin 500mg", "dosage": "1 tablet", "frequency": "Twice daily with meals", "duration": "60 days"}, {"name": "Pantoprazole 40mg", "dosage": "1 tablet", "frequency": "Once daily before breakfast", "duration": "14 days"}]
    ]
    for i in range(20):
        pat = random.choice(created_patients)
        doc_name, dept = random.choice(doctors)
        dt = (datetime.utcnow() - timedelta(days=random.randint(2, 60))).strftime("%d %b %Y")
        db.add(Prescription(
            patient_id=pat.id,
            date=dt,
            doctor_name=doc_name,
            department=dept,
            medications=random.choice(med_samples)
        ))

    # Create Lab Reports (20 reports)
    lab_tests = [
        ("CBC (Complete Blood Count)", "Hemoglobin 14.2 g/dL, WBC 7,200 /mcL, Platelets 250,000 /mcL. All values within normal physiological limits."),
        ("Lipid Profile", "Total Cholesterol: 185 mg/dL, HDL: 48 mg/dL, LDL: 110 mg/dL, Triglycerides: 140 mg/dL. Desirable range."),
        ("Fast Blood Sugar & HbA1c", "FBS: 98 mg/dL, HbA1c: 5.6%. Good glycemic control."),
        ("Thyroid Panel (T3, T4, TSH)", "TSH: 2.45 mIU/L, Free T4: 1.2 ng/dL, Free T3: 3.1 pg/mL. Normal thyroid function."),
        ("Renal Function Test (KFT)", "Serum Creatinine: 0.9 mg/dL, Blood Urea: 24 mg/dL, Uric Acid: 5.2 mg/dL.")
    ]
    for i in range(20):
        pat = random.choice(created_patients)
        doc_name, _ = random.choice(doctors)
        test_name, summary = random.choice(lab_tests)
        dt = (datetime.utcnow() - timedelta(days=random.randint(3, 45))).strftime("%d %b %Y")
        db.add(LabReport(
            patient_id=pat.id,
            test_name=test_name,
            date=dt,
            doctor_name=doc_name,
            status="Completed",
            report_summary=summary,
            file_url="#"
        ))

    # Create Consultation Notes
    for i in range(15):
        pat = random.choice(created_patients)
        doc_name, dept = random.choice(doctors)
        dt = (datetime.utcnow() - timedelta(days=random.randint(4, 50))).strftime("%d %b %Y")
        db.add(ConsultationNote(
            patient_id=pat.id,
            date=dt,
            doctor_name=doc_name,
            department=dept,
            symptoms="Mild discomfort, fatigue reported during morning routines.",
            clinical_notes="Vitals stable. BP: 120/80 mmHg, Pulse: 72 bpm, SpO2: 98% on room air.",
            diagnosis="Routine clinical evaluation, routine hypertension management.",
            plan="Continue current medications. Repeat lipid profile in 4 weeks."
        ))

    # Create Follow-ups (15 followups)
    fu_statuses = ["Pending", "Completed", "Missed", "Cancelled"]
    for i in range(15):
        pat = random.choice(created_patients)
        doc_name, _ = random.choice(doctors)
        f_dt = (datetime.utcnow() + timedelta(days=random.randint(1, 30))).strftime("%d %b %Y")
        db.add(FollowUp(
            patient_id=pat.id,
            followup_date=f_dt,
            doctor_name=doc_name,
            reason="Post consultation review & lab report evaluation",
            status=random.choice(fu_statuses),
            notes="Patient advised to bring recent blood sugar test reports."
        ))

    db.commit()
    print("Mentneo Hospital CRM seed dataset successfully created!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
