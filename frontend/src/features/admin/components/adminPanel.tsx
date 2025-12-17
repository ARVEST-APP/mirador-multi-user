import { Grid } from '@mui/material';
import { getAllUsers } from '../api/getAllUsers.ts';
import { User } from '../../auth/types/types.ts';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminCollapsibleTable } from './adminCollapsibleTable.tsx';

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useTranslation();
  const fetchUsers = async () => {
    const users = await getAllUsers();
    setUsers(users);
  };

  const columns = [
    { label: 'ID', align: 'left' as const, sortKey: 'id' },
    { label: t('mail'), align: 'left' as const, sortKey: 'mail' },
    { label: t('name'), align: 'left' as const, sortKey: 'name' },
    { label: t('admin'), align: 'center' as const, sortKey: '_isAdmin' },
    {
      label: t('emailConfirmed'),
      align: 'center' as const,
      sortKey: 'isEmailConfirmed',
    },
    {
      label: t('termsValidatedAt'),
      align: 'center' as const,
      sortKey: 'termsValidatedAt',
    },
    { label: t('createdAt'), align: 'left' as const, sortKey: 'createdAt' },
    { label: t('lastConnectedAt'), align: 'left' as const, sortKey: 'lastConnectedAt' },
  ];
  useEffect(() => {
    fetchUsers();
  }, []);

  const rows = useMemo(() => {
    return users.map((user) => ({
      id: user.id,
      data: [
        { value: user.id, align: 'left' as const },
        { value: user.mail, align: 'left' as const },
        { value: user.name, align: 'left' as const },
        { value: t(user._isAdmin ? 'yes' : 'no'), align: 'center' as const },
        {
          value: t(user.isEmailConfirmed ? 'yes' : 'no'),
          align: 'center' as const,
        },
        {
          value: t(user.termsValidatedAt ? 'yes' : 'no'), align: 'center' as const,
        }, {
          value: new Date(user.createdAt).toLocaleString(),
          align: 'left' as const,
        },
        {
          value: new Date(user.lastConnectedAt).toLocaleString(),
          align: 'left' as const,
        },
      ],
    }));
  }, [users]);
  return (
    <Grid sx={{ padding: 2 }}>
      <AdminCollapsibleTable
        columns={columns}
        rows={rows}
      />
    </Grid>
  );
};
