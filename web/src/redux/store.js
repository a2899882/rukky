import { configureStore } from "@reduxjs/toolkit";
import adminSettingReducer from "./adminSettingSlice";

const store = configureStore({
  reducer: {
    adminSetting: adminSettingReducer,
  },
});

export default store;
