// src/components/shared/PaginationControls.tsx
import { Button } from "@/components/ui/button";
import { PaginationInfo } from "@/lib/features/admin/adminTypes"; // or a more generic location

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  pagination,
  onPageChange,
}: PaginationControlsProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage >= pagination.totalPages}
      >
        Next
      </Button>
    </div>
  );
}
