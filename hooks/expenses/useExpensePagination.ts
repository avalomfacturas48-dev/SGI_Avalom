"use client";

import { useState, useCallback } from "react";

export const useExpensePagination = (initialPage: number = 1, initialPageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const updatePagination = useCallback((pagination: { totalPages?: number; total?: number }) => {
    if (pagination.totalPages !== undefined) {
      setTotalPages(pagination.totalPages);
    }
    if (pagination.total !== undefined) {
      setTotalRecords(pagination.total);
    }
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    updatePagination,
  };
};

