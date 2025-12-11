import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetDriverProfile,
  useUpdateDriverProfile,
  useToggleDriverAvailability,
  useGetDriverDocuments,
  useAddDriverDocument,
} from '../api/hooks';
import { UpdateDriverProfileSchema, UpdateDriverProfileInput } from '../schemas';
import { ZodError } from 'zod';

export default function DriverDashboardPage() {
  const navigate = useNavigate();
  const { data: driverProfile, isLoading: profileLoading } = useGetDriverProfile();
  const { data: documents } = useGetDriverDocuments();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateDriverProfile();
  const { mutate: toggleAvailability, isPending: isTogglingAvailability } = useToggleDriverAvailability();
  const { mutate: addDocument, isPending: isAddingDocument } = useAddDriverDocument();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateDriverProfileInput>({
    licenseNumber: driverProfile?.licenseNumber || '',
    licenseExpiry: driverProfile?.licenseExpiry || '',
    vehicleType: driverProfile?.vehicleType || '',
    vehicleNumber: driverProfile?.vehicleNumber || '',
  });
  const [errors, setErrors] = useState<Partial<UpdateDriverProfileInput>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof UpdateDriverProfileInput]) {
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
      const validatedData = UpdateDriverProfileSchema.parse(formData);
      updateProfile(validatedData, {
        onSuccess: () => {
          setIsEditing(false);
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<UpdateDriverProfileInput> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof UpdateDriverProfileInput;
          fieldErrors[path] = err.message as any;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleToggleAvailability = () => {
    if (driverProfile) {
      toggleAvailability(!driverProfile.isAvailable);
    }
  };

  const handleAddDocument = (type: string) => {
    addDocument({ type });
  };

  if (profileLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading driver profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!driverProfile) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">Driver profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Driver Dashboard</h1>
          <button className="button button-secondary" onClick={() => navigate('/profile')}>
            Back to Profile
          </button>
        </div>

        <div className="card">
          <div className="card-header">Approval Status</div>
          <div className="card-content">
            <p>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  backgroundColor:
                    driverProfile.status === 'approved' ? '#dcfce7' : driverProfile.status === 'pending_approval' ? '#fef3c7' : '#fee2e2',
                  color:
                    driverProfile.status === 'approved' ? '#166534' : driverProfile.status === 'pending_approval' ? '#92400e' : '#991b1b',
                }}
              >
                {driverProfile.status}
              </span>
            </p>
            {driverProfile.status === 'pending_approval' && (
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                Your driver profile is awaiting admin approval. You'll be able to accept rides once approved.
              </p>
            )}
            {driverProfile.status === 'approved' && (
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#166534' }}>
                Your driver profile is approved! You can now accept rides.
              </p>
            )}
            {driverProfile.status === 'rejected' && driverProfile.rejectionReason && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '0.375rem' }}>
                <strong style={{ color: '#991b1b' }}>Rejection Reason:</strong>
                <p style={{ color: '#991b1b', marginTop: '0.5rem' }}>{driverProfile.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Availability</div>
          <div className="card-content">
            <p>
              <strong>Currently Available:</strong> {driverProfile.isAvailable ? '✓ Yes' : '✗ No'}
            </p>
            {driverProfile.status === 'approved' && (
              <button
                className={`button ${driverProfile.isAvailable ? 'button-danger' : 'button-primary'}`}
                onClick={handleToggleAvailability}
                disabled={isTogglingAvailability}
              >
                {isTogglingAvailability
                  ? 'Updating...'
                  : driverProfile.isAvailable
                    ? 'Go Offline'
                    : 'Go Online'}
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Driver Information</div>
          {!isEditing ? (
            <div className="card-content">
              <p>
                <strong>License Number:</strong> {driverProfile.licenseNumber || 'Not provided'}
              </p>
              <p>
                <strong>License Expiry:</strong>{' '}
                {driverProfile.licenseExpiry
                  ? new Date(driverProfile.licenseExpiry).toLocaleDateString()
                  : 'Not provided'}
              </p>
              <p>
                <strong>Vehicle Type:</strong> {driverProfile.vehicleType || 'Not provided'}
              </p>
              <p>
                <strong>Vehicle Number:</strong> {driverProfile.vehicleNumber || 'Not provided'}
              </p>
              <button
                className="button button-primary"
                onClick={() => {
                  setFormData({
                    licenseNumber: driverProfile.licenseNumber,
                    licenseExpiry: driverProfile.licenseExpiry,
                    vehicleType: driverProfile.vehicleType,
                    vehicleNumber: driverProfile.vehicleNumber,
                  });
                  setIsEditing(true);
                }}
              >
                Edit Information
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="licenseNumber">License Number</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.licenseNumber && <div className="error-message">{errors.licenseNumber}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="licenseExpiry">License Expiry</label>
                <input
                  type="datetime-local"
                  id="licenseExpiry"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.licenseExpiry && <div className="error-message">{errors.licenseExpiry}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <input
                  type="text"
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.vehicleType && <div className="error-message">{errors.vehicleType}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="vehicleNumber">Vehicle Number</label>
                <input
                  type="text"
                  id="vehicleNumber"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
                {errors.vehicleNumber && <div className="error-message">{errors.vehicleNumber}</div>}
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

        <div className="card">
          <div className="card-header">Documents</div>
          <div className="card-content">
            {documents && documents.length > 0 ? (
              <div>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '1rem',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{doc.type}</td>
                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              backgroundColor:
                                doc.status === 'verified'
                                  ? '#dcfce7'
                                  : doc.status === 'pending'
                                    ? '#fef3c7'
                                    : '#fee2e2',
                              color:
                                doc.status === 'verified'
                                  ? '#166534'
                                  : doc.status === 'pending'
                                    ? '#92400e'
                                    : '#991b1b',
                            }}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No documents uploaded yet.</p>
            )}

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ marginBottom: '1rem', fontWeight: '500' }}>Add Document:</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['license', 'insurance', 'registration', 'inspection'].map((docType) => (
                  <button
                    key={docType}
                    className="button button-primary"
                    onClick={() => handleAddDocument(docType)}
                    disabled={isAddingDocument}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {isAddingDocument ? 'Adding...' : `Add ${docType}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
