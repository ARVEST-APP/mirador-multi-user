import { useForm } from "react-hook-form";
import { RegisterFormData, RegisterSchema } from "../types/types.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../../utils/auth.tsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Form, { FormTypes } from "components/elements/Form.tsx";
import { AutomatedFormTextField, CommunFieldsName } from 'components/elements/FormField.tsx';
import LanguageSelector from "features/translation/LanguageSelector.tsx";

export const RegisterForm = () => {
  const navigate = useNavigate(); // Use hooks at the top level
  const { t } = useTranslation();

  //this is a hook from React-Query that allow us to use createUser(data) bellow
  const { mutateAsync: createUser } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
    await createUser(data, {
      onSuccess: () => {
        toast.success(t("accountCreated"), { duration: 10000 });
        navigate("/");
      },
      onError: (error: any) => {
        if (error.status === 409) {
          toast.error(t("userAlreadyExists"));
        } else {
          toast.error(error.message);
        }
        console.error("error creation", error);
      }
    });
  };

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const registerElementName = [
    CommunFieldsName.newMail,
    CommunFieldsName.confirmMail,
    CommunFieldsName.name,
    CommunFieldsName.newPassword,
    CommunFieldsName.confirmPassword,
  ]
  const registerPartialFields = registerElementName.map((input) => {
    return (new AutomatedFormTextField(input))
  });
  const children: (JSX.Element | AutomatedFormTextField)[] = [
    <LanguageSelector name="preferredLanguage" />,
    ...registerPartialFields,
  ]

  return (
    <Form name={FormTypes.register} form={registerForm} onSubmit={onSubmit} submitButtonText="register" formElements={children} />
  );
};
