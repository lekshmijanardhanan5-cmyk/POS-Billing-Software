/**
 * KERALA TEXTILES POS - LANDING PAGE INTERACTION & MULTI-LANGUAGE SCRIPT
 * Supports English, Malayalam (മലയാളം), Hindi (हिन्दी), Tamil (தமிழ்), Arabic (العربية)
 * Note: Keeps core retail terminology in clean English as requested.
 */

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
     1. MULTI-LANGUAGE (i18n) DICTIONARY
     -------------------------------------------------------------------------- */
  const langMeta = {
    en: { name: 'English', flag: '🇬🇧' },
    ml: { name: 'മലയാളം', flag: '🇮🇳' },
    hi: { name: 'हिन्दी', flag: '🇮🇳' },
    ta: { name: 'தமிழ்', flag: '🇮🇳' },
    ar: { name: 'العربية', flag: '🇦🇪' }
  };

  const i18n = {
    en: {
      nav_features: 'Features',
      nav_collections: 'Collections',
      nav_signin: 'Sign In',
      theme_light: 'Light',
      theme_dark: 'Dark',
      theme_light_mode: 'Light Mode',
      theme_dark_mode: 'Dark Mode',
      hero_pill: 'Next-Gen Textile Commerce & POS Platform',
      hero_title: 'Everything to run your <br><span class="gradient-text">textile retail.</span>',
      hero_sub: 'Premium bridal silks, authentic Kasavu handlooms, and contemporary ready-to-wear fashion.',
      hero_btn_explore: 'Explore Collections',
      hero_btn_signin: 'Staff Sign In',
      mockup_title: 'KERALA TEXTILES POS • TERMINAL 01 • LIVE ACTIVE SESSION',
      mockup_active: 'ACTIVE TERMINAL',
      mockup_cart_title: 'Active Cart Items',
      mockup_item_1_name: 'Boys Washed Denim Jacket',
      mockup_item_2_name: 'Classic Formal Cotton Shirt',
      mockup_summary_title: 'Quick Bill Summary',
      mockup_subtotal_label: 'Subtotal (2 items)',
      mockup_gst_label: 'GST Tax (5%)',
      mockup_grand_label: 'Grand Total',
      mockup_checkout_btn: 'Proceed to Checkout',
      bento_pretitle: 'Engineered For Retail Scale',
      bento_title: 'Built for high-volume retail. Refined for speed.',
      bento_subtitle: "Eliminate billing bottlenecks, prevent overselling, and monitor your textile store's health in real time.",
      bento_1_title: 'High-Speed Cashier POS Counter',
      bento_1_desc: 'Scan physical barcodes or key in product codes with keyboard-only controls. Adjust quantity, apply instant percentage discounts, and print formatted 80mm thermal receipts with GST tax breakdowns in seconds.',
      bento_1_tag: 'Instant Checkout Engine →',
      bento_2_title: 'Garment Variant Matrix',
      bento_2_desc: 'Effortlessly categorize your entire store inventory across sizes (S, M, L, XL, XXL, Free Size), colors, fabric types, and distinct barcode tags.',
      bento_2_tag: 'Multi-Attribute Catalog →',
      bento_3_title: 'Atomic Stock Deduction',
      bento_3_desc: 'Database-level locking guarantees no stock overselling during rush hours. Inventory levels instantly reflect across all cashier counters.',
      bento_3_tag: 'Zero Race Conditions →',
      bento_4_title: 'Supplier Accounting & Product Returns',
      bento_4_desc: 'Keep comprehensive financial ledgers for textile mills, fabric suppliers, and wholesale purchases. Handle customer returns with automated inventory restocking directly to the shelf.',
      bento_4_tag: 'Wholesale Ledger Audit →',
      bento_5_title: 'Pocket Manager Mobile App',
      bento_5_desc: "Check today's revenue, inspect low-stock alerts, and view transaction history from any smartphone using our responsive mobile web app.",
      bento_5_tag: 'Mobile Web App →',
      catalog_pretitle: 'Curated Lookbook',
      catalog_title: 'Live Garment Catalog',
      catalog_subtitle: 'Explore current collections pre-loaded with barcode SKU mapping and live pricing.',
      cat_tab_all: 'All Collections (16)',
      cat_tab_men: "Men's Wear (5)",
      cat_tab_women: "Women's Wear (4)",
      cat_tab_kids: 'Kids Wear (4)',
      cat_tab_fabrics: 'Fabrics & Materials (3)',
      bill_item: 'Bill Item',
      showroom_pretitle: 'Showroom & Experience',
      showroom_title: 'Visit Our Flagship Retail Showroom',
      showroom_subtitle: 'Experience authentic Kasavu handlooms, bridal silk sarees, and contemporary textiles in Calicut.',
      showroom_loc_label: 'Store Location',
      showroom_loc_title: 'Calicut Flagship Store',
      showroom_loc_desc: 'Fashion Street, Commercial Hub, Calicut, Kerala - 673001. Convenient customer parking and multi-floor shopping collection.',
      showroom_loc_sub: 'Open Daily',
      showroom_hours_label: 'Store Hours',
      showroom_hours_title: 'Operating Schedule',
      showroom_hours_desc: 'Monday – Saturday: 9:00 AM – 9:30 PM<br>Sunday: 10:00 AM – 8:00 PM<br>Festival and wedding shopping assistance available.',
      showroom_staff_label: 'Staff Access',
      showroom_staff_title: 'Employee & POS Portal',
      showroom_staff_desc: 'Centralized authentication gateway for cashier checkout desks and store management administration.',
      showroom_staff_btn: 'Staff Sign In',
      footer_desc: "Premium retail destination for silk sarees, authentic handloom textiles, men's tailored wear, and designer apparel.",
      footer_col_collections: 'Collections',
      footer_portals_title: 'Store Portals',
      footer_link_pos: 'Billing POS Counter',
      footer_link_admin: 'Admin Portal (Desktop)',
      footer_link_signin: 'Staff Sign In',
      footer_hours_title: 'Showroom & Support',
      footer_copyright: '© 2026 Kerala Textiles Retail Management System. All Rights Reserved.'
    },

    ml: {
      nav_features: 'ഫീച്ചറുകൾ',
      nav_collections: 'വസ്ത്ര ശേഖരം',
      nav_signin: 'സ്റ്റാഫ് ലോഗിൻ',
      theme_light: 'ലൈറ്റ്',
      theme_dark: 'ഡാർക്ക്',
      theme_light_mode: 'ലൈറ്റ് മോഡ്',
      theme_dark_mode: 'ഡാർക്ക് മോഡ്',
      hero_pill: 'അടുത്ത തലമുറ ടെക്സ്റ്റൈൽ POS പ്ലാറ്റ്‌ഫോം',
      hero_title: 'നിങ്ങളുടെ തുണിക്കടയെ നയിക്കാൻ <br><span class="gradient-text">സമ്പൂർണ്ണ POS സിസ്റ്റം.</span>',
      hero_sub: 'പ്രീമിയം ബ്രൈഡൽ പട്ട് സാരികൾ, ഒറിജിനൽ കസവ് കൈത്തറി, പുത്തൻ ഫാഷനുകൾ — വേഗത്തിലുള്ള ബില്ലിംഗും സ്റ്റോക്ക് മാനേജ്‌മെന്റും.',
      hero_btn_explore: 'ശേഖരം കാണുക',
      hero_btn_signin: 'സ്റ്റാഫ് ലോഗിൻ',
      mockup_title: 'കേരളാ ടെക്സ്റ്റൈൽസ് POS • ടെർമിനൽ 01 • ലൈവ് സെഷൻ',
      mockup_active: 'ആക്ടീവ് ടെർമിനൽ',
      mockup_cart_title: 'കാർട്ടിലുള്ള ഇനങ്ങൾ',
      mockup_item_1_name: 'Boys Washed Denim Jacket',
      mockup_item_2_name: 'Classic Formal Cotton Shirt',
      mockup_summary_title: 'ബിൽ സംഗ്രഹം',
      mockup_subtotal_label: 'Subtotal (2 items)',
      mockup_gst_label: 'GST Tax (5%)',
      mockup_grand_label: 'ആകെ തുക (Grand Total)',
      mockup_checkout_btn: 'Proceed to Checkout',
      bento_pretitle: 'റീട്ടെയിൽ ബിസിനസ്സുകൾക്കായി രൂപകൽപ്പന ചെയ്തത്',
      bento_title: 'തിരക്കേറിയ കച്ചവടത്തിന് മിന്നൽ വേഗത.',
      bento_subtitle: 'ബില്ലിംഗ് തടസ്സങ്ങൾ ഒഴിവാക്കൂ, സ്റ്റോക്ക് തെറ്റാതെ കാക്കൂ, ബിസിനസ്സ് തത്സമയം നിരീക്ഷിക്കൂ.',
      bento_1_title: 'ഹൈ-സ്പീഡ് കാഷ്യർ POS കൗണ്ടർ',
      bento_1_desc: 'Barcode സ്കാനർ വഴിയോ കീബോർഡ് വഴിയോ അതിവേഗം ബിൽ ചെയ്യാം. ഡിസ്കൗണ്ടുകൾ ചേർക്കാനും 5% GST രസീത് തത്സമയം പ്രിന്റ് ചെയ്യാനും സാധിക്കും.',
      bento_1_tag: 'Instant Checkout Engine →',
      bento_2_title: 'സൈസ് വകഭേദങ്ങൾ (Variant Matrix)',
      bento_2_desc: 'വസ്ത്രങ്ങളെ Size (S, M, L, XL, XXL), Color, Fabric എന്നിവയ്ക്കനുസരിച്ച് കൃത്യമായി തരംതിരിച്ച് നിയന്ത്രിക്കാം.',
      bento_2_tag: 'Multi-Attribute Catalog →',
      bento_3_title: 'തത്സമയ സ്റ്റോക്ക് നിയന്ത്രണം (Atomic Stock)',
      bento_3_desc: 'തിരക്കേറിയ സമയങ്ങളിലും സ്റ്റോക്ക് തെറ്റാതെ കൃത്യമായി കുറയുന്ന അറ്റോമിക് ഡാറ്റാബേസ് ലോക്കിംഗ് സിസ്റ്റം.',
      bento_3_tag: 'Zero Race Conditions →',
      bento_4_title: 'സപ്ലയർ കണക്കുകളും പ്രൊഡക്റ്റ് റിട്ടേണും',
      bento_4_desc: 'സപ്ലയർമാരുടെ പർച്ചേസ് ലെഡ്ജർ കണക്കുകൾ സൂക്ഷിക്കാം. കസ്റ്റമർ തുണി മാറ്റിയെടുക്കുമ്പോൾ സ്റ്റോക്ക് തനിയെ റീസ്റ്റോർ ആകും.',
      bento_4_tag: 'Wholesale Ledger Audit →',
      bento_5_title: 'മൊബൈൽ മാനേജർ ആപ്പ്',
      bento_5_desc: 'കടയുടമയ്ക്ക് ഏത് സ്മാർട്ട്‌ഫോണിൽ നിന്നും ഇന്നത്തെ വരുമാനവും സ്റ്റോക്ക് വിവരങ്ങളും തത്സമയം അറിയാം.',
      bento_5_tag: 'Mobile Web App →',
      catalog_pretitle: 'തിരഞ്ഞെടുത്ത ശേഖരം',
      catalog_title: 'ലൈവ് വസ്ത്ര കാറ്റലോഗ്',
      catalog_subtitle: 'ബാർകോഡും തത്സമയ വിലയും രേഖപ്പെടുത്തിയ പ്രീമിയം തുണിത്തരങ്ങൾ പരിശോധിക്കൂ.',
      cat_tab_all: 'All Collections (16)',
      cat_tab_men: "Men's Wear (5)",
      cat_tab_women: "Women's Wear (4)",
      cat_tab_kids: 'Kids Wear (4)',
      cat_tab_fabrics: 'Fabrics & Materials (3)',
      bill_item: 'ബിൽ ചെയ്യുക',
      showroom_pretitle: 'ഷോറൂം വിവരങ്ങൾ',
      showroom_title: 'ഞങ്ങളുടെ പ്രധാന റീട്ടെയിൽ ഷോറൂം സന്ദർശിക്കൂ',
      showroom_subtitle: 'ഒറിജിനൽ കസവ് കൈത്തറി, ബ്രൈഡൽ പട്ട് സാരികൾ, പുത്തൻ വസ്ത്ര ശേഖരങ്ങൾ നേരിട്ട് കണ്ടറിയാം.',
      showroom_loc_label: 'Store Location',
      showroom_loc_title: 'Calicut Flagship Store',
      showroom_loc_desc: 'Fashion Street, Commercial Hub, Calicut, Kerala - 673001. Parking and multi-floor shopping collection.',
      showroom_loc_sub: 'Open Daily',
      showroom_hours_label: 'Store Hours',
      showroom_hours_title: 'പ്രവർത്തന സമയം',
      showroom_hours_desc: 'തിങ്കൾ – ശനി: 9:00 AM – 9:30 PM<br>ഞായർ: 10:00 AM – 8:00 PM<br>Festival and wedding shopping assistance available.',
      showroom_staff_label: 'Staff Access',
      showroom_staff_title: 'Employee & POS Portal',
      showroom_staff_desc: 'ബില്ലിംഗ് കൗണ്ടർ ജീവനക്കാർക്കും മാനേജ്‌മെന്റിനുമുള്ള സുരക്ഷിത ലോഗിൻ ഗേറ്റ്‌വേ.',
      showroom_staff_btn: 'Staff Sign In',
      footer_desc: 'പട്ട് സാരികൾ, ഒറിജിനൽ കൈത്തറി തുണികൾ, പുരുഷ-വനിതാ വസ്ത്രങ്ങൾ എന്നിവയുടെ പ്രീമിയം റീട്ടെയിൽ കേന്ദ്രം.',
      footer_col_collections: 'വസ്ത്ര ശേഖരം',
      footer_portals_title: 'പോർട്ടലുകൾ & ലിങ്കുകൾ',
      footer_link_pos: 'Billing POS Counter',
      footer_link_admin: 'Admin Portal (Desktop)',
      footer_link_signin: 'Staff Sign In',
      footer_hours_title: 'ഷോറൂം & സപ്പോർട്ട്',
      footer_copyright: '© 2026 കേരളാ ടെക്സ്റ്റൈൽസ് റീട്ടെയിൽ POS സിസ്റ്റം. All Rights Reserved.'
    },

    hi: {
      nav_features: 'सुविधाएं (Features)',
      nav_collections: 'कलेक्शन (Collections)',
      nav_signin: 'साइन इन (Sign In)',
      theme_light: 'लाइट',
      theme_dark: 'डार्क',
      theme_light_mode: 'लाइट मोड',
      theme_dark_mode: 'डार्क मोड',
      hero_pill: 'Next-Gen Textile Commerce & POS Platform',
      hero_title: 'आपके टेक्सटाइल रिटेल के लिए <br><span class="gradient-text">सम्पूर्ण POS सिस्टम.</span>',
      hero_sub: 'प्रीमियम ब्राइडल सिल्क, कासावु हैंडलूम और आधुनिक रेडी-टू-वियर फैशन — फास्ट बिलिंग और इन्वेंटरी कंट्रोल.',
      hero_btn_explore: 'कलेक्शन देखें (Explore)',
      hero_btn_signin: 'स्टाफ साइन इन (Sign In)',
      mockup_title: 'KERALA TEXTILES POS • TERMINAL 01 • LIVE SESSION',
      mockup_active: 'ACTIVE TERMINAL',
      mockup_cart_title: 'कार्ट के उत्पाद (Cart Items)',
      mockup_item_1_name: 'Boys Washed Denim Jacket',
      mockup_item_2_name: 'Classic Formal Cotton Shirt',
      mockup_summary_title: 'बिल सारांश (Bill Summary)',
      mockup_subtotal_label: 'सबटोटल (2 items)',
      mockup_gst_label: 'GST Tax (5%)',
      mockup_grand_label: 'कुल राशि (Grand Total)',
      mockup_checkout_btn: 'चेकआउट करें (Checkout)',
      bento_pretitle: 'Engineered For Retail Scale',
      bento_title: 'तेज़ गति और बड़े रिटेल स्टोर के लिए निर्मित.',
      bento_subtitle: 'बिलिंग की भीड़ कम करें, स्टॉक ओवरसेलिंग रोकें और अपने स्टोर की बिक्री लाइव ट्रैक करें.',
      bento_1_title: 'हाई-स्पीड कैशियर POS काउंटर',
      bento_1_desc: 'बारकोड स्कैनर या कीबोर्ड शॉर्टकट से तेजी से बिलिंग करें. 5% GST थर्मल रसीद प्रिंट करें सेकंडों में.',
      bento_1_tag: 'Instant Checkout Engine →',
      bento_2_title: 'गारमेंट साइज़ मैट्रिक्स',
      bento_2_desc: 'आसानी से अपने कपड़ों को साइज़ (S, M, L, XL, XXL) और रंगों के आधार पर व्यवस्थित करें.',
      bento_2_tag: 'Multi-Attribute Catalog →',
      bento_3_title: 'रियल-टाइम स्टॉक कटौती',
      bento_3_desc: 'भीड़ के समय भी स्टॉक एकदम सटीक घटता है. सभी काउंटरों पर लाइव इन्वेंटरी अपडेट.',
      bento_3_tag: 'Zero Race Conditions →',
      bento_4_title: 'सप्लायर लेजर और प्रोडक्ट रिटर्न',
      bento_4_desc: 'टेक्सटाइल मिलों और सप्लायरों का बहीखाता रखें. कस्टमर रिटर्न पर स्टॉक खुद ब खुद रीस्टोर होता है.',
      bento_4_tag: 'Wholesale Ledger Audit →',
      bento_5_title: 'पॉकेट मैनेजर मोबाइल ऐप',
      bento_5_desc: 'स्मार्टफोन से आज की बिक्री, राजस्व और लो-स्टॉक अलर्ट कहीं से भी चेक करें.',
      bento_5_tag: 'Mobile Web App →',
      catalog_pretitle: 'Curated Lookbook',
      catalog_title: 'लाइव गारमेंट कैटलॉग',
      catalog_subtitle: 'बारकोड SKU और लाइव कीमतों के साथ उपलब्ध परिधान.',
      cat_tab_all: 'All Collections (16)',
      cat_tab_men: "Men's Wear (5)",
      cat_tab_women: "Women's Wear (4)",
      cat_tab_kids: 'Kids Wear (4)',
      cat_tab_fabrics: 'Fabrics & Materials (3)',
      bill_item: 'बिल करें (Bill Item)',
      showroom_pretitle: 'Showroom & Experience',
      showroom_title: 'हमारे फ्लैगशिप शोरूम में पधारें',
      showroom_subtitle: 'कालीकट में प्रामाणिक कासावु हैंडलूम और ब्राइडल सिल्क साड़ियों का अनुभव करें.',
      showroom_loc_label: 'स्टोर लोकेशन',
      showroom_loc_title: 'Calicut Flagship Store',
      showroom_loc_desc: 'Fashion Street, Commercial Hub, Calicut, Kerala - 673001. पार्किंग और मल्टी-फ्लोर शॉपिंग कलेक्शन.',
      showroom_loc_sub: 'Open Daily',
      showroom_hours_label: 'स्टोर का समय',
      showroom_hours_title: 'ऑपरेटिंग शेड्यूल',
      showroom_hours_desc: 'सोमवार – शनिवार: 9:00 AM – 9:30 PM<br>रविवार: 10:00 AM – 8:00 PM<br>फेस्टिवल और वेडिंग शॉपिंग सहायता उपलब्ध.',
      showroom_staff_label: 'स्टाफ लॉगिन',
      showroom_staff_title: 'Employee & POS Portal',
      showroom_staff_desc: 'कैशियर चेकआउट डेस्क और स्टोर प्रबंधन के लिए सुरक्षित प्रमाणीकरण गेटवे.',
      showroom_staff_btn: 'Staff Sign In',
      footer_desc: 'सिल्क साड़ी, प्रामाणिक हैंडलूम वस्त्र, पुरुषों और महिलाओं के परिधानों का प्रीमियम रिटेल गंतव्य.',
      footer_col_collections: 'कलेक्शन (Collections)',
      footer_portals_title: 'स्टोर पोर्टल्स (Store Portals)',
      footer_link_pos: 'Billing POS Counter',
      footer_link_admin: 'Admin Portal (Desktop)',
      footer_link_signin: 'Staff Sign In',
      footer_hours_title: 'शोरूम और सपोर्ट (Showroom & Support)',
      footer_copyright: '© 2026 Kerala Textiles Retail Management System. All Rights Reserved.'
    },

    ta: {
      nav_features: 'அம்சங்கள் (Features)',
      nav_collections: 'ஆடைகள் (Collections)',
      nav_signin: 'உள்நுழைக (Sign In)',
      theme_light: 'லைட்',
      theme_dark: 'டார்க்',
      theme_light_mode: 'லைட் மோட்',
      theme_dark_mode: 'டார்க் மோட்',
      hero_pill: 'Next-Gen Textile Commerce & POS Platform',
      hero_title: 'உங்கள் ஜவுளி கடைக்கான <br><span class="gradient-text">முழுமையான POS சிஸ்டம்.</span>',
      hero_sub: 'பிரீமியம் பட்டு புடவைகள், பாரம்பரிய கசவு கைத்தறி ஆடைகள் — விரைவான பில்லிங் மற்றும் ஸ்டாக் மேனேஜ்மென்ட்.',
      hero_btn_explore: 'சேகரிப்பை காண்க (Explore)',
      hero_btn_signin: 'பணியாளர் உள்நுழைவு',
      mockup_title: 'KERALA TEXTILES POS • TERMINAL 01 • LIVE ACTIVE SESSION',
      mockup_active: 'ACTIVE TERMINAL',
      mockup_cart_title: 'கார்ட் பொருட்கள் (Cart Items)',
      mockup_item_1_name: 'Boys Washed Denim Jacket',
      mockup_item_2_name: 'Classic Formal Cotton Shirt',
      mockup_summary_title: 'பில் விவரம் (Bill Summary)',
      mockup_subtotal_label: 'Subtotal (2 items)',
      mockup_gst_label: 'GST Tax (5%)',
      mockup_grand_label: 'மொத்த தொகை (Grand Total)',
      mockup_checkout_btn: 'செக்அவுட் செய்க (Checkout)',
      bento_pretitle: 'Engineered For Retail Scale',
      bento_title: 'விரைவான மற்றும் பெரிய ஜவுளி கடைகளுக்கான கட்டமைப்பு.',
      bento_subtitle: 'பில்லிங் நெரிசலை தவிருங்கள், ஸ்டாக் அளவை உடனுக்குடன் துல்லியமாக கண்காணிக்கவும்.',
      bento_1_title: 'அதிவேக கேஷியர் POS கவுண்டர்',
      bento_1_desc: 'பார்கோடு ஸ்கேனர் அல்லது விசைப்பலகை மூலம் நொடிகளில் பில் செய்யலாம். 5% GST தெர்மல் ரசீது பிரிண்டிங்.',
      bento_1_tag: 'Instant Checkout Engine →',
      bento_2_title: 'ஆடை அளவுகள் (Variant Matrix)',
      bento_2_desc: 'ஆடைகளை அளவு (S, M, L, XL, XXL) மற்றும் வண்ணங்களின் அடிப்படையில் எளிதாக நிர்வகிக்கலாம்.',
      bento_2_tag: 'Multi-Attribute Catalog →',
      bento_3_title: 'நேரலை ஸ்டாக் கட்டுப்பாடு',
      bento_3_desc: 'கூட்ட நெரிசலிலும் ஸ்டாக் அளவு பிழையின்றி குறைகிறது. அனைத்து கவுண்டர்களிலும் உடனடி பிரதிபலிப்பு.',
      bento_3_tag: 'Zero Race Conditions →',
      bento_4_title: 'சப்ளையர் கணக்கு மற்றும் ரிட்டர்ன்',
      bento_4_desc: 'ஜவுளி ஆலைகள் மற்றும் சப்ளையர்களின் வரவு செலவு கணக்குகள். கஸ்டமர் துணி மாற்றினால் ஸ்டாக் தானாக மீட்கப்படும்.',
      bento_4_tag: 'Wholesale Ledger Audit →',
      bento_5_title: 'மொபைல் மேனேஜர் ஆப்',
      bento_5_desc: 'ஸ்மார்ட்போனிலிருந்து இன்றைய வருமானம் மற்றும் ஸ்டாக் நிலவரங்களை எப்போது வேண்டுமானாலும் அறியலாம்.',
      bento_5_tag: 'Mobile Web App →',
      catalog_pretitle: 'Curated Lookbook',
      catalog_title: 'லைவ் ஆடை பட்டியல் (Catalog)',
      catalog_subtitle: 'பார்கோடு மற்றும் நேரடி விலையுடன் கிடைக்கும் சிறந்த ஆடைகள்.',
      cat_tab_all: 'All Collections (16)',
      cat_tab_men: "Men's Wear (5)",
      cat_tab_women: "Women's Wear (4)",
      cat_tab_kids: 'Kids Wear (4)',
      cat_tab_fabrics: 'Fabrics & Materials (3)',
      bill_item: 'பில் செய்க (Bill)',
      showroom_pretitle: 'Showroom & Experience',
      showroom_title: 'எங்கள் பிரதான ஷோரூமை பார்வையிடுங்கள்',
      showroom_subtitle: 'கோழிக்கோட்டில் உண்மையான கசவு கைத்தறி மற்றும் திருமண பட்டு புடவைகளை அனுபவியுங்கள்.',
      showroom_loc_label: 'Store Location',
      showroom_loc_title: 'Calicut Flagship Store',
      showroom_loc_desc: 'Fashion Street, Commercial Hub, Calicut, Kerala - 673001. வாடிக்கையாளர் பார்க்கிங் வசதியுடன்.',
      showroom_loc_sub: 'Open Daily',
      showroom_hours_label: 'இயங்கும் நேரம்',
      showroom_hours_title: 'நேர அட்டவணை',
      showroom_hours_desc: 'திங்கள் – சனி: 9:00 AM – 9:30 PM<br>ஞாயிறு: 10:00 AM – 8:00 PM<br>திருமண ஷாப்பிங் உதவி கிடைக்கும்.',
      showroom_staff_label: 'Staff Access',
      showroom_staff_title: 'Employee & POS Portal',
      showroom_staff_desc: 'கேஷியர் செக்அவுட் டெஸ்க் மற்றும் ஸ்டோர் நிர்வாகத்திற்கான பாதுகாப்பான நுழைவாயில்.',
      showroom_staff_btn: 'Staff Sign In',
      footer_desc: 'பட்டு புடவைகள், கைத்தறி ஆடைகள், ஆண்கள் மற்றும் பெண்கள் ஆடைகளுக்கான பிரீமியம் ஜவுளி மையம்.',
      footer_col_collections: 'ஆடை சேகரிப்பு (Collections)',
      footer_portals_title: 'போர்டல்கள் (Store Portals)',
      footer_link_pos: 'Billing POS Counter',
      footer_link_admin: 'Admin Portal (Desktop)',
      footer_link_signin: 'Staff Sign In',
      footer_hours_title: 'இயங்கும் நேரம் & உதவி (Showroom & Support)',
      footer_copyright: '© 2026 Kerala Textiles Retail Management System. All Rights Reserved.'
    },

    ar: {
      nav_features: 'المميزات (Features)',
      nav_collections: 'التشكيلات (Collections)',
      nav_signin: 'دخول الموظفين (Sign In)',
      theme_light: 'نهاري',
      theme_dark: 'ليلي',
      theme_light_mode: 'الوضع النهاري',
      theme_dark_mode: 'الوضع الليلي',
      hero_pill: 'Next-Gen Textile Commerce & POS Platform',
      hero_title: 'النظام المتكامل لإدارة <br><span class="gradient-text">تجارة الأقمشة والملابس.</span>',
      hero_sub: 'أقمشة كيرلا الفاخرة، حرير الأعراس والملابس العصرية — فوترة سريعة وإدارة ذكية للمخزون.',
      hero_btn_explore: 'تصفح التشكيلات (Explore)',
      hero_btn_signin: 'دخول الموظفين (Sign In)',
      mockup_title: 'KERALA TEXTILES POS • TERMINAL 01 • LIVE SESSION',
      mockup_active: 'ACTIVE TERMINAL',
      mockup_cart_title: 'عناصر السلة (Cart Items)',
      mockup_item_1_name: 'Boys Washed Denim Jacket',
      mockup_item_2_name: 'Classic Formal Cotton Shirt',
      mockup_summary_title: 'ملخص الفاتورة (Bill Summary)',
      mockup_subtotal_label: 'المجموع الفرعي (2 items)',
      mockup_gst_label: 'ضريبة GST (5%)',
      mockup_grand_label: 'المجموع الكلي (Grand Total)',
      mockup_checkout_btn: 'إتمام الدفع (Checkout)',
      bento_pretitle: 'Engineered For Retail Scale',
      bento_title: 'مصمم للمتاجر الكبرى وسرعة المعاملات.',
      bento_subtitle: 'تخلص من طوابير الفوترة، وراقب مبيعات متجرك ومخزونك في الوقت الفعلي.',
      bento_1_title: 'نظام نقاط بيع سريع (Fast POS Counter)',
      bento_1_desc: 'مسح الباركود، تطبيق الخصومات، وطباعة إيصالات حرارية 80 مم مع تفصيل الضريبة في ثوانٍ معدودة.',
      bento_1_tag: 'Instant Checkout Engine →',
      bento_2_title: 'مصفوفة المقاسات والألوان (Variant Matrix)',
      bento_2_desc: 'تصنيف الأقمشة والملابس بسهولة عبر المقاسات (S, M, L, XL, XXL) والألوان وأنواع الأقمشة.',
      bento_2_tag: 'Multi-Attribute Catalog →',
      bento_3_title: 'تحديث فوري ودقيق للمخزون',
      bento_3_desc: 'تأمين المخزون على مستوى قاعدة البيانات لمنع البيع الزائد أثناء ساعات الذروة.',
      bento_3_tag: 'Zero Race Conditions →',
      bento_4_title: 'حسابات الموردين والمرتجعات',
      bento_4_desc: 'دفاتر حسابات شاملة لمصانع الأقمشة والموردين، مع إعادة تلقائية للمرتجعات إلى الرف.',
      bento_4_tag: 'Wholesale Ledger Audit →',
      bento_5_title: 'تطبيق الهاتف لمدير المتجر',
      bento_5_desc: 'تابع إيرادات اليوم وتنبيهات نفاد المخزون مباشرة من أي هاتف ذكي عبر تطبيق الويب المتجاوب.',
      bento_5_tag: 'Mobile Web App →',
      catalog_pretitle: 'Curated Lookbook',
      catalog_title: 'كتالوج الأقمشة والملابس الحية',
      catalog_subtitle: 'تشكيلات جاهزة مع رموز الباركود SKU والأسعار الحية.',
      cat_tab_all: 'All Collections (16)',
      cat_tab_men: "Men's Wear (5)",
      cat_tab_women: "Women's Wear (4)",
      cat_tab_kids: 'Kids Wear (4)',
      cat_tab_fabrics: 'Fabrics & Materials (3)',
      bill_item: 'فوترة المنتج (Bill Item)',
      showroom_pretitle: 'Showroom & Experience',
      showroom_title: 'تفضل بزيارة معرضنا الرئيسي',
      showroom_subtitle: 'استمتع بتجربة أقمشة كاسافو التراثية وساري الحرير للأعراس في كاليكوت، كيرلا.',
      showroom_loc_label: 'موقع المعرض',
      showroom_loc_title: 'Calicut Flagship Store',
      showroom_loc_desc: 'Fashion Street, Commercial Hub, Calicut, Kerala - 673001. مواقف سيارات مريحة وتشكيلات متنوعة.',
      showroom_loc_sub: 'Open Daily',
      showroom_hours_label: 'ساعات العمل',
      showroom_hours_title: 'أوقات الدوام',
      showroom_hours_desc: 'الاثنين – السبت: 9:00 AM – 9:30 PM<br>الأحد: 10:00 AM – 8:00 PM<br>مساعدة متخصصة لمشتريات الأعراس والمناسبات.',
      showroom_staff_label: 'بوابة الموظفين',
      showroom_staff_title: 'Employee & POS Portal',
      showroom_staff_desc: 'بوابة دخول آمنة لموظفي الكاشير وإدارة متجر الأقمشة.',
      showroom_staff_btn: 'Staff Sign In',
      footer_desc: 'الوجهة المتميزة لساري الحرير، الأقمشة اليدوية التراثية، والأزياء الراقية للرجال والنساء.',
      footer_col_collections: 'التشكيلات (Collections)',
      footer_portals_title: 'بوابات النظام (Store Portals)',
      footer_link_pos: 'Billing POS Counter',
      footer_link_admin: 'Admin Portal (Desktop)',
      footer_link_signin: 'Staff Sign In',
      footer_hours_title: 'ساعات العمل والدعم (Showroom & Support)',
      footer_copyright: '© 2026 Kerala Textiles Retail Management System. All Rights Reserved.'
    }
  };

  /* --------------------------------------------------------------------------
     2. LANGUAGE SELECTION LOGIC & DROPDOWN HANDLING
     -------------------------------------------------------------------------- */
  window.setLanguage = function(lang) {
    if (!i18n[lang]) lang = 'en';
    try {
      localStorage.setItem('pos_landing_lang', lang);
    } catch (e) {}

    document.documentElement.setAttribute('lang', lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }

    const dict = i18n[lang];
    const meta = langMeta[lang] || langMeta.en;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (dict[key].includes('<')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Update button text with current language name
    const lBtn = document.getElementById('lang-btn-text');
    const fLang = document.getElementById('floating-lang-text');
    if (lBtn) lBtn.textContent = meta.name;
    if (fLang) fLang.textContent = meta.name;

    // Update active highlight in dropdowns
    document.querySelectorAll('.lang-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Refresh theme button text according to active language and current theme
    const curTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const hText = document.getElementById('theme-btn-text');
    const fText = document.getElementById('floating-theme-text');
    if (curTheme === 'light') {
      if (hText) hText.textContent = dict.theme_dark;
      if (fText) fText.textContent = dict.theme_dark_mode;
    } else {
      if (hText) hText.textContent = dict.theme_light;
      if (fText) fText.textContent = dict.theme_light_mode;
    }

    // Close menus if open
    window.closeLangMenus();
  };

  window.toggleLangMenu = function(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('lang-menu');
    if (!menu) return;
    const isShown = menu.style.display === 'flex';
    window.closeLangMenus();
    menu.style.display = isShown ? 'none' : 'flex';
  };

  window.toggleFloatingLangMenu = function(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('floating-lang-menu');
    if (!menu) return;
    const isShown = menu.style.display === 'flex';
    window.closeLangMenus();
    menu.style.display = isShown ? 'none' : 'flex';
  };

  window.closeLangMenus = function() {
    const m1 = document.getElementById('lang-menu');
    const m2 = document.getElementById('floating-lang-menu');
    if (m1) m1.style.display = 'none';
    if (m2) m2.style.display = 'none';
  };

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.lang-dropdown-wrapper') && !e.target.closest('.floating-lang-wrapper')) {
      window.closeLangMenus();
    }
  });

  /* --------------------------------------------------------------------------
     3. CATALOG CATEGORY FILTER
     -------------------------------------------------------------------------- */
  window.filterCatalog = function(category, btn) {
    document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const cards = document.querySelectorAll('.editorial-product-card');
    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  /* --------------------------------------------------------------------------
     4. LIGHT / DARK THEME TOGGLE
     -------------------------------------------------------------------------- */
  const sunSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  const moonSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  window.applyTheme = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('pos_landing_theme', theme);
    } catch (e) {}

    const curLang = localStorage.getItem('pos_landing_lang') || 'en';
    const dict = i18n[curLang] || i18n.en;

    const hText = document.getElementById('theme-btn-text');
    const hIcon = document.getElementById('theme-icon');
    const fText = document.getElementById('floating-theme-text');
    const fIcon = document.getElementById('floating-theme-icon');

    if (theme === 'light') {
      if (hText) hText.textContent = dict.theme_dark;
      if (hIcon) hIcon.innerHTML = moonSvg;
      if (fText) fText.textContent = dict.theme_dark_mode;
      if (fIcon) fIcon.innerHTML = moonSvg;
    } else {
      if (hText) hText.textContent = dict.theme_light;
      if (hIcon) hIcon.innerHTML = sunSvg;
      if (fText) fText.textContent = dict.theme_light_mode;
      if (fIcon) fIcon.innerHTML = sunSvg;
    }
  };

  window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    window.applyTheme(next);
  };

  /* --------------------------------------------------------------------------
     5. HORIZONTAL CATALOG CAROUSEL SLIDER
     -------------------------------------------------------------------------- */
  window.slideCatalogCards = function(direction) {
    const grid = document.getElementById('editorial-grid');
    if (!grid) return;
    const cardWidth = 320;
    grid.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth'
    });
  };

  /* --------------------------------------------------------------------------
     6. SCROLL REVEAL (SMOOTH SLIDE-IN ON SCROLL)
     -------------------------------------------------------------------------- */
  function initScrollSlideAnimations() {
    const targets = document.querySelectorAll('.scroll-slide-up, .scroll-slide-left, .scroll-slide-right');
    if (!targets.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      targets.forEach(el => observer.observe(el));
    } else {
      targets.forEach(el => el.classList.add('is-visible'));
    }
  }

  /* --------------------------------------------------------------------------
     7. INITIALIZE ON DOM READY
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Theme
    let savedTheme = 'dark';
    try {
      savedTheme = localStorage.getItem('pos_landing_theme') || 'dark';
    } catch (e) {}
    window.applyTheme(savedTheme);

    // 2. Initialize Language
    let savedLang = 'en';
    try {
      savedLang = localStorage.getItem('pos_landing_lang') || 'en';
    } catch (e) {}
    window.setLanguage(savedLang);

    // 3. Initialize Smooth Scroll-Reveal Slide-In Animations
    initScrollSlideAnimations();
  });

})();
