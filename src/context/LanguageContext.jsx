import { createContext, useContext, useState } from "react";

const translations = {
  en: {
    dashboard: "Dashboard", students: "Students", faculty: "Faculty",
    attendance: "Attendance", marks: "Marks", fees: "Fees",
    notices: "Notices", timetable: "Timetable", reports: "Reports",
    settings: "Settings", chat: "Chat", logout: "Logout",
    welcome: "Welcome", aiReport: "AI Report",
    totalStudents: "Total Students", totalFaculty: "Total Faculty",
    feesCollected: "Fees Collected", activeNotices: "Active Notices",
    markAttendance: "Mark Attendance", myFees: "My Fees",
    myMarks: "My Marks", myAttendance: "My Attendance",
    present: "Present", absent: "Absent", pending: "Pending",
    save: "Save Changes", cancel: "Cancel", add: "Add",
    edit: "Edit", delete: "Delete", search: "Search",
    loading: "Loading...", noData: "No data found",
    profileSettings: "Profile Settings", changePassword: "Change Password",
    idCard: "ID Card", notifications: "Notifications",
  },
  hi: {
    dashboard: "डैशबोर्ड", students: "छात्र", faculty: "शिक्षक",
    attendance: "उपस्थिति", marks: "अंक", fees: "शुल्क",
    notices: "सूचनाएं", timetable: "समय सारणी", reports: "रिपोर्ट",
    settings: "सेटिंग्स", chat: "चैट", logout: "लॉग आउट",
    welcome: "स्वागत है", aiReport: "AI रिपोर्ट",
    totalStudents: "कुल छात्र", totalFaculty: "कुल शिक्षक",
    feesCollected: "शुल्क संग्रह", activeNotices: "सक्रिय सूचनाएं",
    markAttendance: "उपस्थिति दर्ज करें", myFees: "मेरा शुल्क",
    myMarks: "मेरे अंक", myAttendance: "मेरी उपस्थिति",
    present: "उपस्थित", absent: "अनुपस्थित", pending: "लंबित",
    save: "सहेजें", cancel: "रद्द करें", add: "जोड़ें",
    edit: "संपादित करें", delete: "हटाएं", search: "खोजें",
    loading: "लोड हो रहा है...", noData: "कोई डेटा नहीं मिला",
    profileSettings: "प्रोफ़ाइल सेटिंग्स", changePassword: "पासवर्ड बदलें",
    idCard: "पहचान पत्र", notifications: "सूचनाएं",
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem("erp_lang") || "en");
  const t = (key) => translations[lang][key] || key;
  const toggleLang = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
    localStorage.setItem("erp_lang", newLang);
  };
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);