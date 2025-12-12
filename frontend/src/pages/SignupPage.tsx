import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignup } from '../api/hooks';
import { SignupRiderSchema, SignupDriverSchema, SignupRiderInput, SignupDriverInput } from '../schemas';
import { ZodError } from 'zod';

type SignupInput = (SignupRiderInput | SignupDriverInput) & { confirmPassword?: string };

export default function SignupPage() {
  const navigate = useNavigate();
  const { mutate: signup, isPending, error: serverError } = useSignup();
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role,
  });
  const [errors, setErrors] = useState<Partial<SignupInput>>({});

  const schema = role === 'rider' ? SignupRiderSchema : SignupDriverSchema;

  const handleRoleChange = (newRole: 'rider' | 'driver') => {
    setRole(newRole);
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof SignupInput]) {
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
      const validatedData = schema.parse(formData);
      const submitData = {
        ...validatedData,
        role,
      };
      // Remove confirmPassword before sending
      const { confirmPassword, ...dataToSend } = submitData as any;
      signup(dataToSend, {
        onSuccess: () => {
          navigate('/profile');
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<SignupInput> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignupInput;
          fieldErrors[path] = err.message as any;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form">
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Sign Up</h1>

          {serverError && (
            <div className="alert alert-error">
              {(serverError as any)?.response?.data?.error || 'Signup failed. Please try again.'}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className={`button ${role === 'rider' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => handleRoleChange('rider')}
            >
              Rider
            </button>
            <button
              type="button"
              className={`button ${role === 'driver' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => handleRoleChange('driver')}
            >
              Driver
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isPending}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
              />
              {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isPending}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isPending}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="button button-primary" disabled={isPending}>
              {isPending ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
