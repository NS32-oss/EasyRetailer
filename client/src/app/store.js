import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../feature/Userslice"
export const store=configureStore({
    reducer:{
        user:userReducer,
    }
})