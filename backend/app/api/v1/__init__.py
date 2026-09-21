from fastapi import APIRouter
from app.api.v1.patients import router as patients_router
from app.api.v1.stats import router as stats_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.doctors import router as doctors_router
from app.api.v1.prescriptions import router as prescriptions_router
from app.api.v1.lab_reports import router as lab_reports_router
from app.api.v1.followups import router as followups_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.settings import router as settings_router

api_v1_router = APIRouter()
api_v1_router.include_router(patients_router)
api_v1_router.include_router(stats_router)
api_v1_router.include_router(appointments_router)
api_v1_router.include_router(doctors_router)
api_v1_router.include_router(prescriptions_router)
api_v1_router.include_router(lab_reports_router)
api_v1_router.include_router(followups_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(settings_router)
