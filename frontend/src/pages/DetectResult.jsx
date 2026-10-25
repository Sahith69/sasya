// src/pages/DetectResult.jsx - Comprehensive Diagnostic Result, Grad-CAM Heatmap & Plain Word AI Explanation
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, ShieldAlert, CheckCircle2, RotateCcw, 
  Share2, Sun, Moon, Shield, Sparkles, MessageSquare, 
  ChevronRight, Info, Volume2, Copy, Check, Bot, HelpCircle,
  Send, Mic, MicOff, Key, FileText, ArrowRight, CornerDownLeft
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

// Pre-calibrated mock diagnosis data per crop (Grounded, Safe, Zero Doses)
const DIAGNOSIS_DATA = {
  arecanut: {
    crop: 'Arecanut (ಅಡಿಕೆ)',
    cropKey: 'arecanut',
    diseaseName: 'Koleroga (Fruit Rot)',
    kannadaName: 'ಕೊಳೆ ರೋಗ (ಹಣ್ಣು ಕೊಳೆತ)',
    pathogen: 'Phytophthora meadii',
    confidence: '96.4%',
    severityGrade: 'Grade 2: Moderate Severity',
    severityColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    description: 'Characteristic water-soaked dark lesions on the calyx and perianth of the nut. High relative humidity and rain splash accelerate spread across adjacent palms.',
    plainExplanation: {
      en: "This is a water-loving fungal infection that attacks the stalks of developing arecanut bunches. It softens the attachment point, causing green nuts to drop heavily before maturing.",
      kn: "ಇದು ತೇವಾಂಶದಿಂದ ಹರಡುವ ಶಿಲೀಂಧ್ರ ರೋಗವಾಗಿದ್ದು, ಅಡಿಕೆ ಗೊನೆಯ ತೊಟ್ಟುಗಳನ್ನು ಕೊಳೆಯುವಂತೆ ಮಾಡುತ್ತದೆ. ಇದರಿಂದ ಹಸಿರು ಅಡಿಕೆಗಳು ಮಾಗುವ ಮುನ್ನವೇ ಉದುರಿ ನೆಲಕ್ಕುರುಳುತ್ತವೆ.",
      hi: "यह अधिक नमी और बारिश में फैलने वाला फफूंद रोग है जो सुपारी के गुच्छों की डंडियों पर हमला करता है, जिससे कच्ची सुपारी पकने से पहले ही गिरने लगती है।"
    },
    severityMeaning: {
      en: "Moderate (Grade 2): The infection has started on outer bunches. Prompt physical cleanup and consulting an expert can protect adjacent healthy palms.",
      kn: "ಮಧ್ಯಮ ಹಂತ (ಗ್ರೇಡ್ ೨): ರೋಗವು ಹೊರಗಿನ ಗೊನೆಗಳಲ್ಲಿ ಕಾಣಿಸಿಕೊಂಡಿದೆ. ತಕ್ಷಣ ಒಣಗಿದ ಗೊನೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿದರೆ ಪಕ್ಕದ ಮರಗಳಿಗೆ ಹರಡುವುದನ್ನು ತಡೆಯಬಹುದು.",
      hi: "मध्यम स्तर (ग्रेड 2): संक्रमण बाहरी गुच्छों में शुरू हो चुका है। तुरंत सफाई और विशेषज्ञ सलाह से आसपास के स्वस्थ पेड़ों को बचाया जा सकता है।"
    },
    nextSteps: [
      "Collect and safely bury fallen rotten nuts away from tree basins to stop fungal spores from rising.",
      "Clear inter-row drainage trenches so rainwater does not stay stagnant around root zones.",
      "Post this scan to the community or chat with an agronomist to confirm whether protective action is advised."
    ]
  },
  paddy: {
    crop: 'Paddy (ಭತ್ತ)',
    cropKey: 'paddy',
    diseaseName: 'Paddy Blast (ಎಲೆ ಬೆಂಕಿ ರೋಗ)',
    kannadaName: 'ಎಲೆ ಬೆಂಕಿ ರೋಗ (ಬ್ಲಾಸ್ಟ್)',
    pathogen: 'Magnaporthe oryzae',
    confidence: '94.8%',
    severityGrade: 'Grade 2: Moderate Severity',
    severityColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    description: 'Elliptical spindle-shaped lesions with grayish-white centers and brownish borders on leaf blades.',
    plainExplanation: {
      en: "This is a leaf blast infection that reduces the green leaf surface your paddy needs to make food. In cool, dewy mornings, spores multiply across neighboring tillers.",
      kn: "ಇದು ಭತ್ತದ ಎಲೆಗಳ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ ಮಚ್ಚೆಗಳನ್ನು ಉಂಟುಮಾಡುವ ಬೆಂಕಿ ರೋಗ. ಬೆಳಗಿನ ಮಂಜು ಮತ್ತು ತೇವಾಂಶದಲ್ಲಿ ಈ ರೋಗವು ವೇಗವಾಗಿ ಇತರ ಸಸಿಗಳಿಗೆ ಹರಡುತ್ತದೆ.",
      hi: "यह धान का झुलसा रोग है जो पत्तियों पर आंख के आकार के धब्बे बनाकर पौधे की भोजन बनाने की क्षमता को कम करता है।"
    },
    severityMeaning: {
      en: "Moderate (Grade 2): Active spots on multiple leaves. Leaf sheath is holding, but immediate water and fertilizer management is necessary.",
      kn: "ಮಧ್ಯಮ ಹಂತ (ಗ್ರೇಡ್ ೨): ಎಲೆಗಳ ಮೇಲೆ ಸಕ್ರಿಯ ಮಚ್ಚೆಗಳಿವೆ. ಸಾರಜನಕ ಗೊಬ್ಬರ ನಿಲ್ಲಿಸಿ ನೀರಿನ ಮಟ್ಟ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ತುರ್ತು ಅಗತ್ಯ.",
      hi: "मध्यम स्तर (ग्रेड 2): कई पत्तियों पर सक्रिय धब्बे हैं। नाइट्रोजन खाद रोककर पानी का स्तर बनाए रखना आवश्यक है।"
    },
    nextSteps: [
      "Temporarily pause all urea and chemical nitrogen top-dressing (excess nitrogen makes leaf cells soft and vulnerable).",
      "Keep 2–3 cm standing water in the basin to keep soil humidity stable.",
      "Ask local paddy growers on the feed if they are noticing neck blast symptoms in your taluk."
    ]
  },
  apple: {
    crop: 'Apple (ಸೇಬು)',
    cropKey: 'apple',
    diseaseName: 'Apple Scab',
    kannadaName: 'ಸೇಬು ಸ್ಕ್ಯಾಬ್ ಶಿಲೀಂಧ್ರ',
    pathogen: 'Venturia inaequalis',
    confidence: '97.1%',
    severityGrade: 'Grade 1: Mild Severity',
    severityColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    description: 'Olive-green to velvety brown velvety spots on upper leaf surface, progressing to corky circular spots.',
    plainExplanation: {
      en: "Early fungal scab appearing on upper foliage. Cool, humid spring weather triggers spore release from fallen orchard leaves.",
      kn: "ಸೇಬಿನ ಎಲೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಆಲಿವ್-ಹಸಿರು ಬಣ್ಣದ ಆರಂಭಿಕ ಮಚ್ಚೆಗಳು. ತಂಪಾದ ಹವಾಮಾನದಲ್ಲಿ ಹಳೆಯ ಎಲೆಗಳಿಂದ ಈ ಶಿಲೀಂಧ್ರ ಹರಡುತ್ತದೆ.",
      hi: "पत्तियों की ऊपरी सतह पर हल्के जैतून-हरे रंग के धब्बे। ठंडे और नम मौसम में जमीन पर गिरी पुरानी पत्तियों से यह फैलता है।"
    },
    severityMeaning: {
      en: "Mild (Grade 1): Contained to early leaves. No significant fruit skin damage detected yet.",
      kn: "ಆರಂಭಿಕ ಹಂತ (ಗ್ರೇಡ್ ೧): ಕೆಲವೇ ಎಲೆಗಳಿಗೆ ಸೀಮಿತವಾಗಿದೆ. ಹಣ್ಣಿನ ಗುಣಮಟ್ಟಕ್ಕೆ ಇನ್ನೂ ಯಾವುದೇ ಹಾನಿಯಾಗಿಲ್ಲ.",
      hi: "शुरुआती स्तर (ग्रेड 1): शुरुआती पत्तियों तक सीमित है। फलों को अभी कोई नुकसान नहीं हुआ है।"
    },
    nextSteps: [
      "Rake and remove fallen dead leaves from under tree canopies to eliminate overwintering spores.",
      "Prune crossing internal branches to let sunlight and wind dry leaf surfaces quickly.",
      "Consult your local horticulture extension officer before applying any protective spray."
    ]
  },
  tomato: {
    crop: 'Tomato (ಟೊಮೆಟೊ)',
    cropKey: 'tomato',
    diseaseName: 'Early Blight',
    kannadaName: 'ಟೊಮೆಟೊ ಅರ್ಲಿ ಬ್ಲೈಟ್',
    pathogen: 'Alternaria solani',
    confidence: '93.6%',
    severityGrade: 'Grade 2: Moderate Severity',
    severityColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    description: 'Dark brown concentric target-like rings surrounded by yellow chlorotic halos on lower foliage.',
    plainExplanation: {
      en: "Target-board circular spots on lower leaves caused by warm soil humidity splashing upwards during rainfall or watering.",
      kn: "ಕೆಳಗಿನ ಎಲೆಗಳ ಮೇಲೆ ಗುರಿಯ ಹಲಗೆಯಂತಹ ಕಂದು ಬಣ್ಣದ ಬಳೆಗಳು. ಮಣ್ಣಿನ ತೇವಾಂಶ ನೀರು ಚಿಮ್ಮುವಾಗ ಎಲೆಗಳಿಗೆ ತಾಗಿ ಈ ರೋಗ ಹರಡುತ್ತದೆ.",
      hi: "निचली पत्तियों पर गोल छल्लेदार भूरे धब्बे, जो मिट्टी की नमी और पानी के छींटे पड़ने से ऊपर की ओर फैलते हैं।"
    },
    severityMeaning: {
      en: "Moderate (Grade 2): Lower canopy leaves are affected. Removing them prevents the fungus from climbing to fruit clusters.",
      kn: "ಮಧ್ಯಮ ಹಂತ (ಗ್ರೇಡ್ ೨): ಕೆಳಗಿನ ಎಲೆಗಳಲ್ಲಿ ರೋಗವಿದೆ. ಆ ಎಲೆಗಳನ್ನು ಕಿತ್ತುಹಾಕಿದರೆ ಹಣ್ಣಿನ ಗೊಂಚಲುಗಳಿಗೆ ಹರಡುವುದಿಲ್ಲ.",
      hi: "मध्यम स्तर (ग्रेड 2): निचली पत्तियां प्रभावित हैं। उन्हें तोड़कर हटाने से बीमारी फलों तक नहीं पहुंचेगी।"
    },
    nextSteps: [
      "Carefully pinch off infected lower leaves touching wet soil and dispose of them outside the plot.",
      "Water only at ground level with drip irrigation; avoid overhead splashing on tomato leaves.",
      "Share your scan in s/tomato to see what organic biocontrols neighboring growers are using."
    ]
  }
};

export default function DetectResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, lang, setLang, toggleTheme, isDark, t } = useAuth();

  // State from location or sensible defaults
  const state = location.state || {};
  const image = state.image || '/samples/sample_arecanut.jpg';
  const cropHint = (state.crop || state.sampleId || 'arecanut').toLowerCase();
  const isOod = state.isOod || cropHint === 'noncrop';
  const rejectionReason = state.rejectionReason || 
    state.liveResult?.rejection_reason || 
    state.liveResult?.verification?.rejection_reason;
  
  // Grad-CAM Slider Value (0 = 100% original, 100 = 100% Grad-CAM heatmap)
  const [sliderPos, setSliderPos] = useState(50);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedQuestion, setCopiedQuestion] = useState(false);

  // Selected Diagnosis details
  const live = state.liveResult;
  const baseKey = DIAGNOSIS_DATA[cropHint] ? cropHint : 'arecanut';
  const rawDiag = DIAGNOSIS_DATA[baseKey];

  const diagnosis = live ? {
    crop: `${live.crop || rawDiag.crop}`,
    cropKey: (live.crop || cropHint).toLowerCase(),
    diseaseName: live.disease?.replace(/_/g, ' ') || rawDiag.diseaseName,
    kannadaName: live.kannada_name || live.disease?.replace(/_/g, ' ') || rawDiag.kannadaName,
    pathogen: live.pathogen || (live.crop === 'Arecanut' ? 'Phytophthora meadii' : live.crop === 'Paddy' ? 'Magnaporthe oryzae' : 'Agricultural Pathogen'),
    confidence: typeof live.confidence === 'number'
      ? `${(live.confidence > 1 ? live.confidence : live.confidence * 100).toFixed(1)}%`
      : `${live.confidence || rawDiag.confidence}`,
    severityGrade: live.severity?.label || (live.severity?.grade !== undefined ? `Grade ${live.severity.grade}` : rawDiag.severityGrade),
    severityColor: (live.severity?.grade >= 3) ? 'text-rose-500 bg-rose-500/10 border-rose-500/30' : 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    description: `Diagnosed using Sasya Multimodal Vision neural classifier with attention activation.`,
    plainExplanation: live.plain_explanation || rawDiag.plainExplanation,
    severityMeaning: rawDiag.severityMeaning,
    nextSteps: (Array.isArray(live.next_steps) && live.next_steps.length > 0) ? live.next_steps : rawDiag.nextSteps
  } : rawDiag;

  // Localized Explanation Text
  const currentExplanation = diagnosis.plainExplanation?.[lang] || diagnosis.plainExplanation?.en;
  const currentSeverityMeaning = diagnosis.severityMeaning?.[lang] || diagnosis.severityMeaning?.en;

  // Suggested Expert Question
  const suggestedQuestion = lang === 'kn'
    ? `ನಮಸ್ಕಾರ, ನಾನು ${user?.village || 'ಗ್ರಾಮದ'} ರೈತ. ನನ್ನ ${diagnosis.crop} ಎಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದಾಗ ${diagnosis.diseaseName} (${diagnosis.severityGrade}) ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ. ತೋಟದ ನಿರ್ವಹಣೆಗೆ ಮುಂದಿನ ಸೂಕ್ತ ಕ್ರಮಗಳನ್ನು ದಯವಿಟ್ಟು ತಿಳಿಸಿ.`
    : lang === 'hi'
    ? `नमस्ते, मैं ${user?.village || 'गाँव'} का किसान हूँ। अपनी ${diagnosis.crop} की पत्ती स्कैन करने पर ${diagnosis.diseaseName} (${diagnosis.severityGrade}) के लक्षण दिखे हैं। उचित प्रबंधन हेतु मार्गदर्शन दें।`
    : `Hello, I am a grower from ${user?.village || 'Venur'}. I scanned my ${diagnosis.crop} and detected signs of ${diagnosis.diseaseName} (${diagnosis.severityGrade}). Could an agronomist advise on the recommended cultural steps and what to observe next?`;

  const handleSpeakExplanation = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const textToRead = `${currentExplanation} ${currentSeverityMeaning}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyQuestion = () => {
    navigator.clipboard.writeText(suggestedQuestion);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
  };

  // ── GRAD-CAM IMAGE RESOLUTION ──
  const gradcamImageSrc = live?.visuals?.gradcam_image
    ? (live.visuals.gradcam_image.startsWith('data:') ? live.visuals.gradcam_image : `data:image/jpeg;base64,${live.visuals.gradcam_image}`)
    : null;

  // ── EMBEDDED AI AGRONOMIST CONSULTATION CHAT ──
  const chatBottomRef = useRef(null);
  const [chatQuery, setChatQuery] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => [
    {
      id: 'ai-initial',
      sender: 'ai',
      text: lang === 'kn'
        ? `ನಮಸ್ಕಾರ ${user?.name || 'ರೈತರೇ'}! 👋 ನಾನು ನಿಮ್ಮ **ಸಸ್ಯ AI ಕೃಷಿ ಸಲಹೆಗಾರ**.\n\nನಿಮ್ಮ **${diagnosis.crop}** ಬೆಳೆಯ **${diagnosis.diseaseName}** (${diagnosis.severityGrade}) ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ನಾನು ಪರಿಶೀಲಿಸಿದ್ದೇನೆ.\n\nರೋಗದ ಹರಡುವಿಕೆ ತಡೆಯಲು, ಬೋರ್ಡೋ ಸಿಂಪರಣೆ ಪ್ರಮಾಣ ತಿಳಿಯಲು ಅಥವಾ ಸಮುದಾಯ ಪೋಸ್ಟ್ ಬರೆಯಲು ನೀವು ಕೆಳಗೆ ನೇರವಾಗಿ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು!`
        : lang === 'hi'
        ? `नमस्ते ${user?.name || 'किसान भाई'}! 👋 मैं आपका **सस्य AI कृषि सलाहकार** हूँ।\n\nमैंने आपकी **${diagnosis.crop}** फसल की **${diagnosis.diseaseName}** (${diagnosis.severityGrade}) रिपोर्ट जांची है।\n\nदवा छिड़काव, जैविक उपचार या मजदूर ढूंढने हेतु आप सीधे नीचे प्रश्न पूछ सकते हैं!`
        : `Namaskara ${user?.name || 'Farmer'}! 👋 I am your **Sasya AI Agronomist**.\n\nI have analyzed your **${diagnosis.crop}** leaf scan showing **${diagnosis.diseaseName}** (${diagnosis.severityGrade}).\n\nAsk me anything below about treatment timing, safe spray windows, organic biocontrols, or hiring farm workers!`
    }
  ]);

  const handleSendQuery = async (queryText) => {
    const q = (queryText !== undefined ? queryText : chatQuery).trim();
    if (!q || isAiTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatQuery('');
    setIsAiTyping(true);

    try {
      const res = await callGeminiAgronomist({
        query: q,
        conversationHistory: [...chatMessages, userMsg],
        userProfile: {
          ...user,
          crops: [diagnosis.crop],
          currentDiagnosis: {
            crop: diagnosis.crop,
            disease: diagnosis.diseaseName,
            severity: diagnosis.severityGrade,
            pathogen: diagnosis.pathogen
          }
        },
        lang
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.text,
          draft: res.draft,
          model: res.model
        }
      ]);
    } catch (err) {
      console.warn('AI Agronomist query error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "I am having difficulty connecting to cloud agronomist, but remember to remove infected fronds and maintain drainage."
        }
      ]);
    } finally {
      setIsAiTyping(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setChatQuery(transcript);
        handleSendQuery(transcript);
      }
    };

    recognition.start();
  };

  const quickQuestions = lang === 'kn' ? [
    '🧪 ೧% ಬೋರ್ಡೋ ದ್ರಾವಣ ತಯಾರಿಸುವುದು ಹೇಗೆ?',
    '🌧️ ಇಂದಿನ ಹವಾಮಾನದಲ್ಲಿ ಸಿಂಪಡಿಸಬಹುದೇ?',
    '🌿 ಟ್ರೈಕೋಡರ್ಮಾ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಹೇಗೆ?',
    '📝 ಕೃಷಿ ಆಳುಗಳಿಗಾಗಿ ಸಮುದಾಯ ಪೋಸ್ಟ್ ಬರೆಯಿರಿ'
  ] : lang === 'hi' ? [
    '🧪 1% बोर्डो मिश्रण कैसे तैयार करें?',
    '🌧️ क्या आज मौसम छिड़काव के अनुकूल है?',
    '🌿 ट्राइकोडर्मा जैविक उपचार विधि',
    '📝 मजदूर खोजने हेतु समुदाय पोस्ट लिखें'
  ] : [
    '🧪 How to prepare 1% neutral Bordeaux mixture?',
    '🌧️ Is it safe to spray with today\'s local weather?',
    '🌿 Organic Trichoderma / Jeevamrutha recipe',
    '📝 Draft a community labor post for spraying'
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0B1712] text-white' : 'bg-[#F9F9F6] text-[#275637]'
    }`}>
      {/* ── TOP NAVIGATION ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 h-16 flex items-center justify-between ${
        isDark ? 'bg-[#0B1712]/90 border-[#162C20]' : 'bg-[#F9F9F6]/90 border-[#91BA94]/60'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/detect')}
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:bg-[#162F20]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
            title="Back to Scanner"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
              {t('result_title')}
            </h1>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
              Leaf Pathology Diagnosis &amp; Explainability
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
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
                    ? isDark 
                      ? 'bg-[#22C55E] text-[#0B1712] shadow-xs' 
                      : 'bg-[#275637] text-white shadow-xs'
                    : isDark 
                      ? 'text-[#8BA695] hover:text-white' 
                      : 'text-[#275637] hover:bg-[#E8F2EA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/detect')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isDark ? 'bg-[#12241A] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637] hover:bg-[#E8F2EA]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="hidden sm:inline">Scan Another</span>
          </button>

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

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* CASE 1: NON-CROP DETECTED */}
        {isOod ? (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className={`p-8 rounded-3xl border shadow-xl ${
              isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                <ShieldAlert className="w-8 h-8" />
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-3">
                Non-Crop Guard Active
              </div>

              <h2 className="text-xl sm:text-2xl font-black mb-2">
                Non-Crop Specimen Detected
              </h2>
              
              <p className={`text-sm max-w-lg mx-auto mb-6 leading-relaxed ${isDark ? 'text-gray-200' : 'text-[#275637]'}`}>
                {rejectionReason || "This uploaded object is not recognized as a supported agricultural crop leaf. Sasya rejects out-of-distribution inputs to protect farmer finances and prevent unnecessary chemical purchases."}
              </p>

              {image && (
                <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-rose-500/40 mb-6 bg-black flex items-center justify-center">
                  <img src={image} alt="Rejected sample" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/detect')}
                  className="px-6 h-12 rounded-[14px] bg-[#275637] text-white font-extrabold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Scan Genuine Leaf Specimen</span>
                </button>
              </div>
            </div>
          </div>
        ) : (

        /* CASE 2: VALID CROP PATHOLOGY DIAGNOSIS */
        <div className="space-y-6 animate-card-in">
          
          {/* Top Disease Header Card */}
          <div className={`p-5 sm:p-6 rounded-[16px] border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#162F20] border-[#22C55E]/40 text-[#22C55E]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}>
                  {diagnosis.crop}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${diagnosis.severityColor}`}>
                  {diagnosis.severityGrade}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {diagnosis.diseaseName}
              </h2>
              <p className={`text-sm font-semibold ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                {diagnosis.kannadaName} • <span className="italic font-normal">{diagnosis.pathogen}</span>
              </p>
            </div>

            {/* Confidence Gauge */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`p-3 rounded-xl border text-center ${
                isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#F9F9F6] border-[#91BA94]'
              }`}>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#8BA695]">
                  Confidence
                </div>
                <div className="text-2xl font-black text-[#22C55E]">
                  {diagnosis.confidence}
                </div>
                <div className="text-[9px] text-[#8BA695]">
                  ResNet-18 Vision Model
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Grad-CAM Attention Heatmap Slider (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className={`p-4 sm:p-5 rounded-[16px] border shadow-xs ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#22C55E]" />
                    <h3 className="font-extrabold text-sm">
                      Grad-CAM Explainability Heatmap
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-[#162F20] border-[#1E3A2B] text-[#8BA695]' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                  }`}>
                    Drag Slider Below
                  </span>
                </div>

                {/* Interactive Slider Viewport */}
                <div className="relative aspect-square w-full max-w-md mx-auto rounded-[14px] overflow-hidden border border-[#91BA94]/40 shadow-inner select-none bg-black/10">
                  {/* Base Original Leaf */}
                  <img 
                    src={image} 
                    alt="Original specimen" 
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `/samples/sample_${diagnosis.cropKey || 'arecanut'}.jpg`;
                    }}
                  />

                  {/* Grad-CAM Heatmap Layer with variable opacity */}
                  {gradcamImageSrc ? (
                    <img 
                      src={gradcamImageSrc}
                      alt="Grad-CAM activation heatmap"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75 pointer-events-none"
                      style={{ opacity: sliderPos / 100 }}
                    />
                  ) : (
                    <>
                      <div 
                        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-color-dodge transition-opacity duration-75"
                        style={{ 
                          opacity: sliderPos / 100,
                          background: 'radial-gradient(circle at 55% 45%, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.75) 30%, rgba(0,255,0,0.5) 55%, transparent 75%)'
                        }}
                      />
                      {/* Subtle thermal scan overlay */}
                      <div 
                        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay transition-opacity duration-75"
                        style={{ 
                          opacity: (sliderPos / 100) * 0.8,
                          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 60, 0, 0.9) 15%, rgba(255, 230, 0, 0.6) 40%, transparent 70%)'
                        }}
                      />
                    </>
                  )}

                  {/* Top-Left Badge */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-semibold shadow-xs">
                    {sliderPos < 20 ? 'Original Photo' : sliderPos > 80 ? 'Grad-CAM Attention' : `Blend: ${sliderPos}%`}
                  </div>

                  {/* Bottom-Right Target Layer Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[10px] font-mono shadow-xs">
                    Target: Conv_layer4.2
                  </div>
                </div>

                {/* Slider Control */}
                <div className="mt-4 px-2 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#8BA695]">
                    <span>📷 Original Specimen</span>
                    <span>🔥 Grad-CAM Attention</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPos} 
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full accent-[#22C55E] cursor-ew-resize h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  />
                  <p className={`text-[11px] text-center ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Drag right to see the exact lesion pixels activating the ResNet-18 neural network.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Column: Plain Words Explanation & Expert Question Drafter (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* 1. EXPLAIN MY SCAN (In Plain Words - Zero Doses) */}
              <div className={`p-5 rounded-[16px] border shadow-xs space-y-3.5 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#22C55E]" />
                    <span>Explain My Scan (Plain Words)</span>
                  </h4>
                  
                  {/* Read Aloud TTS Button */}
                  <button
                    onClick={handleSpeakExplanation}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-[#22C55E] text-[#0B1712] border-[#22C55E]'
                        : isDark ? 'bg-[#142C1E] border-[#1E3A2B] text-gray-300 hover:text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                    }`}
                    title="Listen to explanation"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                    <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
                  </button>
                </div>

                {/* What it is */}
                <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">
                    What this disease does:
                  </span>
                  <p className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                    {currentExplanation}
                  </p>
                </div>

                {/* What severity means */}
                <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B]' : 'bg-[#FAFCFA] border-gray-200'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                    What this severity level means:
                  </span>
                  <p className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                    {currentSeverityMeaning}
                  </p>
                </div>

                {/* Practical Next Steps (Cultural, No Doses) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                    Recommended Next Steps:
                  </span>
                  {diagnosis.nextSteps?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[10.5px] text-gray-400 italic">
                  💡 Safe Guidance: Sasya AI provides cultural sanitation steps and does not prescribe chemical doses without expert confirmation.
                </div>
              </div>

              {/* 2. SUGGEST WHAT TO ASK AN EXPERT */}
              <div className={`p-5 rounded-[16px] border shadow-xs space-y-3 ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>Suggested Question for Expert</span>
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400">Pre-Drafted</span>
                </div>

                <div className={`p-3 rounded-xl border text-xs leading-relaxed font-mono ${
                  isDark ? 'bg-[#0A140F] border-[#1E3A2B] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  {suggestedQuestion}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleSendQuery(suggestedQuestion)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#275637] hover:bg-[#1E462B] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ask AI Agronomist</span>
                  </button>

                  <button
                    onClick={handleCopyQuestion}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedQuestion 
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isDark ? 'bg-[#142C1E] border-[#1E3A2B] text-white hover:border-[#22C55E]' : 'bg-white border-[#91BA94] text-[#275637]'
                    }`}
                  >
                    {copiedQuestion ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuestion ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <Link
                    to={`/c/${diagnosis.cropKey || 'arecanut'}?chat=open`}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Farmer Chat</span>
                  </Link>
                </div>
              </div>

              {/* 3. COMMUNITY DISCUSSION LINK */}
              <div className={`p-4 rounded-[16px] border shadow-xs flex items-center justify-between ${
                isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
              }`}>
                <div>
                  <div className="text-xs font-bold">Ask Local Growers</div>
                  <div className="text-[11px] text-gray-400">See if other farmers in s/{diagnosis.cropKey || 'arecanut'} have seen this</div>
                </div>

                <Link
                  to={`/c/${diagnosis.cropKey || 'arecanut'}`}
                  className="px-3.5 py-1.5 rounded-xl border border-[#91BA94] hover:bg-[#E8F2EA] dark:border-[#1E3A2B] dark:hover:bg-[#142C1E] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Feed</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

          {/* ── EMBEDDED AI AGRONOMIST CONSULTATION CONSOLE ── */}
          <div className={`p-5 sm:p-7 rounded-[20px] border shadow-md space-y-4 ${
            isDark ? 'bg-[#102217] border-[#1E3A2B]' : 'bg-white border-[#91BA94]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <span>Ask Sasya AI Agronomist About This Scan</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      AI Agronomist Active
                    </span>
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-[#8BA695]' : 'text-[#556B5C]'}`}>
                    Ask specific questions about this {diagnosis.crop} ({diagnosis.diseaseName}) diagnosis in Kannada, Hindi, or English.
                  </p>
                </div>
              </div>

              <Link
                to="/ai"
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>Full Screen Agronomist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Suggested Query Chips */}
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isAiTyping}
                  onClick={() => handleSendQuery(chip)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-left ${
                    isDark 
                      ? 'bg-[#0E1E16] border-[#1E3A2B] text-gray-200 hover:border-emerald-500 hover:text-white' 
                      : 'bg-[#FAFCFA] border-gray-200 text-gray-700 hover:border-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Conversation Log Container */}
            <div className={`p-4 rounded-2xl border max-h-[380px] overflow-y-auto space-y-3.5 ${
              isDark ? 'bg-[#0B1712] border-[#162C20]' : 'bg-[#F9F9F6] border-gray-200'
            }`}>
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#275637] text-white rounded-tr-xs font-medium'
                      : isDark
                      ? 'bg-[#12241A] text-gray-100 border border-[#1E3A2B] rounded-tl-xs'
                      : 'bg-white text-gray-800 border border-[#91BA94]/60 rounded-tl-xs shadow-xs'
                  }`}>
                    <RenderMessageText 
                      text={msg.text} 
                      onNavigate={(url) => navigate(url)} 
                    />

                    {/* Community Post Draft Card if drafted */}
                    {msg.draft && (
                      <div className={`mt-3 p-3.5 sm:p-4 rounded-xl border space-y-2 shadow-xs ${
                        isDark ? 'bg-[#0E1E16] border-[#22C55E]/40' : 'bg-[#F4F8F5] border-[#91BA94]'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            📝 Sasya Group Post Draft
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">s/{msg.draft.crop}</span>
                        </div>
                        <h5 className={`font-extrabold text-sm sm:text-base leading-snug ${
                          isDark ? 'text-white' : 'text-[#1B4329]'
                        }`}>
                          {msg.draft.title}
                        </h5>
                        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                          isDark ? 'text-gray-200' : 'text-[#2C3E32]'
                        }`}>
                          {msg.draft.content}
                        </p>
                        {(msg.draft.workers || msg.draft.wage) && (
                          <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold py-1">
                            {msg.draft.workers && <span>👥 {msg.draft.workers}</span>}
                            {msg.draft.wage && <span>💰 {msg.draft.wage}</span>}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.setItem('sasya_pending_community_draft', JSON.stringify(msg.draft));
                            navigate(`/c/${msg.draft.crop}`);
                          }}
                          className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#275637] hover:bg-[#1E462B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>🚀 Publish to s/{msg.draft.crop}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark ? 'bg-[#12241A] border-[#1E3A2B] text-gray-300' : 'bg-white border-gray-200 text-gray-600'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Analyzing agronomic protocol for {diagnosis.diseaseName}...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar with Voice & Send */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
              className="flex items-center gap-2 pt-1"
            >
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : isDark ? 'bg-[#142C1E] border-[#1E3A2B] text-gray-300 hover:text-white' : 'bg-[#E8F2EA] border-[#91BA94] text-[#275637]'
                }`}
                title={isListening ? 'Listening...' : 'Speak in Kannada, Hindi, or English'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder={
                  lang === 'kn'
                    ? `ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ${diagnosis.diseaseName} ಹರಡದಂತೆ ಏನು ಮಾಡಬೇಕು?)...`
                    : lang === 'hi'
                    ? `प्रश्न पूछें (उदा: ${diagnosis.diseaseName} रोकथाम हेतु क्या करें?)...`
                    : `Ask question (e.g. Can I spray Bordeaux today for this ${diagnosis.diseaseName}?)...`
                }
                className={`flex-1 min-h-[44px] text-base sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#22C55E] ${
                  isDark ? 'bg-[#0E1E16] border-[#1E3A2B] text-white placeholder-gray-500' : 'bg-[#FAFCFA] border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />

              <button
                type="submit"
                disabled={!chatQuery.trim() || isAiTyping}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                  chatQuery.trim() && !isAiTyping
                    ? 'bg-[#275637] hover:bg-[#1E462B] text-white hover:scale-105 active:scale-95'
                    : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="hidden xs:inline">Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
        )}

      </main>
    </div>
  );
}
