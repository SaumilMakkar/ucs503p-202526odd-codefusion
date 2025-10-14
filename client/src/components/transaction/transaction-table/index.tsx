import { DataTable } from "@/components/data-table";
import { TRANSACTION_DATA } from "./data";
import { transactionColumns } from "./column";
import { _TRANSACTION_TYPE, _TransactionType } from "@/constant";
import { useState } from "react";
import useDebouncedSearch from "@/hooks/use-debounce-search";
import { useBulkDeleteTransactionMutation, useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import { toast } from "sonner";
// Add this to TransactionTable:
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useEffect } from "react";

// Add this after the hooks:

// const auth = useSelector((state: RootState) => state.auth);
// console.log("Auth state:", auth);
// console.log("Access token:", auth.accessToken);
// console.log("User:", auth.user);

type FilterType = {
  type?: _TransactionType | undefined;
  recurringStatus?: "RECURRING" | "NON_RECURRING" | undefined;
  pageNumber?: number;
  pageSize?: number;
};

const TransactionTable = (props: {
  pageSize?: number;
  isShowPagination?: boolean;
}) => {
  const [filter, setFilter] = useState<FilterType>({
    type: undefined,
    recurringStatus: undefined,
    pageNumber: 1,
    pageSize: props.pageSize || 10,
  });
// Add this to TransactionTable:
console.log("API Base URL:", import.meta.env.VITE_API_URL);
  const { debouncedTerm, setSearchTerm } = useDebouncedSearch("", {
    delay: 500,
  });

  const [bulkDeleteTransaction, { isLoading: isBulkDeleting }] =
    useBulkDeleteTransactionMutation();

  const { data, isFetching, error, isError, refetch } = useGetAllTransactionsQuery({
    keyword: debouncedTerm,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  })


  const transactions = data?.transactions || [];
console.log("=== TransactionTable Debug ===");
console.log("API Data:", data);
console.log("Is Fetching:", isFetching);
console.log("Transactions:", transactions);
console.log("Transactions Length:", transactions.length);
console.log("==============================");
  const pagination = {
    totalItems: data?.pagination?.totalCount || 0,
    totalPages: data?.pagination?.totalPages || 0,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  };
  

// Removed invalid useEffect that called undefined `fetch()`.


  const handleSearch = (value: string) => {
    console.log(debouncedTerm);
    setSearchTerm(value);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    const { type, frequently } = filters;
    setFilter((prev) => ({
      ...prev,
      type: type as _TransactionType,
      recurringStatus: frequently as "RECURRING" | "NON_RECURRING",
    }));
  };


  const handlePageChange = (pageNumber: number) => {
    setFilter((prev) => ({ ...prev, pageNumber }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilter((prev) => ({ ...prev, pageSize }));
  };

  const handleBulkDelete = (transactionIds: string[]) => {
    console.log("Bulk deleting transactions:", transactionIds);

    if (!transactionIds || transactionIds.length === 0) {
      toast.error("No transactions selected for deletion");
      return;
    }

    // Pass the transaction IDs as an object with transactionIds property
    // to match the API expectation in the backend
    bulkDeleteTransaction({ transactionIds })
    .unwrap()
    .then(() => {
      toast.success("Transactions deleted successfully");
      refetch(); // Force refresh the data
    })
    .catch((error) => {
      console.error("Bulk delete error:", error);
      toast.error(error.data?.message || "Failed to delete transactions");
    });
  };

  return (
    <DataTable
      data={transactions} //transactions
      columns={transactionColumns}
      searchPlaceholder="Search transactions..."
      isLoading={isFetching}
      isBulkDeleting={isBulkDeleting}
      isShowPagination={props.isShowPagination}
      pagination={pagination}
      filters={[
        {
          key: "type",
          label: "All Types",
          options: [
            { value: _TRANSACTION_TYPE.INCOME, label: "Income" },
            { value: _TRANSACTION_TYPE.EXPENSE, label: "Expense" },
          ],
        },
        {
          key: "frequently",
          label: "Frequently",
          options: [
            { value: "RECURRING", label: "Recurring" },
            { value: "NON_RECURRING", label: "Non-Recurring" },
          ],
        },
      ]}
      onSearch={handleSearch}
      onPageChange={(pageNumber) => handlePageChange(pageNumber)}
      onPageSizeChange={(pageSize) => handlePageSizeChange(pageSize)}
      onFilterChange={(filters) => handleFilterChange(filters)}
      onBulkDelete={handleBulkDelete}
    />
  );
};
export default TransactionTable;
