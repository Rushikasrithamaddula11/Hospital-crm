from enum import Enum
from typing import List, Optional
from fastapi import Header, HTTPException, status

class UserRole(str, Enum):
    SUPER_ADMIN = "Super Admin"
    HOSPITAL_ADMIN = "Hospital Admin"
    DOCTOR = "Doctor"
    NURSE = "Nurse"
    RECEPTIONIST = "Receptionist"
    LAB_STAFF = "Lab Staff"
    PHARMACY_STAFF = "Pharmacy Staff"


class CurrentUser:
    def __init__(self, user_id: str, name: str, role: UserRole, hospital_branch: str = "Main Branch"):
        self.user_id = user_id
        self.name = name
        self.role = role
        self.hospital_branch = hospital_branch


def get_current_user(
    x_user_role: Optional[str] = Header(default="Receptionist"),
    x_user_name: Optional[str] = Header(default="Ravi Kumar (Staff)")
) -> CurrentUser:
    """
    Architecture placeholder for JWT Authentication and Role-Based Access Control (RBAC).
    Extracts simulated user token/headers for active staff session.
    """
    try:
        role_enum = UserRole(x_user_role)
    except ValueError:
        role_enum = UserRole.RECEPTIONIST

    return CurrentUser(
        user_id="EMP-1023",
        name=x_user_name or "Hospital Receptionist",
        role=role_enum,
        hospital_branch="Mentneo Central Hospital"
    )


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency generator for RBAC route protection.
    Usage: @app.get("/secure-path", dependencies=[Depends(require_roles([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN]))])
    """
    def role_checker(current_user: CurrentUser = get_current_user):
        if current_user.role not in allowed_roles and current_user.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role.value}' is not authorized to perform this operation."
            )
        return current_user
    return role_checker
