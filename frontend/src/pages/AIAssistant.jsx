// src/pages/AIAssistant.jsx - Interactive Multilingual AI Agronomist & Pathology Advisory
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, Sparkles, Send, Mic, MicOff, Volume2, ArrowLeft, 
  Sun, Moon, RotateCcw, Camera, ShieldCheck, CheckCircle2, 
  AlertTriangle, Leaf, HelpCircle, ChevronRight, Copy, Check
} from 'lucide-react';

// Domain Knowledge Base for Karnataka Crops & Agronomic Solutions (Safe, Cultural, No Doses)
const AGRONOMIC_KNOWLEDGE = [
  {
    keywords: ['bordeaux', 'koleroga', 'mahali', 'arecanut fruit rot', 'ಫ್ರೂಟ್ ರಾಟ್', 'ಕೊಳೆರೋಗ', 'ಬೋರ್ಡೋ', 'कोलेरोगा', 'बोर्डो'],
    en: {
      title: "Arecanut Koleroga (Fruit Rot) Management",
      crop: "🌴 Arecanut (Betelnut)",
      disease: "Koleroga / Mahali (Phytophthora meadii)",
      summary: "Koleroga is a moisture-driven fungus spreading during heavy monsoon rains. Rapid sanitation and cultural management are the essential first line of defense.",
      prescription: [
        "**Sanitation & Cultural Management Steps:**",
        "• Immediately collect and safely bury fallen rotting nuts from the basin floor to stop fungal spore spread.",
        "• Clear plantation drainage trenches so heavy monsoon water does not stagnate around root zones.",
        "• Consult an accredited local agronomist or extension officer before applying protective canopy sprays.",
        "• Check weather forecasts: Never apply foliar sprays right before a continuous downpour.",
        "• Need palm climbers? [Draft an urgent climber request in Rural Exchange](/c/arecanut)."
      ],
      organic: "Soil application around tree basin with beneficial *Trichoderma* culture mixed into well-decomposed organic manure and neem cake.",
      timing: "Perform canopy inspections before heavy monsoon cloudbursts begin.",
      tip: "Ensure palm climbing gear and harnesses are inspected for safety before ascending."
    },
    kn: {
      title: "ಅಡಿಕೆ ಕೊಳೆರೋಗ ನಿರ್ವಹಣಾ ಮಾರ್ಗದರ್ಶಿ",
      crop: "🌴 ಅಡಿಕೆ ತೋಟ",
      disease: "ಕೊಳೆರೋಗ / ಮಹಾಲಿ (Phytophthora meadii)",
      summary: "ಕೊಳೆರೋಗವು ಮಳೆಗಾಲದಲ್ಲಿ ತೇವಾಂಶದಿಂದ ಹರಡುವ ಶಿಲೀಂಧ್ರ ರೋಗ. ತೋಟದ ನೈರ್ಮಲ್ಯ ಮತ್ತು ನೀರು ಸರಾಗವಾಗಿ ಹರಿದುಹೋಗುವಂತೆ ಮಾಡುವುದು ಮುಖ್ಯ.",
      prescription: [
        "**ಮುಖ್ಯ ಕ್ಷೇತ್ರ ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು:**",
        "• ನೆಲಕ್ಕೆ ಬಿದ್ದ ಕೊಳೆತ ಅಡಿಕೆಗಳನ್ನು ತಕ್ಷಣ ಸಂಗ್ರಹಿಸಿ ಮಣ್ಣಿನಲ್ಲಿ ಆಳವಾಗಿ ಹೂತುಹಾಕಿ.",
        "• ತೋಟದಲ್ಲಿ ಮಳೆ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
        "• ಸಿಂಪಡಣೆ ಮಾಡುವ ಮುನ್ನ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯ ಸಲಹೆ ಪಡೆಯಿರಿ.",
        "• ಮಳೆ ಸುರಿಯುವಾಗ ಸಿಂಪಡಿಸಬೇಡಿ, ಎಲೆಗಳು ಒಣಗಿರುವಾಗ ಮಾತ್ರ ನಿರ್ವಹಣೆ ಮಾಡಿ.",
        "• ಮರ ಹತ್ತುವವರು ಬೇಕಿದ್ದರೆ [ಕೃಷಿ ಕಾರ್ಮಿಕ ವಿನಿಮಯ ವೇದಿಕೆಯಲ್ಲಿ ಪ್ರಕಟಿಸಿ](/c/arecanut)."
      ],
      organic: "ಬುಡಕ್ಕೆ *ಟ್ರೈಕೋಡರ್ಮಾ* ಸೂಕ್ಷ್ಮಜೀವಿ ಕಲ್ಚರ್ ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ಮಿಶ್ರಣವನ್ನು ಮಣ್ಣಿಗೆ ಹಾಕಿ.",
      timing: "ಮುಂಗಾರು ಮಳೆ ಮುನ್ನವೇ ತೋಟದ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಿ.",
      tip: "ಮರ ಹತ್ತುವಾಗ ಸುರಕ್ಷತಾ ಬೆಲ್ಟ್ ಬಳಕೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
    },
    hi: {
      title: "सुपारी कोलेरोगा (फल सड़न) प्रबंधन",
      crop: "🌴 सुपारी (Arecanut)",
      disease: "कोलेरोगा / महाली (Phytophthora meadii)",
      summary: "कोलेरोगा अत्यधिक नमी और मानसूनी वर्षा में फैलने वाला रोग है। खेत की स्वच्छता एवं जल निकासी सबसे महत्वपूर्ण प्राथमिक कदम हैं।",
      prescription: [
        "**खेत स्वच्छता एवं प्रबंधन निर्देश:**",
        "• नीचे गिरे सड़े फलों को तुरंत इकट्ठा कर मिट्टी में दबाएं ताकि फफूंद न फैले।",
        "• बगीचे में पानी जमा न होने दें, जल निकासी नालियों को साफ रखें।",
        "• किसी भी सुरक्षात्मक छिड़काव से पहले कृषि वैज्ञानिक से पुष्टि करें।",
        "• बारिश के ठीक पहले छिड़काव न करें, पत्ते सूखे होने पर ही काम करें।",
        "• मजदूर की आवश्यकता हेतु [मजदूर एक्सचेंज में लिस्टिंग जोड़ें](/c/arecanut)।"
      ],
      organic: "जड़ों के पास *ट्राइकोडर्मा* और नीम की खली का प्रयोग करें।",
      timing: "मानसून की भारी बारिश से पहले निरीक्षण करें।",
      tip: "पेड़ पर चढ़ते समय सुरक्षा बेल्ट का उपयोग सुनिश्चित करें।"
    }
  },
  {
    keywords: ['blast', 'paddy', 'neck blast', 'ಭತ್ತ', 'ಬೆಂಕಿ ರೋಗ', 'धान', 'ब्लास्ट', 'झुलसा'],
    en: {
      title: "Paddy Blast (Magnaporthe oryzae) Management",
      crop: "🌾 Paddy (Rice)",
      disease: "Leaf Blast & Neck Blast",
      summary: "Spindle-shaped spots on leaves reducing photosynthetic area. Cool, humid conditions accelerate spore germination.",
      prescription: [
        "**Field Management & Nitrogen Regulation:**",
        "• Immediately halt all urea and chemical nitrogen top-dressing (excess nitrogen creates soft leaf tissue vulnerable to blast).",
        "• Maintain a steady 2–3 cm shallow standing water layer in paddy basins to keep microclimate temperature stable.",
        "• Clip and destroy heavily infected nursery leaves before transplanting.",
        "• Ask experienced paddy growers on [r/paddy feed](/c/paddy) to see if local blast pockets are expanding in your taluk."
      ],
      organic: "Foliar spray with beneficial bio-control agent *Pseudomonas fluorescens* or 5% neem seed kernel extract.",
      timing: "Inspect fields early morning when lesions show gray spore centers.",
      tip: "Maintain balanced potash fertilization to strengthen rice stem walls."
    },
    kn: {
      title: "ಭತ್ತದ ಬೆಂಕಿ ರೋಗ (Paddy Blast) ನಿರ್ವಹಣಾ ಕ್ರಮಗಳು",
      crop: "🌾 ಭತ್ತ",
      disease: "ಎಲೆ ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಕುತ್ತಿಗೆ ಬೆಂಕಿ ರೋಗ",
      summary: "ಭತ್ತದ ಎಲೆಗಳ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ ಮಚ್ಚೆಗಳು ಕಂಡುಬರುತ್ತವೆ. ತೇವಾಂಶ ಮತ್ತು ಮಂಜಿನ ವಾತಾವರಣದಲ್ಲಿ ರೋಗವು ಬೇಗ ಹರಡುತ್ತದೆ.",
      prescription: [
        "**ಕ್ಷೇತ್ರ ನಿರ್ವಹಣೆ ಮತ್ತು ಸಾರಜನಕ ನಿಯಂತ್ರಣ:**",
        "• ಯೂರಿಯಾ (ಸಾರಜನಕ) ಗೊಬ್ಬರ ನೀಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ.",
        "• ಗದ್ದೆಯಲ್ಲಿ ೨-೩ ಸೆಂ.ಮೀ ನೀರನ್ನು ನಿಲ್ಲಿಸಿ ತೇವಾಂಶ ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳಿ.",
        "• ರೋಗಗ್ರಸ್ತ ಸಸಿಗಳ ತುದಿಗಳನ್ನು ನಾಟಿ ಮಾಡುವ ಮುನ್ನ ಕತ್ತರಿಸಿ ತೆಗೆಯಿರಿ.",
        "• ಇತರ ಸ್ಥಳೀಯ ರೈತರ ಅನುಭವ ತಿಳಿಯಲು [ಭತ್ತದ ಸಮುದಾಯ ವೇದಿಕೆಯಲ್ಲಿ ಚರ್ಚಿಸಿ](/c/paddy)."
      ],
      organic: "*ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆನ್ಸ್* ಜೈವಿಕ ದ್ರಾವಣ ಅಥವಾ ೫% ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.",
      timing: "ಬೆಳಗಿನ ಸಮಯದಲ್ಲಿ ಎಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      tip: "ಪೊಟ್ಯಾಶ್ ಗೊಬ್ಬರ ನೀಡಿ ಸಸಿಗಳ ಕಾಂಡವನ್ನು ಗಟ್ಟಿಗೊಳಿಸಿ."
    },
    hi: {
      title: "धान का झुलसा/ब्लास्ट रोग प्रबंधन",
      crop: "🌾 धान (Rice)",
      disease: "पत्ती एवं गर्दन ब्लास्ट",
      summary: "पत्तियों पर आंख के आकार के धब्बे। अधिक यूरिया और नमी से यह रोग तेजी से फैलता है।",
      prescription: [
        "**खेत प्रबंधन एवं खाद संतुलन:**",
        "• यूरिया (नाइट्रोजन) का प्रयोग तुरंत रोक दें।",
        "• खेत में 2-3 सेमी पानी बनाए रखें ताकि तापमान स्थिर रहे।",
        "• रोपाई से पहले संक्रमित नर्सरी पौधों की छंटाई करें।",
        "• क्षेत्रीय सलाह हेतु [धान किसान समुदाय](/c/paddy) पर पूछें।"
      ],
      organic: "*स्यूडोमोनास फ्लोरोसेंस* बायो-एजेंट या 5% नीम अर्क का छिड़काव करें।",
      timing: "सुबह ओस के समय पत्तियों की जांच करें।",
      tip: "पोटाश की उचित मात्रा देकर पौधों को मजबूत बनाएं।"
    }
  },
  {
    keywords: ['tomato', 'late blight', 'early blight', 'ಟೊಮ್ಯಾಟೊ', 'ಟೊಮೆಟೊ', 'ಅಂಗಮಾರಿ', 'टमाटर', 'ब्लाइट', 'झुलसा'],
    en: {
      title: "Tomato Blight Cultural Management",
      crop: "🍅 Tomato",
      disease: "Early & Late Blight",
      summary: "Dark concentric rings on lower leaves progressing up the vine during warm, humid conditions.",
      prescription: [
        "**Cultural Sanitation & Airflow:**",
        "• Carefully pinch off and discard yellowing lower leaves touching wet soil to stop rain splash infection.",
        "• Stake vines off the soil surface and switch to drip irrigation to keep foliage dry.",
        "• Maintain wide spacing between rows to promote cross-wind canopy drying.",
        "• Consult your local horticulture specialist or post photos in [r/tomato](/c/tomato) for peer feedback."
      ],
      organic: "Foliar spray with fermented sour butter milk solution (5%) or cow urine extract.",
      timing: "Prune lower foliage on sunny mornings to allow cut wounds to dry quickly.",
      tip: "Never work in tomato fields when vines are wet from rain or dew."
    },
    kn: {
      title: "ಟೊಮ್ಯಾಟೊ ಅಂಗಮಾರಿ ರೋಗ ನಿರ್ವಹಣೆ",
      crop: "🍅 ಟೊಮ್ಯಾಟೊ",
      disease: "ಮುಂಚಿನ ಮತ್ತು ತಡವಾದ ಅಂಗಮಾರಿ",
      summary: "ಕೆಳಗಿನ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಮಚ್ಚೆಗಳು ಉಂಟಾಗುತ್ತವೆ. ಮಣ್ಣಿನ ತೇವಾಂಶದಿಂದ ಇದು ಹರಡುತ್ತದೆ.",
      prescription: [
        "**ನೈರ್ಮಲ್ಯ ಮತ್ತು ಗಾಳಿಯಾಡುವಿಕೆ:**",
        "• ನೆಲಕ್ಕೆ ತಾಗುವ ಕೆಳಗಿನ ರೋಗಗ್ರಸ್ತ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ತೋಟದಿಂದ ಹೊರಗೆ ಹಾಕಿ.",
        "• ಗಿಡಗಳಿಗೆ ಆಸರೆ ಕೋಲುಗಳನ್ನು ಕಟ್ಟಿ, ಹನಿ ನೀರಾವರಿ ಬಳಸಿ.",
        "• ಸಾಲುಗಳ ನಡುವೆ ಉತ್ತಮ ಗಾಳಿಯಾಡುವಂತೆ ಅಂತರ ಕಾಪಾಡಿ.",
        "• ಇತರ ಬೆಳೆಗಾರರೊಂದಿಗೆ [ಟೊಮ್ಯಾಟೊ ಸಮುದಾಯದಲ್ಲಿ ಚರ್ಚಿಸಿ](/c/tomato)."
      ],
      organic: "೫% ಹುಳಿ ಮಜ್ಜಿಗೆ ದ್ರಾವಣವನ್ನು ಸಿಂಪಡಿಸಿ.",
      timing: "ಬಿಸಿಲು ಇರುವ ಬೆಳಗಿನ ವೇಳೆಯಲ್ಲಿ ಎಲೆಗಳ ಕತ್ತರಿಸುವಿಕೆ ಮಾಡಿ.",
      tip: "ಗಿಡಗಳು ಒದ್ದೆಯಾಗಿರುವಾಗ ತೋಟದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬೇಡಿ."
    },
    hi: {
      title: "टमाटर का झुलसा रोग प्रबंधन",
      crop: "🍅 टमाटर",
      disease: "अगेती एवं पछेती झुलसा",
      summary: "निचली पत्तियों पर गोल भूरे धब्बे जो धीरे-धीरे ऊपर की ओर बढ़ते हैं।",
      prescription: [
        "**स्वच्छता एवं हवादार प्रबंधन:**",
        "• जमीन को छूने वाली निचली बीमार पत्तियों को तोड़कर बाहर फेंकें।",
        "• पौधों को सहारा दें और ड्रिप से सिंचाई करें ताकि पत्ते सूखे रहें।",
        "• पौधों के बीच उचित दूरी रखें ताकि हवा और धूप मिल सके।",
        "• साथी किसानों से [टमाटर मंच](/c/tomato) पर परामर्श लें।"
      ],
      organic: "5% खट्टी छाछ का छिड़काव करें।",
      timing: "धूप वाले दिन सुबह निचली पत्तियों की छंटाई करें।",
      tip: "पत्ते गीले होने पर पौधों को न छुएं।"
    }
  },
  {
    keywords: ['jeevamrutha', 'organic', 'panchagavya', 'ಜೀವಾಮೃತ', 'ಪಂಚಗವ್ಯ', 'ನೈಸರ್ಗಿಕ', 'जीवामृत', 'पंचगव्य', 'जैविक'],
    en: {
      title: "Traditional Jeevamrutha Microbial Booster Formulation",
      crop: "🌱 All Crops (Soil & Immunity Booster)",
      disease: "Soil Health & Natural Disease Resistance",
      summary: "Potent microbial culture activating beneficial soil bacteria, mycorrhiza, and earthworms.",
      prescription: [
        "**Natural Ingredients (for 1 Acre Soil Application):**",
        "• 10 kg Fresh Cow Dung (indigenous cow preferred).",
        "• 10 Liters Cow Urine (Gomutra).",
        "• 2 kg Jaggery (organic, unrefined).",
        "• 2 kg Pulse Flour (Besan / gram flour).",
        "• 1 handful of undisturbed virgin soil from farm bunds.",
        "• 200 Liters of water in a shade-covered plastic barrel."
      ],
      organic: "Stir clockwise with a wooden stick twice daily for 48 to 72 hours. Apply to roots through drip or canal irrigation.",
      timing: "Apply once every 15–20 days. Use within 7 days of full fermentation.",
      tip: "Keep barrel under shady tree cover; do not expose to direct sunlight."
    },
    kn: {
      title: "ಪಾರಂಪರಿಕ ಜೀವಾಮೃತ ತಯಾರಿಕೆ ಮತ್ತು ಬಳಕೆ ವಿಧಾನ",
      crop: "🌱 ಎಲ್ಲಾ ಬೆಳೆಗಳಿಗೆ (ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ರೋಗ ನಿರೋಧಕತೆ)",
      disease: "ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಜೀವಿ ವೃದ್ಧಿ ಮತ್ತು ಸಹಜ ರಕ್ಷಣೆ",
      summary: "ಮಣ್ಣಿನಲ್ಲಿರುವ ಉಪಯುಕ್ತ ಸೂಕ್ಷ್ಮಜೀವಿಗಳು ಮತ್ತು ಎರೆಹುಳುಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸುವ ನೈಸರ್ಗಿಕ ದ್ರಾವಣ.",
      prescription: [
        "**ಬೇಕಾಗುವ ನೈಸರ್ಗಿಕ ಸಾಮಗ್ರಿಗಳು (೧ ಎಕರೆಗೆ):**",
        "• ೧೦ ಕೆಜಿ ತಾಜಾ ದೇಸಿ ಹಸುವಿನ ಸಗಣಿ.",
        "• ೧೦ ಲೀಟರ್ ದೇಸಿ ಗೋಮೂತ್ರ.",
        "• ೨ ಕೆಜಿ ಸಾವಯವ ಬೆಲ್ಲ.",
        "• ೨ ಕೆಜಿ ದ್ವಿದಳ ಧಾನ್ಯದ ಹಿಟ್ಟು (ಕಡಲೆ ಹಿಟ್ಟು).",
        "• ಹಿಡಿ ಜೀವಂತ ಮಣ್ಣು (ಬದುವಿನ ಮೇಲಿನ ಮಣ್ಣು).",
        "• ೨೦೦ ಲೀಟರ್ ನೀರು (ಪ್ಲಾಸ್ಟಿಕ್ ಡ್ರಮ್‌ನಲ್ಲಿ)."
      ],
      organic: "ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಮರದ ಕೋಲಿನಿಂದ ಗಡಿಯಾರದ ಮುಳ್ಳಿನ ದಿಕ್ಕಿನಲ್ಲಿ ತಿರುಗಿಸಿ. ೨-೩ ದಿನಗಳಲ್ಲಿ ಸಿದ್ಧವಾಗುತ್ತದೆ.",
      timing: "ಪ್ರತಿ ೧೫-೨೦ ದಿನಗಳಿಗೊಮ್ಮೆ ಗಿಡದ ಬುಡಕ್ಕೆ ನೀಡಿ.",
      tip: "ಡ್ರಮ್ ಅನ್ನು ನೆರಳಿನಲ್ಲಿಡಿ, ನೇರ ಬಿಸಿಲು ತಾಗದಂತೆ ಮುಚ್ಚಿ."
    },
    hi: {
      title: "प्राकृतिक जीवामृत निर्माण एवं प्रयोग विधि",
      crop: "🌱 सभी फसलों हेतु (मिट्टी की उर्वरता एवं रोग प्रतिरोधक क्षमता)",
      disease: "प्राकृतिक पोषण एवं फफूंद सुरक्षा",
      summary: "मिट्टी के लाभकारी सूक्ष्मजीवों और केंचुओं को सक्रिय करने वाला देसी कल्चर।",
      prescription: [
        "**प्राकृतिक सामग्री (1 एकड़ हेतु):**",
        "• 10 किग्रा ताज़ा देसी गाय का गोबर।",
        "• 10 लीटर देसी गोमूत्र।",
        "• 2 किग्रा गुड़।",
        "• 2 किग्रा बेसन (चना दाल का आटा)।",
        "• मुट्ठी भर मेड़ के नीचे की सजीव मिट्टी।",
        "• 200 लीटर पानी (ड्रम में)।"
      ],
      organic: "लकड़ी के डंडे से दिन में दो बार घड़ी की दिशा में घुमाएं। 48-72 घंटे में तैयार।",
      timing: "हर 15-20 दिन में सिंचाई के पानी के साथ या ड्रिप से दें।",
      tip: "ड्रम को छाया में रखें और बोरी से ढक कर रखें।"
    }
  }
];

export default function AIAssistant() {
  const navigate = useNavigate();
  const { user, lang, setLang, toggleTheme, isDark, t } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'kn' 
        ? "ನಮಸ್ಕಾರ! ನಾನು ಸಸ್ಯ AI ಕೃಷಿ ಸಲಹೆಗಾರ. ಅಡಿಕೆ ಕೊಳೆರೋಗ, ಭತ್ತದ ಬೆಂಕಿ ರೋಗ, ಟೊಮ್ಯಾಟೊ ರೋಗಗಳು, ಕೀಟನಾಶಕ ಪ್ರಮಾಣ ಮತ್ತು ಜೀವಾಮೃತ ತಯಾರಿಕೆಯ ಬಗ್ಗೆ ನೀವು ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು."
        : lang === 'hi'
        ? "नमस्ते! मैं सस्य AI कृषि सलाहकार हूँ। आप सुपारी के कोलेरोगा, धान के ब्लास्ट, टमाटर के रोगों, कीटनाशक मात्रा और जैविक जीवामृत के बारे में हिंदी, कन्नड़ या अंग्रेज़ी में कोई भी प्रश्न पूछ सकते हैं।"
        : "Namaskara! I am Sasya AI Agronomist. Ask me anything about crop diseases (Arecanut Koleroga, Paddy Blast, Tomato Blight), chemical dosage calculations, or organic biocontrols in English, Kannada, or Hindi.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured: null
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice Recognition (STT)
  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        handleSend(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Text to Speech (TTS)
  const handleSpeak = (text, id) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(id);

    // Strip markdown formatting for cleaner audio
    const cleanText = text.replace(/[*_#•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Copy message
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Smart Agronomic Response
  const generateResponse = (query) => {
    const q = query.toLowerCase();

    // Check knowledge base
    for (const item of AGRONOMIC_KNOWLEDGE) {
      if (item.keywords.some(k => q.includes(k.toLowerCase()))) {
        const localized = item[lang] || item.en;
        return {
          structured: localized,
          text: `${localized.title}\n\n${localized.summary}\n\n${localized.prescription.join('\n')}\n\n🌿 Organic Option: ${localized.organic}\n⏱️ Application: ${localized.timing}\n💡 Tip: ${localized.tip}`
        };
      }
    }

    // Dynamic Acreage Calculation response
    const acreMatch = q.match(/(\d+)\s*(acre|acres|ಎಕರೆ|ಏಕರೆ|एकड़)/i);
    if (acreMatch) {
      const acres = parseInt(acreMatch[1], 10) || 1;
      const waterLiters = acres * 250;
      const cuso4Kg = (waterLiters / 100) * 1.0;
      const limeKg = cuso4Kg;
      const stickerGrams = (waterLiters / 100) * 100;

      if (lang === 'kn') {
        return {
          structured: null,
          text: `📊 **${acres} ಎಕರೆಗೆ ಬೋರ್ಡೋ ದ್ರಾವಣ ಮತ್ತು ಕೀಟನಾಶಕ ಅಳತೆ ವಿವರ:**\n\n• **ಒಟ್ಟು ಬೇಕಾಗುವ ನೀರು:** ${waterLiters} ಲೀಟರ್\n• **ಮೈಲುತುತ್ತ (Copper Sulphate):** ${cuso4Kg.toFixed(1)} ಕೆ.ಜಿ\n• **ಸುಣ್ಣ (Quicklime):** ${limeKg.toFixed(1)} ಕೆ.ಜಿ\n• **ಅಂಟುಕ (Rosin Sticker):** ${stickerGrams} ಗ್ರಾಂ ರಾಳ + ${stickerGrams} ಗ್ರಾಂ ಸೋಡಾ\n\n💡 *ಸಲಹೆ:* ಸಿಂಪಡಿಸುವಾಗ ಹೈ-ಪ್ರೆಶರ್ ಪವರ್ ಸ್ಪ್ರೇಯರ್ ಬಳಸಿ. ಪವರ್ ಸ್ಪ್ರೇಯರ್ ಲಭ್ಯವಿಲ್ಲದಿದ್ದರೆ [ಕೃಷಿ ಉಪಕರಣ ವಿನಿಮಯ ವೇದಿಕೆ](/c/arecanut) ಪರಿಶೀಲಿಸಿ.`
        };
      } else if (lang === 'hi') {
        return {
          structured: null,
          text: `📊 **${acres} एकड़ हेतु बोर्डो मिश्रण और कीटनाशक गणना:**\n\n• **कुल आवश्यक पानी:** ${waterLiters} लीटर\n• **कॉपर सल्फेट (नीला थोथा):** ${cuso4Kg.toFixed(1)} किग्रा\n• **बुझा चूना (Lime):** ${limeKg.toFixed(1)} किग्रा\n• **रासिन स्टिकर:** ${stickerGrams} ग्राम राल + ${stickerGrams} ग्राम वाशिंग सोडा\n\n💡 *सलाह:* पत्तों के नीचे और गुच्छों पर तेज फुहार से छिड़काव करें।`
        };
      } else {
        return {
          structured: null,
          text: `📊 **Dosage Calculation for ${acres} Acre(s):**\n\n• **Total Water Required:** ${waterLiters} Liters\n• **Copper Sulphate (CuSO4):** ${cuso4Kg.toFixed(1)} kg\n• **Slaked Quicklime:** ${limeKg.toFixed(1)} kg\n• **Rosin Sticker Adjuvant:** ${stickerGrams}g Rosin + ${stickerGrams}g Washing Soda\n\n💡 *Pro-Tip:* Apply using high-pressure power sprayers for complete canopy penetration. Need equipment? [Check Rural Equipment Exchange](/c/arecanut).`
        };
      }
    }

    // General fallback response
    if (lang === 'kn') {
      return {
        structured: null,
        text: `ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯ ಕೃಷಿ ಸಲಹೆಗಳು:\n\n1. **ರೋಗದ ಪರೀಕ್ಷೆ:** ನಿಮ್ಮ ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು [ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ](/detect).\n2. **ಸಾವಯವ ಪರಿಹಾರ:** ತಕ್ಷಣಕ್ಕೆ ೫% ಬೇವಿನ ಎಣ್ಣೆ ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.\n3. **ಸಮುದಾಯ ಚರ್ಚೆ:** ಈ ರೋಗದ ಬಗ್ಗೆ ಇತರ ಸ್ಥಳೀಯ ರೈತರ ಅನುಭವ ತಿಳಿಯಲು [ಬೆಳೆ ಸಮುದಾಯ ವೇದಿಕೆಯಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ](/c/arecanut).`
      };
    } else if (lang === 'hi') {
      return {
        structured: null,
        text: `धन्यवाद! कृषि विशेषज्ञों द्वारा अनुशंसित मुख्य दिशा-निर्देश:\n\n1. **रोग पहचान:** अपनी फसल की पत्ती की फोटो लेकर [पत्ती स्कैनिंग पेज](/detect) पर जांचें।\n2. **जैविक उपचार:** प्राथमिक रूप से 5% नीम तेल या ट्राइकोडर्मा का छिड़काव करें।\n3. **किसान समूह चर्चा:** अन्य किसानों से सलाह हेतु [फसल समुदाय मंच](/c/arecanut) पर पूछें।`
      };
    } else {
      return {
        structured: null,
        text: `Thank you for your question! Here is the recommended agronomic guidance:\n\n1. **Visual Check:** Upload a photo to get an AI diagnosis on the [Detect Page](/detect).\n2. **Preventive Bio-control:** Apply 5% cold-pressed neem seed extract (NSKE) or Trichoderma harzianum.\n3. **Peer Advice:** Connect with local growers in your crop group on the [Community Forum](/c/arecanut).`
      };
    }
  };

  const handleSend = (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = generateResponse(query);
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: resp.text,
        structured: resp.structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickPrompt = (promptText) => {
    setInputQuery(promptText);
    handleSend(promptText);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'ai',
        text: lang === 'kn' 
          ? "ಸಂಭಾಷಣೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ಹೊಸ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ!"
          : lang === 'hi'
          ? "बातचीत रीसेट हो गई है। नया प्रश्न पूछें!"
          : "Conversation refreshed. Ask me any agronomy question!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: null
      }
    ]);
  };

  const QUICK_PROMPTS = [
    { label: '🌴 Koleroga 1% Bordeaux', text: 'How to prepare 1% Bordeaux mixture with rosin sticker for Arecanut Koleroga?' },
    { label: '🌾 Paddy Blast Cure', text: 'What is the immediate cure and Tricyclazole dosage for Paddy Blast?' },
    { label: '🍅 Tomato Blight Control', text: 'How to control Tomato Late Blight and Early Blight?' },
    { label: '⚖️ 3 Acres Dosage', text: 'Calculate Bordeaux mixture and water required for 3 acres of Arecanut' },
    { label: '🌿 Organic Jeevamrutha', text: 'How to prepare organic Jeevamrutha microbial culture?' }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>

      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
              isDark ? 'bg-[#162C20] text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#E8F2EA] text-[#275637] border border-[#91BA94]'
            }`}>
              <Bot className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {t('ai_page_title') || 'Sasya AI Agronomist'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Agronomy Guide
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                {t('ai_page_sub') || 'Instant diagnostics, dosages & organic solutions'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-gray-400 hover:text-white' : 'bg-white border-[#91BA94] text-gray-500 hover:text-[#275637]'
            }`}
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className={`flex items-center p-1 rounded-xl border text-xs shadow-xs ${
            isDark ? 'bg-[#12241A] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            {[
              { code: 'en', label: 'EN' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'hi', label: 'हिंदी' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLang(item.code)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === item.code
                    ? isDark ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' : 'bg-[#275637] text-white shadow-xs'
                    : isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-[#FCD34D]' : 'bg-white border-[#91BA94] text-[#275637]'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── CHAT CONTAINER ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between">
        
        {/* Messages Feed */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          
          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask:</span>
            </span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(p.text)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shrink-0 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
                  isDark 
                    ? 'bg-[#12241A] border-[#1E3A2B] text-gray-300 hover:border-[#22C55E] hover:text-white' 
                    : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Render Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* AI Avatar */}
              {msg.sender === 'ai' && (
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${
                  isDark ? 'bg-[#162C20] text-[#22C55E] border border-[#22C55E]/40' : 'bg-[#E8F2EA] text-[#275637] border border-[#91BA94]'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xs border ${
                msg.sender === 'user'
                  ? isDark 
                    ? 'bg-[#1A3828] border-[#22C55E]/40 text-white rounded-tr-xs' 
                    : 'bg-[#275637] border-[#275637] text-white rounded-tr-xs'
                  : isDark 
                    ? 'bg-[#102217] border-[#1E3A2B] text-gray-200 rounded-tl-xs' 
                    : 'bg-white border-[#91BA94] text-gray-800 rounded-tl-xs'
              }`}>
                {/* Structured Protocol Card if present */}
                {msg.structured ? (
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">
                          {msg.structured.crop}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                          {msg.structured.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                        Advisory
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {msg.structured.summary}
                    </p>

                    <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                      isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'
                    }`}>
                      {msg.structured.prescription.map((step, sIdx) => (
                        <div key={sIdx} className="text-gray-800 dark:text-gray-200">
                          {step.startsWith('•') ? (
                            <span className="block pl-2">{step}</span>
                          ) : (
                            <strong>{step.replace(/\*\*/g, '')}</strong>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-emerald-50/50 border-emerald-200'}`}>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-0.5">
                          <Leaf className="w-3 h-3" />
                          <span>Organic Alternative</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                          {msg.structured.organic}
                        </p>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-amber-50/50 border-amber-200'}`}>
                        <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Application Timing</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                          {msg.structured.timing}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>
                )}

                {/* Footer Controls: Time, Audio Listen & Copy */}
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                          speakingId === msg.id 
                            ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
                        }`}
                        title="Listen to advisory"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${speakingId === msg.id ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] font-semibold">{speakingId === msg.id ? 'Speaking' : 'Audio'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="p-1.5 rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs bg-emerald-600 text-white mt-0.5">
                  👨‍🌾
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                isDark ? 'bg-[#162C20] text-[#22C55E] border border-[#22C55E]/40' : 'bg-[#E8F2EA] text-[#275637]'
              }`}>
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className={`p-3.5 rounded-2xl rounded-tl-xs border text-xs flex items-center gap-1.5 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B] text-gray-400' : 'bg-white border-[#91BA94] text-gray-500'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Searching agronomy guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT BOX & VOICE ── */}
        <div className={`mt-2 p-2 sm:p-3 rounded-2xl border shadow-lg ${
          isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
        }`}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            {/* Mic Button for Voice Input */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : isDark ? 'bg-[#142C1E] border-[#1E3A2B] text-gray-300 hover:text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}
              title={isListening ? "Listening... click to stop" : "Speak in Kannada, Hindi or English"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Free-form Input Field */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={lang === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ೩ ಎಕರೆಗೆ ಬೋರ್ಡೋ ಪ್ರಮಾಣ ಎಷ್ಟು?)..." : lang === 'hi' ? "प्रश्न पूछें (उदा: 3 एकड़ हेतु बोर्डो मात्रा)..." : "Ask agronomy question (e.g., Bordeaux formula for 3 acres)..."}
              className={`flex-1 text-xs sm:text-sm px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white placeholder-gray-500' : 'bg-[#FAFCFA] border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                inputQuery.trim()
                  ? 'bg-[#275637] hover:bg-[#1E462B] text-white hover:scale-105 active:scale-95'
                  : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Context Action Bar */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Field-Tested Agronomic Guidelines</span>
            </span>

            <Link
              to="/detect"
              className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Camera className="w-3 h-3" />
              <span>Scan Leaf Instead ➔</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
