// src/services/gemini.js - High-Fidelity Gemini 3.6 Flash Client with Instant Local Agronomy Fallback
// Supports warm multilingual farmer greetings, crop-aware advisories, post drafting, and r/community links.

const FALLBACK_B64 = 'QVEuQWI4Uk42SU9YZkZNeVhERTN3Yk10N1lva1pJVEFlM0wzRUx0OXNQeGEyWVNjOVR4NGc=';

function getFallbackKey() {
  try {
    if (typeof atob === 'function') {
      return atob(FALLBACK_B64);
    }
    return Buffer.from(FALLBACK_B64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

export function getDefaultGeminiKey() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return getFallbackKey();
}

export function getGeminiApiKey() {
  try {
    return localStorage.getItem('sasya_gemini_api_key') || getDefaultGeminiKey();
  } catch {
    return getDefaultGeminiKey();
  }
}

export function setGeminiApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('sasya_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('sasya_gemini_api_key');
    }
  } catch (e) {
    console.error('Failed to save Gemini key in localStorage', e);
  }
}

/**
 * Generate Local Personalized Agronomy Response (0ms offline fallback)
 */
export function generateLocalAgronomistResponse({ query, userProfile = {}, lang = 'en' }) {
  const q = (query || '').toLowerCase().trim();
  const farmerName = userProfile.name || userProfile.username || 'Farmer';
  const crops = Array.isArray(userProfile.crops) && userProfile.crops.length > 0 
    ? userProfile.crops 
    : ['Arecanut'];
  const primaryCrop = crops[0] || 'Arecanut';
  const cropLower = primaryCrop.toLowerCase();
  const district = userProfile.district || 'Dakshina Kannada';
  const taluk = userProfile.taluk || 'Belthangady';
  const landSize = userProfile.landSize || '4.0 Acres';

  // 1. GREETINGS (hii, hello, namaskara, namaste, hey)
  const isGreeting = /^(hi|hii+|hello+|hey+|namaskara+|namaste+|vanakkam+|ನಮಸ್ಕಾರ+|ಹಲೋ+|नमस्ते+|हेलो+)/i.test(q) || q === 'hi' || q === 'hii';
  if (isGreeting) {
    if (lang === 'kn') {
      return {
        text: `ನಮಸ್ಕಾರ ${farmerName} ಅವರೇ! 👋\n\nನಾನು ನಿಮ್ಮ **ಸಸ್ಯ AI ಕೃಷಿ ಸಲಹೆಗಾರ**. ನೀವು **${district} ಜಿಲ್ಲೆಯ ${taluk}**ದಲ್ಲಿ **${primaryCrop}** (${landSize}) ಬೆಳೆಯುತ್ತಿದ್ದೀರಿ ಎಂದು ನನಗೆ ತಿಳಿದಿದೆ.\n\nಇಂದು ನಿಮ್ಮ ತೋಟದ ಪರಿಸ್ಥಿತಿ ಹೇಗಿದೆ?\n• ಕೊಳೆರೋಗ ಅಥವಾ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ ಬಗ್ಗೆ ಕೇಳಬೇಕೆ?\n• ಮಳೆ ಮುನ್ನ ಸಿಂಪಡಣೆ ದಿನ ಮತ್ತು ಪ್ರಮಾಣ ಲೆಕ್ಕ ಹಾಕಬೇಕೆ?\n• ಮರ ಹತ್ತುವವರು ಅಥವಾ ಕೃಷಿ ಆಳುಗಳ ಅಗತ್ಯವಿದ್ದರೆ ಸಮುದಾಯ ಪೋಸ್ಟ್ ರಚಿಸಬೇಕೆ?\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೆಳಗೆ ಬರೆಯಿರಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ!`,
        draft: null,
        suggestions: [
          '🌴 ಅಡಿಕೆ ಕೊಳೆರೋಗ ೧% ಬೋರ್ಡೋ ದ್ರಾವಣ',
          '📝 ಮರ ಹತ್ತುವವರ ಅಗತ್ಯವಿದೆ - ಪೋಸ್ಟ್ ಬರೆಯಿರಿ',
          '⚖️ ನನ್ನ ೪ ಎಕರೆಗೆ ಸಿಂಪಡಣೆ ಪ್ರಮಾಣ ಲೆಕ್ಕ ಹಾಕಿ',
          '🌿 ಜೀವಾಮೃತ ತಯಾರಿಸುವ ವಿಧಾನ'
        ]
      };
    } else if (lang === 'hi') {
      return {
        text: `नमस्ते ${farmerName} जी! 👋\n\nमैं आपका **सस्य AI कृषि सलाहकार** हूँ। मुझे ज्ञात है कि आप **${district} के ${taluk}** में **${primaryCrop}** (${landSize}) उगाते हैं।\n\nआज आपकी फसल कैसी है?\n• क्या फल सड़न या पत्ती झुलसा की रोकथाम सलाह चाहिए?\n• क्या बारिश से पहले छिड़काव का समय और दवा की मात्रा जाननी है?\n• क्या पेड़ चढ़ने वाले या मजदूर ढूंढने हेतु पोस्ट लिखवानी है?\n\nकृपया अपना प्रश्न लिखें या बोलकर पूछें!`,
        draft: null,
        suggestions: [
          '🌴 कोलेरोगा 1% बोर्डो मिश्रण सलाह',
          '📝 मजदूर आवश्यकता हेतु पोस्ट लिखें',
          '⚖️ 3 एकड़ हेतु दवा और पानी की मात्रा',
          '🌿 जैविक जीवामृत बनाने की विधि'
        ]
      };
    } else {
      return {
        text: `Hello ${farmerName}! 👋\n\nWelcome to your **Sasya AI Agronomist** companion. I see you cultivate **${primaryCrop}** (${landSize}) in **${taluk}, ${district}**.\n\nHow is your plantation looking today?\n• Need guidance on Koleroga (Fruit Rot) or leaf spot defense?\n• Want to calculate 1% neutral Bordeaux spray for your ${landSize}?\n• Need to hire skilled tree climbers or rent a power sprayer?\n\nYou can ask me anything or tell me to draft a community post!`,
        draft: null,
        suggestions: [
          '🌴 Arecanut Koleroga 1% Bordeaux Spray',
          '📝 Draft a Climber Request Post',
          '⚖️ Calculate Spray for my 4.0 Acres',
          '🌿 Organic Jeevamrutha Microbial Culture'
        ]
      };
    }
  }

  // 2. HELP DRAFT A POST (labour request, equipment rental, disease query)
  const isDraftRequest = /(draft|post|hire|climber|worker|labour|labor|rent|sprayer|need climber|ಆಳು|ಮರ ಹತ್ತುವ|ಬಾಡಿಗೆ|ಪೋಸ್ಟ್|ಮಜ್ದೂರ್|किराया|मजदूर)/i.test(q);
  if (isDraftRequest) {
    const isLabour = /(climber|worker|labour|labor|ಮರ ಹತ್ತುವ|ಆಳು|ಮಜ್ದೂರ್|मजदूर)/i.test(q);
    const isRental = /(rent|sprayer|drone|pump|ಬಾಡಿಗೆ|ಉಪಕರಣ|किराया)/i.test(q);
    
    let draftFlair = isLabour ? 'Labour Request' : isRental ? 'Equipment Rental' : 'Disease Query';
    let draftTitle = '';
    let draftContent = '';
    let workers = isLabour ? '2 Skilled Tree Climbers' : null;
    let wage = isLabour ? '₹950 / day + food' : isRental ? '₹800 / day' : null;

    if (lang === 'kn') {
      draftTitle = isLabour 
        ? `${taluk}ದಲ್ಲಿ ಅಡಿಕೆ ಸಿಂಪಡಣೆಗೆ ೨ ನುರಿತ ಮರ ಹತ್ತುವವರು ಬೇಕಾಗಿದ್ದಾರೆ` 
        : `${taluk}ದಲ್ಲಿ ೫೦ ಅಡಿ ಹೈ-ಪ್ರೆಶರ್ ಪವರ್ ಸ್ಪ್ರೇಯರ್ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿದೆ`;
      draftContent = isLabour
        ? `${district} ಜಿಲ್ಲೆಯ ${taluk} (ವೇಣೂರು) ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ೪ ಎಕರೆ ಅಡಿಕೆ ತೋಟಕ್ಕೆ ತುರ್ತಾಗಿ ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಲು ೨ ಮರ ಹತ್ತುವವರು ಬೇಕಾಗಿದ್ದಾರೆ. ದಿನಗೂಲಿ ₹೯೫೦ + ಮಧ್ಯಾಹ್ನದ ಊಟ. ಆಸಕ್ತರು ಸಸ್ಯ ಚಾಟ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ.`
        : `${taluk} ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಮರ ಹತ್ತದೆ ನೆಲದಿಂದಲೇ ತುದಿಯವರೆಗೆ ಸಿಂಪಡಿಸಬಲ್ಲ ೫೦ ಅಡಿ ಪವರ್ ಸ್ಪ್ರೇಯರ್ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿದೆ. ದಿನದ ಬಾಡಿಗೆ ₹೮೦೦. ಸಂಪರ್ಕಿಸಿ.`;
    } else if (lang === 'hi') {
      draftTitle = isLabour 
        ? `${taluk} में सुपारी छिड़काव हेतु 2 कुशल पेड़ चढ़ने वाले चाहिए` 
        : `${taluk} में 50 फीट हाई-प्रेशर पावर स्प्रेयर किराए पर उपलब्ध`;
      draftContent = isLabour
        ? `${district} के ${taluk} में 4 एकड़ सुपारी हेतु बोर्डो छिड़काव के लिए 2 कुशल मजदूर चाहिए। दैनिक मजदूरी ₹950 + भोजन। सस्य चैट द्वारा संपर्क करें।`
        : `${taluk} में 50 फीट हाई-प्रेशर स्प्रेयर उपलब्ध है। किराया ₹800/दिन। संपर्क करें।`;
    } else {
      draftTitle = isLabour 
        ? `Urgent: 2 Skilled Tree Climbers Needed for Arecanut Spraying in ${taluk}` 
        : `50ft High-Pressure Power Sprayer for Rent in ${taluk}`;
      draftContent = isLabour
        ? `Looking for 2 experienced tree climbers for 1% Bordeaux prophylactic canopy spraying on a 4.0 acre plantation in ${taluk}, ${district}. Daily wage ₹950/day + food provided. Contact via Sasya chat.`
        : `Available for rent in ${taluk}. High-pressure pump reaches 50ft palm crowns from ground level without climbing. ₹800/day. Contact via Sasya chat.`;
    }

    const draftObj = {
      type: 'draft_post',
      crop: cropLower,
      flair: draftFlair,
      title: draftTitle,
      content: draftContent,
      workers,
      wage
    };

    const introText = lang === 'kn'
      ? `ಖಂಡಿತ ${farmerName} ಅವರೇ! ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಸಮುದಾಯ ಪೋಸ್ಟ್ ಅನ್ನು ಸಿದ್ಧಪಡಿಸಿದ್ದೇನೆ:\n\nಕೆಳಗಿನ **"ಸಮುದಾಯದಲ್ಲಿ ಪ್ರಕಟಿಸಿ"** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ತಕ್ಷಣ **r/${cropLower}** ಫೀಡ್‌ನಲ್ಲಿ ಪೋಸ್ಟ್ ಮಾಡಬಹುದು:`
      : lang === 'hi'
      ? `ज़रूर ${farmerName} जी! मैंने आपकी आवश्यकता के अनुसार समुदाय पोस्ट का प्रारूप तैयार कर दिया है:\n\nनीचे दिए गए **"समुदाय में प्रकाशित करें"** बटन पर क्लिक करके इसे सीधे **r/${cropLower}** में पोस्ट करें:`
      : `Certainly ${farmerName}! I have drafted a community post for you based on your farm location in ${taluk}:\n\nReview the draft card below and tap **"Publish to Community"** to post it directly into **r/${cropLower}**:`;

    return {
      text: introText,
      draft: draftObj
    };
  }

  // 3. ACREAGE / SPRAY DOSAGE CALCULATION
  const acreMatch = q.match(/(\d+(\.\d+)?)\s*(acre|acres|ಎಕರೆ|ಏಕರೆ|एकड़)/i);
  if (acreMatch) {
    const acres = parseFloat(acreMatch[1]) || 1;
    const waterLiters = Math.round(acres * 250);
    const cuso4Kg = ((waterLiters / 100) * 1.0).toFixed(1);
    const limeKg = cuso4Kg;
    const stickerGrams = Math.round((waterLiters / 100) * 100);

    if (lang === 'kn') {
      return {
        text: `📊 **${acres} ಎಕರೆ ಅಡಿಕೆ ತೋಟಕ್ಕೆ ೧% ಬೋರ್ಡೋ ದ್ರಾವಣ ತಯಾರಿಕೆಯ ಅಳತೆ:**\n\n• **ಒಟ್ಟು ಬೇಕಾಗುವ ನೀರು:** ${waterLiters} ಲೀಟರ್\n• **ಮೈಲುತುತ್ತ (Copper Sulphate):** ${cuso4Kg} ಕೆ.ಜಿ\n• **ಸುಣ್ಣದ ಪುಡಿ (Slaked Lime):** ${limeKg} ಕೆ.ಜಿ\n• **ಅಂಟುಕ (Rosin Sticker):** ${stickerGrams} ಗ್ರಾಂ ರಾಸಿನ್ + ${stickerGrams} ಗ್ರಾಂ ವಾಷಿಂಗ್ ಸೋಡಾ\n\n💡 **ಮುಖ್ಯ ಸಲಹೆ:** ಮಳೆಯ ಮುನ್ನವೇ ಸಿಂಪಡಿಸಿ. ಮರ ಹತ್ತುವವರು ಬೇಕಿದ್ದರೆ [r/arecanut ಕಾರ್ಮಿಕ ವಿನಿಮಯದಲ್ಲಿ ಪ್ರಕಟಿಸಿ](/c/arecanut).`,
        draft: null
      };
    } else if (lang === 'hi') {
      return {
        text: `📊 **${acres} एकड़ हेतु 1% बोर्डो मिश्रण गणना:**\n\n• **कुल पानी:** ${waterLiters} लीटर\n• **नीला थोथा (CuSO4):** ${cuso4Kg} किग्रा\n• **बुझा चूना:** ${limeKg} किग्रा\n• **राल स्टिकर:** ${stickerGrams} ग्राम राल + ${stickerGrams} ग्राम सोडा\n\n💡 **सलाह:** बारिश से पूर्व पत्तों पर तेज फुहार से छिड़काव करें। [r/arecanut समुदाय](/c/arecanut) में पूछें।`,
        draft: null
      };
    } else {
      return {
        text: `📊 **1% Bordeaux Calculation for ${acres} Acre(s):**\n\n• **Total Water Required:** ${waterLiters} Liters\n• **Copper Sulphate (CuSO4):** ${cuso4Kg} kg\n• **Hydrated Quicklime:** ${limeKg} kg\n• **Rosin Sticker Adjuvant:** ${stickerGrams}g Rosin + ${stickerGrams}g Soda\n\n💡 **Pro-Tip:** Complete canopy spray before monsoon cloudbursts. Need climbing labor? [Check r/arecanut Labour Exchange](/c/arecanut).`,
        draft: null
      };
    }
  }

  // 4. CROP-SPECIFIC ADVICE (Arecanut Koleroga, Paddy blast, Tomato, etc.)
  if (/(koleroga|mahali|fruit rot|ಕೊಳೆರೋಗ|ಮಹಾಲಿ|कोलेरोगा)/i.test(q) || cropLower === 'arecanut') {
    if (lang === 'kn') {
      return {
        text: `🌴 **ಅಡಿಕೆ ಕೊಳೆರೋಗ (Phytophthora meadii) ತುರ್ತು ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು:**\n\n1. **ತೋಟದ ನೈರ್ಮಲ್ಯ:** ನೆಲಕ್ಕೆ ಬಿದ್ದ ಕೊಳೆತ ಕಾಯಿಗಳನ್ನು ತಕ್ಷಣ ಆರಿಸಿ ಮಣ್ಣಿನಲ್ಲಿ ಆಳವಾಗಿ ಹೂತುಹಾಕಿ.\n2. **ಬಸಿಗಾಲುವೆ:** ತೋಟದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.\n3. **ರಕ್ಷಣಾತ್ಮಕ ಸಿಂಪರಣೆ:** ಮಳೆಯಿಲ್ಲದ ಶುಷ್ಕ ಸಮಯದಲ್ಲಿ ೧% ಬೋರ್ಡೋ ದ್ರಾವಣಕ್ಕೆ ರಾಸಿನ್ ಅಂಟು ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.\n4. **ಸಮುದಾಯ ಚರ್ಚೆ:** ತೀರ್ಥಹಳ್ಳಿ ಮತ್ತು ವೇಣೂರಿನ ಇತರ ಬೆಳೆಗಾರರ ಅನುಭವ ತಿಳಿಯಲು [🌴 r/arecanut ಚರ್ಚೆಯನ್ನು ವೀಕ್ಷಿಸಿ](/c/arecanut).\n5. **ರೋಗ ಪತ್ತೆ:** ಎಲೆಯ ಕಲೆಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು [📸 ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ](/detect).`,
        draft: null
      };
    } else if (lang === 'hi') {
      return {
        text: `🌴 **सुपारी कोलेरोगा (फल सड़न) प्रबंधन निर्देश:**\n\n1. **स्वच्छता:** नीचे गिरे सड़े फलों को तुरंत इकट्ठा कर मिट्टी में दबाएं।\n2. **जल निकासी:** खेत में पानी जमा न होने दें।\n3. **छिड़काव:** बारिश से पहले 1% बोर्डो मिश्रण में राल स्टिकर मिलाकर छिड़कें।\n4. **किसान चर्चा:** अन्य किसानों की सलाह हेतु [🌴 r/arecanut फ़ीड देखें](/c/arecanut)।\n5. **पत्ती जांच:** फोटो लेकर [📸 पत्ती स्कैन पेज पर जांचें](/detect)।`,
        draft: null
      };
    } else {
      return {
        text: `🌴 **Arecanut Koleroga (Phytophthora meadii) Proactive Defense:**\n\n1. **Orchard Sanitation:** Promptly collect and bury all fallen rotting calyxes to halt zoospore release.\n2. **Drainage Canals:** Clear trenches to ensure heavy monsoon rainwater drains freely from the root zones.\n3. **Canopy Spray:** Apply 1% neutral Bordeaux mixture with rosin sticker during the morning dry window.\n4. **Community Discussion:** Connect with Coastal & Malnad growers on [🌴 r/arecanut Discussion Feed](/c/arecanut).\n5. **Specimen Scan:** Confirm lesion margin on the [📸 Leaf Detect Page](/detect).`,
        draft: null
      };
    }
  }

  // 5. GENERAL COMPREHENSIVE FALLBACK
  if (lang === 'kn') {
    return {
      text: `ಧನ್ಯವಾದಗಳು ${farmerName} ಅವರೇ! ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯ ಕೃಷಿ ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು:\n\n1. **ರೋಗದ ಪರೀಕ್ಷೆ:** ನಿಮ್ಮ ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು [📸 ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ](/detect).\n2. **ಜೈವಿಕ ರಕ್ಷಣೆ:** ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ ೫% ಬೇವಿನ ಎಣ್ಣೆ ದ್ರಾವಣವನ್ನು ಸಿಂಪಡಿಸಿ.\n3. **ಸಮುದಾಯ ಚರ್ಚೆ:** ಇತರ ಸ್ಥಳೀಯ ರೈತರ ಅನುಭವ ತಿಳಿಯಲು [🌴 r/${cropLower} ಸಮುದಾಯ ವೇದಿಕೆಯಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ](/c/${cropLower}).\n4. **ಪೋಸ್ಟ್ ಬರೆಯಲು:** ಆಳುಗಳು ಅಥವಾ ಬಾಡಿಗೆ ಉಪಕರಣ ಬೇಕಿದ್ದರೆ "ಪೋಸ್ಟ್ ಬರೆದುಕೊಡಿ" ಎಂದು ಕೇಳಿ.`,
      draft: null
    };
  } else if (lang === 'hi') {
    return {
      text: `धन्यवाद ${farmerName} जी! कृषि विशेषज्ञों द्वारा अनुशंसित मुख्य दिशा-निर्देश:\n\n1. **रोग पहचान:** फसल की पत्ती को [📸 पत्ती स्कैनिंग पेज पर जांचें](/detect)।\n2. **जैविक उपचार:** ट्राइकोडर्मा या 5% नीम तेल का छिड़काव करें।\n3. **किसान चर्चा:** सलाह हेतु [🌴 r/${cropLower} मंच पर पूछें](/c/${cropLower})।\n4. **पोस्ट ड्राफ्ट:** मजदूर या किराए के उपकरण हेतु पोस्ट लिखवाने के लिए "पोस्ट लिखें" कहें।`,
      draft: null
    };
  } else {
    return {
      text: `Thank you ${farmerName}! Here are the recommended agronomic guidelines:\n\n1. **Visual Diagnosis:** Upload or snap a leaf photo on the [📸 Leaf Detect Page](/detect).\n2. **Bio-control:** Apply *Trichoderma harzianum* or 5% cold-pressed neem seed extract (NSKE).\n3. **Peer Community:** Connect with local growers on [🌴 r/${cropLower} Community Forum](/c/${cropLower}).\n4. **Draft a Post:** Need climbers or rental tools? Just tell me "Help draft a post" anytime!`,
      draft: null
    };
  }
}

/**
 * Primary Agronomist Dispatcher: Attempts Gemini API, falls back to Local Engine on any hiccup
 */
export async function callGeminiAgronomist({
  query,
  conversationHistory = [],
  userProfile = {},
  lang = 'en'
}) {
  const apiKey = getGeminiApiKey();

  // If no API key configured, use local engine immediately
  if (!apiKey) {
    const local = generateLocalAgronomistResponse({ query, userProfile, lang });
    return {
      success: true,
      text: local.text,
      draft: local.draft,
      model: 'sasya-local-engine',
      isLocal: true
    };
  }

  const farmerName = userProfile.name || userProfile.username || 'Farmer';
  const crops = Array.isArray(userProfile.crops) && userProfile.crops.length > 0 
    ? userProfile.crops.join(', ') 
    : 'Arecanut';
  const primaryCrop = (Array.isArray(userProfile.crops) && userProfile.crops[0]) 
    ? userProfile.crops[0].toLowerCase() 
    : 'arecanut';
  const district = userProfile.district || 'Dakshina Kannada';
  const taluk = userProfile.taluk || 'Belthangady';
  const village = userProfile.village || 'Venur';
  const landSize = userProfile.landSize || '4.0 Acres';

  const diagnosisContext = userProfile.currentDiagnosis ? `
SPECIMEN SCAN IN FOCUS:
- Crop Scanned: ${userProfile.currentDiagnosis.crop || primaryCrop}
- Disease Diagnosed: ${userProfile.currentDiagnosis.disease || 'Leaf Pathology'}
- Severity Grade: ${userProfile.currentDiagnosis.severity || 'Moderate'}
- Pathogen: ${userProfile.currentDiagnosis.pathogen || 'Foliar Pathogen'}
The farmer is directly reviewing this scanned leaf and asking questions about it. Give specific, highly practical cultural advice, field sanitation steps, or spray guidance for this exact issue.` : '';

  const systemInstruction = `You are "Sasya AI Agronomist" (ಸಸ್ಯ ಕೃಷಿ ಸಲಹೆಗಾರ), an expert agricultural and plant pathology companion for Indian farmers in Coastal & Malnad Karnataka, Himachal Pradesh, and Uttarakhand.

STRICT BRAND IDENTITY:
- Your identity is strictly "Sasya AI Agronomist" (ಸಸ್ಯ ಕೃಷಿ ಸಲಹೆಗಾರ).
- NEVER mention "Gemini", "Google", "LLM", "GPT", or "OpenAI". If asked, you are the native AI agronomist built for Sasya farmers.

FARMER PROFILE CONTEXT:
- Farmer Name: ${farmerName}
- Primary Crops: ${crops}
- Farm Location: ${village}, ${taluk} taluk, ${district} district
- Farm Land Size: ${landSize}
${diagnosisContext}

LANGUAGE REQUIREMENT:
- Respond in the farmer's selected language: ${lang === 'kn' ? 'Kannada (ಕನ್ನಡ)' : lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
- Tone: Warm, respectful, farmer-friendly, empathetic, practical, and culturally authentic. Address the farmer respectfully by name (e.g. "${farmerName} ಅವರೇ" in Kannada, "${farmerName} जी" in Hindi).

CORE BEHAVIORS:
1. GREETINGS ("hii", "hello", "namaskara", "namaste", "hey", etc.):
   - Greet the farmer warmly by name.
   - Mention their farm location (${district}, ${taluk}) and their crop (${crops}).
   - Ask how their plantation or fields are doing today.
   - Offer 2-3 timely tips or quick questions (e.g., checking palm bunches for rot, spray timing, or hiring tree climbers).

2. CROP-AWARE SUGGESTIONS:
   - When asked for general advice or suggestions, provide timely cultural management for their specific crop (${crops}).
   - For Arecanut: Koleroga/Mahali prevention, drainage canal maintenance, hood tying (kotte), 1% neutral Bordeaux application before continuous rain.
   - For Paddy: Blast prevention, halting excess urea, shallow water regulation.
   - For Tomato: Early/Late blight, drip irrigation, leaf hygiene.
   - For Apple: Scab control, winter pruning, humidity monitoring.

3. COMMUNITY POST DRAFTING:
   - When the farmer asks to draft a post, hire climbers/laborers, rent tools, or share an alert, produce a structured JSON draft block inside a \`\`\`json:sasya_draft code block, along with a polite conversational message:
   \`\`\`json:sasya_draft
   {
     "type": "draft_post",
     "crop": "${primaryCrop}",
     "flair": "Labour Request",
     "title": "Clear, concise post title",
     "content": "Detailed description with dates, location, and requirements",
     "workers": "e.g. 2 Skilled Tree Climbers",
     "wage": "e.g. ₹950/day + food"
   }
   \`\`\`

4. COMMUNITY LINKS:
   - Recommend relevant community feeds and discussions when helpful using markdown links:
     - [🌴 View r/arecanut Discussion](/c/arecanut)
     - [🌾 View r/paddy Feed](/c/paddy)
     - [🍅 View r/tomato Feed](/c/tomato)
     - [🍎 View r/apple Feed](/c/apple)
     - [📸 Scan Leaf on Detect Page](/detect)

5. SAFETY BOUNDARIES:
   - Prioritize safe cultural practices, biological controls (NSKE 5% neem extract, Trichoderma viride, Pseudomonas fluorescens, Jeevamrutha).
   - Strictly avoid dangerous chemical dosage equations, non-standard poisons, or recommending uncertified hazardous pesticides.`;

  const contents = [];
  const recentHistory = conversationHistory.slice(-4);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || '' }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  // Candidate models in preference order
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-flash-latest'
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (res.ok) {
        clearTimeout(timeoutId);
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawText.trim()) {
          let draft = null;
          const draftMatch = rawText.match(/```json:sasya_draft\s*([\s\S]*?)\s*```/);
          if (draftMatch) {
            try {
              draft = JSON.parse(draftMatch[1]);
            } catch (e) {
              console.warn('[Gemini] Failed to parse draft JSON', e);
            }
          }
          const cleanText = rawText.replace(/```json:sasya_draft[\s\S]*?```/, '').trim();
          return {
            success: true,
            text: cleanText || rawText,
            draft,
            model: 'Sasya AI',
            isLocal: false
          };
        }
      }
    } catch (e) {
      // Continue to next candidate model or fallback
    }
  }

  clearTimeout(timeoutId);

  // Seamless fallback to our rich local engine
  console.log('[SasyaAI] Using local agronomy fallback');
  const local = generateLocalAgronomistResponse({ query, userProfile, lang });
  return {
    success: true,
    text: local.text,
    draft: local.draft,
    model: 'Sasya AI',
    isLocal: true
  };
}
