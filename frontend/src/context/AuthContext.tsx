import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types/user';
import { DEMO_ACCOUNTS, DEFAULT_DEMO_PASSWORD } from '../data/demoAccounts';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, selectedRole?: UserRole) => Promise<boolean>;
  quickLogin: (role: UserRole) => void;
  registerUser: (name: string, email: string, role: UserRole, phone?: string, patientId?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hospital_crm_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const adminAcc = DEMO_ACCOUNTS.find(a => a.role === 'Admin');
    return adminAcc ? {
      uid: 'uid-admin-001',
      name: 'System Admin',
      email: 'admin@gmail.com',
      role: 'Admin',
      phone: '+1 (555) 019-2831',
      department: 'Hospital Administration',
      status: 'Active',
      createdAt: new Date().toISOString()
    } : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const quickLogin = (targetRole: UserRole) => {
    const acc = DEMO_ACCOUNTS.find(a => a.role === targetRole) || DEMO_ACCOUNTS[0];
    const defaultName = targetRole === 'Patient' ? 'Rahul Kumar' : targetRole === 'Doctor' ? 'Dr. Anil Sharma' : targetRole === 'Nurse' ? 'Sister Meera' : 'System Admin';
    const newUser: UserProfile = {
      uid: `uid-${targetRole.toLowerCase()}-${Date.now()}`,
      name: defaultName,
      email: acc.email,
      role: acc.role,
      phone: '+91 9876543210',
      department: targetRole === 'Doctor' ? 'Cardiology' : targetRole === 'Nurse' ? 'Inpatient Nursing' : 'General Medicine',
      patientId: targetRole === 'Patient' ? (acc.patientId || 'PT-000001') : undefined,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
  };

  const registerUser = (name: string, email: string, role: UserRole, phone?: string, patientId?: string) => {
    const newUser: UserProfile = {
      uid: `uid-${role.toLowerCase()}-${Date.now()}`,
      name: name.trim() || (role === 'Patient' ? 'Rahul Kumar' : 'Healthcare User'),
      email: email.trim(),
      role,
      phone: phone || '+91 9876543210',
      patientId: role === 'Patient' ? (patientId || 'PT-000001') : undefined,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
  };

  const login = async (email: string, pass: string, selectedRole?: UserRole): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Admin credentials
    if (cleanEmail === 'admin@gmail.com' && (pass === 'admin@123' || pass === DEFAULT_DEMO_PASSWORD)) {
      setUser({
        uid: 'uid-admin-001',
        name: 'System Admin',
        email: 'admin@gmail.com',
        role: 'Admin',
        phone: '+1 (555) 019-2831',
        department: 'Hospital Administration',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      return true;
    }

    // Patient credentials
    if (cleanEmail === 'patient@hospital.com' || selectedRole === 'Patient') {
      setUser({
        uid: 'uid-patient-001',
        name: 'Rahul Kumar',
        email: cleanEmail || 'patient@hospital.com',
        role: 'Patient',
        phone: '+91 9876543210',
        patientId: 'PT-000001',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      return true;
    }

    // Doctor credentials
    if (cleanEmail === 'doctor@hospital.com' || selectedRole === 'Doctor') {
      setUser({
        uid: 'uid-doctor-001',
        name: 'Dr. Anil Sharma',
        email: cleanEmail || 'doctor@hospital.com',
        role: 'Doctor',
        department: 'General Medicine',
        phone: '+91 9876543211',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      return true;
    }

    // Nurse credentials
    if (cleanEmail === 'nurse@hospital.com' || selectedRole === 'Nurse') {
      setUser({
        uid: 'uid-nurse-001',
        name: 'Sister Meera',
        email: cleanEmail || 'nurse@hospital.com',
        role: 'Nurse',
        department: 'General OPD',
        phone: '+91 9876543212',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      return true;
    }

    const matched = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === cleanEmail);
    if (matched && (pass === DEFAULT_DEMO_PASSWORD || pass === 'admin@123')) {
      quickLogin(matched.role);
      return true;
    }

    // Fallback for custom logins
    if (pass === 'admin@123' || pass === DEFAULT_DEMO_PASSWORD || pass.length >= 4) {
      const activeRole: UserRole = selectedRole || (matched ? matched.role : 'Patient');
      const defaultName = activeRole === 'Patient' ? 'Rahul Kumar' : activeRole === 'Doctor' ? 'Dr. Anil Sharma' : activeRole === 'Nurse' ? 'Sister Meera' : 'System Admin';
      const newUser: UserProfile = {
        uid: `uid-${Date.now()}`,
        name: defaultName,
        email: cleanEmail,
        role: activeRole,
        patientId: activeRole === 'Patient' ? 'PT-000001' : undefined,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    quickLogin(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        quickLogin,
        registerUser,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
