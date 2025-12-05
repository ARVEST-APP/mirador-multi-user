import { useForm } from "react-hook-form";
import { RegisterFormData, RegisterSchema } from "../types/types.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../../utils/auth.tsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Form, { FormTypes, getFormElements } from "components/elements/Form.tsx";

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
  const registerElements = getFormElements({ name: FormTypes.register, form: registerForm })
  return (
    <Form name={FormTypes.register} form={registerForm} elements={registerElements} onSubmit={onSubmit} submitButton="register" />
  );

};
