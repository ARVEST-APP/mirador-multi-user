import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, LoginSchema } from '../types/types.ts';
import { useLogin } from '../../../utils/auth.tsx';
import { useNavigate } from 'react-router-dom';

import Form, { FormTypes } from 'components/elements/Form.tsx';
import { AutomatedFormTextField, CommunFieldsName } from 'components/elements/FormField.tsx';
import toast from 'react-hot-toast';

export const LoginForm = () => {
  const navigate = useNavigate();

  const { mutateAsync: loginUser } = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data, {
        onSuccess: () => navigate('/app/my-projects'),
      });
    } catch (error) {
      toast.error('Login error: ' + (error as Error).message);
      console.error('Login error:', error);
    }
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  return (
    <Form name={FormTypes.login} form={loginForm} onSubmit={onSubmit} submitButtonText="loginButton"
      formElements={[
        new AutomatedFormTextField(CommunFieldsName.mail),
        new AutomatedFormTextField(CommunFieldsName.password)
      ]} />
  );
};
