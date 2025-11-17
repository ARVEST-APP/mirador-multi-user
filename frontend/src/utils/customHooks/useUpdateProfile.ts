import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateFormData } from '../../features/auth/types/types.ts';
import { updateUser } from '../../features/auth/api/updateUser.tsx';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFormData) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
  });
};
