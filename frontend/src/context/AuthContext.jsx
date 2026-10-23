// src/context/AuthContext.jsx - Global Authentication & Language State Store
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../locales/translations';

const AuthContext = createContext();

// Pre-seeded demo accounts matching the 3-minute pitch personas
export const DEMO_ACCOUNTS = [
  {
    id: 'farmer_KA_101',
    username: 'farmer_KA_101',
    name: 'Ramesh Poojary',
    role: 'farmer',
    phone: '0000010101',
    district: 'Dakshina Kannada',
    taluk: 'Belthangady',
    village: 'Venur',
    crops: ['Arecanut', 'Paddy'],
    lang: 'kn',
    consentGiven: true,
    pass: 'farmer123',
    badge: '🌴 Arecanut (Coastal KA)'
  },
  {
    id: 'farmer_HP_202',
    username: 'farmer_HP_202',
    name: 'Kuldeep Sharma',
    role: 'farmer',
    phone: '0000020202',
    district: 'Shimla',
    taluk: 'Theog',
    village: 'Fagu',
    crops: ['Apple'],
    lang: 'hi',
    consentGiven: true,
    pass: 'apple123',
    badge: '🍏 Apple (Shimla, HP)'
  },
  {
    id: 'admin_expert',
    username: 'admin_expert',
    name: 'Dr. Subrahmanya Bhat',
    role: 'expert',
    phone: '0000099999',
    district: 'Dakshina Kannada',
    taluk: 'Mangaluru',
    village: 'ICAR-CPCRI',
    crops: ['Arecanut', 'Paddy', 'Apple', 'Tomato'],
    lang: 'en',
    consentGiven: true,
    pass: 'admin123',
    badge: '🔬 Senior Plant Pathologist'
  }
];

export function AuthProvider({ children }) {
  // Language defaults to Kannada 'kn' as requested for the father's pitch story
  const [lang, setLang] = useState(() => localStorage.getItem('sasya_lang') || 'kn');
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('sasya_user');
    return cached ? JSON.parse(cached) : null;
  });

  // Track pending sign-up state during OTP verification
  const [pendingSignup, setPendingSignup] = useState(null);

  useEffect(() => {
    localStorage.setItem('sasya_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sasya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sasya_user');
    }
  }, [user]);

  // Translation helper
  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // 1. Password-based Login (Existing Users)
  const login = (username, password) => {
    // Check against demo accounts first
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.pass === password
    );
    if (demo) {
      setUser(demo);
      if (demo.lang) setLang(demo.lang);
      return { success: true, user: demo };
    }

    // Check against dynamically registered users in localStorage
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
      phone: pendingSignup?.phone || '0000012345',
      role: 'farmer',
      name: username.trim(),
      district: 'Dakshina Kannada',
      taluk: 'Belthangady',
      village: 'Venur',
      crops: ['Arecanut'],
      lang: lang,
      consentGiven: false,
      onboarded: false
    };

    // Save to custom users list
    const storedUsers = JSON.parse(localStorage.getItem('sasya_custom_users') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('sasya_custom_users', JSON.stringify(storedUsers));

    setUser(newUser);
    setPendingSignup(null);
    return { success: true, user: newUser };
  };

  // 5. Update Farm Profile Onboarding
  const updateOnboarding = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      if (data.lang) setLang(data.lang);
      return updated;
    });
  };

  // 6. Grant Privacy Consent
  const grantConsent = () => {
    setUser((prev) => ({ ...prev, consentGiven: true, onboarded: true }));
  };

  // 7. Logout
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
        t,
        login,
        startPhoneSignup,
        verifyDummyOtp,
        completeAccountCreation,
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
