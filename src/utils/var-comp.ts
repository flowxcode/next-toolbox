// components/MyGridComponent.tsx
import React, { useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useGridConfig } from '../hooks/useGridConfig';
import { RowData } from '../types/types';
import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get<RowData[]>(url).then(res => res.data);

const MyGridComponent: React.FC = () => {
  const { config, isLoading: configLoading, isError: configError } = useGridConfig();

  const { data: rows, error: dataError, isLoading: dataLoading } = useSWR<RowData[]>('/api/getData', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    dedupingInterval: Infinity,
  });

  const defaultColumns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', minWidth: 70 },
    { field: 'name', headerName: 'Sequence Name', minWidth: 150 },
    { field: 'category', headerName: 'Category', minWidth: 120 },
    { field: 'comment', headerName: 'Comment', minWidth: 120 },
    { field: 'modifiedby', headerName: 'Modified By', minWidth: 150 },
    { field: 'modifiedDate', headerName: 'Modified Date', minWidth: 180 },
  ], []);

  const columns: GridColDef[] = useMemo(() => {
    if (!config) return defaultColumns;

    return defaultColumns.map((col) => {
      const configColumn = config.columns.find((c) => c.field === col.field);
      if (configColumn) {
        return { ...col, width: configColumn.width };
      }
      return col;
    });
  }, [config, defaultColumns]);

  const loading = configLoading || dataLoading;
  const error = configError || dataError;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box color="error.main">Error loading grid data.</Box>;
  }

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows || []}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        // Add other DataGrid props as needed
      />
    </div>
  );
};

export default MyGridComponent;
