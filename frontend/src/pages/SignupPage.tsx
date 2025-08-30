import React from 'react';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-sm text-gray-600">Create your account</p>
        </div>
        {/* Signup form will be implemented similar to login */}
      </div>
    </div>
  );
};

export default SignupPage;
