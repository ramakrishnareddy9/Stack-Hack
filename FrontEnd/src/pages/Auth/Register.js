import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const role = watch('role');

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      // Wait a bit for user to be set in context
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = user.role || data.role || 'student';
        navigate(`/${userRole}/dashboard`);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                type="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select role</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>

            {role === 'student' && (
              <>
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Student ID
                  </label>
                  <input
                    {...register('studentId', { required: 'Student ID is required' })}
                    type="text"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    {...register('department')}
                    type="text"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <select
                    {...register('year')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="PG">PG</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone (Optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

