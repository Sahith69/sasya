// src/context/AuthContext.jsx - Global Authentication, Language, Theme & Typography Store
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../locales/translations';

const AuthContext = createContext();

// Pre-seeded demo accounts matching the exact user specification
export const DEMO_ACCOUNTS = [
  {
    id: 'farmer_ka_101',
    username: 'ramesh_k',
    name: 'Ramesh K',
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
    badge: '🌴 Arecanut & Paddy (Belthangady)'
  },
  {
    id: 'farmer_ka_102',
    username: 'manjunath_s',
    name: 'Manjunath S',
    role: 'farmer',
    phone: '98450 98765',
    state: 'Karnataka',
    district: 'Shivamogga',
    taluk: 'Thirthahalli',
    village: 'Agumbe',
    landSize: '5.0 Acres',
    upiId: 'manjunath@oksbi',
    crops: ['Arecanut', 'Paddy'],
    lang: 'en',
    consentGiven: true,
    pass: 'farmer123',
    badge: '🌴 Arecanut & Paddy (Thirthahalli)'
  },
  {
    id: 'farmer_ka_103',
    username: 'suresh_p',
    name: 'Suresh P',
    role: 'farmer',
    phone: '98452 33445',
    state: 'Karnataka',
    district: 'Dakshina Kannada',
    taluk: 'Sullia',
    village: 'Sullia',
    landSize: '3.5 Acres',
    upiId: 'suresh@oksbi',
    crops: ['Arecanut'],
    lang: 'en',
    consentGiven: true,
    pass: 'farmer123',
    badge: '🌴 Arecanut Cultivator (Sullia)'
  },
  {
    id: 'farmer_ka_104',
    username: 'anand_m',
    name: 'Anand M',
    role: 'farmer',
    phone: '97410 23456',
    state: 'Karnataka',
    district: 'Kolar',
    taluk: 'Kolar',
    village: 'Huthur',
    landSize: '2.5 Acres',
    upiId: 'anand@okaxis',
    crops: ['Tomato'],
    lang: 'en',
    consentGiven: true,
    pass: 'farmer123',
    badge: '🍅 Tomato Grower (Kolar)'
  },
  {
    id: 'farmer_hp_105',
    username: 'sunil_t',
    name: 'Sunil T',
    role: 'farmer',
    phone: '98160 55443',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    taluk: 'Theog',
    village: 'Kotkhai',
    landSize: '3.5 Acres',
    upiId: 'sunil@okicici',
    crops: ['Apple'],
    lang: 'en',
    consentGiven: true,
    pass: 'apple123',
    badge: '🍏 Apple Orchardist (Shimla)'
  },
  {
    id: 'admin_expert',
    username: 'admin_expert',
    name: 'Dr. Subrahmanya K',
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
    try {
      const cached = localStorage.getItem('sasya_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        const valid = DEMO_ACCOUNTS.find(a => a.username === parsed.username);
        if (valid) return valid;
        if (parsed.username && !parsed.username.includes('farmer_KA_101') && !parsed.username.includes('farmer_HP_202')) {
          return parsed;
        }
        localStorage.removeItem('sasya_user');
      }
    } catch {}
    return DEMO_ACCOUNTS[0];
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

  // 1. Password-based Login (Existing Users or New Sign In)
  const login = (username, password) => {
    const cleanUser = (username || '').trim();
    if (!cleanUser || !password) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    const demo = DEMO_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === cleanUser.toLowerCase() && a.pass === password
    );
    if (demo) {
      setUser(demo);
      if (demo.lang) setLang(demo.lang);
      return { success: true, user: demo };
    }

    const storedUsers = JSON.parse(localStorage.getItem('sasya_custom_users') || '[]');
    const matched = storedUsers.find(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === password
    );
    if (matched) {
      setUser(matched);
      if (matched.lang) setLang(matched.lang);
      return { success: true, user: matched };
    }

    // Direct registration & login for newly entered farmer credentials
    const newUser = {
      id: `farmer_${Math.floor(1000 + Math.random() * 9000)}`,
      username: cleanUser,
      name: cleanUser,
      role: cleanUser.toLowerCase().includes('expert') || cleanUser.toLowerCase().includes('admin') ? 'expert' : 'farmer',
      state: 'Karnataka',
      district: 'Dakshina Kannada',
      taluk: 'Belthangady',
      village: 'Venur',
      landSize: '4.0 Acres',
      upiId: `${cleanUser}@oksbi`,
      crops: ['Arecanut', 'Paddy'],
      lang: lang,
      consentGiven: true
    };
    storedUsers.push(newUser);
    localStorage.setItem('sasya_custom_users', JSON.stringify(storedUsers));
    setUser(newUser);
    return { success: true, user: newUser };
  };

  // 2. Step 1 of Sign Up: Start Dummy Phone OTP with Profile Preferences
  const startPhoneSignup = (phone, profileDetails = {}) => {
    const cleanPhone = (phone || '').trim();
    if (!cleanPhone.startsWith('00000') && cleanPhone.replace(/\D/g, '').length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number or demo number starting with 00000.' };
    }
    setPendingSignup({
      phone: cleanPhone,
      ...profileDetails,
      step: 'otp'
    });
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

  // 4. Step 3 of Sign Up: Complete Account Creation & Save Credentials
  const completeAccountCreation = (chosenUsername, chosenPassword) => {
    const finalUsername = (chosenUsername || pendingSignup?.username || '').trim();
    const finalPassword = (chosenPassword || pendingSignup?.password || '').trim();
    if (!finalUsername || !finalPassword) {
      return { success: false, error: 'Username and password cannot be empty.' };
    }

    const newUser = {
      id: `farmer_${pendingSignup?.phone ? pendingSignup.phone.slice(-4) : Math.floor(Math.random() * 9000 + 1000)}`,
      username: finalUsername,
      password: finalPassword,
      phone: pendingSignup?.phone || '98450 12345',
      role: 'farmer',
      name: pendingSignup?.name || finalUsername,
      state: pendingSignup?.state || 'Karnataka',
      district: pendingSignup?.district || 'Dakshina Kannada',
      taluk: pendingSignup?.taluk || 'Belthangady',
      village: (pendingSignup?.taluk || 'Venur').replace(/\(.*\)/, '').trim(),
      landSize: '3.5 Acres',
      upiId: `${finalUsername}@oksbi`,
      crops: pendingSignup?.crops && pendingSignup.crops.length > 0 ? pendingSignup.crops : ['Arecanut'],
      lang: lang,
      consentGiven: true,
      onboarded: true
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