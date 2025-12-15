import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPlaying: true,
  title: "",
  artist: "",
  collapsed: false,
};

const adminSettingSlice = createSlice({
  name: "adminSetting",
  initialState,
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCollapsed: (state, action) => {
      state.collapsed = action.payload;
    },
    setAdminSetting: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {setCollapsed,setAdminSetting } =
  adminSettingSlice.actions;
export default adminSettingSlice.reducer;
