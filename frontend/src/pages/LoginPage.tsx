import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../api/hooks';
import { LoginSchema, LoginInput } from '../schemas';
import { ZodError } from 'zod';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error: serverError } = useLogin();
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginInput>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof LoginInput]) {
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
      const validatedData = LoginSchema.parse(formData);
      login(validatedData, {
        onSuccess: () => {
          navigate('/profile');
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<LoginInput> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginInput;
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
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h1>

          {serverError && (
            <div className="alert alert-error">
              {(serverError as any)?.response?.data?.error || 'Login failed. Please try again.'}
            </div>
          )}

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

            <button type="submit" className="button button-primary" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
