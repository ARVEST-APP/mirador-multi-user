import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, LoginSchema } from '../types/types.ts';
import { useLogin } from '../../../utils/auth.tsx';
import { useNavigate } from 'react-router-dom';

import Form, { FormTypes, getFormElements } from 'components/elements/Form.tsx';
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

  const loginElements = getFormElements({ name: FormTypes.login, form: loginForm })
  return (
    <Form name={FormTypes.login} form={loginForm} elements={loginElements} onSubmit={onSubmit} submitButton="loginButton" forgotPasswordButton={true} />
  );
};
