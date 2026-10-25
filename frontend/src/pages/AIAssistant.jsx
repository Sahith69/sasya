// src/pages/AIAssistant.jsx - Interactive Multilingual AI Agronomist & Pathology Advisory
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, Sparkles, Send, Mic, MicOff, Volume2, ArrowLeft, 
  Sun, Moon, RotateCcw, Camera, ShieldCheck, CheckCircle2, 
  AlertTriangle, Leaf, HelpCircle, ChevronRight, Copy, Check,
  Users, FileText, User
} from 'lucide-react';
import { callGeminiAgronomist } from '../services/gemini';

// Helper component to render interactive markdown links inside assistant responses
function RenderMessageText({ text, onNavigate }) {
  if (!text) return null;
  const parts = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    parts.push(
      <button
        key={match.index}
        type="button"
        onClick={() => onNavigate(url)}
        className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-emerald-500/10 px-1.5 py-0.5 rounded-md my-0.5 mx-0.5 transition-colors"
      >
        <span>{label}</span>
        <span className="text-[10px]">➔</span>
      </button>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return <div className="whitespace-pre-line leading-relaxed">{parts}</div>;
}

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
  
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'kn' 
        ? `ನಮಸ್ಕಾರ ${user?.name || user?.username || 'ರೈತ ಬಾಂಧವರೇ'}! 👋 ನಾನು ಸಸ್ಯ AI ಕೃಷಿ ಸಲಹೆಗಾರ. ನೀವು ${user?.district || 'ದಕ್ಷಿಣ ಕನ್ನಡ'} ಜಿಲ್ಲೆಯ ${user?.taluk || 'ಬೆಳ್ತಂಗಡಿ'}ದಲ್ಲಿ ${user?.crops?.[0] || 'ಅಡಿಕೆ'} ಬೆಳೆಯುತ್ತಿದ್ದೀರಿ ಎಂದು ನನಗೆ ತಿಳಿದಿದೆ. ಇಂದು ನಿಮ್ಮ ತೋಟದ ಪರಿಸ್ಥಿತಿ ಹೇಗಿದೆ? ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ, ಸಿಂಪಡಣೆ ಪ್ರಮಾಣ ಅಥವಾ ಸಮುದಾಯ ಪೋಸ್ಟ್ ರಚಿಸಲು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು!`
        : lang === 'hi'
        ? `नमस्ते ${user?.name || user?.username || 'किसान भाई'}! 👋 मैं सस्य AI कृषि सलाहकार हूँ। मुझे ज्ञात है कि आप ${user?.district || 'दक्षिण कन्नड़'} के ${user?.taluk || 'बेलथंगडी'} में ${user?.crops?.[0] || 'सुपारी'} उगाते हैं। आज आपकी फसल कैसी है? रोग रोकथाम, छिड़काव या पोस्ट लिखवाने के लिए पूछ सकते हैं!`
        : `Namaskara ${user?.name || user?.username || 'Farmer'}! 👋 I am your Sasya AI Agronomist companion. I see you cultivate ${user?.crops?.[0] || 'Arecanut'} in ${user?.taluk || 'Belthangady'}, ${user?.district || 'Dakshina Kannada'}. How can I assist your farm today? Ask me about disease defense, spray calculation, or community post drafting!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured: null,
      draft: null
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

    const cleanText = text.replace(/[*_#•]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
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

  // Send Message with Gemini 3.6 Flash + Local Fallback
  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured: null,
      draft: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await callGeminiAgronomist({
        query,
        conversationHistory: messages,
        userProfile: user,
        lang
      });

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: res.text,
        draft: res.draft,
        model: res.model,
        isLocal: res.isLocal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: null
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.warn('AI Agronomist processing fallback', e);
      const fallback = generateResponse(query);
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: fallback.text,
          structured: fallback.structured,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          draft: null
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePublishDraft = (draft) => {
    try {
      sessionStorage.setItem('sasya_pending_community_draft', JSON.stringify(draft));
      navigate(`/c/${draft.crop || 'arecanut'}`);
    } catch (e) {
      navigate('/c/arecanut');
    }
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
          ? `ಸಂಭಾಷಣೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ನಮಸ್ಕಾರ ${user?.name || user?.username || 'ರೈತರೇ'}, ಹೊಸ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ!`
          : lang === 'hi'
          ? `बातचीत रीसेट हो गई है। नमस्ते ${user?.name || user?.username || 'किसान भाई'}, नया प्रश्न पूछें!`
          : `Conversation refreshed. Hello ${user?.name || user?.username || 'Farmer'}, ask me any agronomy or post drafting question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: null,
        draft: null
      }
    ]);
  };

  // Generate Static Knowledge Base Response (legacy fallback support)
  const generateResponse = (query) => {
    const q = query.toLowerCase();
    for (const item of AGRONOMIC_KNOWLEDGE) {
      if (item.keywords.some(k => q.includes(k.toLowerCase()))) {
        const localized = item[lang] || item.en;
        return {
          structured: localized,
          text: `${localized.title}\n\n${localized.summary}\n\n${localized.prescription.join('\n')}\n\n🌿 Organic Option: ${localized.organic}\n⏱️ Application: ${localized.timing}\n💡 Tip: ${localized.tip}`
        };
      }
    }
    return {
      structured: null,
      text: lang === 'kn'
        ? "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಕೃಷಿ ಸಲಹೆ ಸಿದ್ಧವಾಗಿದೆ. ಬೆಳೆ ಸಮುದಾಯದಲ್ಲಿ ಇತರ ರೈತರ ಜತೆ ಚರ್ಚಿಸಲು [r/arecanut ಫೀಡ್](/c/arecanut) ವೀಕ್ಷಿಸಿ."
        : "Thank you! Check your crop community feed on [r/arecanut](/c/arecanut) to discuss with fellow growers."
    };
  };

  const QUICK_PROMPTS = [
    { label: `🌴 ${user?.crops?.[0] || 'Arecanut'} Koleroga 1% Bordeaux`, text: `How to prepare 1% Bordeaux mixture with rosin sticker for ${user?.crops?.[0] || 'Arecanut'} Koleroga?` },
    { label: '📝 Draft Climber Request Post', text: `Draft a community post asking for 2 skilled tree climbers for spraying in ${user?.taluk || 'Belthangady'}` },
    { label: `⚖️ Spray Dosage for ${user?.landSize || '4.0 Acres'}`, text: `Calculate 1% Bordeaux mixture and water required for my ${user?.landSize || '4.0 Acres'} of ${user?.crops?.[0] || 'Arecanut'}` },
    { label: '🌿 Organic Jeevamrutha', text: 'How to prepare organic Jeevamrutha microbial culture?' },
    { label: '🌾 Paddy Blast Cure', text: 'What is the immediate cure and Tricyclazole dosage for Paddy Blast?' }
  ];

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-300 pb-24 md:pb-6 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>

      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => navigate('/home')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
              isDark ? 'bg-[#162C20] text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#E8F2EA] text-[#275637] border border-[#91BA94]'
            }`}>
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-lg tracking-tight">
                  {t('ai_page_title') || 'Sasya AI Agronomist'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI Agronomist Active</span>
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                {t('ai_page_sub') || 'Instant diagnostics, dosages, crop advice & post drafting'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
              <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xs border ${
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
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <RenderMessageText text={msg.text} onNavigate={(url) => navigate(url)} />
                  </div>
                )}

                {/* ── INTERACTIVE COMMUNITY POST DRAFT CARD (IF DRAFTED) ── */}
                {msg.draft && (
                  <div className={`mt-3.5 p-3.5 sm:p-4 rounded-xl border space-y-2.5 animate-fadeIn shadow-xs ${
                    isDark ? 'bg-[#0E1E16] border-[#22C55E]/40' : 'bg-[#F4F8F5] border-[#91BA94]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Community Post Draft (r/{msg.draft.crop || 'arecanut'})</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                        {msg.draft.flair || 'Labour Request'}
                      </span>
                    </div>

                    <h4 className={`font-extrabold text-sm sm:text-base leading-snug ${
                      isDark ? 'text-white' : 'text-[#1B4329]'
                    }`}>
                      {msg.draft.title}
                    </h4>

                    <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isDark ? 'text-gray-200' : 'text-[#2C3E32]'
                    }`}>
                      {msg.draft.content}
                    </p>

                    {(msg.draft.workers || msg.draft.wage) && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                        {msg.draft.workers && <span>👥 {msg.draft.workers}</span>}
                        {msg.draft.wage && <span>💰 {msg.draft.wage}</span>}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-gray-200/80 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => handlePublishDraft(msg.draft)}
                        className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-[#275637] hover:bg-[#1E462B] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>🚀 Publish to r/{msg.draft.crop || 'arecanut'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.draft.title + '\n\n' + msg.draft.content, 'draft_' + msg.id)}
                        className={`min-h-[44px] py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isDark 
                            ? 'border-[#1E3A2B] bg-[#12241A] text-gray-200 hover:bg-[#183526]' 
                            : 'border-[#91BA94] bg-white text-[#275637] hover:bg-[#E8F2EA]'
                        }`}
                      >
                        {copiedId === 'draft_' + msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Controls: Time, Audio Listen, Copy & Brand Indicator */}
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Sasya AI
                      </span>
                    )}
                  </div>

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
                <span>Formulating personalized agronomic response...</span>
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
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : isDark ? 'bg-[#142C1E] border-[#1E3A2B] text-gray-300 hover:text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
              }`}
              title={isListening ? "Listening... click to stop" : "Speak in Kannada, Hindi or English"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Free-form Input Field - 16px text-base on mobile prevents iOS Safari auto-zoom */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={lang === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ 'ಪೋಸ್ಟ್ ಬರೆಯಿರಿ' ಎನ್ನಿ..." : lang === 'hi' ? "प्रश्न पूछें या 'पोस्ट लिखें' कहें..." : "Ask agronomy question or say 'help draft a post'..."}
              className={`flex-1 min-h-[44px] text-base sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white placeholder-gray-500' : 'bg-[#FAFCFA] border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                inputQuery.trim() && !isTyping
                  ? 'bg-[#275637] hover:bg-[#1E462B] text-white hover:scale-105 active:scale-95'
                  : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="hidden xs:inline">Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Context Action Bar */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Certified Agronomic Protocols</span>
            </span>

            <Link
              to="/detect"
              className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Leaf Instead ➔</span>
            </Link>
          </div>
        </div>

      </main>

      {/* ── MOBILE BOTTOM NAVIGATION (CONSISTENT APP SHELL) ── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around py-1.5 px-2 backdrop-blur-md ${
        isDark ? 'bg-[#0B1712]/95 border-[#162C20]' : 'bg-[#F9F9F6]/95 border-[#91BA94]/60'
      }`}>
        <button 
          onClick={() => navigate('/home')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <span className="text-base">🌱</span>
          <span className="text-[10px] font-semibold">{t('nav_home') || 'Home'}</span>
        </button>

        <button 
          onClick={() => navigate('/c/arecanut')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <span className="text-base">💬</span>
          <span className="text-[10px] font-semibold">{t('nav_community') || 'Community'}</span>
        </button>

        <button 
          onClick={() => navigate('/detect')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-semibold">{t('nav_detect') || 'Detect'}</span>
        </button>

        <button 
          onClick={() => navigate('/ai')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#22C55E] font-bold' : 'text-[#275637] font-bold'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold">{t('nav_ai') || 'Sasya AI'}</span>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
            isDark ? 'text-[#8BA695] hover:text-white' : 'text-[#556B5C] hover:text-[#275637]'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{t('menu_profile') || 'Profile'}</span>
        </button>
      </nav>

    </div>
  );
}
