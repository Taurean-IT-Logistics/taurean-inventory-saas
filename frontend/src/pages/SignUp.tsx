import SignUpForm from 'components/modules/auth/SignUpForm';
import AuthSimpleLayout from 'layouts/AuthSimpleLayout';

const SignUp = () => {
  return (
    <AuthSimpleLayout>
      <SignUpForm />
    </AuthSimpleLayout>
  );
};

export default SignUp;
