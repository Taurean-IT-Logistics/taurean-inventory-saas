import SignUpForm from 'components/modules/auth/SignUpForm';
import AuthSimpleLayout from 'layouts/AuthSimpleLayout';

const SignUp = () => {
  return (
    <AuthSimpleLayout>
      <SignUpForm layout="simple" />
    </AuthSimpleLayout>
  );
};

export default SignUp;
