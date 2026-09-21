import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Patient, PatientFormData } from '../../types/patient';

// Zod Validation Schema
const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  dob: z.string().optional(),
  age: z.coerce.number().min(0, 'Age must be 0 or greater').max(130, 'Age must be valid'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']),
  profile_photo: z.string().optional(),
  occupation: z.string().optional(),
  marital_status: z.string().optional(),
  preferred_language: z.string().optional(),
  is_existing_patient: z.boolean().default(false),
  status: z.enum(['Active', 'Inactive', 'Follow-up']).default('Active'),

  address: z.object({
    mobile: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
    alt_mobile: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address_line: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, 'Pincode must be a 6-digit number')
      .optional()
      .or(z.literal('')),
  }),

  emergency_contact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  patientToEdit?: Patient | null;
  isLoading?: boolean;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientToEdit,
  isLoading = false,
}) => {
  const isEditMode = Boolean(patientToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      dob: '',
      age: 30,
      gender: 'Male',
      blood_group: 'Unknown',
      occupation: '',
      marital_status: 'Married',
      preferred_language: 'English',
      is_existing_patient: false,
      status: 'Active',
      address: {
        mobile: '',
        alt_mobile: '',
        email: '',
        address_line: '',
        city: '',
        state: '',
        pincode: '',
      },
      emergency_contact: {
        name: '',
        relationship: '',
        phone: '',
      },
    },
  });

  // Calculate age automatically if DOB is selected
  const dobValue = watch('dob');
  useEffect(() => {
    if (dobValue) {
      const dobDate = new Date(dobValue);
      if (!isNaN(dobDate.getTime())) {
        const ageDiffMs = Date.now() - dobDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (calculatedAge >= 0 && calculatedAge <= 130) {
          setValue('age', calculatedAge);
        }
      }
    }
  }, [dobValue, setValue]);

  useEffect(() => {
    if (patientToEdit) {
      reset({
        first_name: patientToEdit.first_name,
        last_name: patientToEdit.last_name,
        dob: patientToEdit.dob || '',
        age: patientToEdit.age,
        gender: patientToEdit.gender,
        blood_group: patientToEdit.blood_group,
        profile_photo: patientToEdit.profile_photo || '',
        occupation: patientToEdit.occupation || '',
        marital_status: patientToEdit.marital_status || '',
        preferred_language: patientToEdit.preferred_language || 'English',
        is_existing_patient: patientToEdit.is_existing_patient,
        status: patientToEdit.status,
        address: {
          mobile: patientToEdit.address?.mobile || '',
          alt_mobile: patientToEdit.address?.alt_mobile || '',
          email: patientToEdit.address?.email || '',
          address_line: patientToEdit.address?.address_line || '',
          city: patientToEdit.address?.city || '',
          state: patientToEdit.address?.state || '',
          pincode: patientToEdit.address?.pincode || '',
        },
        emergency_contact: {
          name: patientToEdit.emergency_contact?.name || '',
          relationship: patientToEdit.emergency_contact?.relationship || '',
          phone: patientToEdit.emergency_contact?.phone || '',
        },
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        dob: '',
        age: 30,
        gender: 'Male',
        blood_group: 'Unknown',
        occupation: '',
        marital_status: 'Married',
        preferred_language: 'English',
        is_existing_patient: false,
        status: 'Active',
        address: {
          mobile: '',
          alt_mobile: '',
          email: '',
          address_line: '',
          city: '',
          state: '',
          pincode: '',
        },
        emergency_contact: {
          name: '',
          relationship: '',
          phone: '',
        },
      });
    }
  }, [patientToEdit, reset, isOpen]);

  const onFormSubmit = async (data: PatientFormData) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Patient Record (${patientToEdit?.patient_id})` : 'Register New Patient'}
      subtitle={isEditMode ? 'Update demographic and contact details' : 'Enter patient details to automatically generate a unique Patient ID'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <User className="w-4 h-4 text-medical-600" />
            <span>1. Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* First Name */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ravi"
                {...register('first_name')}
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.first_name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-medical-500'
                }`}
              />
              {errors.first_name && <p className="text-[11px] text-rose-500 mt-1">{String((errors.first_name as any)?.message || '')}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kumar"
                {...register('last_name')}
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.last_name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-medical-500'
                }`}
              />
              {errors.last_name && <p className="text-[11px] text-rose-500 mt-1">{String((errors.last_name as any)?.message || '')}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...register('dob')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Age (years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="58"
                {...register('age')}
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.age ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-medical-500'
                }`}
              />
              {errors.age && <p className="text-[11px] text-rose-500 mt-1">{String((errors.age as any)?.message || '')}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('gender')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
              <select
                {...register('blood_group')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Phone className="w-4 h-4 text-medical-600" />
            <span>2. Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Mobile Number */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="10-digit Indian mobile (e.g. 9876543210)"
                {...register('address.mobile')}
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  (errors as any).address?.mobile ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-medical-500'
                }`}
              />
              {(errors as any).address?.mobile && (
                <p className="text-[11px] text-rose-500 mt-1">{String((errors as any).address.mobile.message || '')}</p>
              )}
            </div>

            {/* Alternate Mobile */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alternate Mobile</label>
              <input
                type="text"
                placeholder="Optional secondary mobile"
                {...register('address.alt_mobile')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="patient@example.com"
                {...register('address.email')}
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  (errors as any).address?.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-medical-500'
                }`}
              />
              {(errors as any).address?.email && (
                <p className="text-[11px] text-rose-500 mt-1">{String((errors as any).address.email.message || '')}</p>
              )}
            </div>

            {/* Address Line */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="Flat / House No., Apartment, Street"
                {...register('address.address_line')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="Bangalore"
                {...register('address.city')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">State</label>
              <input
                type="text"
                placeholder="Karnataka"
                {...register('address.state')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pincode (6 digits)</label>
              <input
                type="text"
                placeholder="560001"
                {...register('address.pincode')}
                className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  (errors as any).address?.pincode ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-medical-500'
                }`}
              />
              {(errors as any).address?.pincode && (
                <p className="text-[11px] text-rose-500 mt-1">{String((errors as any).address.pincode.message || '')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact & Additional Details */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-medical-600" />
            <span>3. Emergency Contact & Additional Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Emergency Name */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                placeholder="Relative / Guardian Name"
                {...register('emergency_contact.name')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                placeholder="Spouse / Parent / Child"
                {...register('emergency_contact.relationship')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Emergency Phone */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Emergency Phone Number</label>
              <input
                type="text"
                placeholder="Emergency Contact Phone"
                {...register('emergency_contact.phone')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                placeholder="Software Engineer / Businessman"
                {...register('occupation')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Marital Status</label>
              <select
                {...register('marital_status')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {/* Patient Status */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Patient Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <option value="Active">Active</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} icon={<CheckCircle className="w-4 h-4" />}>
            {isEditMode ? 'Save Patient Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
