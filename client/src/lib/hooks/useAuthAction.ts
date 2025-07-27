// FILE: src/lib/hooks/useAuthAction.ts

"use client";

import { useAppSelector } from "./hooks";
import { selectCurrentUser } from "../features/user/userSlice";
import { useAppDispatch } from "./hooks";
import { openAuthModal } from "../features/ui/uiSlice";

/**
 * A custom hook to conditionally perform an action based on user authentication.
 * If the user is not authenticated, it opens a generic "login required" modal.
 * @returns A function that takes a callback to execute if the user is logged in.
 */
export const useAuthAction = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const handleAuthAction = (action: () => void) => {
    if (currentUser) {
      // If the user is logged in, perform the action.
      action();
    } else {
      // If the user is not logged in, open the authentication modal.
      dispatch(openAuthModal());
    }
  };

  return handleAuthAction;
};
