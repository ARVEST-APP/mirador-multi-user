import { Button, Grid } from '@mui/material';
import { getAllUsers } from '../api/getAllUsers.ts';
import { User } from '../../auth/types/types.ts';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminCollapsibleTable } from './adminCollapsibleTable.tsx';

// Function to download the CSV file
const downloadCSV = (data: string) => {
  // Create a Blob with the CSV data and type
  const blob = new Blob([data], { type: 'text/csv' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor tag for downloading
  const a = document.createElement('a');

  // Set the URL and download attribute of the anchor tag
  a.href = url;
  a.download = 'download.csv';

  // Trigger the download by clicking the anchor tag
  a.click();
}

const csvmaker = function (data: Object[]) {
  let csvRows = [];

  const headers = Object.keys(data[0]);

  // As for making csv format, headers must be separated by comma and pushing it into array
  csvRows.push(headers.join(','));

  data.forEach(
    obj => {
      const values = Object.values(obj).join(',');
      csvRows.push(values)
    }
  )

  // Returning the array joining with new line 
  return csvRows.join('\n')
}

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
    { label: t('emailConfirmed'), align: 'center' as const, sortKey: 'isEmailConfirmed' },
    { label: t('termsValidatedAt'), align: 'center' as const, sortKey: 'termsValidatedAt' },
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
        { value: t(user.isEmailConfirmed ? 'yes' : 'no'), align: 'center' as const },
        { value: t(user.termsValidatedAt ? 'yes' : 'no'), align: 'center' as const },
        { value: new Date(user.createdAt).toLocaleString(), align: 'left' as const },
        { value: new Date(user.lastConnectedAt).toLocaleString(), align: 'left' as const },
      ],
    }));
  }, [users]);
  return (
    <Grid sx={{ padding: 2 }}>
      <Button onClick={() => downloadCSV(csvmaker(users))}>{t("downloadCSV")}</Button>
      <AdminCollapsibleTable
        columns={columns}
        rows={rows}
      />
    </Grid>
  );
};
