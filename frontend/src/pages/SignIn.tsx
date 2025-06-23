import SignInForm from 'components/modules/auth/SignInForm';
import AuthSimpleLayout from 'layouts/AuthSimpleLayout';

const SignIn = () => {
  return (
    <AuthSimpleLayout>
      <SignInForm layout="simple" />
    </AuthSimpleLayout>
  );
};

export default SignIn;
