// FILE: src/lib/features/upload/uploadProgressSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UploadProgressState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  fileName: string | null;
}

const initialState: UploadProgressState = {
  isUploading: false,
  progress: 0,
  error: null,
  fileName: null,
};

const uploadProgressSlice = createSlice({
  name: "uploadProgress",
  initialState,
  reducers: {
    uploadStarted(state, action: PayloadAction<string>) {
      state.isUploading = true;
      state.progress = 0;
      state.error = null;
      state.fileName = action.payload;
    },
    uploadProgressUpdated(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    uploadSucceeded(state) {
      state.isUploading = false;
      state.progress = 100;
      state.fileName = null;
    },
    uploadFailed(state, action: PayloadAction<string>) {
      state.isUploading = false;
      state.error = action.payload;
      state.fileName = null;
    },
    resetUploadState(state) {
      state.isUploading = false;
      state.progress = 0;
      state.error = null;
      state.fileName = null;
    },
  },
});

export const {
  uploadStarted,
  uploadProgressUpdated,
  uploadSucceeded,
  uploadFailed,
  resetUploadState,
} = uploadProgressSlice.actions;

export default uploadProgressSlice.reducer;
