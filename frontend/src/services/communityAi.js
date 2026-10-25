// src/services/communityAi.js - Trilingual AI Assistant for Sasya Community
// Implements:
// 1. Natural Language Voice/Text Draft to Listing (Labour & Equipment Request)
// 2. Automated Safety Nudges for Climbing & Spraying
// 3. 1-Tap Trilingual Translation for Posts and Comments (Kannada, Hindi, English)
// Strictly enforces zero chemical dosages, human confirmation (never auto-posts), and AI attribution.

export const COMMUNITY_POST_TRANSLATIONS = {
  1: {
    kn: {
      title: "ನಿರಂತರ ಮಂಜಿನ ನಂತರ ಕೊಳೆರೋಗ ಕಂಡುಬಂದಿದೆ. ಬೋರ್ಡೋ ದ್ರಾವಣಕ್ಕೆ ರಾಸಿನ್ ಅಂಟು ಸೇರಿಸಬೇಕೆ?",
      content: "ಉತ್ತರಕ್ಕೆ ಮುಖ ಮಾಡಿರುವ ಇಳಿಜಾರಿನ 3 ತಿಂಗಳ ಅಡಿಕೆ ಗೊನೆಗಳಲ್ಲಿ ಕೊಳೆತ ನೀರು ತುಂಬಿದ ಕಲೆಗಳು ಕಾಣಿಸಿವೆ. ಸಸ್ಯ ರೆಸ್‌ನೆಟ್ ಸ್ಕ್ಯಾನ್ 96.4% ಕೊಳೆರೋಗ (Phytophthora meadii) ಎಂದು ದೃಢಪಡಿಸಿದೆ. 22 ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇರುವುದರಿಂದ, ತೊಳೆಯುವುದನ್ನು ತಡೆಯಲು ರಾಸಿನ್ ಅಂಟು ಕಡ್ಡಾಯವೇ?"
    },
    hi: {
      title: "लगातार कोहरे के बाद कोलेरोगा (सड़न) देखा गया। क्या बोर्डो मिश्रण में रेज़िन स्टिकर मिलाना जरूरी है?",
      content: "उत्तर मुखी ढलान पर 3 महीने के सुपारी के गुच्छों पर पानी जैसे सड़न के धब्बे देखे गए हैं। सस्य रेसनेट स्कैन ने 96.4% कोलेरोगा (Phytophthora meadii) की पुष्टि की है। 22 घंटे में बारिश का पूर्वानुमान होने से, क्या दवा को धुलने से बचाने के लिए रेज़िन स्टिकर अनिवार्य है?"
    },
    en: {
      title: "Koleroga spotted after continuous mist. Is 1% Bordeaux mixture enough or should I add rosin sticker?",
      content: "Noticed dark water-soaked rot starting on 3-month-old nut calyxes on the north-facing slope. Sasya ResNet scan flagged 96.4% confidence Koleroga (Phytophthora meadii). With Open-Meteo forecasting rainfall in 22 hours, is standard neutral Bordeaux spray sufficient or is rosin sticker mandatory to stop wash-off?"
    }
  },
  2: {
    kn: {
      title: "50 ಅಡಿ ಎತ್ತರದ ಹೈ-ಪ್ರೆಶರ್ ಪವರ್ ಸ್ಪ್ರೇಯರ್ ಇಂದು ಮತ್ತು ನಾಳೆ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿದೆ (ತೀರ್ಥಹಳ್ಳಿ ತಾಲೂಕು)",
      content: "ಮರ ಹತ್ತುವ ಅಗತ್ಯವಿಲ್ಲದೆ ನೆಲದಿಂದಲೇ ಅತಿ ಎತ್ತರದ ಅಡಿಕೆ ಮರದ ತುದಿಗೆ ಸಿಂಪಡಿಸಬಹುದು. 100 ಮೀಟರ್ ಬ್ರೇಡೆಡ್ ಪೈಪ್ ಮತ್ತು ಹಿತ್ತಾಳೆಯ ನಾಜಲ್ ಒಳಗೊಂಡಿದೆ. ದಿನದ ಬಾಡಿಗೆ ₹350. ವಾರಾಂತ್ಯದ ಮಳೆಗಾಲದ ಮುನ್ಸೂಚನೆಗೂ ಮುನ್ನ ಬೋರ್ಡೋ ಸಿಂಪಡಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ."
    },
    hi: {
      title: "50 फीट हाई-प्रेशर पावर स्प्रेयर आज और कल किराए पर उपलब्ध है (तीर्थहल्ली तालुक)",
      content: "पेड़ पर चढ़े बिना जमीन से ही सबसे ऊंचे सुपारी के पेड़ के शीर्ष तक स्प्रे पहुंचता है। इसमें 100 मीटर ब्रेडेड होज़ और पीतल का नोजल शामिल है। किराया ₹350/दिन है। सप्ताहांत की बारिश से पहले छिड़काव के लिए तैयार।"
    },
    en: {
      title: "High-pressure 50ft power sprayer available for rent today & tomorrow (Tirthahalli taluk)",
      content: "Reaches the highest palm tops from ground level without needing tree climbers. Includes 100m high-pressure braided hose and brass atomizing nozzle. Rent is ₹350/day. Cleaned and ready for Bordeaux application before the weekend monsoon front."
    }
  },
  3: {
    kn: {
      title: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಕರಾವಳಿ ಮತ್ತು ಘಟ್ಟ ಪ್ರದೇಶಗಳಲ್ಲಿ ಸಾಪೇಕ್ಷ ಆರ್ದ್ರತೆ 92% ಕ್ಕಿಂತ ಹೆಚ್ಚು",
      content: "ಪರಿಸರ ನಿಲ್ದಾಣದ ಮಾಹಿತಿಯಂತೆ ಸತತ 14 ಗಂಟೆಗಳಿಂದ ತೇವಾಂಶ 90% ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದು ತಾಪಮಾನ 21°C - 24°C ನಡುವೆ ಇದೆ. ಇದು ಕೊಳೆರೋಗ ಬೀಜಕಗಳ ಹರಡುವಿಕೆಗೆ ನಿಖರ ಕಾರಣವಾಗಿದೆ. ಮಳೆಯಿಲ್ಲದ ಬೆಳಗ್ಗಿನ ಸಮಯದಲ್ಲಿ ರಕ್ಷಣಾತ್ಮಕ ಸಿಂಪರಣೆ ಮುಗಿಸಿ."
    },
    hi: {
      title: "मौसम चेतावनी: तटीय घाटों में सापेक्ष आर्द्रता 92% से अधिक दर्ज",
      content: "मौसम विज्ञान केंद्रों के अनुसार लगातार 14 घंटों से आर्द्रता 90% से अधिक और तापमान 21°C - 24°C के बीच बना हुआ है। यह फाइटोफ्थोरा रोग फैलाने का प्रमुख कारण है। सुबह के शुष्क समय में सभी निवारक छिड़काव पूरा करें।"
    },
    en: {
      title: "Bioclimatic Alert: Relative Humidity > 92% sustained across Coastal Ghats",
      content: "Environmental station telemetry indicates 14 continuous hours above 90% RH with ambient temperatures between 21°C - 24°C. This is the exact epidemiological trigger for Phytophthora zoospore release. Complete all prophylactic canopy coverage during the morning dry window."
    }
  },
  4: {
    kn: {
      title: "ಜ್ಯೋತಿ ತಳಿಯ ಭತ್ತದ ಸಸಿಗಳಲ್ಲಿ ಕಣ್ಣಿನ ಆಕಾರದ ಬೆಂಕಿ ರೋಗದ (Blast) ಕಲೆಗಳು",
      content: "ಸಸಿಗಳು 22 ದಿನಗಳಾಗಿದ್ದು, ಎಲೆಯ ಮೇಲಿನ ಕಲೆಗಳ ಮಧ್ಯಭಾಗ ಬೂದು ಬಣ್ಣ ಮತ್ತು ಕಂದು ಅಂಚುಗಳನ್ನು ಹೊಂದಿವೆ. ತೇವಾಂಶ ಕಡಿಮೆ ಮಾಡಲು ಗದ್ದೆಯಲ್ಲಿ ನಿಂತ ನೀರನ್ನು ಬಸಿದು ಬಿಡಬೇಕೆ?"
    },
    hi: {
      title: "ज्योति किस्म के धान की पौध पर आंख के आकार के ब्लास्ट धब्बे दिखे",
      content: "पौध 22 दिन की है। पत्तियों के धब्बों के बीच का हिस्सा धूसर और किनारे गहरे भूरे हैं। क्या नर्सरी का खड़ा पानी निकाल देना चाहिए?"
    },
    en: {
      title: "Eye-shaped spindle blast lesions on nursery seedlings (variety Jyothi)",
      content: "Seedlings are 22 days old. Leaf blast lesions have greyish centers and dark brown margins. Should I drain the standing nursery water to control microclimate humidity?"
    }
  },
  5: {
    kn: {
      title: "ಎರಡು ರಾತ್ರಿಗಳ ಮಂಜಿನ ನಂತರ ಟೊಮೇಟೊ ಹಣ್ಣುಗಳ ಮೇಲೆ ನೀರಿನ ಕಲೆಗಳು",
      content: "ಹಸಿರು ಹಣ್ಣುಗಳ ಮೇಲೆ ಕಲೆಗಳು ವೇಗವಾಗಿ ಹರಡುತ್ತಿವೆ. ಲೇಟ್ ಬ್ಲೈಟ್ (Phytophthora infestans) ರೋಗದ ಲಕ್ಷಣಗಳಂತೆ ಕಾಣುತ್ತಿವೆ. ಮಳೆಗೂ ಮುನ್ನ ಕೈಗೊಳ್ಳಬೇಕಾದ ನೈಸರ್ಗಿಕ ತಡೆಗಟ್ಟುವಿಕೆ ಕ್ರಮಗಳೇನು?"
    },
    hi: {
      title: "दो रातों के कोहरे के बाद टमाटर के फलों पर पानी जैसे धब्बे",
      content: "कच्चे फलों पर तेजी से फैलाव देखा जा रहा है। लेट ब्लाइट (Phytophthora infestans) का संदेह है। बारिश से पहले अनुशंसित सुरक्षात्मक उपाय क्या हैं?"
    },
    en: {
      title: "Water-soaked greasy patches on tomato fruit after two nights of fog",
      content: "Rapid spreading observed on green fruits. Phytophthora infestans (Late Blight) suspected. What are the recommended cultural preventative practices before rain?"
    }
  },
  6: {
    kn: {
      title: "ಸೇಬು ಸ್ಕ್ಯಾಬ್ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ಕೊಯ್ಲಿನ ನಂತರದ ಯೂರಿಯಾ ಸಿಂಪಡಣೆ ಸಮಯ",
      content: "ಎತ್ತರದ ತೋಟಗಳಲ್ಲಿ ಕೊಯ್ಲು ಪೂರ್ಣಗೊಂಡಿದೆ. ಉದುರಿದ ಎಲೆಗಳು ಬೇಗ ಕೊಳೆತು ಶಿಲೀಂಧ್ರ ನಾಶವಾಗಲು ಯೂರಿಯಾ ಸಿಂಪಡಣೆಗೆ ಸಿದ್ಧತೆ ನಡೆಸುತ್ತಿದ್ದೇನೆ."
    },
    hi: {
      title: "सेब स्कैब नियंत्रण हेतु तुड़ाई के बाद यूरिया छिड़काव का समय",
      content: "ऊंचाई वाले बगीचों में तुड़ाई पूरी हो चुकी है। गिरे हुए पत्तों को जल्दी गलाने और कवक को नष्ट करने के लिए छिड़काव की तैयारी है।"
    },
    en: {
      title: "Post-harvest urea application timing for apple scab control",
      content: "Harvest complete in higher elevation blocks. Preparing 5% urea spray on fallen orchard leaves to accelerate decomposition and destroy overwintering pseudothecia."
    }
  },
  7: {
    kn: {
      title: "👥 ತುರ್ತು: ಕೊಳೆರೋಗ ಸಿಂಪಡಣೆಗೆ 3 ಮರ ಹತ್ತುವ ನುರಿತ ಆಳುಗಳು ಬೇಕಾಗಿದ್ದಾರೆ (ಬೆಳ್ತಂಗಡಿ)",
      content: "ಬೆಳ್ತಂಗಡಿ ತಾಲೂಕಿನಲ್ಲಿ 6 ಎಕರೆ ಅಡಿಕೆ ತೋಟಕ್ಕೆ ಕಿರೀಟ ಸಿಂಪಡಣೆಗೆ 3 ಅನುಭವಿ ಮರ ಹತ್ತುವವರು ಬೇಕಾಗಿದ್ದಾರೆ. ದಿನಗೂಲಿ: ₹950/ದಿನ + ಉಪಾಹಾರ, ಊಟ ಮತ್ತು ಪ್ರಯಾಣ ವೆಚ್ಚ. ಈ ಗುರುವಾರ ಬೆಳಗ್ಗೆ ಮಳೆ ಪ್ರಾರಂಭವಾಗುವ ಮುನ್ನ ಕೆಲಸ ಆರಂಭವಾಗಲಿದೆ.\n\n🛡️ ಸಸ್ಯ ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ: ಮರ ಹತ್ತುವ ಮುನ್ನ ಸುರಕ್ಷತಾ ಬೆಲ್ಟ್, ಸೊಂಟದ ಪಟ್ಟಿ ಮತ್ತು ಕ್ಲೈಂಬಿಂಗ್ ರಿಂಗ್‌ಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ."
    },
    hi: {
      title: "👥 आवश्यक: सुपारी के पेड़ पर चढ़ने वाले 3 कुशल मजदूर चाहिए (बेल्तंगडी)",
      content: "बेल्तंगडी तालुक में 6 एकड़ सुपारी के बगीचे में स्प्रे के लिए 3 अनुभवी पेड़ चढ़ने वाले चाहिए। दैनिक मजदूरी: ₹950/दिन + नाश्ता, दोपहर का भोजन और यात्रा भत्ता। इस गुरुवार सुबह बारिश शुरू होने से पहले काम शुरू।\n\n🛡️ सस्य सुरक्षा चेकलिस्ट: पेड़ पर चढ़ने से पहले सुरक्षा हार्नेस, कमर की बेल्ट और क्लैंप की जांच अवश्य करें।"
    },
    en: {
      title: "👥 URGENT: 3 Skilled Arecanut Palm Climbers Needed for Spraying (Belthangady)",
      content: "Need 3 experienced palm climbers for crown spraying and maintenance across 6 acres in Belthangady taluk. Daily wage: ₹950/day + breakfast, lunch & travel allowance provided. Work starts this Thursday morning before monsoon showers resume.\n\n🛡️ Sasya Safety Checklist: Palm climbers must inspect tree climbing rings, safety harness & foot grip prior to ascending wet canopies."
    }
  },
  8: {
    kn: {
      title: "👥 ಭತ್ತದ ನಾಟಿ ಮಾಡಲು 6-8 ಜನರ ಕಾರ್ಮಿಕರ ತಂಡ ಬೇಕು (ಮದ್ದೂರು ಬೇಸಿನ್)",
      content: "ಜ್ಯೋತಿ ತಳಿಯ ಭತ್ತದ ಸಸಿಗಳು 22 ದಿನದವಾಗಿದ್ದು ಹೊಲದಲ್ಲಿ ನಾಟಿ ಮಾಡಲು ಸಿದ್ಧವಾಗಿವೆ. 2 ದಿನಗಳ ಕಾಲ 6-8 ಅನುಭವಿ ಕೃಷಿ ಕಾರ್ಮಿಕರ ತಂಡ ಬೇಕಾಗಿದೆ. ದಿನಕ್ಕೆ ₹650/ದಿನ ಮತ್ತು ಮದ್ದೂರು ಬಸ್ ನಿಲ್ದಾಣದಿಂದ ವಾಹನ ಸೌಲಭ್ಯ."
    },
    hi: {
      title: "👥 धान की रोपाई के लिए 6-8 मजदूरों का समूह चाहिए (मद्दूर)",
      content: "ज्योति किस्म के धान की पौध 22 दिन की हो चुकी है और खेत में रोपाई के लिए तैयार है। 2 दिनों के लिए 6-8 अनुभवी कृषि मजदूरों की आवश्यकता है। ₹650/दिन प्रति मजदूर और मद्दूर बस स्टैंड से पिकअप।"
    },
    en: {
      title: "👥 Paddy Transplanting Labour Group (6-8 Workers) Needed for 2 Days (Maddur basin)",
      content: "Paddy nursery seedlings (Jyothi variety) are 22 days old and ready for field transplantation. Looking for a group of 6-8 experienced farm workers for 2 days. ₹650/day/worker with direct pickup from Maddur bus stand."
    }
  },
  9: {
    kn: {
      title: "👥 ಟೊಮೇಟೊ ಗಿಡಗಳಿಗೆ ಬಿದಿರಿನ ಆಸರೆ ಕಟ್ಟಲು 4 ಆಳುಗಳು ಬೇಕು (ಬಂಗಾರಪೇಟೆ)",
      content: "ಟೊಮೇಟೊ ಗಿಡಗಳಿಗೆ ಬಿದಿರು ಊರಲು, ತಂತಿ ಕಟ್ಟಲು ಮತ್ತು ನೈಲಾನ್ ದಾರ ಕಟ್ಟಲು ನುರಿತ 4 ಕೆಲಸಗಾರರು ಬೇಕಾಗಿದ್ದಾರೆ. ನಾಳೆ ಬೆಳಗ್ಗೆ 8:00 ಗಂಟೆಗೆ ಪ್ರಾರಂಭ. ದಿನಗೂಲಿ ₹600."
    },
    hi: {
      title: "👥 टमाटर की फसल के लिए बांस की स्टैकिंग हेतु 4 मजदूर चाहिए (बांगरपेट)",
      content: "टमाटर के पौधों के सहारे के लिए बांस लगाने और सुतली बांधने में अनुभवी 4 मजदूरों की आवश्यकता है। कल सुबह 8:00 बजे से कार्य शुरू। ₹600/दिन।"
    },
    en: {
      title: "👥 4 Workers Needed for Bamboo Staking & Trellising Tomato Field (Bangarapet)",
      content: "Need 4 workers experienced in bamboo staking, trellis wiring and nylon twine tying for semi-determinate tomato crop. Starting tomorrow 8:00 AM. ₹600/day."
    }
  }
};

export const COMMUNITY_COMMENT_TRANSLATIONS = {
  101: {
    kn: "ರೈತರೇ, 1% ಬೋರ್ಡೋ ದ್ರಾವಣಕ್ಕೆ 100 ಲೀಟರ್‌ಗೆ 100 ಗ್ರಾಂ ರಾಸಿನ್ ಅಂಟು ಸೇರಿಸಿ. ನಾಳೆ ಮಧ್ಯಾಹ್ನ 14 ಮಿಮೀ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇರುವುದರಿಂದ, ಅಂಟು ಇಲ್ಲದಿದ್ದರೆ ತಾಮ್ರದ ಕಣಗಳು 45 ನಿಮಿಷಗಳಲ್ಲಿ ತೊಳೆದುಹೋಗುತ್ತವೆ. ಎಲೆಗಳು ಒಣಗಿರುವಾಗ ಇಂದು ಮಧ್ಯಾಹ್ನ 3 ಗಂಟೆಯೊಳಗೆ ಸಿಂಪಡಣೆ ಮುಗಿಸಿ.",
    hi: "किसान भाई, 1% बोर्डो मिश्रण में प्रति 100 लीटर 100 ग्राम रेज़िन स्टिकर जरूर मिलाएं। कल दोपहर 14 मिमी बारिश के पूर्वानुमान के कारण, बिना स्टिकर के दवा 45 मिनट में बह जाएगी। पत्तियां सूखी रहने पर आज दोपहर 3 बजे से पहले छिड़काव पूरा करें।",
    en: "Definitely add 100g Rosin sticker per 100L of 1% Bordeaux mixture. With the forecast predicting 14mm rain tomorrow afternoon, unbonded copper particles will wash off within 45 minutes. Complete spraying before 3 PM today while leaf surfaces are dry."
  },
  102: {
    kn: "ಮುಂದಿನ ವಾರ ನಿರಂತರ ಮುಂಗಾರು ಮಳೆ ಮುಂದುವರಿದರೆ ಅಡಿಕೆ ಗೊನೆಗಳಿಗೆ ಪಾಲಿಥೀನ್ ಹೊದಿಕೆ (ಕೊಟ್ಟೆ) ಕಟ್ಟುವುದು ಸೂಕ್ತ. ಕೊಳೆತು ಉದುರಿದ ಅಡಿಕೆ ಹೆಕ್ಕುವುದಕ್ಕಿಂತ ಮುನ್ನೆಚ್ಚರಿಕೆಯೇ 10 ಪಟ್ಟು ಉತ್ತಮ.",
    hi: "यदि अगले सप्ताह लगातार मानसूनी बारिश जारी रहती है तो सुपारी के गुच्छों पर पॉलीथिन कवर (कोट्टे) अवश्य बांधें। सड़े हुए फल गिरने से पहले सुरक्षा करना 10 गुना सस्ता और बेहतर है।",
    en: "Also make sure to tie polyethene hoods (kotte) over the developing crown bunches if continuous monsoon spells persist next week. Prevention is 10x cheaper than harvesting dropped rotten nuts."
  },
  201: {
    kn: "ಪ್ರಶಾಂತ್ ಅವರೇ, ನಾಳೆ ಬೆಳಗ್ಗೆ 7 ರಿಂದ ಮಧ್ಯಾಹ್ನ 12 ರವರೆಗೆ 2 ಎಕರೆಗೆ ನನಗೆ ಇದು ಬೇಕಾಗಿದೆ. ವಾಟ್ಸಾಪ್ ಅಥವಾ ಚಾಟ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ!",
    hi: "प्रशांत, मुझे कल सुबह 7 बजे से दोपहर 12 बजे तक 2 एकड़ के लिए यह चाहिए। चैट या व्हाट्सएप पर संपर्क करें!",
    en: "Prashanth, I need it tomorrow morning from 7 AM to 12 PM for 2 acres. DM me on Reddit chat!"
  },
  401: {
    kn: "ಹೌದು, ತೇವಾಂಶ ಕಡಿಮೆ ಮಾಡಲು ಗದ್ದೆಯಲ್ಲಿ ನಿಂತ ನೀರನ್ನು ತಕ್ಷಣ ಹೊರಹಾಕಿ. ಸೂರ್ಯನ ತೀಕ್ಷ್ಣ ಬಿಸಿಲು ಬೀಳುವ ಮುನ್ನ ಮುಂಜಾನೆಯೇ ರಕ್ಷಣಾತ್ಮಕ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.",
    hi: "हां, नमी कम करने के लिए तुरंत रुका हुआ पानी निकाल दें। तेज धूप निकलने से पहले सुबह जल्दी निवारक उपाय अपनाएं।",
    en: "Yes, drain stagnant water immediately to reduce microclimate humidity. Spray in early morning before sunlight breaks spore adhesion."
  },
  701: {
    kn: "ನಾವು ಸುರಕ್ಷತಾ ಬೆಲ್ಟ್ ಮತ್ತು ಸಲಕರಣೆಗಳನ್ನು ಹೊಂದಿರುವ 4 ಜನರ ನುರಿತ ಮರ ಹತ್ತುವವರ ತಂಡ. ಗುರುವಾರದಿಂದ ಶನಿವಾರದವರೆಗೆ ಲಭ್ಯವಿದ್ದೇವೆ. ಚಾಟ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿದ್ದೇನೆ!",
    hi: "हम सुरक्षा हार्नेस से लैस 4 प्रशिक्षित पेड़ चढ़ने वालों का दल हैं। गुरुवार से शनिवार तक उपलब्ध हैं। मैंने चैट पर मैसेज भेजा है!",
    en: "We are a crew of 4 trained palm climbers with safety harnesses. Available Thursday to Saturday. Sent you a DM on Reddit chat!"
  }
};

// Natural Language Parser for Voice & Text AI Quick Draft
export function parseAiListingDraft(promptText, activeCrop = 'arecanut', defaultVillage = 'Venur') {
  const text = (promptText || '').trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  // 1. Detect Worker Count (supports English digits, words, Kannada numbers, Hindi numbers)
  let count = '2';
  const digitMatch = text.match(/(\d+)/);
  if (digitMatch) {
    count = digitMatch[1];
  } else if (/two|ಎರಡು|ಇಬ್ಬರು|दो/i.test(lower)) {
    count = '2';
  } else if (/three|ಮೂರು|ಮೂವರು|तीन/i.test(lower)) {
    count = '3';
  } else if (/four|ನಾಲ್ಕು|ನಾಲ್ವರು|चार/i.test(lower)) {
    count = '4';
  } else if (/five|ಐದು|ಐವರು|पांच/i.test(lower)) {
    count = '5';
  }

  // 2. Detect Timing / Day
  let timing = 'This Thursday morning';
  if (/thursday|ಗುರುವಾರ|गुरुवार/i.test(lower)) {
    timing = 'This Thursday morning';
  } else if (/tomorrow|ನಾಳೆ|कल/i.test(lower)) {
    timing = 'Tomorrow morning';
  } else if (/today|ಇಂದು|आज/i.test(lower)) {
    timing = 'Today';
  } else if (/friday|ಶುಕ್ರವಾರ|शुक्रवार/i.test(lower)) {
    timing = 'This Friday morning';
  } else if (/weekend|ವಾರಾಂತ್ಯ|सप्ताहांत/i.test(lower)) {
    timing = 'This Weekend';
  } else if (/monday|ಸೋಮವಾರ|सोमवार/i.test(lower)) {
    timing = 'Next Monday morning';
  }

  // 3. Detect Village / Location
  let village = defaultVillage || 'Venur';
  const knownPlaces = [
    'Venur', 'ವೇಣೂರು', 'वेणूर',
    'Belthangady', 'ಬೆಳ್ತಂಗಡಿ', 'बेल्तंगडी',
    'Tirthahalli', 'ತೀರ್ಥಹಳ್ಳಿ', 'तीर्थहल्ली',
    'Sringeri', 'ಶೃಂಗೇರಿ', 'शृंगेरी',
    'Mandya', 'ಮಂಡ್ಯ', 'मंड्या',
    'Kolar', 'ಕೋಲಾರ', 'कोलार',
    'Shimla', 'ಶಿಮ್ಲಾ', 'शिमला',
    'Udupi', 'ಉಡುಪಿ', 'उडुपी',
    'Koppa', 'ಕೊಪ್ಪ', 'कोप्पा',
    'Puttur', 'ಪುತ್ತೂರು', 'पुत्तूर',
    'Sullia', 'ಸುಳ್ಯ', 'सुल्या',
    'Sirsi', 'ಶಿರಸಿ', 'सिरसी'
  ];
  for (const place of knownPlaces) {
    if (lower.includes(place.toLowerCase())) {
      village = place;
      break;
    }
  }

  // 4. Intent Classification: Labour Request vs Equipment Rental vs Disease Query
  const isClimber = /climber|climbing|harvest|palm|tree|ಹತ್ತುವ|ಮರ|ಕೊಯ್ಲು|ಏಣಿ|चढ़ाई|पेड़|कटाई/i.test(lower);
  const isLabour = isClimber || /labour|worker|coolie|transplant|weeding|crew|ಆಳು|ಕೂಲಿ|ನಾಟಿ|ಕೆಲಸ|मजदूर|श्रमिक|रोपाई|कामगार/i.test(lower);
  const isSprayer = /sprayer|spray|machine|pump|ಸ್ಪ್ರೇಯರ್|ಸಿಂಪಡಣೆ|ಪಂಪ್|ಯಂತ್ರ|स्प्रेयर|छिड़काव|पंप/i.test(lower);
  const isEquipment = isSprayer || /rent|rental|tractor|tiller|harvester|rotavator|ಬಾಡಿಗೆ|ಉಪಕರಣ|किराया|ट्रैक्टर/i.test(lower);

  const cropNames = {
    arecanut: 'Arecanut Palm',
    paddy: 'Paddy & Rice',
    tomato: 'Tomato Field',
    apple: 'Apple Orchard'
  };
  const cropDisplay = cropNames[activeCrop] || 'Crop';

  if (isLabour && !isEquipment) {
    const workerLabel = isClimber ? `${count} Skilled Palm Climbers` : `${count} Experienced Farm Workers`;
    const wage = isClimber ? '₹950/day + food & travel allowance' : '₹650/day + pickup';

    const safetyNudge = isClimber
      ? `\n\n🛡️ Sasya Safety Checklist:\n• Inspect safety harnesses, climbing rings & foot grips before ascending.\n• Never climb during lightning or continuous canopy wetness.\n• Keep a farm first-aid kit ready.`
      : `\n\n🛡️ Sasya Safety Checklist:\n• Ensure clean drinking water & shaded rest breaks.\n• Wear protective farm footwear in wet fields.`;

    return {
      flair: 'Labour Request',
      workers: workerLabel,
      wage: wage,
      title: `👥 ${workerLabel} Needed for ${cropDisplay} (${timing} - ${village})`,
      content: 
        `Urgent requirement for ${workerLabel.toLowerCase()} in ${village} for ${cropDisplay.toLowerCase()} operations.\n\n` +
        `📅 Date & Timing: ${timing}\n` +
        `📍 Location: ${village}\n` +
        `👥 Requirement: ${workerLabel}\n` +
        `💰 Daily Wage: ${wage}\n` +
        `📞 Contact via 1-on-1 Reddit Chat or reply below.` +
        safetyNudge +
        `\n\n✨ AI Draft by Sasya AI • Please review and edit before posting. (AI drafts, you confirm).`
    };
  }

  if (isEquipment) {
    const eqLabel = isSprayer ? 'High-Pressure Power Sprayer' : 'Farm Equipment';
    const rate = isSprayer ? '₹350 - ₹500/day' : '₹600/day';

    const safetyNudge = isSprayer
      ? `\n\n🛡️ Sasya Safety Checklist:\n• Always wear protective respirator mask, rubber gloves, and eye goggles during spray preparation.\n• Spray only downwind; never spray against wind direction or near open water bodies.`
      : `\n\n🛡️ Sasya Safety Checklist:\n• Ensure power take-off (PTO) shields and safety guards are locked before operation.`;

    return {
      flair: 'Equipment Rental',
      workers: '',
      wage: '',
      title: `🛠️ ${eqLabel} Needed for Rent (${timing} - ${village})`,
      content:
        `Looking to rent a well-maintained ${eqLabel.toLowerCase()} in ${village}.\n\n` +
        `📅 Needed Timing: ${timing}\n` +
        `📍 Location: ${village}\n` +
        `💰 Expected Budget: ${rate}\n` +
        `📞 Contact via 1-on-1 Reddit Chat or leave a comment below.` +
        safetyNudge +
        `\n\n✨ AI Draft by Sasya AI • Please review and edit before posting. (AI drafts, you confirm).`
    };
  }

  // Fallback: Disease / Agronomic inquiry (Strictly zero chemical doses)
  return {
    flair: 'Disease Query',
    workers: '',
    wage: '',
    title: `🍃 Question regarding ${cropDisplay} health symptoms in ${village}`,
    content:
      `Observed unusual leaf / fruit symptoms in ${village} following recent microclimate changes.\n\n` +
      `• Observed Symptoms: ${text}\n` +
      `• Crop: ${cropDisplay}\n` +
      `• Location: ${village}\n\n` +
      `Seeking peer grower insights and expert agronomist recommendations. (Photo attached below).\n\n` +
      `🛡️ Sasya Advisory: Rely on cultural sanitation and verify with a certified agronomist before applying any treatments.\n\n` +
      `✨ AI Draft by Sasya AI • Please review and edit before posting. (AI drafts, you confirm).`
  };
}

// Fallback multilingual translation helper for dynamic posts or comments
export function translateDynamicText(text, targetLang) {
  if (!text || targetLang === 'en') return text;

  // Agricultural keywords dictionary for dynamic translations
  const dict = {
    kn: [
      [/climber/gi, 'ಮರ ಹತ್ತುವವರು'],
      [/climbers/gi, 'ಮರ ಹತ್ತುವವರು'],
      [/workers/gi, 'ಕಾರ್ಮಿಕರು'],
      [/worker/gi, 'ಕಾರ್ಮಿಕ'],
      [/labour/gi, 'ಆಳು'],
      [/wage/gi, 'ದಿನಗೂಲಿ'],
      [/sprayer/gi, 'ಸ್ಪ್ರೇಯರ್'],
      [/spraying/gi, 'ಸಿಂಪಡಣೆ'],
      [/equipment/gi, 'ಯಂತ್ರೋಪಕರಣ'],
      [/rental/gi, 'ಬಾಡಿಗೆ'],
      [/rent/gi, 'ಬಾಡಿಗೆ'],
      [/urgently/gi, 'ತುರ್ತಾಗಿ'],
      [/urgent/gi, 'ತುರ್ತು'],
      [/needed/gi, 'ಬೇಕಾಗಿದ್ದಾರೆ'],
      [/available/gi, 'ಲಭ್ಯವಿದೆ'],
      [/rain/gi, 'ಮಳೆ'],
      [/mist/gi, 'ಮಂಜು'],
      [/morning/gi, 'ಬೆಳಗ್ಗೆ'],
      [/thursday/gi, 'ಗುರುವಾರ'],
      [/tomorrow/gi, 'ನಾಳೆ'],
      [/safety/gi, 'ಸುರಕ್ಷತೆ'],
      [/harness/gi, 'ಸುರಕ್ಷತಾ ಬೆಲ್ಟ್'],
      [/mask/gi, 'ಮುಖಗವಸು']
    ],
    hi: [
      [/climber/gi, 'पेड़ चढ़ने वाले'],
      [/climbers/gi, 'पेड़ चढ़ने वाले'],
      [/workers/gi, 'मजदूर'],
      [/worker/gi, 'श्रमिक'],
      [/labour/gi, 'श्रम'],
      [/wage/gi, 'दैनिक मजदूरी'],
      [/sprayer/gi, 'स्प्रेयर'],
      [/spraying/gi, 'छिड़काव'],
      [/equipment/gi, 'उपकरण'],
      [/rental/gi, 'किराया'],
      [/rent/gi, 'किराया'],
      [/urgently/gi, 'तुरंत'],
      [/urgent/gi, 'आवश्यक'],
      [/needed/gi, 'चाहिए'],
      [/available/gi, 'उपलब्ध'],
      [/rain/gi, 'बारिश'],
      [/mist/gi, 'कोहरा'],
      [/morning/gi, 'सुबह'],
      [/thursday/gi, 'गुरुवार'],
      [/tomorrow/gi, 'कल'],
      [/safety/gi, 'सुरक्षा'],
      [/harness/gi, 'सुरक्षा हार्नेस'],
      [/mask/gi, 'मास्क']
    ]
  };

  const replacements = dict[targetLang];
  if (!replacements) return text;

  let translated = text;
  for (const [pattern, rep] of replacements) {
    translated = translated.replace(pattern, rep);
  }
  return translated;
}
