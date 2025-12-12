import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProfile, useUpdateProfile, useLogout, useCurrentUser } from '../api/hooks';
import { UpdateProfileSchema, UpdateProfileInput } from '../schemas';
import { ZodError } from 'zod';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { mutate: updateProfile, isPending: isUpdating, error: updateError } = useUpdateProfile();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileInput>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phoneNumber: profile?.phoneNumber || '',
  });
  const [errors, setErrors] = useState<Partial<UpdateProfileInput>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof UpdateProfileInput]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = UpdateProfileSchema.parse(formData);
      updateProfile(validatedData, {
        onSuccess: () => {
          setIsEditing(false);
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<UpdateProfileInput> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof UpdateProfileInput;
          fieldErrors[path] = err.message as any;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  if (profileLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Profile</h1>
          <button className="button button-danger" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {updateError && (
          <div className="alert alert-error">
            {(updateError as any)?.response?.data?.error || 'Update failed'}
          </div>
        )}

        <div className="card">
          <div className="card-header">Account Information</div>
          <div className="card-content">
            <p>
              <strong>Role:</strong> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {profile.status}
                {profile.status === 'pending' && ' (pending approval)'}
              </span>
            </p>
            {currentUser?.role === 'driver' && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem' }}>
                <strong style={{ color: '#92400e' }}>Driver Note:</strong>
                <p style={{ color: '#92400e', marginTop: '0.5rem' }}>
                  Your driver account is awaiting approval. You'll be able to accept rides once approved by an admin.
                </p>
                {currentUser?.role === 'driver' && (
                  <a href="/driver-dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    Go to Driver Dashboard
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Personal Information</div>
          {!isEditing ? (
            <div className="card-content">
              <p>
                <strong>Name:</strong> {profile.firstName} {profile.lastName}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phoneNumber}
              </p>
              <button
                className="button button-primary"
                onClick={() => {
                  setFormData({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phoneNumber: profile.phoneNumber,
                  });
                  setIsEditing(true);
                }}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
              </div>

              <div className="button-group">
                <button type="submit" className="button button-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {currentUser?.role === 'driver' && (
          <div className="card">
            <div className="card-header">Driver Information</div>
            <p style={{ color: '#6b7280' }}>
              <a href="/driver-dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                Go to Driver Dashboard
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
