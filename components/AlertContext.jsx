"use client";
import { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [alert, setAlert] = useState(null); // { message, band }
    const [open, setOpen] = useState(false);

    const triggerAlert = useCallback((message, band) => {
        setAlert({ message, band, time: new Date() });
        setOpen(true);
    }, []);

    const closeAlert = useCallback(() => setOpen(false), []);

    return (
        <AlertContext.Provider value={{ alert, open, triggerAlert, closeAlert, setOpen }}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error("useAlert must be used within AlertProvider");
    return ctx;
}
