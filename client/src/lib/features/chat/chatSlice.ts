import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, toggleChat, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
