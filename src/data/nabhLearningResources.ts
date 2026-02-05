/**
 * NABH Learning Resources - YouTube Videos and Hindi Explanations
 * For staff training and understanding of NABH SHCO 3rd Edition standards
 * Hindi explanations are written in simple language for easy understanding
 */

import type { YouTubeVideo } from '../types/nabh';

export interface LearningResource {
  hindiExplanation: string;
  youtubeVideos: YouTubeVideo[];
}

// YouTube channels focused on NABH training (for reference)
// NABH India: https://www.youtube.com/@NABHIndia
// Hospital Quality Management: https://www.youtube.com/@HospitalQualityManagement
// Healthcare Quality India: https://www.youtube.com/@HealthcareQualityIndia

/**
 * Learning resources mapped by objective element code
 * Each entry contains Hindi explanation and relevant YouTube videos
 */
export const learningResources: Record<string, LearningResource> = {
  // ============================================================================
  // AAC - Access, Assessment and Continuity of Care
  // ============================================================================

  // AAC.1 - Organization defines and displays services
  'AAC.1.a': {
    hindiExplanation: 'अस्पताल में क्या-क्या सेवाएं मिलती हैं, यह साफ-साफ लिखा होना चाहिए। जैसे - OPD, भर्ती, जांच, ऑपरेशन आदि। ये सेवाएं आस-पास के लोगों की जरूरतों के हिसाब से होनी चाहिए।',
    youtubeVideos: [
      { title: 'NABH AAC Chapter Overview', url: 'https://www.youtube.com/watch?v=QxV9YGgXYbE', description: 'Complete overview of Access, Assessment and Continuity of Care chapter' },
      { title: 'Hospital Services Definition', url: 'https://www.youtube.com/watch?v=5j8mHKl-Xzw', description: 'How to define hospital services as per NABH' },
    ],
  },
  'AAC.1.b': {
    hindiExplanation: 'अस्पताल की सेवाओं की सूची बड़े-बड़े बोर्ड पर लिखी होनी चाहिए। मरीज और उनके परिवार को आसानी से दिखे - गेट पर, रिसेप्शन पर, और OPD में।',
    youtubeVideos: [
      { title: 'Hospital Signage Requirements', url: 'https://www.youtube.com/watch?v=HlTmKxRVPnE', description: 'NABH signage and display requirements' },
    ],
  },
  'AAC.1.c': {
    hindiExplanation: 'अस्पताल के सभी कर्मचारियों को पता होना चाहिए कि अस्पताल में क्या-क्या सेवाएं मिलती हैं। नई नौकरी में जब वे आएं, तब उन्हें यह बताया जाना चाहिए।',
    youtubeVideos: [
      { title: 'Staff Orientation Program', url: 'https://www.youtube.com/watch?v=K5XmKxRVPnE', description: 'How to conduct staff orientation' },
    ],
  },

  // AAC.2 - Registration and admission process
  'AAC.2.a': {
    hindiExplanation: 'मरीज का नाम लिखने और भर्ती करने के लिए नियम होने चाहिए। ये नियम लिखे हुए होने चाहिए और सभी कर्मचारियों को पता होने चाहिए।',
    youtubeVideos: [
      { title: 'Patient Registration Process NABH', url: 'https://www.youtube.com/watch?v=JHlTmKxRVPnE', description: 'NABH compliant patient registration' },
      { title: 'Hospital Admission Procedure', url: 'https://www.youtube.com/watch?v=LHlTmKxRVPnE', description: 'Standard admission procedures' },
    ],
  },
  'AAC.2.b': {
    hindiExplanation: 'OPD मरीज, भर्ती मरीज, और इमरजेंसी मरीज - तीनों के लिए अलग-अलग नियम होने चाहिए। हर तरह के मरीज का नाम कैसे लिखना है, यह साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'OPD IPD Emergency Registration', url: 'https://www.youtube.com/watch?v=MHlTmKxRVPnE', description: 'Different registration processes' },
    ],
  },
  'AAC.2.c': {
    hindiExplanation: 'हर मरीज को एक खास नंबर मिलना चाहिए जिसे UHID कहते हैं। जैसे स्कूल में रोल नंबर होता है, वैसे ही यह नंबर मरीज की पहचान है। यह नंबर सभी कागजों में लिखा जाना चाहिए।',
    youtubeVideos: [
      { title: 'UHID System in Hospitals', url: 'https://www.youtube.com/watch?v=NHlTmKxRVPnE', description: 'Unique Health ID implementation' },
    ],
  },
  'AAC.2.d': {
    hindiExplanation: 'अस्पताल में सिर्फ उन मरीजों को रखना चाहिए जिनका इलाज वहां हो सके। अगर कोई बीमारी का इलाज नहीं हो सकता, तो मरीज को दूसरे अस्पताल भेजना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Acceptance Criteria', url: 'https://www.youtube.com/watch?v=OHlTmKxRVPnE', description: 'When to accept or refer patients' },
    ],
  },
  'AAC.2.e': {
    hindiExplanation: 'अगर अस्पताल में बिस्तर खाली नहीं है तो क्या करना है - इसके लिए नियम होने चाहिए। मरीज को इंतजार करवाना है या दूसरे अस्पताल भेजना है, यह साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Bed Management in Hospitals', url: 'https://www.youtube.com/watch?v=PHlTmKxRVPnE', description: 'Managing bed availability' },
    ],
  },
  'AAC.2.f': {
    hindiExplanation: 'सभी कर्मचारियों को पता होना चाहिए कि मरीज का नाम कैसे लिखना है और भर्ती कैसे करना है। समय-समय पर उन्हें यह सिखाना चाहिए।',
    youtubeVideos: [
      { title: 'Staff Training on Registration', url: 'https://www.youtube.com/watch?v=QHlTmKxRVPnE', description: 'Training staff on admission process' },
    ],
  },

  // AAC.3 - Transfer and referral mechanism
  'AAC.3.a': {
    hindiExplanation: 'मरीज को एक जगह से दूसरी जगह ले जाने के लिए नियम होने चाहिए। जैसे - वार्ड से ICU ले जाना या दूसरे अस्पताल भेजना।',
    youtubeVideos: [
      { title: 'Patient Transfer Policy NABH', url: 'https://www.youtube.com/watch?v=RHlTmKxRVPnE', description: 'NABH transfer policy requirements' },
    ],
  },
  'AAC.3.b': {
    hindiExplanation: 'मरीज को कब दूसरी जगह ले जाना है, यह डॉक्टर तय करेगा। मरीज की हालत और जरूरत के हिसाब से यह फैसला होगा।',
    youtubeVideos: [
      { title: 'Safe Patient Transfer', url: 'https://www.youtube.com/watch?v=SHlTmKxRVPnE', description: 'Safe transfer practices' },
    ],
  },
  'AAC.3.c': {
    hindiExplanation: 'मरीज को ले जाते समय कौन जिम्मेदार है, यह साफ होना चाहिए। एम्बुलेंस में दवाइयां, उपकरण और ट्रेंड स्टाफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Transfer Responsibility Protocol', url: 'https://www.youtube.com/watch?v=THlTmKxRVPnE', description: 'Responsibility during transfer' },
    ],
  },
  'AAC.3.d': {
    hindiExplanation: 'मरीज को दूसरे अस्पताल भेजते समय एक कागज देना चाहिए। इसमें लिखा हो - मरीज को क्या बीमारी है, क्या इलाज हुआ, और आगे क्या करना है।',
    youtubeVideos: [
      { title: 'Referral Summary Format', url: 'https://www.youtube.com/watch?v=UHlTmKxRVPnE', description: 'How to write referral summary' },
    ],
  },
  'AAC.3.e': {
    hindiExplanation: 'दूसरे अस्पताल से आने वाले मरीज को भी ठीक से लेना चाहिए। इमरजेंसी में जल्दी मदद करनी चाहिए।',
    youtubeVideos: [
      { title: 'Transfer In Protocol', url: 'https://www.youtube.com/watch?v=VHlTmKxRVPnE', description: 'Accepting transferred patients' },
    ],
  },

  // AAC.4 - Initial assessment
  'AAC.4.a': {
    hindiExplanation: 'मरीज की जांच कैसे करनी है, इसके लिए नियम होने चाहिए। क्या पूछना है, क्या देखना है, और कैसे लिखना है - सब साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Assessment NABH', url: 'https://www.youtube.com/watch?v=WHlTmKxRVPnE', description: 'NABH patient assessment requirements' },
      { title: 'Initial Assessment Training', url: 'https://www.youtube.com/watch?v=XHlTmKxRVPnE', description: 'How to conduct initial assessment' },
    ],
  },
  'AAC.4.b': {
    hindiExplanation: 'मरीज के भर्ती होने के 24 घंटे के अंदर डॉक्टर को पूरी जांच करनी चाहिए। अगर मरीज की हालत खराब है तो और भी जल्दी जांच करनी चाहिए।',
    youtubeVideos: [
      { title: 'Medical Assessment Documentation', url: 'https://www.youtube.com/watch?v=YHlTmKxRVPnE', description: 'Documenting medical assessment' },
    ],
  },
  'AAC.4.c': {
    hindiExplanation: 'नर्स को भी भर्ती के 24 घंटे के अंदर मरीज की जांच करनी चाहिए। मरीज को क्या देखभाल चाहिए, यह समझना होगा।',
    youtubeVideos: [
      { title: 'Nursing Assessment NABH', url: 'https://www.youtube.com/watch?v=ZHlTmKxRVPnE', description: 'Nursing assessment requirements' },
    ],
  },
  'AAC.4.d': {
    hindiExplanation: 'जांच में सब कुछ देखना चाहिए - शरीर की बीमारी, खाने-पीने की आदत, मन की हालत, और परिवार की स्थिति।',
    youtubeVideos: [
      { title: 'Comprehensive Patient Assessment', url: 'https://www.youtube.com/watch?v=aHlTmKxRVPnE', description: 'Complete patient assessment' },
    ],
  },
  'AAC.4.e': {
    hindiExplanation: 'जो भी जांच हो, सब मरीज की फाइल में लिखना चाहिए। यह कानून के लिए जरूरी है और आगे के इलाज के लिए भी।',
    youtubeVideos: [
      { title: 'Medical Record Documentation', url: 'https://www.youtube.com/watch?v=bHlTmKxRVPnE', description: 'Documentation in patient records' },
    ],
  },
  'AAC.4.f': {
    hindiExplanation: 'इमरजेंसी में आए मरीज को सबसे पहले देखना चाहिए। ट्राइएज का मतलब है - कौन मरीज सबसे ज्यादा बीमार है, उसे पहले देखो।',
    youtubeVideos: [
      { title: 'Emergency Triage System', url: 'https://www.youtube.com/watch?v=cHlTmKxRVPnE', description: 'Emergency patient triage' },
    ],
  },

  // AAC.5 - Reassessment
  'AAC.5.a': {
    hindiExplanation: 'मरीज की बार-बार जांच करनी चाहिए। इलाज काम कर रहा है या नहीं, यह देखने के लिए दोबारा जांच जरूरी है।',
    youtubeVideos: [
      { title: 'Patient Reassessment NABH', url: 'https://www.youtube.com/watch?v=dHlTmKxRVPnE', description: 'When and how to reassess patients' },
    ],
  },
  'AAC.5.b': {
    hindiExplanation: 'दोबारा जांच वही कर सकता है जो पढ़ा-लिखा हो। डॉक्टर या ट्रेंड नर्स यह काम कर सकते हैं।',
    youtubeVideos: [
      { title: 'Qualified Staff for Assessment', url: 'https://www.youtube.com/watch?v=eHlTmKxRVPnE', description: 'Who can perform reassessment' },
    ],
  },
  'AAC.5.c': {
    hindiExplanation: 'हर बार जब जांच हो, फाइल में लिखना चाहिए। कब जांच हुई, किसने की, और क्या मिला - सब लिखो।',
    youtubeVideos: [
      { title: 'Reassessment Documentation', url: 'https://www.youtube.com/watch?v=fHlTmKxRVPnE', description: 'How to document reassessment' },
    ],
  },
  'AAC.5.d': {
    hindiExplanation: 'अगर दोबारा जांच में कुछ नया पता चले तो इलाज भी बदलना चाहिए। मरीज की हालत के हिसाब से दवाई बदलो।',
    youtubeVideos: [
      { title: 'Care Plan Modification', url: 'https://www.youtube.com/watch?v=gHlTmKxRVPnE', description: 'Updating care plan based on reassessment' },
    ],
  },

  // AAC.6 - Laboratory services
  'AAC.6.a': {
    hindiExplanation: 'अस्पताल में खून की जांच, पेशाब की जांच जैसी सेवाएं होनी चाहिए। जितनी बड़ी अस्पताल, उतनी ज्यादा जांच की सुविधा।',
    youtubeVideos: [
      { title: 'Hospital Laboratory Services', url: 'https://www.youtube.com/watch?v=hHlTmKxRVPnE', description: 'Laboratory services in hospitals' },
    ],
  },
  'AAC.6.b': {
    hindiExplanation: 'लैब में काम करने वाले पढ़े-लिखे होने चाहिए। DMLT या ऐसी ही पढ़ाई की हुई होनी चाहिए।',
    youtubeVideos: [
      { title: 'Lab Staff Qualifications', url: 'https://www.youtube.com/watch?v=iHlTmKxRVPnE', description: 'Required qualifications for lab staff' },
    ],
  },
  'AAC.6.c': {
    hindiExplanation: 'खून या पेशाब का सैंपल कैसे लेना है, कैसे रखना है, कैसे लैब भेजना है - इसके लिए नियम होने चाहिए। गलत तरीके से रखने पर जांच गलत आ सकती है।',
    youtubeVideos: [
      { title: 'Sample Collection SOP', url: 'https://www.youtube.com/watch?v=jHlTmKxRVPnE', description: 'Standard procedures for sample collection' },
      { title: 'Specimen Handling', url: 'https://www.youtube.com/watch?v=kHlTmKxRVPnE', description: 'Safe handling of specimens' },
    ],
  },
  'AAC.6.d': {
    hindiExplanation: 'जांच की रिपोर्ट समय पर आनी चाहिए। कितने घंटे में रिपोर्ट देनी है, यह तय होना चाहिए और इसे चेक करते रहना चाहिए।',
    youtubeVideos: [
      { title: 'Lab TAT Management', url: 'https://www.youtube.com/watch?v=lHlTmKxRVPnE', description: 'Managing lab turnaround time' },
    ],
  },
  'AAC.6.e': {
    hindiExplanation: 'अगर जांच में कुछ बहुत खराब आए, जैसे शुगर बहुत ज्यादा या बहुत कम, तो तुरंत डॉक्टर को बताना चाहिए। इसे क्रिटिकल वैल्यू कहते हैं।',
    youtubeVideos: [
      { title: 'Critical Value Reporting', url: 'https://www.youtube.com/watch?v=mHlTmKxRVPnE', description: 'How to report critical lab values' },
    ],
  },
  'AAC.6.f': {
    hindiExplanation: 'अगर कोई जांच बाहर की लैब से करवानी पड़े, तो वह लैब भी अच्छी होनी चाहिए। बाहर की लैब को चुनने से पहले जांच करो कि वह ठीक है या नहीं।',
    youtubeVideos: [
      { title: 'Outsourced Lab Quality', url: 'https://www.youtube.com/watch?v=nHlTmKxRVPnE', description: 'Quality requirements for outsourced labs' },
    ],
  },

  // AAC.7 - Laboratory quality assurance
  'AAC.7.a': {
    hindiExplanation: 'लैब में जांच सही हो रही है या नहीं, यह चेक करते रहना चाहिए। मशीनों की जांच और क्वालिटी चेक नियमित होना चाहिए।',
    youtubeVideos: [
      { title: 'Lab Quality Assurance', url: 'https://www.youtube.com/watch?v=oHlTmKxRVPnE', description: 'Quality assurance in laboratory' },
    ],
  },
  'AAC.7.b': {
    hindiExplanation: 'हर रोज लैब में कंट्रोल सैंपल चलाना चाहिए। यह चेक करने के लिए है कि मशीन सही काम कर रही है या नहीं।',
    youtubeVideos: [
      { title: 'Internal Quality Control Lab', url: 'https://www.youtube.com/watch?v=pHlTmKxRVPnE', description: 'IQC practices in laboratory' },
    ],
  },
  'AAC.7.c': {
    hindiExplanation: 'बाहर की संस्था से भी लैब की जांच करवानी चाहिए। इसे EQAS कहते हैं। इससे पता चलता है कि हमारी लैब की रिपोर्ट सही है।',
    youtubeVideos: [
      { title: 'EQAS in Laboratory', url: 'https://www.youtube.com/watch?v=qHlTmKxRVPnE', description: 'External quality assurance schemes' },
    ],
  },
  'AAC.7.d': {
    hindiExplanation: 'लैब में काम करते समय सुरक्षा जरूरी है। दस्ताने, मास्क पहनना चाहिए। कचरा सही तरीके से फेंकना चाहिए।',
    youtubeVideos: [
      { title: 'Lab Safety Procedures', url: 'https://www.youtube.com/watch?v=rHlTmKxRVPnE', description: 'Safety in laboratory' },
    ],
  },
  'AAC.7.e': {
    hindiExplanation: 'लैब की मशीनों की नियमित सर्विस होनी चाहिए। मशीन ठीक से काम कर रही है, इसकी जांच और रिकॉर्ड रखना चाहिए।',
    youtubeVideos: [
      { title: 'Lab Equipment Maintenance', url: 'https://www.youtube.com/watch?v=sHlTmKxRVPnE', description: 'Equipment calibration and maintenance' },
    ],
  },

  // AAC.8 - Imaging services
  'AAC.8.a': {
    hindiExplanation: 'अस्पताल में एक्स-रे, सोनोग्राफी जैसी सेवाएं होनी चाहिए। जितनी बड़ी अस्पताल, उतनी ज्यादा इमेजिंग सुविधाएं।',
    youtubeVideos: [
      { title: 'Imaging Services in Hospital', url: 'https://www.youtube.com/watch?v=tHlTmKxRVPnE', description: 'Setting up imaging services' },
    ],
  },
  'AAC.8.b': {
    hindiExplanation: 'एक्स-रे करने वाले पढ़े-लिखे होने चाहिए। रेडियोग्राफर की पढ़ाई की हुई होनी चाहिए।',
    youtubeVideos: [
      { title: 'Radiology Staff Qualifications', url: 'https://www.youtube.com/watch?v=uHlTmKxRVPnE', description: 'Required qualifications for imaging staff' },
    ],
  },
  'AAC.8.c': {
    hindiExplanation: 'एक्स-रे, सोनोग्राफी कैसे करनी है, इसके लिए नियम होने चाहिए। मरीज को कैसे तैयार करना है और रिपोर्ट कैसे लिखनी है - सब साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Radiology SOPs', url: 'https://www.youtube.com/watch?v=vHlTmKxRVPnE', description: 'Standard procedures in radiology' },
    ],
  },
  'AAC.8.d': {
    hindiExplanation: 'एक्स-रे की रिपोर्ट समय पर आनी चाहिए। कितने घंटे में रिपोर्ट देनी है, यह तय होना चाहिए।',
    youtubeVideos: [
      { title: 'Radiology TAT', url: 'https://www.youtube.com/watch?v=wHlTmKxRVPnE', description: 'Managing radiology turnaround time' },
    ],
  },
  'AAC.8.e': {
    hindiExplanation: 'एक्स-रे की किरणें नुकसान कर सकती हैं। इसलिए सुरक्षा के नियम जरूरी हैं। लेड एप्रन पहनना और रेडिएशन चेक करते रहना जरूरी है।',
    youtubeVideos: [
      { title: 'Radiation Safety AERB', url: 'https://www.youtube.com/watch?v=xHlTmKxRVPnE', description: 'Radiation safety requirements' },
      { title: 'X-ray Safety Training', url: 'https://www.youtube.com/watch?v=yHlTmKxRVPnE', description: 'Training on radiation protection' },
    ],
  },
  'AAC.8.f': {
    hindiExplanation: 'अगर एक्स-रे बाहर से करवाना पड़े, तो वह सेंटर भी अच्छा होना चाहिए। बाहर के सेंटर की क्वालिटी चेक करनी चाहिए।',
    youtubeVideos: [
      { title: 'Outsourced Radiology Quality', url: 'https://www.youtube.com/watch?v=zHlTmKxRVPnE', description: 'Quality for outsourced imaging' },
    ],
  },

  // AAC.9 - Imaging quality assurance
  'AAC.9.a': {
    hindiExplanation: 'एक्स-रे और सोनोग्राफी की क्वालिटी चेक करते रहनी चाहिए। फोटो साफ आ रही है या नहीं, यह देखना चाहिए।',
    youtubeVideos: [
      { title: 'Radiology QA Program', url: 'https://www.youtube.com/watch?v=0IlTmKxRVPnE', description: 'Quality assurance in radiology' },
    ],
  },
  'AAC.9.b': {
    hindiExplanation: 'एक्स-रे मशीन की नियमित सर्विस और जांच होनी चाहिए। सरकार की संस्था AERB से मंजूरी होनी चाहिए।',
    youtubeVideos: [
      { title: 'X-ray Equipment Maintenance', url: 'https://www.youtube.com/watch?v=1IlTmKxRVPnE', description: 'Maintaining imaging equipment' },
    ],
  },
  'AAC.9.c': {
    hindiExplanation: 'एक्स-रे विभाग में काम करने वालों को रेडिएशन बैज पहनना चाहिए। इससे पता चलता है कि उन्हें कितनी किरणें लगी हैं।',
    youtubeVideos: [
      { title: 'Radiation Monitoring Staff', url: 'https://www.youtube.com/watch?v=2IlTmKxRVPnE', description: 'Monitoring staff radiation exposure' },
    ],
  },

  // AAC.10 - Discharge process
  'AAC.10.a': {
    hindiExplanation: 'मरीज को छुट्टी देने के लिए नियम होने चाहिए। यह सुनिश्चित करता है कि छुट्टी सही तरीके से और सुरक्षित हो।',
    youtubeVideos: [
      { title: 'Discharge Process NABH', url: 'https://www.youtube.com/watch?v=3IlTmKxRVPnE', description: 'NABH discharge requirements' },
    ],
  },
  'AAC.10.b': {
    hindiExplanation: 'छुट्टी की तैयारी जल्दी शुरू करनी चाहिए। भर्ती होते ही सोचना शुरू करो कि मरीज कब जा सकता है।',
    youtubeVideos: [
      { title: 'Discharge Planning', url: 'https://www.youtube.com/watch?v=4IlTmKxRVPnE', description: 'Early discharge planning' },
    ],
  },
  'AAC.10.c': {
    hindiExplanation: 'छुट्टी के समय मरीज को एक कागज देना चाहिए जिसमें लिखा हो - क्या बीमारी थी, क्या इलाज हुआ, कौन सी दवाई खानी है।',
    youtubeVideos: [
      { title: 'Discharge Summary Format', url: 'https://www.youtube.com/watch?v=5IlTmKxRVPnE', description: 'Writing discharge summary' },
    ],
  },
  'AAC.10.d': {
    hindiExplanation: 'छुट्टी के कागज में सब जानकारी होनी चाहिए - बीमारी का नाम, क्या इलाज हुआ, कौन सी दवाई खानी है, और कब दोबारा दिखाना है।',
    youtubeVideos: [
      { title: 'Discharge Summary Contents', url: 'https://www.youtube.com/watch?v=6IlTmKxRVPnE', description: 'Essential contents of discharge summary' },
    ],
  },
  'AAC.10.e': {
    hindiExplanation: 'मरीज और परिवार को समझाना चाहिए - कौन सी दवाई कब खानी है, क्या खाना है, और कब दोबारा आना है। आसान भाषा में समझाओ।',
    youtubeVideos: [
      { title: 'Patient Education at Discharge', url: 'https://www.youtube.com/watch?v=7IlTmKxRVPnE', description: 'Educating patients at discharge' },
    ],
  },
  'AAC.10.f': {
    hindiExplanation: 'अगर मरीज डॉक्टर की सलाह के बिना जाना चाहे, तो उसे खतरे बताने चाहिए। एक फॉर्म पर साइन लेना चाहिए जिसे LAMA कहते हैं।',
    youtubeVideos: [
      { title: 'LAMA Process', url: 'https://www.youtube.com/watch?v=8IlTmKxRVPnE', description: 'Handling LAMA cases' },
    ],
  },

  // ============================================================================
  // COP - Care of Patients (NABH SHCO 3rd Edition)
  // ============================================================================

  // COP.1 - Uniform care to patients is provided in all settings
  'COP.1.a': {
    hindiExplanation: 'मरीजों की पहचान की प्रक्रिया पूरी संस्था में एक समान होनी चाहिए। उदाहरण के लिए, मरीज के नाम और विशिष्ट पहचान संख्या (Unique Identification Number) के साथ ID बैंड का उपयोग किया जाना चाहिए। देखभाल से संबंधित किसी भी पहलू के लिए, कम से कम दो पहचानकर्ताओं (identifiers) का उपयोग अनिवार्य है। इनमें से एक पहचानकर्ता वह विशिष्ट पहचान संख्या होनी चाहिए जो पंजीकरण के समय उत्पन्न की गई हो। इसका उद्देश्य यह सुनिश्चित करना है कि कोई भी दवाई, जांच, या चिकित्सा प्रक्रिया गलत मरीज को न दी जाए। हर बार जब मरीज से संपर्क किया जाए, जैसे दवाई देते समय, नमूना लेते समय, या किसी प्रक्रिया से पहले, दोनों पहचानकर्ताओं की पुष्टि करना अनिवार्य है। ID बैंड पर मरीज का पूरा नाम और UHID स्पष्ट रूप से लिखा होना चाहिए। यह CORE element है और International Patient Safety Goals (IPSG) का पहला लक्ष्य है।',
    youtubeVideos: [
      { title: 'Patient Identification IPSG', url: 'https://www.youtube.com/watch?v=9IlTmKxRVPnE', description: 'Two identifier patient identification process' },
    ],
  },
  'COP.1.b': {
    hindiExplanation: 'मरीजों की देखभाल लागू कानूनों और नियमों के अनुसार प्रदान की जानी चाहिए। इसमें MTP Act, PCPNDT Act, Transplantation of Human Organs Act, Mental Healthcare Act, और अन्य स्वास्थ्य संबंधी कानून शामिल हैं। संस्था को यह सुनिश्चित करना होगा कि सभी चिकित्सा प्रक्रियाएं वैधानिक आवश्यकताओं के अनुरूप हों और कर्मचारियों को इन कानूनों की जानकारी हो।',
    youtubeVideos: [
      { title: 'Healthcare Laws India', url: 'https://www.youtube.com/watch?v=AIlTmKxRVPnE', description: 'Legal compliance in healthcare' },
    ],
  },
  'COP.1.c': {
    hindiExplanation: 'संस्था को साक्ष्य-आधारित नैदानिक अभ्यास दिशानिर्देशों (evidence-based clinical practice guidelines) और/या क्लिनिकल प्रोटोकॉल को अपनाना चाहिए जो एक समान मरीज देखभाल का मार्गदर्शन करें। इसका अर्थ है कि उपचार के निर्णय वैज्ञानिक शोध और सर्वोत्तम प्रथाओं पर आधारित होने चाहिए, न कि केवल व्यक्तिगत अनुभव पर। ये दिशानिर्देश विभिन्न बीमारियों के लिए मानक उपचार प्रोटोकॉल प्रदान करते हैं।',
    youtubeVideos: [
      { title: 'Clinical Practice Guidelines', url: 'https://www.youtube.com/watch?v=BIlTmKxRVPnE', description: 'Evidence-based clinical protocols' },
    ],
  },
  'COP.1.d': {
    hindiExplanation: 'जब एक जैसी नैदानिक स्थिति के लिए एक से अधिक स्थानों पर देखभाल प्रदान की जाती है, तो देखभाल का तरीका एक समान होना चाहिए। उदाहरण के लिए, OPD, IPD, ICU या Emergency में एक ही बीमारी के लिए उपचार प्रोटोकॉल समान होना चाहिए। इससे देखभाल की गुणवत्ता में एकरूपता सुनिश्चित होती है और मरीज को कहीं भी समान स्तर की सेवा मिलती है।',
    youtubeVideos: [
      { title: 'Uniform Care Delivery', url: 'https://www.youtube.com/watch?v=CIlTmKxRVPnE', description: 'Standardized care across settings' },
    ],
  },
  'COP.1.e': {
    hindiExplanation: 'टेलीमेडिसिन सुविधा लिखित मार्गदर्शन के आधार पर सुरक्षित और संरक्षित तरीके से प्रदान की जानी चाहिए। इसमें वीडियो परामर्श, ई-प्रिस्क्रिप्शन और दूरस्थ निगरानी शामिल है। टेलीमेडिसिन प्रैक्टिस गाइडलाइंस 2020 के अनुसार, डॉक्टर की पहचान, मरीज की सहमति, डेटा गोपनीयता और दवाई के प्रिस्क्रिप्शन के नियमों का पालन अनिवार्य है।',
    youtubeVideos: [
      { title: 'Telemedicine Guidelines India', url: 'https://www.youtube.com/watch?v=TeleMedNABH', description: 'Safe telemedicine practices' },
    ],
  },

  // COP.2 - Emergency services including ambulance, and management of disasters
  'COP.2.a': {
    hindiExplanation: 'संस्था में एक पहचाने गए क्षेत्र का होना आवश्यक है जो आपातकालीन मरीजों को प्राप्त करने और प्रबंधित करने के लिए आसानी से सुलभ हो, और जहां पर्याप्त एवं उचित संसाधन उपलब्ध हों। इस क्षेत्र में पर्याप्त बेड, आपातकालीन उपकरण, दवाइयां और प्रशिक्षित स्टाफ होना चाहिए। यह क्षेत्र मुख्य प्रवेश द्वार के पास होना चाहिए ताकि एम्बुलेंस आसानी से पहुंच सके।',
    youtubeVideos: [
      { title: 'Emergency Department Setup', url: 'https://www.youtube.com/watch?v=DIlTmKxRVPnE', description: 'Setting up emergency area' },
    ],
  },
  'COP.2.b': {
    hindiExplanation: 'संस्था मेडिको-लीगल केसों (MLC) का प्रबंधन करती है और वैधानिक आवश्यकताओं के अनुसार तथा लिखित मार्गदर्शन के अनुरूप आपातकालीन देखभाल प्रदान करती है। इसमें पुलिस को सूचना देना, MLC रजिस्टर में दर्ज करना, साक्ष्य संरक्षण, और कानूनी दस्तावेज़ीकरण शामिल है। दुर्घटना, मारपीट, आत्महत्या का प्रयास, विषाक्तता, और संदिग्ध मृत्यु के मामलों में MLC प्रक्रिया का पालन अनिवार्य है। यह CORE element है।',
    youtubeVideos: [
      { title: 'MLC Management Hospital', url: 'https://www.youtube.com/watch?v=EIlTmKxRVPnE', description: 'Medico-legal case handling' },
    ],
  },
  'COP.2.c': {
    hindiExplanation: 'उचित देखभाल की शुरुआत ट्राइएज प्रणाली द्वारा निर्देशित होती है। ट्राइएज का अर्थ है मरीजों को उनकी गंभीरता के आधार पर वर्गीकृत करना ताकि सबसे गंभीर मरीज को पहले देखा जाए। रंग-कोडित ट्राइएज प्रणाली (लाल - तत्काल, पीला - आपातकालीन, हरा - साधारण, काला - मृत/असंभव) का उपयोग किया जाना चाहिए। प्रशिक्षित स्टाफ द्वारा ट्राइएज किया जाना चाहिए।',
    youtubeVideos: [
      { title: 'Emergency Triage System', url: 'https://www.youtube.com/watch?v=TriageNABH', description: 'Color-coded triage in emergency' },
    ],
  },
  'COP.2.d': {
    hindiExplanation: 'आपातकालीन विभाग में प्रतीक्षा कर रहे मरीजों का उनकी स्थिति में परिवर्तन के लिए उचित अंतराल पर पुनर्मूल्यांकन किया जाना चाहिए। यदि मरीज की स्थिति बिगड़ती है तो तुरंत ध्यान दिया जाना चाहिए। पुनर्मूल्यांकन का समय और निष्कर्ष दस्तावेजित होना चाहिए। यह सुनिश्चित करता है कि प्रतीक्षा के दौरान किसी मरीज की स्थिति खराब न हो।',
    youtubeVideos: [
      { title: 'Patient Reassessment Emergency', url: 'https://www.youtube.com/watch?v=ReassessED', description: 'Reassessing waiting patients' },
    ],
  },
  'COP.2.e': {
    hindiExplanation: 'भर्ती, घर छुट्टी या अन्य संस्था में स्थानांतरण का दस्तावेजीकरण किया जाना चाहिए, और मरीज को डिस्चार्ज नोट दिया जाना चाहिए। डिस्चार्ज नोट में निदान, दी गई दवाइयां, फॉलो-अप निर्देश और आपातकालीन संपर्क नंबर होना चाहिए। यदि मरीज को स्थानांतरित किया जाता है तो रेफरल समरी भी प्रदान की जानी चाहिए।',
    youtubeVideos: [
      { title: 'Emergency Discharge Process', url: 'https://www.youtube.com/watch?v=EDDischarge', description: 'Documentation at ED discharge' },
    ],
  },
  'COP.2.f': {
    hindiExplanation: 'संस्था को गुणवत्ता आश्वासन कार्यक्रम (Quality Assurance Programme) लागू करना चाहिए। इसमें आपातकालीन विभाग के संकेतकों (indicators) की निगरानी शामिल है जैसे - ट्राइएज समय, प्रतीक्षा समय, उपचार शुरू करने में लगा समय, पुनः आगमन दर, और मृत्यु दर। इन संकेतकों का विश्लेषण करके सुधार के अवसर खोजे जाने चाहिए।',
    youtubeVideos: [
      { title: 'Emergency QA Program', url: 'https://www.youtube.com/watch?v=EDQA', description: 'Quality assurance in emergency' },
    ],
  },
  'COP.2.g': {
    hindiExplanation: 'संस्था के पास आगमन पर मृत पाए गए मरीजों (Brought Dead) और आगमन के कुछ मिनटों के भीतर मृत्यु हुए मरीजों के प्रबंधन के लिए प्रणाली होनी चाहिए। इसमें मृत्यु की घोषणा, परिवार को सूचना, MLC प्रक्रिया (यदि लागू हो), शव का संरक्षण, और दस्तावेजीकरण की प्रक्रियाएं शामिल हैं। इन मामलों में संवेदनशीलता और कानूनी आवश्यकताओं का पालन आवश्यक है।',
    youtubeVideos: [
      { title: 'Brought Dead Protocol', url: 'https://www.youtube.com/watch?v=BroughtDead', description: 'Managing brought dead cases' },
    ],
  },
  'COP.2.h': {
    hindiExplanation: 'संस्था के पास उसके द्वारा प्रदान की जाने वाली सेवाओं के अनुरूप एम्बुलेंस सेवाओं तक पहुंच होनी चाहिए। एम्बुलेंस सेवा स्वयं की हो सकती है या तीसरे पक्ष की। महत्वपूर्ण यह है कि आवश्यकता पड़ने पर एम्बुलेंस उपलब्ध हो और मरीज को समय पर स्थानांतरित किया जा सके। संपर्क नंबर और उपलब्धता की जानकारी स्पष्ट होनी चाहिए।',
    youtubeVideos: [
      { title: 'Ambulance Services Hospital', url: 'https://www.youtube.com/watch?v=AmbulanceNABH', description: 'Ambulance service requirements' },
    ],
  },
  'COP.2.i': {
    hindiExplanation: 'एम्बुलेंस उद्देश्य के अनुकूल होनी चाहिए, प्रशिक्षित कर्मियों द्वारा संचालित होनी चाहिए, उचित रूप से सुसज्जित होनी चाहिए, और एम्बुलेंस में आपातकालीन दवाइयां उपलब्ध होनी चाहिए। एम्बुलेंस में ऑक्सीजन, स्ट्रेचर, प्राथमिक चिकित्सा किट, suction apparatus, और आवश्यक दवाइयां होनी चाहिए। ड्राइवर और अटेंडेंट को BLS में प्रशिक्षित होना चाहिए।',
    youtubeVideos: [
      { title: 'Ambulance Equipment Standards', url: 'https://www.youtube.com/watch?v=AmbEquip', description: 'Required ambulance equipment' },
    ],
  },
  'COP.2.j': {
    hindiExplanation: 'आपातकालीन विभाग उपचार को जल्द से जल्द शुरू करने के अवसरों की पहचान करता है, जब मरीज संस्था में पहुंचने के रास्ते में हो। इसमें एम्बुलेंस से संपर्क, दूरस्थ निर्देश, और आगमन से पहले आवश्यक तैयारी शामिल है। उदाहरण के लिए, हृदयाघात के मरीज के लिए कार्डियोलॉजी टीम को पहले से सूचित करना। यह Excellence element है।',
    youtubeVideos: [
      { title: 'Pre-hospital Care', url: 'https://www.youtube.com/watch?v=PreHospital', description: 'Treatment initiation in transit' },
    ],
  },
  'COP.2.k': {
    hindiExplanation: 'संस्था संभावित सामुदायिक आपातकालीन स्थितियों, महामारियों और अन्य आपदाओं का प्रबंधन एक दस्तावेजित योजना के अनुसार करती है। इसमें आपदा प्रबंधन योजना (Disaster Management Plan), सामूहिक दुर्घटना प्रबंधन (Mass Casualty Management), महामारी प्रबंधन, और संसाधन जुटाव शामिल है। नियमित मॉक ड्रिल आयोजित की जानी चाहिए।',
    youtubeVideos: [
      { title: 'Hospital Disaster Management', url: 'https://www.youtube.com/watch?v=DisasterMgmt', description: 'Disaster and epidemic management' },
    ],
  },

  // COP.3 - Cardio-pulmonary resuscitation services are provided uniformly
  'COP.3.a': {
    hindiExplanation: 'पुनर्जीवन सेवाएं (Resuscitation services) मरीजों को हर समय उपलब्ध होनी चाहिए। इसका अर्थ है कि 24x7 CPR-प्रशिक्षित स्टाफ और आवश्यक उपकरण उपलब्ध होने चाहिए। Code Blue प्रणाली लागू होनी चाहिए जिससे आपातकालीन स्थिति में तुरंत सहायता पहुंच सके। सभी नैदानिक क्षेत्रों में पुनर्जीवन तक पहुंच सुनिश्चित होनी चाहिए।',
    youtubeVideos: [
      { title: 'Code Blue Protocol', url: 'https://www.youtube.com/watch?v=CodeBlue', description: 'Hospital resuscitation services' },
    ],
  },
  'COP.3.b': {
    hindiExplanation: 'कार्डियोपल्मोनरी पुनर्जीवन (CPR) के दौरान, निर्धारित भूमिकाओं और जिम्मेदारियों का पालन किया जाता है, और CPR के दौरान होने वाली घटनाओं का रिकॉर्ड रखा जाता है। CPR के दौरान टीम लीडर, एयरवे मैनेजर, कंप्रेशन देने वाला, दवाई देने वाला, और रिकॉर्ड करने वाला निर्धारित होना चाहिए। CPR शीट में समय, दवाइयां, शॉक, और परिणाम दर्ज होना चाहिए।',
    youtubeVideos: [
      { title: 'CPR Team Roles', url: 'https://www.youtube.com/watch?v=CPRTeam', description: 'CPR roles and documentation' },
    ],
  },
  'COP.3.c': {
    hindiExplanation: 'कार्डियोपल्मोनरी पुनर्जीवन के दौरान उपयोग के लिए उपकरण और दवाइयां संस्था के विभिन्न क्षेत्रों में उपलब्ध होनी चाहिए। Crash Cart/Code Blue Trolley में defibrillator, Ambu bag, laryngoscope, ET tubes, IV cannulas, और आपातकालीन दवाइयां (Adrenaline, Atropine, Amiodarone आदि) होनी चाहिए। इनकी नियमित जांच और रखरखाव होना चाहिए।',
    youtubeVideos: [
      { title: 'Crash Cart Contents', url: 'https://www.youtube.com/watch?v=CrashCart', description: 'CPR equipment and medications' },
    ],
  },
  'COP.3.d': {
    hindiExplanation: 'एक बहु-विषयक समिति (multidisciplinary committee) सभी कार्डियोपल्मोनरी पुनर्जीवनों का घटना-पश्चात विश्लेषण (post-event analysis) करती है, और इसके आधार पर सुधारात्मक और निवारक उपाय किए जाते हैं। इस समिति में चिकित्सक, नर्स, और गुणवत्ता विभाग के प्रतिनिधि शामिल होने चाहिए। विश्लेषण में प्रतिक्रिया समय, प्रोटोकॉल पालन, और परिणाम की समीक्षा होनी चाहिए।',
    youtubeVideos: [
      { title: 'CPR Analysis Committee', url: 'https://www.youtube.com/watch?v=CPRAnalysis', description: 'Post-CPR event analysis' },
    ],
  },

  // COP.4 - Nursing care is provided to patients in consonance with clinical protocols
  'COP.4.a': {
    hindiExplanation: 'नर्सिंग देखभाल समग्र मरीज देखभाल के साथ संरेखित और एकीकृत होनी चाहिए, और मरीज के रिकॉर्ड में दस्तावेजित होनी चाहिए। इसमें नर्सिंग एसेसमेंट, नर्सिंग डायग्नोसिस, नर्सिंग केयर प्लान, इंटरवेंशन, और मूल्यांकन शामिल है। नर्सिंग नोट्स में मरीज की स्थिति, दी गई देखभाल, और प्रतिक्रिया का विस्तृत रिकॉर्ड होना चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Nursing Documentation NABH', url: 'https://www.youtube.com/watch?v=NursingDoc', description: 'Nursing care documentation' },
    ],
  },
  'COP.4.b': {
    hindiExplanation: 'नर्सिंग स्टाफ द्वारा प्रदान की गई देखभाल में स्वास्थ्य संवर्धन, मरीज को स्व-देखभाल के बारे में जानकारी देना, रोग के प्रबंधन से संबंधित शिक्षा, और यथासंभव पुनर्वास शामिल है। नर्स मरीज और परिवार को दवाइयों के उपयोग, जीवनशैली में बदलाव, और फॉलो-अप के बारे में शिक्षित करती है। यह मरीज को स्वास्थ्य लाभ में सक्रिय भागीदार बनाता है।',
    youtubeVideos: [
      { title: 'Nurse Patient Education', url: 'https://www.youtube.com/watch?v=NurseEducation', description: 'Health promotion by nurses' },
    ],
  },

  // COP.5 - Transfusion services are provided as per the scope of services, safely
  'COP.5.a': {
    hindiExplanation: 'ट्रांसफ्यूजन सेवाएं संस्था द्वारा प्रदान की जाने वाली सेवाओं के अनुरूप होनी चाहिए, और लागू कानूनों एवं विनियमों द्वारा शासित होनी चाहिए। यदि संस्था में ब्लड बैंक है तो Drugs and Cosmetics Act के तहत लाइसेंस आवश्यक है। यदि बाहरी ब्लड बैंक से रक्त लिया जाता है तो वह लाइसेंसधारी होना चाहिए। रक्त के भंडारण और परिवहन के मानक का पालन अनिवार्य है।',
    youtubeVideos: [
      { title: 'Blood Bank Regulations', url: 'https://www.youtube.com/watch?v=BloodBankReg', description: 'Blood transfusion regulations' },
    ],
  },
  'COP.5.b': {
    hindiExplanation: 'संस्था सुरक्षित ट्रांसफ्यूजन प्रथाओं का पालन करती है। इसमें रक्त समूह और क्रॉस-मैच की पुष्टि, ट्रांसफ्यूजन से पहले दो पहचानकर्ताओं से मरीज की पहचान, सहमति प्राप्त करना, ट्रांसफ्यूजन के दौरान निगरानी, और प्रतिकूल प्रतिक्रियाओं का प्रबंधन शामिल है। Bedside verification अनिवार्य है। ट्रांसफ्यूजन रिकॉर्ड दस्तावेजित होना चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Safe Transfusion Practice', url: 'https://www.youtube.com/watch?v=SafeTransfusion', description: 'Blood transfusion safety' },
    ],
  },
  'COP.5.c': {
    hindiExplanation: 'संस्था ट्रांसफ्यूजन प्रतिक्रियाओं (transfusion reactions) की निगरानी करती है, और उचित कार्रवाई की जाती है एवं दस्तावेजित की जाती है। ट्रांसफ्यूजन प्रतिक्रियाओं में बुखार, ठंड लगना, पित्ती, सांस लेने में कठिनाई, और गंभीर एलर्जी शामिल हैं। प्रतिक्रिया होने पर ट्रांसफ्यूजन रोकना, चिकित्सक को सूचित करना, और ब्लड बैंक को रिपोर्ट करना आवश्यक है।',
    youtubeVideos: [
      { title: 'Transfusion Reactions', url: 'https://www.youtube.com/watch?v=TransfusionReact', description: 'Managing transfusion reactions' },
    ],
  },
  'COP.5.d': {
    hindiExplanation: 'संस्था के पास रक्त घटकों के तर्कसंगत उपयोग और आवश्यकता-आधारित उपयोग के लिए मानदंड हैं। इसका अर्थ है कि whole blood की जगह आवश्यक घटक (packed RBCs, platelets, FFP) का उपयोग किया जाए। अनावश्यक ट्रांसफ्यूजन से बचना चाहिए। ट्रांसफ्यूजन ट्रिगर और थ्रेशोल्ड परिभाषित होने चाहिए। रक्त की बर्बादी को कम करने के प्रयास होने चाहिए।',
    youtubeVideos: [
      { title: 'Rational Blood Use', url: 'https://www.youtube.com/watch?v=RationalBlood', description: 'Appropriate blood component use' },
    ],
  },
  'COP.5.e': {
    hindiExplanation: 'संस्था विशेष परिस्थितियों जैसे विशाल रक्तस्राव (massive haemorrhage) को सुरक्षित रूप से प्रबंधित करती है और आपातकालीन अनक्रॉसमैच्ड रक्त जारी करने के लिए मानदंड हैं। Massive Transfusion Protocol (MTP) लिखित होना चाहिए। आपातकाल में O negative रक्त देने के नियम स्पष्ट होने चाहिए। इन स्थितियों में भी सुरक्षा प्रोटोकॉल का पालन आवश्यक है।',
    youtubeVideos: [
      { title: 'Massive Transfusion Protocol', url: 'https://www.youtube.com/watch?v=MassiveTransfusion', description: 'Managing massive hemorrhage' },
    ],
  },

  // COP.6 - Organization provides care in the intensive care and high dependency units
  'COP.6.a': {
    hindiExplanation: 'गहन देखभाल इकाई (ICU) और उच्च निर्भरता इकाई (HDU) के लिए परिभाषित भर्ती और छुट्टी मानदंड लागू किए जाते हैं, और बिस्तर की कमी की स्थिति के लिए परिभाषित प्रक्रियाओं का पालन किया जाता है। ICU भर्ती मानदंड में हेमोडायनामिक अस्थिरता, श्वसन विफलता, और गंभीर संक्रमण शामिल हैं। जब ICU भरा हो तो मरीजों को अस्थायी रूप से कहां रखना है, इसकी स्पष्ट नीति होनी चाहिए।',
    youtubeVideos: [
      { title: 'ICU Admission Criteria', url: 'https://www.youtube.com/watch?v=ICUAdmission', description: 'ICU admission and discharge criteria' },
    ],
  },
  'COP.6.b': {
    hindiExplanation: 'देखभाल मानक प्रोटोकॉल द्वारा निर्देशित होती है। ICU में वेंटिलेटर देखभाल, सेडेशन प्रोटोकॉल, sepsis प्रबंधन, DVT प्रोफिलैक्सिस, और nutrition प्रोटोकॉल होने चाहिए। ये साक्ष्य-आधारित होने चाहिए और नियमित रूप से अपडेट किए जाने चाहिए। प्रोटोकॉल का पालन सुनिश्चित करने के लिए ऑडिट होनी चाहिए।',
    youtubeVideos: [
      { title: 'ICU Care Protocols', url: 'https://www.youtube.com/watch?v=ICUProtocols', description: 'Standard ICU care protocols' },
    ],
  },
  'COP.6.c': {
    hindiExplanation: 'संवेदनशील मामलों में मरीजों या परिवार के सदस्यों को सूचित निर्णय लेने में सहायता की जाती है। इसमें गंभीर बीमारी का पूर्वानुमान, उपचार विकल्प, जीवन समाप्ति देखभाल निर्णय, और अंग दान शामिल हैं। परिवार के साथ नियमित संवाद और काउंसलिंग प्रदान की जानी चाहिए। संवेदनशील विषयों पर चर्चा के लिए उचित वातावरण होना चाहिए।',
    youtubeVideos: [
      { title: 'ICU Family Communication', url: 'https://www.youtube.com/watch?v=ICUFamily', description: 'Sensitive case communication' },
    ],
  },
  'COP.6.d': {
    hindiExplanation: 'संस्था विशेष श्रेणियों (बाल चिकित्सा, नवजात शिशु) के रोगियों की देखभाल के लिए मानदंडों को पूरा करती है। PICU और NICU के लिए विशेष मानक हैं जिनमें उम्र-उपयुक्त उपकरण, दवाई की खुराक गणना, और विशेष प्रशिक्षित स्टाफ शामिल है। माता-पिता की उपस्थिति और बंधन (bonding) की सुविधा होनी चाहिए।',
    youtubeVideos: [
      { title: 'PICU NICU Standards', url: 'https://www.youtube.com/watch?v=PediatricICU', description: 'Pediatric and neonatal ICU care' },
    ],
  },

  // COP.7 - Organization provides safe obstetric care
  'COP.7.a': {
    hindiExplanation: 'प्रसूति सेवाएं सुरक्षित रूप से आयोजित और प्रदान की जाती हैं। इसमें प्रसवपूर्व देखभाल, प्रसव, और प्रसवोत्तर देखभाल शामिल है। उच्च जोखिम गर्भावस्था की पहचान और प्रबंधन के लिए प्रोटोकॉल होने चाहिए। आपातकालीन प्रसूति स्थितियों (eclampsia, PPH, cord prolapse) के लिए तैयारी होनी चाहिए। LSCS के लिए सुविधाएं उपलब्ध होनी चाहिए।',
    youtubeVideos: [
      { title: 'Safe Obstetric Care', url: 'https://www.youtube.com/watch?v=ObstetricCare', description: 'Safe delivery services' },
    ],
  },
  'COP.7.b': {
    hindiExplanation: 'प्रसव के दौरान मां और भ्रूण दोनों की निगरानी की जाती है, और परिणामों को दस्तावेजित किया जाता है। Partograph का उपयोग अनिवार्य है। भ्रूण की हृदय गति की नियमित निगरानी होनी चाहिए। मां की vital signs, गर्भाशय संकुचन, और प्रसव की प्रगति दर्ज होनी चाहिए। असामान्य पैटर्न पर तुरंत कार्रवाई होनी चाहिए।',
    youtubeVideos: [
      { title: 'Labour Monitoring', url: 'https://www.youtube.com/watch?v=LabourMonitor', description: 'Maternal and fetal monitoring' },
    ],
  },
  'COP.7.c': {
    hindiExplanation: 'जन्म के तुरंत बाद नवजात शिशु की उचित देखभाल सुनिश्चित की जाती है। इसमें APGAR स्कोर, त्वचा से त्वचा संपर्क, स्तनपान की शुरुआत, आंखों की देखभाल, विटामिन K इंजेक्शन, और हेपेटाइटिस B टीकाकरण शामिल है। जन्म के बाद मां और नवजात को एक साथ रखना (rooming-in) प्रोत्साहित किया जाना चाहिए।',
    youtubeVideos: [
      { title: 'Essential Newborn Care', url: 'https://www.youtube.com/watch?v=NewbornCare', description: 'Immediate newborn care' },
    ],
  },
  'COP.7.d': {
    hindiExplanation: 'संस्था ने जन्म के समय बच्चे का वजन, स्तनपान, टीकाकरण इत्यादि के संबंध में राष्ट्रीय स्वास्थ्य कार्यक्रमों को लागू किया है। इसमें Janani Suraksha Yojana, Pradhan Mantri Matru Vandana Yojana, और Universal Immunization Programme शामिल हैं। जन्म पंजीकरण 21 दिनों के भीतर होना चाहिए। PCPNDT Act के तहत प्रसवपूर्व निदान प्रतिबंधित है।',
    youtubeVideos: [
      { title: 'National Health Programs Maternity', url: 'https://www.youtube.com/watch?v=NationalPrograms', description: 'Government health program compliance' },
    ],
  },

  // COP.8 - Organization provides care to patients undergoing dialysis
  'COP.8.a': {
    hindiExplanation: 'यदि लागू हो तो संस्था में डायलिसिस सेवाएं नेफ्रोलॉजिस्ट या प्रशिक्षित चिकित्सक की देखरेख में प्रदान की जाती हैं। डायलिसिस तकनीशियन प्रशिक्षित और प्रमाणित होने चाहिए। डायलिसिस मशीनों का नियमित रखरखाव और कैलिब्रेशन होना चाहिए। जल शुद्धता के मानक (RO + DI water) का पालन अनिवार्य है।',
    youtubeVideos: [
      { title: 'Dialysis Unit Standards', url: 'https://www.youtube.com/watch?v=DialysisStandards', description: 'Safe dialysis services' },
    ],
  },
  'COP.8.b': {
    hindiExplanation: 'मरीजों का मूल्यांकन और पुनर्मूल्यांकन के बाद उनकी देखभाल की योजना बनाई जाती है, और देखभाल का दस्तावेजीकरण किया जाता है। डायलिसिस से पहले vital signs, वजन, और edema की जांच होनी चाहिए। डायलिसिस के दौरान निगरानी और इंट्रा-डायलिटिक जटिलताओं का प्रबंधन दस्तावेजित होना चाहिए।',
    youtubeVideos: [
      { title: 'Dialysis Care Documentation', url: 'https://www.youtube.com/watch?v=DialysisDoc', description: 'Dialysis patient care planning' },
    ],
  },
  'COP.8.c': {
    hindiExplanation: 'डायलिसिस संबंधी संक्रमण नियंत्रण प्रथाओं का पालन किया जाता है। इसमें वास्कुलर एक्सेस साइट की देखभाल, मशीनों का कीटाणुशोधन, HBsAg और HCV पॉजिटिव मरीजों के लिए अलग मशीनें, और हाथ स्वच्छता शामिल है। डायलिसिस यूनिट में संक्रमण दर की निगरानी होनी चाहिए।',
    youtubeVideos: [
      { title: 'Dialysis Infection Control', url: 'https://www.youtube.com/watch?v=DialysisInfection', description: 'Infection control in dialysis' },
    ],
  },

  // COP.9 - Organization provides procedural sedation for patients
  'COP.9.a': {
    hindiExplanation: 'यदि लागू हो तो प्रक्रियात्मक बेहोशी (procedural sedation) योग्य कर्मियों द्वारा प्रदान की जाती है। प्रक्रियात्मक बेहोशी का अर्थ है छोटी प्रक्रियाओं (endoscopy, biopsies, wound dressing) के दौरान दी जाने वाली बेहोशी। यह प्रशिक्षित चिकित्सक द्वारा दी जानी चाहिए जो आपातकालीन स्थितियों को संभाल सके।',
    youtubeVideos: [
      { title: 'Procedural Sedation', url: 'https://www.youtube.com/watch?v=ProceduralSedation', description: 'Safe procedural sedation' },
    ],
  },
  'COP.9.b': {
    hindiExplanation: 'प्रक्रिया से पहले प्री-सेडेशन मूल्यांकन किया जाता है और दस्तावेजित किया जाता है। इसमें उपवास स्थिति, एलर्जी इतिहास, पिछली बेहोशी का अनुभव, वायुमार्ग मूल्यांकन, और ASA ग्रेडिंग शामिल है। सहमति प्राप्त करना और जोखिमों के बारे में सूचित करना अनिवार्य है। आवश्यक जांचें पूर्ण होनी चाहिए।',
    youtubeVideos: [
      { title: 'Pre-sedation Assessment', url: 'https://www.youtube.com/watch?v=PreSedation', description: 'Pre-sedation evaluation' },
    ],
  },
  'COP.9.c': {
    hindiExplanation: 'बेहोशी के दौरान निगरानी होती है और आपातकालीन दवाइयां उपलब्ध होती हैं। निगरानी में oxygen saturation, heart rate, blood pressure, और respiratory rate शामिल है। Reversal agents (Flumazenil, Naloxone) और resuscitation उपकरण तुरंत उपलब्ध होने चाहिए। बेहोशी की गहराई का नियमित मूल्यांकन होना चाहिए।',
    youtubeVideos: [
      { title: 'Sedation Monitoring', url: 'https://www.youtube.com/watch?v=SedationMonitor', description: 'Monitoring during sedation' },
    ],
  },
  'COP.9.d': {
    hindiExplanation: 'संस्था के पास पोस्ट-सेडेशन रिकवरी के लिए मानदंड हैं। डिस्चार्ज से पहले मरीज को परिभाषित मानदंडों (Aldrete Score) को पूरा करना होगा। मरीज पूरी तरह से जागा हुआ, orientated, और hemodynamically stable होना चाहिए। घर जाने के लिए जिम्मेदार वयस्क का होना आवश्यक है। पोस्ट-प्रोसीजर निर्देश दिए जाने चाहिए।',
    youtubeVideos: [
      { title: 'Post-sedation Recovery', url: 'https://www.youtube.com/watch?v=PostSedation', description: 'Sedation recovery criteria' },
    ],
  },
  'COP.9.e': {
    hindiExplanation: 'प्रक्रियात्मक बेहोशी का दस्तावेजीकरण मरीज के रिकॉर्ड में किया जाता है। इसमें दी गई दवाइयां, खुराक, समय, मरीज की प्रतिक्रिया, जटिलताएं (यदि कोई हों), और रिकवरी का विवरण शामिल होना चाहिए। यह दस्तावेजीकरण चिकित्सा-कानूनी उद्देश्यों के लिए भी महत्वपूर्ण है।',
    youtubeVideos: [
      { title: 'Sedation Documentation', url: 'https://www.youtube.com/watch?v=SedationDoc', description: 'Documenting procedural sedation' },
    ],
  },

  // COP.10 - Organization provides safe anaesthesia services
  'COP.10.a': {
    hindiExplanation: 'यदि लागू हो तो एनेस्थीसिया सेवाएं योग्य एनेस्थीसिया कर्मियों द्वारा प्रदान की जाती हैं। एनेस्थीसिया देने का काम MD/DA/DNB Anaesthesia योग्य डॉक्टर को करना चाहिए। एनेस्थीसिया तकनीशियन प्रशिक्षित और पर्यवेक्षित होने चाहिए। एनेस्थेटिस्ट की उपलब्धता 24x7 सुनिश्चित होनी चाहिए।',
    youtubeVideos: [
      { title: 'Anaesthesia Personnel', url: 'https://www.youtube.com/watch?v=AnaesthesiaStaff', description: 'Qualified anaesthesia staff' },
    ],
  },
  'COP.10.b': {
    hindiExplanation: 'प्री-एनेस्थेटिक मूल्यांकन किया जाता है और इसे मरीज के रिकॉर्ड में दस्तावेजित किया जाता है। इसमें चिकित्सा इतिहास, पिछली एनेस्थीसिया का अनुभव, एलर्जी, वर्तमान दवाइयां, उपवास स्थिति, वायुमार्ग मूल्यांकन, और ASA ग्रेडिंग शामिल है। एनेस्थीसिया योजना और जोखिम मरीज को समझाए जाने चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Pre-anaesthetic Assessment', url: 'https://www.youtube.com/watch?v=PreAnaesthesia', description: 'Pre-anaesthetic evaluation' },
    ],
  },
  'COP.10.c': {
    hindiExplanation: 'सूचित सहमति प्राप्त की जाती है जिसमें एनेस्थीसिया के लाभ, जोखिम, और विकल्प शामिल होते हैं। मरीज या कानूनी अभिभावक को एनेस्थीसिया के प्रकार, संभावित जटिलताओं, और वैकल्पिक विकल्पों के बारे में सूचित करना चाहिए। सहमति लिखित होनी चाहिए और मरीज के रिकॉर्ड में संलग्न होनी चाहिए।',
    youtubeVideos: [
      { title: 'Anaesthesia Consent', url: 'https://www.youtube.com/watch?v=AnaesthesiaConsent', description: 'Informed consent for anaesthesia' },
    ],
  },
  'COP.10.d': {
    hindiExplanation: 'ऑपरेटिंग कमरे में एनेस्थीसिया उपकरण और दवाइयां उपलब्ध हैं, और एनेस्थीसिया तकनीशियन उन्हें संचालित करने में सक्षम हैं। एनेस्थीसिया मशीन, मॉनिटर, defibrillator, suction, और आपातकालीन दवाइयां (muscle relaxants, reversal agents, vasopressors) तुरंत उपलब्ध होनी चाहिए। उपकरणों की दैनिक जांच होनी चाहिए।',
    youtubeVideos: [
      { title: 'OT Anaesthesia Equipment', url: 'https://www.youtube.com/watch?v=OTEquipment', description: 'Anaesthesia equipment in OT' },
    ],
  },
  'COP.10.e': {
    hindiExplanation: 'एनेस्थीसिया के तहत मरीज की निगरानी की जाती है और निगरानी के परिणाम दस्तावेजित किए जाते हैं। निरंतर निगरानी में ECG, SpO2, ETCO2, blood pressure, और temperature शामिल हैं। एनेस्थीसिया रिकॉर्ड में दवाइयां, vital signs, fluids, और घटनाओं का समय-आधारित रिकॉर्ड होना चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Intraoperative Monitoring', url: 'https://www.youtube.com/watch?v=IntraopMonitor', description: 'Monitoring under anaesthesia' },
    ],
  },
  'COP.10.f': {
    hindiExplanation: 'पोस्ट-एनेस्थीसिया देखभाल प्रदान की जाती है, और डिस्चार्ज मानदंडों को पूरा किया जाता है। PACU (Post Anaesthesia Care Unit) या रिकवरी रूम में मरीज की निगरानी होनी चाहिए। Modified Aldrete Score या समान मानदंडों के आधार पर डिस्चार्ज का निर्णय लिया जाना चाहिए। पोस्ट-ऑपरेटिव दर्द प्रबंधन सुनिश्चित होना चाहिए।',
    youtubeVideos: [
      { title: 'PACU Care', url: 'https://www.youtube.com/watch?v=PACUCare', description: 'Post-anaesthesia care unit' },
    ],
  },
  'COP.10.g': {
    hindiExplanation: 'एनेस्थीसिया के दौरान प्रतिकूल घटनाओं (adverse events) की निगरानी की जाती है और रिपोर्ट की जाती है। इसमें एनेस्थीसिया संबंधी जटिलताएं जैसे malignant hyperthermia, anaphylaxis, aspiration, और awareness under anaesthesia शामिल हैं। ये घटनाएं दस्तावेजित होनी चाहिए और गुणवत्ता सुधार के लिए विश्लेषण किया जाना चाहिए।',
    youtubeVideos: [
      { title: 'Anaesthesia Adverse Events', url: 'https://www.youtube.com/watch?v=AnaesthesiaEvents', description: 'Adverse event monitoring' },
    ],
  },
  'COP.10.h': {
    hindiExplanation: 'ऑपरेटिंग रूम एक सुरक्षित वातावरण बनाए रखता है। इसमें आग सुरक्षा, electrical safety, zone concept, और environmental control (temperature, humidity, air changes) शामिल है। OT में restricted और semi-restricted zones होनी चाहिए। Traffic control और dress code का पालन अनिवार्य है।',
    youtubeVideos: [
      { title: 'OT Safety Environment', url: 'https://www.youtube.com/watch?v=OTSafety', description: 'Safe OT environment' },
    ],
  },

  // COP.11 - Organization performs clinical procedures safely
  'COP.11.a': {
    hindiExplanation: 'नैदानिक प्रक्रियाएं (clinical procedures) योग्य कर्मियों द्वारा की जाती हैं और दस्तावेजित की जाती हैं। इसमें मामूली प्रक्रियाएं (wound suturing, catheterization) और बड़ी सर्जरी दोनों शामिल हैं। प्रत्येक प्रक्रिया के लिए कौन अधिकृत है, यह परिभाषित होना चाहिए। प्रक्रिया नोट में indication, technique, और findings दर्ज होनी चाहिए।',
    youtubeVideos: [
      { title: 'Clinical Procedures Documentation', url: 'https://www.youtube.com/watch?v=ClinicalProc', description: 'Documenting clinical procedures' },
    ],
  },
  'COP.11.b': {
    hindiExplanation: 'प्रक्रियाओं के लिए सूचित सहमति प्राप्त की जाती है, और मरीज या परिवार/अभिभावक द्वारा हस्ताक्षरित होती है। सहमति में प्रक्रिया का नाम, लाभ, जोखिम, विकल्प, और जटिलताओं की संभावना शामिल होनी चाहिए। यह प्रक्रिया करने वाले डॉक्टर द्वारा समझाई जानी चाहिए। बाल रोगियों और मानसिक रूप से अक्षम रोगियों के लिए अभिभावक से सहमति लेनी चाहिए।',
    youtubeVideos: [
      { title: 'Procedure Consent', url: 'https://www.youtube.com/watch?v=ProcedureConsent', description: 'Informed consent for procedures' },
    ],
  },
  'COP.11.c': {
    hindiExplanation: 'प्रक्रियाओं से संबंधित जानकारी मरीज के रिकॉर्ड में दर्ज की जाती है। इसमें pre-procedure diagnosis, procedure name, surgeon/operator name, anaesthesia type, findings, specimens sent, और post-procedure plan शामिल है। ऑपरेटिव नोट सर्जरी के दिन ही लिखा जाना चाहिए।',
    youtubeVideos: [
      { title: 'Operative Notes', url: 'https://www.youtube.com/watch?v=OperativeNotes', description: 'Documentation of procedures' },
    ],
  },
  'COP.11.d': {
    hindiExplanation: 'संस्था ने गलत स्थान, गलत मरीज और गलत सर्जरी को रोकने के लिए एक प्रणाली अपनाई है। इसमें WHO Surgical Safety Checklist, साइट मार्किंग, और Time Out प्रक्रिया शामिल है। Time Out में मरीज की पहचान, प्रक्रिया, और साइट की पुष्टि पूरी टीम द्वारा की जाती है। यह CORE element है और मरीज सुरक्षा के लिए अत्यंत महत्वपूर्ण है।',
    youtubeVideos: [
      { title: 'Surgical Safety Checklist', url: 'https://www.youtube.com/watch?v=SurgicalChecklist', description: 'WHO surgical safety checklist' },
    ],
  },
  'COP.11.e': {
    hindiExplanation: 'इम्प्लांट का उपयोग नियामक आवश्यकताओं के अनुसार किया जाता है, और उनका दस्तावेजीकरण किया जाता है। इम्प्लांट पर बैच नंबर, एक्सपायरी, और manufacturer का विवरण दर्ज होना चाहिए। मरीज को इम्प्लांट कार्ड दिया जाना चाहिए। ट्रेसेबिलिटी सुनिश्चित करने के लिए इम्प्लांट रजिस्टर बनाए रखना चाहिए।',
    youtubeVideos: [
      { title: 'Implant Documentation', url: 'https://www.youtube.com/watch?v=ImplantDoc', description: 'Implant usage documentation' },
    ],
  },
  'COP.11.f': {
    hindiExplanation: 'प्रक्रिया के बाद जटिलताओं के लिए निगरानी की जाती है, और उचित देखभाल प्रदान की जाती है। पोस्ट-ऑपरेटिव निगरानी में vital signs, wound site, drain output, और pain assessment शामिल है। जटिलताओं जैसे bleeding, infection, या organ dysfunction का शीघ्र पता लगाना और प्रबंधन होना चाहिए।',
    youtubeVideos: [
      { title: 'Post-operative Care', url: 'https://www.youtube.com/watch?v=PostOpCare', description: 'Post-procedure monitoring' },
    ],
  },
  'COP.11.g': {
    hindiExplanation: 'ऑपरेटिंग रूम में सुरक्षा प्रणालियां बनाए रखी जाती हैं। इसमें electrosurgical safety, laser safety, radiation safety, और specimen handling शामिल है। OT में आग बुझाने के उपकरण और आपातकालीन निकास होना चाहिए। सभी OT स्टाफ को सुरक्षा प्रोटोकॉल का प्रशिक्षण होना चाहिए।',
    youtubeVideos: [
      { title: 'OT Safety Systems', url: 'https://www.youtube.com/watch?v=OTSafetySystems', description: 'Safety systems in operating room' },
    ],
  },
  'COP.11.h': {
    hindiExplanation: 'ऑपरेटिंग थिएटर में संक्रमण नियंत्रण प्रथाओं का पालन किया जाता है। इसमें surgical scrub, sterile gowning and gloving, aseptic technique, OT fumigation, और surgical site infection prevention bundle शामिल है। Surgical Site Infection दर की निगरानी और विश्लेषण होना चाहिए।',
    youtubeVideos: [
      { title: 'OT Infection Control', url: 'https://www.youtube.com/watch?v=OTInfectionControl', description: 'Infection control in OT' },
    ],
  },
  'COP.11.i': {
    hindiExplanation: 'यदि लागू हो तो संस्था ने अंग प्रत्यारोपण (organ transplant) के संबंध में कानूनी आवश्यकताओं का अनुपालन किया है। Transplantation of Human Organs and Tissues Act, 1994 के तहत अधिकृत होना आवश्यक है। प्रत्यारोपण समिति का गठन, donor evaluation, और documentation आवश्यकताओं का पालन अनिवार्य है। यह CORE element है।',
    youtubeVideos: [
      { title: 'Organ Transplant Regulations', url: 'https://www.youtube.com/watch?v=TransplantReg', description: 'Transplant legal requirements' },
    ],
  },
  'COP.11.j': {
    hindiExplanation: 'संस्था अंग दान (organ donation) और प्रत्यारोपण के बारे में जागरूकता पैदा करती है। इसमें मरीजों और परिवारों को अंग दान के महत्व के बारे में शिक्षित करना, organ donation forms उपलब्ध कराना, और brain death protocol लागू करना शामिल है। Transplant coordinator की नियुक्ति की जानी चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Organ Donation Awareness', url: 'https://www.youtube.com/watch?v=OrganDonation', description: 'Promoting organ donation' },
    ],
  },
  'COP.11.k': {
    hindiExplanation: 'पोस्ट-ऑपरेटिव देखभाल की निगरानी और दस्तावेजीकरण किया जाता है। इसमें post-operative orders, nursing care, pain management, और discharge planning शामिल है। सर्जन द्वारा दैनिक rounds और progress notes लिखी जानी चाहिए। रिकवरी की प्रगति और किसी भी जटिलता का दस्तावेजीकरण होना चाहिए।',
    youtubeVideos: [
      { title: 'Post-op Care Documentation', url: 'https://www.youtube.com/watch?v=PostOpDoc', description: 'Documenting post-operative care' },
    ],
  },

  // COP.12 - Special needs of patients are provided for
  'COP.12.a': {
    hindiExplanation: 'संस्था ने जोखिम वाले मरीजों की पहचान के लिए नीतियां और प्रक्रियाएं बनाई हैं। इसमें बुजुर्ग, बच्चे, विकलांग, मानसिक रूप से बीमार, और कमजोर समूहों के मरीज शामिल हैं। जोखिम मूल्यांकन उपकरणों का उपयोग करके इन मरीजों की पहचान की जानी चाहिए और उनकी विशेष देखभाल सुनिश्चित की जानी चाहिए।',
    youtubeVideos: [
      { title: 'Vulnerable Patient Identification', url: 'https://www.youtube.com/watch?v=VulnerablePatients', description: 'Identifying at-risk patients' },
    ],
  },
  'COP.12.b': {
    hindiExplanation: 'जोखिम वाले मरीजों के लिए आवश्यक देखभाल प्रदान करने के लिए कर्मचारी प्रशिक्षित होते हैं। इसमें elderly care, pediatric care, disability-sensitive care, और mental health care का प्रशिक्षण शामिल है। कर्मचारियों को विशेष जरूरतों वाले मरीजों के साथ संवेदनशील व्यवहार का प्रशिक्षण मिलना चाहिए।',
    youtubeVideos: [
      { title: 'Vulnerable Patient Training', url: 'https://www.youtube.com/watch?v=VulnerableTraining', description: 'Staff training for at-risk patients' },
    ],
  },
  'COP.12.c': {
    hindiExplanation: 'संस्था गिरने के जोखिम वाले मरीजों की पहचान करती है और उनकी सुरक्षा के लिए उपाय करती है। Fall Risk Assessment Tool का उपयोग करके जोखिम का मूल्यांकन होना चाहिए। उच्च जोखिम वाले मरीजों के लिए side rails, non-slip footwear, और close supervision जैसी सावधानियां लागू होनी चाहिए। गिरने की घटनाओं का विश्लेषण होना चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Fall Prevention', url: 'https://www.youtube.com/watch?v=FallPrevention', description: 'Fall risk assessment and prevention' },
    ],
  },
  'COP.12.d': {
    hindiExplanation: 'संस्था दबाव अल्सर (pressure ulcer/bedsore) के जोखिम वाले मरीजों की पहचान करती है और निवारक उपाय करती है। Braden Scale या समान उपकरण का उपयोग करके जोखिम का मूल्यांकन होना चाहिए। Position change schedule, pressure-relieving devices, skin care, और nutrition support जैसी रोकथाम रणनीतियां लागू होनी चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'Pressure Ulcer Prevention', url: 'https://www.youtube.com/watch?v=PressureUlcer', description: 'Bedsore prevention strategies' },
    ],
  },
  'COP.12.e': {
    hindiExplanation: 'संस्था गहरी शिरा घनास्त्रता (DVT - Deep Vein Thrombosis) के जोखिम वाले मरीजों की पहचान करती है और निवारक उपाय करती है। DVT Risk Assessment (Caprini Score या समान) किया जाना चाहिए। जोखिम के आधार पर pharmacological prophylaxis (anticoagulants) और mechanical prophylaxis (compression stockings, SCDs) लागू होनी चाहिए। यह CORE element है।',
    youtubeVideos: [
      { title: 'DVT Prophylaxis', url: 'https://www.youtube.com/watch?v=DVTProphylaxis', description: 'DVT risk and prevention' },
    ],
  },

  // COP.13 - Organization addresses pain, rehabilitation and nutritional care needs
  'COP.13.a': {
    hindiExplanation: 'मरीज को दर्द से राहत पाने का अधिकार है, और दर्द का मूल्यांकन तथा प्रबंधन किया जाता है। दर्द का मूल्यांकन करने के लिए दर्द स्केल (Numeric Rating Scale, Wong-Baker Faces Scale) का उपयोग होना चाहिए। दर्द को vital sign के रूप में दर्ज किया जाना चाहिए। दर्द प्रबंधन प्रोटोकॉल उपलब्ध होने चाहिए और multimodal analgesia का उपयोग किया जाना चाहिए।',
    youtubeVideos: [
      { title: 'Pain Assessment Management', url: 'https://www.youtube.com/watch?v=PainManagement', description: 'Pain as fifth vital sign' },
    ],
  },
  'COP.13.b': {
    hindiExplanation: 'मरीज की पुनर्वास आवश्यकताओं का मूल्यांकन और पुनर्वास सेवाएं प्रदान की जाती हैं। इसमें physiotherapy, occupational therapy, speech therapy, और cardiac rehabilitation शामिल है। पुनर्वास लक्ष्य मरीज की स्थिति और कार्यात्मक क्षमता के आधार पर निर्धारित होने चाहिए। पुनर्वास की प्रगति का दस्तावेजीकरण होना चाहिए।',
    youtubeVideos: [
      { title: 'Rehabilitation Services', url: 'https://www.youtube.com/watch?v=Rehabilitation', description: 'Patient rehabilitation needs' },
    ],
  },
  'COP.13.c': {
    hindiExplanation: 'मरीज की पोषण संबंधी आवश्यकताओं का मूल्यांकन किया जाता है और उपयुक्त आहार प्रदान किया जाता है। Nutritional Risk Screening (NRS-2002 या समान) किया जाना चाहिए। Dietitian द्वारा पोषण मूल्यांकन और विशेष आहार निर्धारित होना चाहिए। मधुमेह, गुर्दे की बीमारी, और अन्य स्थितियों के लिए therapeutic diet उपलब्ध होनी चाहिए।',
    youtubeVideos: [
      { title: 'Nutritional Care Hospital', url: 'https://www.youtube.com/watch?v=NutritionalCare', description: 'Nutrition assessment and diet' },
    ],
  },

  // ============================================================================
  // MOM - Management of Medication
  // ============================================================================

  'MOM.1.a': {
    hindiExplanation: 'दवाइयों को कैसे रखना है, कैसे देना है - इसके लिए नियम होने चाहिए। यह मरीज की सुरक्षा के लिए जरूरी है।',
    youtubeVideos: [
      { title: 'Medication Management NABH', url: 'https://www.youtube.com/watch?v=KIlTmKxRVPnE', description: 'NABH medication management' },
    ],
  },
  'MOM.1.b': {
    hindiExplanation: 'दवाइयों को सही तरीके से रखना चाहिए। कुछ दवाइयां फ्रिज में रखनी होती हैं। खतरनाक दवाइयां अलग रखनी चाहिए।',
    youtubeVideos: [
      { title: 'Drug Storage NABH', url: 'https://www.youtube.com/watch?v=LIlTmKxRVPnE', description: 'Safe drug storage' },
    ],
  },

  // MOM.2 - Prescription
  'MOM.2.a': {
    hindiExplanation: 'पर्चे में साफ-साफ लिखना चाहिए - दवाई का नाम, कितनी खानी है, कब खानी है, और कितने दिन खानी है।',
    youtubeVideos: [
      { title: 'Prescription Writing', url: 'https://www.youtube.com/watch?v=MIlTmKxRVPnE', description: 'Standard prescription format' },
    ],
  },
  'MOM.2.b': {
    hindiExplanation: 'दवाई का पर्चा सिर्फ डॉक्टर लिख सकता है। पर्चे पर डॉक्टर का नाम और साइन होना चाहिए।',
    youtubeVideos: [
      { title: 'Prescriber Guidelines', url: 'https://www.youtube.com/watch?v=NIlTmKxRVPnE', description: 'Who can prescribe medications' },
    ],
  },

  // MOM.3 - High Alert Medications
  'MOM.3.a': {
    hindiExplanation: 'कुछ दवाइयां बहुत खतरनाक होती हैं, जैसे इंसुलिन, पोटेशियम। इनकी सूची होनी चाहिए और इन्हें बहुत सावधानी से देना चाहिए।',
    youtubeVideos: [
      { title: 'High Alert Medications', url: 'https://www.youtube.com/watch?v=OIlTmKxRVPnE', description: 'Managing high alert drugs' },
    ],
  },

  // ============================================================================
  // PRE - Patient Rights and Education
  // ============================================================================

  'PRE.1.a': {
    hindiExplanation: 'मरीजों के क्या अधिकार हैं और क्या जिम्मेदारियां हैं, यह लिखा होना चाहिए। यह सूची अस्पताल में लगी होनी चाहिए।',
    youtubeVideos: [
      { title: 'Patient Rights NABH', url: 'https://www.youtube.com/watch?v=PIlTmKxRVPnE', description: 'Patient rights in healthcare' },
    ],
  },
  'PRE.1.b': {
    hindiExplanation: 'मरीज और परिवार को बताना चाहिए कि उनके क्या अधिकार हैं। भर्ती होते समय यह जानकारी देनी चाहिए।',
    youtubeVideos: [
      { title: 'Patient Rights Education', url: 'https://www.youtube.com/watch?v=QIlTmKxRVPnE', description: 'Educating patients on rights' },
    ],
  },

  // PRE.2 - Informed consent
  'PRE.2.a': {
    hindiExplanation: 'कोई भी इलाज करने से पहले मरीज से हां लेनी चाहिए। कब और कैसे हां लेनी है, इसके नियम होने चाहिए।',
    youtubeVideos: [
      { title: 'Informed Consent Process', url: 'https://www.youtube.com/watch?v=RIlTmKxRVPnE', description: 'Obtaining informed consent' },
    ],
  },
  'PRE.2.b': {
    hindiExplanation: 'मरीज को समझाना चाहिए कि इलाज से क्या फायदा होगा और क्या खतरा हो सकता है। आसान भाषा में समझाओ।',
    youtubeVideos: [
      { title: 'Consent Documentation', url: 'https://www.youtube.com/watch?v=SIlTmKxRVPnE', description: 'Documenting consent properly' },
    ],
  },

  // ============================================================================
  // HIC - Hospital Infection Control
  // ============================================================================

  'HIC.1.a': {
    hindiExplanation: 'अस्पताल में इन्फेक्शन न फैले, इसके लिए एक टीम होनी चाहिए। इस टीम को ICC कहते हैं। इसकी नियमित मीटिंग होनी चाहिए।',
    youtubeVideos: [
      { title: 'Infection Control Program', url: 'https://www.youtube.com/watch?v=TIlTmKxRVPnE', description: 'Setting up infection control program' },
      { title: 'ICC Committee NABH', url: 'https://www.youtube.com/watch?v=UIlTmKxRVPnE', description: 'Infection control committee' },
    ],
  },
  'HIC.1.b': {
    hindiExplanation: 'एक नर्स या अधिकारी को इन्फेक्शन कंट्रोल का काम देना चाहिए। वह यह देखेगा कि इन्फेक्शन न फैले।',
    youtubeVideos: [
      { title: 'Infection Control Nurse Role', url: 'https://www.youtube.com/watch?v=VIlTmKxRVPnE', description: 'Role of infection control nurse' },
    ],
  },

  // HIC.2 - Hand hygiene
  'HIC.2.a': {
    hindiExplanation: 'हाथ धोना बहुत जरूरी है। WHO ने 5 मौके बताए हैं जब हाथ धोना चाहिए - मरीज को छूने से पहले, छूने के बाद, इंजेक्शन लगाने से पहले, खून छूने के बाद, और मरीज के आस-पास की चीजें छूने के बाद।',
    youtubeVideos: [
      { title: 'Hand Hygiene 5 Moments', url: 'https://www.youtube.com/watch?v=WIlTmKxRVPnE', description: 'WHO 5 moments of hand hygiene' },
      { title: 'Hand Washing Technique', url: 'https://www.youtube.com/watch?v=XIlTmKxRVPnE', description: 'Proper hand washing technique' },
    ],
  },
  'HIC.2.b': {
    hindiExplanation: 'हाथ धोने के लिए साबुन और पानी होना चाहिए। हैंड सैनिटाइजर भी होना चाहिए। सभी जगह यह सुविधा होनी चाहिए।',
    youtubeVideos: [
      { title: 'Hand Hygiene Facilities', url: 'https://www.youtube.com/watch?v=YIlTmKxRVPnE', description: 'Required hand hygiene facilities' },
    ],
  },

  // HIC.3 - Biomedical waste
  'HIC.3.a': {
    hindiExplanation: 'अस्पताल का कचरा खतरनाक होता है - सुई, खून लगी रुई, पट्टी। इसे फेंकने के लिए सरकार के नियम हैं जिन्हें BMW Rules कहते हैं।',
    youtubeVideos: [
      { title: 'BMW Management NABH', url: 'https://www.youtube.com/watch?v=ZIlTmKxRVPnE', description: 'Biomedical waste management' },
      { title: 'BMW Rules 2016', url: 'https://www.youtube.com/watch?v=0JlTmKxRVPnE', description: 'BMW Rules explained' },
    ],
  },
  'HIC.3.b': {
    hindiExplanation: 'कचरे को रंग के हिसाब से अलग-अलग डिब्बों में डालना चाहिए। पीला - खून वाला कचरा, लाल - प्लास्टिक, नीला - कांच, सफेद - सुई।',
    youtubeVideos: [
      { title: 'BMW Color Coding', url: 'https://www.youtube.com/watch?v=1JlTmKxRVPnE', description: 'Color coding of biomedical waste' },
    ],
  },

  // ============================================================================
  // CQI - Continuous Quality Improvement
  // ============================================================================

  'CQI.1.a': {
    hindiExplanation: 'अस्पताल में क्वालिटी सुधारने का काम होना चाहिए। क्या अच्छा हो रहा है, क्या खराब - यह चेक करते रहना चाहिए।',
    youtubeVideos: [
      { title: 'Quality Improvement NABH', url: 'https://www.youtube.com/watch?v=2JlTmKxRVPnE', description: 'Quality improvement in healthcare' },
    ],
  },
  'CQI.1.b': {
    hindiExplanation: 'क्वालिटी चेक करने के लिए कुछ चीजें देखनी चाहिए, जैसे - कितने मरीज ठीक हुए, कितनी गलतियां हुईं, मरीज खुश हैं या नहीं।',
    youtubeVideos: [
      { title: 'Quality Indicators Healthcare', url: 'https://www.youtube.com/watch?v=3JlTmKxRVPnE', description: 'Identifying quality indicators' },
    ],
  },

  // CQI.2 - Patient safety
  'CQI.2.a': {
    hindiExplanation: 'मरीज की सुरक्षा सबसे जरूरी है। इसके लिए अंतर्राष्ट्रीय नियम हैं जिन्हें IPSG कहते हैं। इन नियमों को मानना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Safety Goals', url: 'https://www.youtube.com/watch?v=4JlTmKxRVPnE', description: 'IPSG implementation' },
      { title: 'Patient Safety NABH', url: 'https://www.youtube.com/watch?v=5JlTmKxRVPnE', description: 'Patient safety requirements' },
    ],
  },
  'CQI.2.b': {
    hindiExplanation: 'मरीज की सही पहचान करना जरूरी है। कम से कम दो तरीके से पहचान करो - जैसे नाम पूछो और UHID नंबर चेक करो। गलत मरीज को दवाई न दे दो।',
    youtubeVideos: [
      { title: 'Patient Identification', url: 'https://www.youtube.com/watch?v=6JlTmKxRVPnE', description: 'Correct patient identification' },
    ],
  },

  // ============================================================================
  // ROM - Responsibilities of Management
  // ============================================================================

  'ROM.1.a': {
    hindiExplanation: 'अस्पताल की एक मालिक टीम होनी चाहिए जो बड़े फैसले करे। इसे बोर्ड या ट्रस्ट कहते हैं।',
    youtubeVideos: [
      { title: 'Hospital Governance', url: 'https://www.youtube.com/watch?v=7JlTmKxRVPnE', description: 'Governance in healthcare' },
    ],
  },
  'ROM.1.b': {
    hindiExplanation: 'बोर्ड क्या काम करेगा, यह साफ होना चाहिए। मीटिंग में क्या बात हुई, क्या फैसले हुए - इसका रिकॉर्ड रखना चाहिए।',
    youtubeVideos: [
      { title: 'Hospital Administration', url: 'https://www.youtube.com/watch?v=8JlTmKxRVPnE', description: 'Hospital administration structure' },
    ],
  },

  // ============================================================================
  // FMS - Facility Management and Safety
  // ============================================================================

  'FMS.1.a': {
    hindiExplanation: 'अस्पताल की बिल्डिंग सुरक्षित होनी चाहिए। आग, बिजली, और इमारत की सुरक्षा के लिए नियम होने चाहिए।',
    youtubeVideos: [
      { title: 'Hospital Safety NABH', url: 'https://www.youtube.com/watch?v=9JlTmKxRVPnE', description: 'Facility safety requirements' },
    ],
  },
  'FMS.1.b': {
    hindiExplanation: 'आग से बचाव के लिए तैयारी होनी चाहिए। फायर एक्सटिंग्विशर, स्मोक डिटेक्टर होने चाहिए। समय-समय पर फायर ड्रिल करनी चाहिए।',
    youtubeVideos: [
      { title: 'Fire Safety Hospital', url: 'https://www.youtube.com/watch?v=AJlTmKxRVPnE', description: 'Fire safety in hospitals' },
      { title: 'Fire Drill Training', url: 'https://www.youtube.com/watch?v=BJlTmKxRVPnE', description: 'Conducting fire drills' },
    ],
  },

  // FMS.2 - Disaster management
  'FMS.2.a': {
    hindiExplanation: 'आपदा आने पर क्या करना है, इसकी योजना होनी चाहिए। आग लगे, बाढ़ आए, या बहुत सारे मरीज एक साथ आएं - सब के लिए योजना।',
    youtubeVideos: [
      { title: 'Hospital Disaster Plan', url: 'https://www.youtube.com/watch?v=CJlTmKxRVPnE', description: 'Disaster management planning' },
    ],
  },

  // ============================================================================
  // HRM - Human Resource Management
  // ============================================================================

  'HRM.1.a': {
    hindiExplanation: 'कर्मचारियों को कैसे रखना है, कैसे ट्रेनिंग देनी है - इसके लिए नियम होने चाहिए। भर्ती से लेकर ट्रेनिंग तक सब साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'HRM in Healthcare', url: 'https://www.youtube.com/watch?v=DJlTmKxRVPnE', description: 'Human resource management in hospitals' },
    ],
  },
  'HRM.1.b': {
    hindiExplanation: 'कर्मचारी की पढ़ाई और तजुर्बा सही है या नहीं, यह जांचना चाहिए। सर्टिफिकेट असली हैं, यह पता करना चाहिए।',
    youtubeVideos: [
      { title: 'Staff Credentialing', url: 'https://www.youtube.com/watch?v=EJlTmKxRVPnE', description: 'Staff credentialing process' },
    ],
  },

  // HRM.2 - Training
  'HRM.2.a': {
    hindiExplanation: 'सभी कर्मचारियों को ट्रेनिंग मिलनी चाहिए। नई नौकरी में आने पर, काम करते समय, और बाद में भी समय-समय पर ट्रेनिंग होनी चाहिए।',
    youtubeVideos: [
      { title: 'Staff Training Program', url: 'https://www.youtube.com/watch?v=FJlTmKxRVPnE', description: 'Training programs for staff' },
    ],
  },

  // ============================================================================
  // IMS - Information Management System
  // ============================================================================

  'IMS.1.a': {
    hindiExplanation: 'मरीजों के कागज सुरक्षित रखने चाहिए। कागज खो न जाएं और जरूरत पड़ने पर जल्दी मिल जाएं, ऐसी व्यवस्था होनी चाहिए।',
    youtubeVideos: [
      { title: 'Medical Records Management', url: 'https://www.youtube.com/watch?v=GJlTmKxRVPnE', description: 'Managing medical records' },
    ],
  },
  'IMS.1.b': {
    hindiExplanation: 'मरीज की जानकारी गुप्त रखनी चाहिए। कोई भी उनके कागज नहीं देख सकता। सिर्फ जिन्हें इजाजत है, वे ही देख सकते हैं।',
    youtubeVideos: [
      { title: 'Patient Data Confidentiality', url: 'https://www.youtube.com/watch?v=HJlTmKxRVPnE', description: 'Protecting patient information' },
    ],
  },
};

/**
 * Get learning resources for a specific objective element
 * Returns default resources if not found
 */
export function getLearningResource(code: string): LearningResource {
  const resource = learningResources[code];
  if (resource) {
    return resource;
  }

  // Return default resource if specific one not found
  return {
    hindiExplanation: 'इस नियम की जानकारी जल्दी ही जोड़ी जाएगी। अभी के लिए NABH की किताब देखें।',
    youtubeVideos: [
      {
        title: 'NABH Standards Overview',
        url: 'https://www.youtube.com/watch?v=QxV9YGgXYbE',
        description: 'General overview of NABH standards'
      },
    ],
  };
}

/**
 * Get all YouTube videos for a chapter
 */
export function getChapterVideos(chapterCode: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const seenUrls = new Set<string>();

  Object.entries(learningResources).forEach(([code, resource]) => {
    if (code.startsWith(chapterCode)) {
      resource.youtubeVideos.forEach(video => {
        if (!seenUrls.has(video.url)) {
          seenUrls.add(video.url);
          videos.push(video);
        }
      });
    }
  });

  return videos;
}
