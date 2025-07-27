// FILE: src/lib/hooks/useFocusOnError.ts
import { useEffect } from "react";
import { FieldErrors, UseFormSetFocus } from "react-hook-form";

export const useFocusOnError = (
  errors: FieldErrors,
  setFocus: UseFormSetFocus<any>
) => {
  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      setFocus(firstErrorField as any);
    }
  }, [errors, setFocus]);
};
