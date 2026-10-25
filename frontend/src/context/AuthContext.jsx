// src/context/AuthContext.jsx - Global Authentication, Language, Theme & Typography Store
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../locales/translations';

const AuthContext = createContext();

// Pre-seeded demo accounts matching the 3-minute pitch personas
export const DEMO_ACCOUNTS = [
  {
    id: 'farmer_KA_101',
    username: 'farmer_KA_101',
    name: 'Ramesh Gowda',
    role: 'farmer',
    phone: '98451 10101',
    state: 'Karnataka',
    district: 'Dakshina Kannada',
    taluk: 'Belthangady',
    village: 'Venur',
    landSize: '4.0 Acres',
    upiId: 'ramesh@oksbi',
    crops: ['Arecanut', 'Paddy'],
    lang: 'en',
    consentGiven: true,
    pass: 'farmer123',
    badge: '🌴 Arecanut (Coastal KA)'
  },
  {
    id: 'farmer_HP_202',
    username: 'farmer_HP_202',
    name: 'Kuldeep Sharma',
    role: 'farmer',
    phone: '98160 20202',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    taluk: 'Theog',
    village: 'Fagu',
    landSize: '3.5 Acres',
    upiId: 'kuldeep@okicici',
    crops: ['Apple'],
    lang: 'en',
    consentGiven: true,
    pass: 'apple123',
    badge: '🍏 Apple (Shimla, HP)'
  },
  {
    id: 'admin_expert',
    username: 'admin_expert',
    name: 'Dr. Subrahmanya Bhat',
    role: 'expert',
    phone: '94481 99999',
    state: 'Karnataka',
    district: 'Dakshina Kannada',
    taluk: 'Mangaluru',
    village: 'Vittal',
    landSize: 'Research Station',
    upiId: 'admin@sbi',
    crops: ['Arecanut', 'Paddy', 'Apple', 'Tomato'],
    lang: 'en',
    consentGiven: true,
    pass: 'admin123',
    badge: '🔬 Senior Plant Pathologist'
  }
];

export function AuthProvider({ children }) {
  // Global Language state (persisted)
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('sasya_lang') || 'en';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('sasya_lang', newLang);
  };

  // Global Theme state (persisted)
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('sasya_theme') || 'light';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('sasya_theme', newTheme);
  };

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Global Text Size state (persisted)
  const [textSize, setTextSizeState] = useState(() => {
    return localStorage.getItem('sasya_text_size') || 'normal';
  });

  const setTextSize = (newSize) => {
    setTextSizeState(newSize);
    localStorage.setItem('sasya_text_size', newSize);
  };

  // Synchronize Theme & Text Size to document element immediately
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  // Global User state (persisted)
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('sasya_user');
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sasya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sasya_user');
    }
  }, [user]);

  // Track pending sign-up state during OTP verification
  const [pendingSignup, setPendingSignup] = useState(null);

  // Translation helper
  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // 1. Password-based Login (Existing Users)
  const login = (username, password) => {
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.pass === password
    );
    if (demo) {
      setUser(demo);
      if (demo.lang) setLang(demo.lang);
      return { success: true, user: demo };
    }

    const storedUsers = JSON.parse(localStorage.getItem('sasya_custom_users') || '[]');
    const matched = storedUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (matched) {
      setUser(matched);
      if (matched.lang) setLang(matched.lang);
      return { success: true, user: matched };
    }

    return { success: false, error: 'Invalid username or password. For demo use farmer_KA_101 / farmer123' };
  };

  // 2. Step 1 of Sign Up: Start Dummy Phone OTP
  const startPhoneSignup = (phone) => {
    const cleanPhone = phone.trim();
    if (!cleanPhone.startsWith('00000') && cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number or demo number starting with 00000.' };
    }
    setPendingSignup({ phone: cleanPhone, step: 'otp' });
    return { success: true, demoOtp: '123456' };
  };

  // 3. Step 2 of Sign Up: Verify Dummy OTP (123456)
  const verifyDummyOtp = (enteredOtp) => {
    if (enteredOtp.trim() !== '123456') {
      return { success: false, error: 'Invalid OTP. For demo use 123456.' };
    }
    setPendingSignup((prev) => ({ ...prev, step: 'credentials', otpVerified: true }));
    return { success: true };
  };

  // 4. Step 3 of Sign Up: Save Username & Password
  const completeAccountCreation = (username, password) => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Username and password cannot be empty.' };
    }

    const newUser = {
      id: `farmer_${pendingSignup?.phone?.slice(-4) || Math.floor(Math.random() * 9000 + 1000)}`,
      username: username.trim(),
      password: password,
      phone: pendingSignup?.phone || '00000 12345',
      role: 'farmer',
      name: username.trim(),
      state: 'Karnataka',
      district: 'Dakshina Kannada',
      taluk: 'Belthangady',
      village: 'Venur',
      landSize: '4.0 Acres',
      upiId: `${username.trim()}@oksbi`,
      crops: ['Arecanut'],
      lang: lang,
      consentGiven: false,
      onboarded: false
    };

    const storedUsers = JSON.parse(localStorage.getItem('sasya_custom_users') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('sasya_custom_users', JSON.stringify(storedUsers));

    setUser(newUser);
    setPendingSignup(null);
    return { success: true, user: newUser };
  };

  // 4b. Direct Farmer Registration with Place & Crop Preferences
  const registerFarmer = ({ username, password, phone, name, state, district, taluk, village, crops }) => {
    if (!username?.trim() || !password?.trim()) {
      return { success: false, error: 'Username and password cannot be empty.' };
    }

    const newUser = {
      id: `farmer_${phone ? phone.slice(-4) : Math.floor(Math.random() * 9000 + 1000)}`,
      username: username.trim(),
      password: password,
      phone: phone?.trim() || '98450 12345',
      role: 'farmer',
      name: name?.trim() || username.trim(),
      state: state || 'Karnataka',
      district: district || 'Dakshina Kannada',
      taluk: taluk || 'Belthangady',
      village: village || 'Venur',
      landSize: '3.5 Acres',
      upiId: `${username.trim()}@oksbi`,
      crops: crops && crops.length > 0 ? crops : ['Arecanut'],
      lang: lang,
      onboarded: true,
      consentGiven: true
    };

    const storedUsers = JSON.parse(localStorage.getItem('sasya_custom_users') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('sasya_custom_users', JSON.stringify(storedUsers));

    setUser(newUser);
    return { success: true, user: newUser };
  };

  // 5. Update Profile
  const updateProfile = (profileData) => {
    setUser((prev) => {
      const updated = { ...prev, ...profileData };
      if (profileData.lang) setLang(profileData.lang);
      return updated;
    });
  };

  // 6. Update Farm Profile Onboarding
  const updateOnboarding = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      if (data.lang) setLang(data.lang);
      return updated;
    });
  };

  // 7. Grant Privacy Consent
  const grantConsent = () => {
    setUser((prev) => ({ ...prev, consentGiven: true, onboarded: true }));
  };

  // 8. Logout
  const logout = () => {
    setUser(null);
    setPendingSignup(null);
    localStorage.removeItem('sasya_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        lang,
        setLang,
        theme,
        setTheme,
        isDark,
        toggleTheme,
        textSize,
        setTextSize,
        t,
        login,
        registerFarmer,
        startPhoneSignup,
        verifyDummyOtp,
        completeAccountCreation,
        updateProfile,
        updateOnboarding,
        grantConsent,
        logout,
        pendingSignup,
        demoAccounts: DEMO_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}