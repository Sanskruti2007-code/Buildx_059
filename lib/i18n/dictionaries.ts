export type Locale = 'en' | 'mr' | 'hi';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  pilotLocation: string;
  roleSwitcher: {
    citizen: string;
    volunteer: string;
    helpDesk: string;
    controlRoom: string;
  };
  helpDesk: {
    title: string;
    subtitle: string;
    reportMissingTab: string;
    reportFoundTab: string;
    crossDeskAlertsTab: string;
    childName: string;
    approxAge: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    clothingTop: string;
    clothingBottom: string;
    lastSeenLandmark: string;
    guardianPhone: string;
    generateOtp: string;
    otpSentMessage: string;
    submitCase: string;
    caseGenerated: string;
    otpPlaceholder: string;
    verifyOtp: string;
  };
  doubtReport: {
    badge: string;
    title: string;
    subheading: string;
    noBlameNotice: string;
    noBlameDetails: string;
    confidentialPromise: string;
    tabDoubt: string;
    tabSighting: string;
    finderName: string;
    finderPhone: string;
    finderLocation: string;
    childPhysicalStatus: string;
    whereIsChildNow: string;
    submitReport: string;
    thankYou: string;
    nextSteps: string;
  };
  alerts: {
    guardianMesh: string;
    orangeAlert: string;
    redAlert: string;
    activeSearchRadius: string;
    respondersNotified: string;
    escalateNow: string;
    reunitedSuccess: string;
  };
  crowd: {
    title: string;
    capacity: string;
    density: string;
    openGatesAdvisory: string;
    evacuateProtocol: string;
    simulatedTag: string;
    measuredTag: string;
  };
  matching: {
    matchDetected: string;
    highConfidenceMatch: string;
    potentialLead: string;
    faceScore: string;
    locationScore: string;
    timeScore: string;
    ageScore: string;
    clothingScore: string;
    compositeConfidence: string;
    humanVerificationRequired: string;
    confirmMatchBtn: string;
    dismissCandidateBtn: string;
  };
}

export const DICTIONARIES: Record<Locale, TranslationDictionary> = {
  en: {
    appName: "MEHFUS",
    appTagline: "Integrated Citizen-Authority Safety Network",
    pilotLocation: "Deeksha Bhoomi Ground, Nagpur",
    roleSwitcher: {
      citizen: "Citizen Portal",
      volunteer: "Guardian Volunteer",
      helpDesk: "Help-Desk Kiosk",
      controlRoom: "Control Room Command",
    },
    helpDesk: {
      title: "Help-Desk Rapid Incident Terminal",
      subtitle: "Emergency Child Safety Intake — Deeksha Bhoomi Police Assistance Center",
      reportMissingTab: "Report Missing Child",
      reportFoundTab: "I Found a Child (Doubt Report)",
      crossDeskAlertsTab: "Cross-Desk Broadcasts",
      childName: "Child's Full Name",
      approxAge: "Age (Years)",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      clothingTop: "Top Garment (Color/Pattern)",
      clothingBottom: "Bottom Garment (Color/Type)",
      lastSeenLandmark: "Last Seen Landmark / Gate",
      guardianPhone: "Guardian / Parent Mobile No.",
      generateOtp: "Send Verification OTP",
      otpSentMessage: "6-digit OTP sent to guardian. Verification required for alert dispatch.",
      submitCase: "Dispatch Guardian Mesh Alert",
      caseGenerated: "Case Successfully Registered with Case ID:",
      otpPlaceholder: "Enter 6-digit OTP",
      verifyOtp: "Verify & Authorize",
    },
    doubtReport: {
      badge: "No Blame • Confidential • Rapid Response",
      title: "I Found a Child — I Have a Doubt",
      subheading: "You do not need to be 100% sure. Trust your instinct and help us protect this child.",
      noBlameNotice: "Good-Faith Reporting Guaranteed",
      noBlameDetails: "You will never face police questioning or suspicion for reporting a child in good faith. Your quick action can save a life.",
      confidentialPromise: "Your identity remains strictly protected within official response channels.",
      tabDoubt: "I am Currently with the Child",
      tabSighting: "I Saw a Lost/Unattended Child (Sighting Tip)",
      finderName: "Your Full Name",
      finderPhone: "Your Contact Number",
      finderLocation: "Current Exact Location / Landmark",
      childPhysicalStatus: "Child's Current Condition (Crying, Asleep, Calm, Distressed)",
      whereIsChildNow: "Where is the child right now? (e.g. Near Stupa Gate 2 with me)",
      submitReport: "Submit Found Child Doubt Report",
      thankYou: "Report Received Immediately by Control Room",
      nextSteps: "Please stay with the child if safe. An authorized responder or help-desk volunteer is being routed to your coordinates.",
    },
    alerts: {
      guardianMesh: "GUARDIAN MESH ALERT",
      orangeAlert: "ORANGE ALERT: Active Child Search",
      redAlert: "RED ALERT: High Priority Escalation",
      activeSearchRadius: "Active Search Perimeter: 2.0 km",
      respondersNotified: "Responders Notified within Radius",
      escalateNow: "Escalate to Red Alert",
      reunitedSuccess: "CHILD SAFELY REUNITED & CASE CLOSED",
    },
    crowd: {
      title: "Deeksha Bhoomi Crowd Density Monitor",
      capacity: "Maximum Capacity",
      density: "Current Density",
      openGatesAdvisory: "ADVISORY: Open Auxiliary Gates & Reroute Inflow",
      evacuateProtocol: "CRITICAL: Activate Zone Evacuation Protocol",
      simulatedTag: "SIMULATED (Drill)",
      measuredTag: "MEASURED (IoT Sensors)",
    },
    matching: {
      matchDetected: "Potential Candidate Match Detected",
      highConfidenceMatch: "HIGH-PRIORITY MATCH CANDIDATE (Score >= 82%)",
      potentialLead: "Potential Lead for Officer Review",
      faceScore: "Facial Similarity",
      locationScore: "Spatial Proximity (Haversine)",
      timeScore: "Timeline Compatibility",
      ageScore: "Age Profile",
      clothingScore: "Garment Matching",
      compositeConfidence: "Composite Algorithmic Confidence",
      humanVerificationRequired: "Mandatory Human Verification: An authorized officer must physically confirm child identity before case resolution.",
      confirmMatchBtn: "Confirm Positive Match & Dispatch Officer",
      dismissCandidateBtn: "Dismiss Candidate as False Positive",
    },
  },
  mr: {
    appName: "महफूज (MEHFUS)",
    appTagline: "एकात्मिक नागरिक-प्रशासन सुरक्षा नेटवर्क",
    pilotLocation: "दीक्षाभूमी परिसर, नागपूर",
    roleSwitcher: {
      citizen: "नागरिक पोर्टल",
      volunteer: "सुरक्षा स्वयंसेवक",
      helpDesk: "मदत केंद्र किओस्क",
      controlRoom: "नियंत्रण कक्ष कमांड",
    },
    helpDesk: {
      title: "मदत केंद्र जलद नोंदणी टर्मिनल",
      subtitle: "आपत्कालीन बाल सुरक्षा कक्ष — दीक्षाभूमी पोलीस साहाय्य केंद्र",
      reportMissingTab: "हरवलेल्या बालकाची नोंद करा",
      reportFoundTab: "बालक सापडले (संशय नोंदवा)",
      crossDeskAlertsTab: "इतर मदत केंद्रांचे संदेश",
      childName: "बालकाचे पूर्ण नाव",
      approxAge: "अंदाजे वय (वर्षे)",
      gender: "लिंग",
      male: "मुलगा",
      female: "मुलगी",
      other: "इतर",
      clothingTop: "वरचे कपडे (रंग/प्रकार)",
      clothingBottom: "खालचे कपडे (पँट/स्कर्ट रंग)",
      lastSeenLandmark: "शेवटचे पाहिलेले ठिकाण / गेट",
      guardianPhone: "पालक / नातेवाईक मोबाईल क्र.",
      generateOtp: "पडताळणी OTP पाठवा",
      otpSentMessage: "पालकांच्या मोबाईलवर ६ अंकी OTP पाठवला आहे. सतर्कता जारी करण्यासाठी आवश्यक.",
      submitCase: "गार्डियन मेश अलर्ट जारी करा",
      caseGenerated: "केस यशस्वीरीत्या नोंदवली! केस क्रमांक:",
      otpPlaceholder: "६ अंकी OTP प्रविष्ट करा",
      verifyOtp: "पडताळणी करा आणि अलर्ट पाठवा",
    },
    doubtReport: {
      badge: "कोणताही दोष नाही • गोपनीय • त्वरित प्रतिसाद",
      title: "मला एक लहान मूल सापडले आहे — मला शंका आहे",
      subheading: "तुम्हाला १००% खात्री असण्याची गरज नाही. तुमच्या अंतःप्रेरणेवर विश्वास ठेवा आणि बालकाचे रक्षण करा.",
      noBlameNotice: "सद्भावनेने नोंदणीचे संरक्षण",
      noBlameDetails: "सद्भावनेने माहिती दिल्याबद्दल तुम्हाला कोणतीही पोलीस चौकशी किंवा त्रास होणार नाही. तुमचा त्वरित निर्णय एका बालकाचा जीव वाचवू शकतो.",
      confidentialPromise: "तुमची ओळख अधिकृत यंत्रणेमध्ये पूर्णपणे गोपनीय ठेवली जाते.",
      tabDoubt: "मूल सध्या माझ्या सोबत आहे",
      tabSighting: "मी एकटे फिरणारे मूल पाहिले (माहिती टीप)",
      finderName: "तुमचे पूर्ण नाव",
      finderPhone: "तुमचा संपर्क क्रमांक",
      finderLocation: "सध्याचे अचूक ठिकाण / जवळची खूण",
      childPhysicalStatus: "मुलाची सद्यस्थिती (रडत आहे, झोपले आहे, शांत आहे)",
      whereIsChildNow: "मूल आता नक्की कुठे आहे? (उदा. स्तूप गेट २ जवळ माझ्यासोबत)",
      submitReport: "संशय नोंद सबमिट करा",
      thankYou: "माहिती तात्काळ नियंत्रण कक्षाला प्राप्त झाली आहे",
      nextSteps: "कृपया शक्य असल्यास मुलासोबत राहा. जवळचे अधिकृत स्वयंसेवक किंवा पोलीस मदतनीस तुमच्याकडे येत आहेत.",
    },
    alerts: {
      guardianMesh: "गार्डियन मेश सतर्कता संदेश",
      orangeAlert: "ऑरेंज अलर्ट: शोध मोहीम सुरू",
      redAlert: "रेड अलर्ट: उच्च प्राधान्य आणीबाणी",
      activeSearchRadius: "सक्रिय शोध परिघ: २.० किमी",
      respondersNotified: "परिसरातील स्वयंसेवक व मदतनीस सतर्क",
      escalateNow: "रेड अलर्ट मध्ये रूपांतरित करा",
      reunitedSuccess: "बालक सुरक्षितपणे पालकांच्या ताब्यात पोहोचले!",
    },
    crowd: {
      title: "दीक्षाभूमी गर्दी घनता नियंत्रण",
      capacity: "कमाल क्षमता",
      density: "सध्याची गर्दी घनता",
      openGatesAdvisory: "सूचना: अतिरिक्त मार्ग उघडा आणि गर्दी वळवा",
      evacuateProtocol: "गंभीर: क्षेत्र रिकामे करण्याची मोहीम राबवा",
      simulatedTag: "सराव चाचणी (Simulated)",
      measuredTag: "थेट सेन्सर्स (Measured)",
    },
    matching: {
      matchDetected: "संभाव्य बालकाची ओळख जुळली",
      highConfidenceMatch: "उच्च प्राधान्य संभाव्य जुळणी (८२%+ समानता)",
      potentialLead: "अधिकाऱ्यांच्या तपासणीसाठी संभाव्य माहिती",
      faceScore: "चेहऱ्याची समानता",
      locationScore: "भौगोलिक समीपता (हावरसाइन)",
      timeScore: "वेळेची सुसंगतता",
      ageScore: "वय सुसंगतता",
      clothingScore: "कपड्यांची जुळणी",
      compositeConfidence: "एकत्रित अल्गोरिदम विश्वासार्हता",
      humanVerificationRequired: "मानवी पडताळणी अनिवार्य: केस बंद करण्यापूर्वी अधिकृत पोलीस अधिकाऱ्याने प्रत्यक्ष खात्री करणे बंधनकारक आहे.",
      confirmMatchBtn: "ओळख निश्चित करा आणि अधिकारी पाठवा",
      dismissCandidateBtn: "ही जुळणी चुकीची म्हणून फेटाळा",
    },
  },
  hi: {
    appName: "महफूज़ (MEHFUS)",
    appTagline: "एकीकृत नागरिक-प्रशासन सुरक्षा नेटवर्क",
    pilotLocation: "दीक्षाभूमि परिसर, नागपुर",
    roleSwitcher: {
      citizen: "नागरिक पोर्टल",
      volunteer: "सुरक्षा स्वयंसेवक",
      helpDesk: "सहायता केंद्र कियोस्क",
      controlRoom: "कंट्रोल रूम कमांड",
    },
    helpDesk: {
      title: "सहायता केंद्र त्वरित पंजीकरण टर्मिनल",
      subtitle: "आपातकालीन बाल सुरक्षा डेस्क — दीक्षाभूमि पुलिस सहायता केंद्र",
      reportMissingTab: "लापता बच्चे की रिपोर्ट करें",
      reportFoundTab: "बच्चा मिला (संदेह रिपोर्ट)",
      crossDeskAlertsTab: "अन्य सहायता केंद्रों के अलर्ट",
      childName: "बच्चे का पूरा नाम",
      approxAge: "अनुमानित आयु (वर्ष)",
      gender: "लिंग",
      male: "बालक",
      female: "बालिका",
      other: "अन्य",
      clothingTop: "ऊपरी वस्त्र (रंग/प्रकार)",
      clothingBottom: "निचले वस्त्र (पैंट/स्कर्ट रंग)",
      lastSeenLandmark: "अंतिम बार देखा गया स्थान / गेट",
      guardianPhone: "अभिभावक मोबाइल नंबर",
      generateOtp: "सत्यापन OTP भेजें",
      otpSentMessage: "अभिभावक के मोबाइल पर 6 अंकों का OTP भेजा गया है।",
      submitCase: "गार्डियन मेश अलर्ट जारी करें",
      caseGenerated: "केस सफलतापूर्वक दर्ज किया गया! केस आईडी:",
      otpPlaceholder: "6 अंकों का OTP दर्ज करें",
      verifyOtp: "सत्यापित करें और अलर्ट भेजें",
    },
    doubtReport: {
      badge: "कोई दोष नहीं • पूर्ण गोपनीयता • त्वरित कार्रवाई",
      title: "मुझे एक बच्चा मिला है — मुझे संदेह है",
      subheading: "आपको 100% निश्चित होने की आवश्यकता नहीं है। अपने अंतर्मन पर भरोसा करें और इस बच्चे की रक्षा में मदद करें।",
      noBlameNotice: "सद्भावना से दी गई सूचना का संरक्षण",
      noBlameDetails: "सद्भावना से सूचना देने पर आपको किसी पुलिस पूछताछ या परेशानी का सामना नहीं करना पड़ेगा। आपका त्वरित कदम एक जान बचा सकता है।",
      confidentialPromise: "आपकी पहचान आधिकारिक स्तर पर पूर्णतः गोपनीय रखी जाती है।",
      tabDoubt: "बच्चा वर्तमान में मेरे साथ है",
      tabSighting: "मैंने एक अकेला बच्चा देखा (सटीक सूचना)",
      finderName: "आपका पूरा नाम",
      finderPhone: "आपका संपर्क नंबर",
      finderLocation: "वर्तमान सटीक स्थान / नजदीकी लैंडमार्क",
      childPhysicalStatus: "बच्चे की स्थिति (रो रहा है, सो रहा है, शांत है)",
      whereIsChildNow: "बच्चा अभी कहाँ है? (उदा. स्तूप गेट 2 के पास मेरे साथ)",
      submitReport: "संदेह रिपोर्ट सबमिट करें",
      thankYou: "कंट्रोल रूम को सूचना तत्काल प्राप्त हो गई है",
      nextSteps: "यदि सुरक्षित हो तो कृपया बच्चे के साथ रहें। नजदीकी अधिकृत स्वयंसेवक या पुलिस सहायता आपके पास पहुँच रही है।",
    },
    alerts: {
      guardianMesh: "गार्डियन मेश अलर्ट संदेश",
      orangeAlert: "ऑरेंज अलर्ट: सक्रिय खोज अभियान",
      redAlert: "रेड अलर्ट: उच्च प्राथमिकता आपातकाल",
      activeSearchRadius: "सक्रिय खोज दायरा: 2.0 किमी",
      respondersNotified: "दायरे में सभी स्वयंसेवक व अधिकारी सतर्क",
      escalateNow: "रेड अलर्ट में अपग्रेड करें",
      reunitedSuccess: "बच्चा सुरक्षित रूप से अभिभावकों से मिल गया!",
    },
    crowd: {
      title: "दीक्षाभूमि भीड़ घनत्व नियंत्रण",
      capacity: "अधिकतम क्षमता",
      density: "वर्तमान भीड़ घनत्व",
      openGatesAdvisory: "परामर्श: अतिरिक्त द्वार खोलें और भीड़ को मोड़ें",
      evacuateProtocol: "गंभीर: क्षेत्र को खाली करने का प्रोटोकॉल लागू करें",
      simulatedTag: "मॉक ड्रिल (Simulated)",
      measuredTag: "सक्रिय सेंसर (Measured)",
    },
    matching: {
      matchDetected: "संभावित बच्चे का मिलान पाया गया",
      highConfidenceMatch: "उच्च प्राथमिकता मिलान उम्मीदवार (82%+ समानता)",
      potentialLead: "अधिकारियों की समीक्षा हेतु संभावित जानकारी",
      faceScore: "चेहरे की समानता",
      locationScore: "स्थान निकटता (हावरसाइन)",
      timeScore: "समय की अनुकूलता",
      ageScore: "आयु प्रोफाइल",
      clothingScore: "पहनावे की समानता",
      compositeConfidence: "समग्र एल्गोरिथम विश्वसनीयता",
      humanVerificationRequired: "मानवीय सत्यापन अनिवार्य: केस बंद करने से पूर्व अधिकृत पुलिस अधिकारी द्वारा प्रत्यक्ष पुष्टि आवश्यक है।",
      confirmMatchBtn: "सकारात्मक मिलान की पुष्टि करें",
      dismissCandidateBtn: "गलत मिलान के रूप में खारिज करें",
    },
  },
};
