/* =============================================================================
 * RAQEEM · Physics Educational Labs — DEMO Content Model
 * ========================================================================== */

window.RAQEEM_DATA = {

  isDemo: true,

  contact: {
    instagram: "https://instagram.com/el8dev",
    instagramHandle: "el8dev",
    github: "https://github.com/el8dev",
    githubHandle: "el8dev",
    website: "https://el8.dev",
    websiteDisplay: "el8.dev",
    phone: "07721230011",
    whatsapp: "https://wa.me/9647721230011",
    promoTitle: "النسخة التجريبية (DEMO)",
    promoText: "تواصل معنا للحصول على الإصدار الكامل — أكثر من 50 تجربة فيزياء تفاعلية لأول 3 فصول فقط!"
  },

  chapters: [

    /* ------------------------------------------------------------------ 01 */
    {
      id: 'capacitors',
      num: '01',
      status: 'available',
      icon: 'capacitor',
      image: 'assets/chapters/ch1-capacitors.jpg',
      tone: 'light',
      title: { ar: 'الفصل الأول — المتسعات (DEMO)', en: 'Chapter One — Capacitors (DEMO)' },
      desc: {
        ar: 'العوازل، التطبيقات الذكية، وطرق ربط المتسعات',
        en: 'Dielectrics, smart applications and capacitor networks'
      },
      experiments: [
        {
          id: 'nonpolar',
          href: 'experiments/nonpolar.html',
          icon: 'cubes',
          title: { ar: 'العوازل غير القطبية', en: 'Non-polar Dielectrics' },
          desc: { ar: 'استقطاب المادة العازلة داخل المجال وتأثيره', en: 'Polarisation of the dielectric inside the field' }
        },
        {
          id: 'capacitor-keyboard',
          href: 'experiments/capacitor_application_keyboard.html',
          icon: 'grid',
          title: { ar: 'لوحة مفاتيح الحاسوب (الكيبورد)', en: 'Computer Keyboard' },
          desc: { ar: 'تغير سعة المتسعة بتغير البعد بين الصفيحتين عند الضغط', en: 'Capacitance change upon key press and distance variation' }
        },
        {
          id: 'parallel',
          href: 'experiments/parallel.html',
          icon: 'parallel',
          title: { ar: 'ربط المتسعات على التوازي', en: 'Parallel Capacitor Connection' },
          desc: { ar: 'توزيع الشحنة وثبوت فرق الجهد بين الفروع المتوازية', en: 'Distribute charge across parallel branches' }
        }
      ]
    },

    /* ------------------------------------------------------------------ 02 */
    {
      id: 'induction',
      num: '02',
      status: 'available',
      icon: 'magnet',
      image: 'assets/chapters/ch2-induction.jpg',
      tone: 'dark',
      title: { ar: 'الفصل الثاني — الحث الكهرومغناطيسي (DEMO)', en: 'Chapter Two — Electromagnetic Induction (DEMO)' },
      desc: {
        ar: 'حركة الشحنات، قوة لورنتز، واكتشاف فراداي التاريخي',
        en: 'Charged particles, Lorentz force and historical Faraday discovery'
      },
      experiments: [
        {
          id: 'fields-effect',
          href: 'experiments/fields_effect.html',
          icon: 'atom',
          title: { ar: 'حركة الجسيمات المشحونة', en: 'Motion of Charged Particles' },
          desc: { ar: 'مسار الشحنة تحت تأثير المجالين الكهربائي والمغناطيسي (قوة لورنتز)', en: 'Charge trajectories under electric and magnetic Lorentz forces' }
        },
        {
          id: 'faraday-ring',
          href: 'experiments/induction.html',
          icon: 'ring',
          title: { ar: 'تجربة حلقة فراداي', en: "Faraday's Ring Experiment" },
          desc: { ar: 'التجربة التاريخية للحث الكهرومغناطيسي وتوليد التيار المحتث', en: 'The historic mutual-induction experiment' }
        }
      ]
    },

    /* ------------------------------------------------------------------ 03 */
    {
      id: 'alternating-current',
      num: '03',
      status: 'available',
      icon: 'wave',
      image: 'assets/chapters/ch3-alternating-current.jpg',
      tone: 'dark',
      title: { ar: 'الفصل الثالث — التيار المتناوب (DEMO)', en: 'Chapter Three — Alternating Current (DEMO)' },
      desc: {
        ar: 'مقارنة المستمر والمتناوب والمكافئ الحراري الفعّال',
        en: 'DC vs AC comparison, thermal equivalent and RMS effective values'
      },
      experiments: [
        {
          id: 'intro-dc-vs-ac',
          href: 'experiments/intro_dc_vs_ac.html',
          icon: 'wave',
          title: { ar: 'مقارنة بين التيار المستمر (DC) والتيار المتناوب (AC)', en: 'DC vs AC Comparison' },
          desc: { ar: 'دراسة ومقارنة خصائص وسلوك التيارين المستمر والمتناوب', en: 'Study and compare the behavior of DC and AC currents' }
        },
        {
          id: 'concept-rms-thermal-effect',
          href: 'experiments/concept_rms_thermal_effect.html',
          icon: 'bulb',
          title: { ar: 'المقدار المؤثر للتيار المتناوب (المكافئ الحراري)', en: 'RMS Value & Thermal Equivalent of AC' },
          desc: { ar: 'المفهوم الفيزيائي للتأثير الحراري والمقدار الفعّال Irms', en: 'Thermal effect physical concept and Irms effective value' }
        }
      ]
    }

  ],

  /* ===========================================================================
   * Interface copy — every visible shell string lives here (AR / EN).
   * ======================================================================== */
  i18n: {
    ar: {
      dir: 'rtl',
      brand_sub: 'مختبرات رقيم (DEMO)',
      splash_tag: 'Physics Educational Labs · DEMO',
      lang_switch: 'English',

      home_title: 'بوابة الفيزياء التعليمية',
      home_subtitle: 'نسخة تجريبية مختارة — تفاعل مع أحدث محاكيات الفيزياء المنهجية',
      home_kicker: 'مختبر فيزياء رقمي · الإصدار التجريبي DEMO',
      home_cta: 'استكشف النسخة التجريبية',
      home_stat_chapters: 'فصول ديمو',
      home_stat_experiments: 'تجارب مختارة',
      home_stat_offline: 'يعمل بدون إنترنت',

      auth_title: 'مرحباً بك',
      auth_lead: 'سجّل دخولك للوصول إلى تجارب النسخة التجريبية',
      auth_label: 'اسم الأستاذ',
      auth_placeholder: 'أدخل اسمك الكريم هنا...',
      auth_submit: 'دخول النسخة التجريبية',
      auth_hint: 'أدخل اسمك الكريم للبدء — لا توجد كلمة مرور',
      auth_back: 'رجوع',

      dash_greeting: 'مرحباً بك، أستاذ {name}',
      dash_lead: 'اختر فصلاً واستكشف التجارب المتاحة في الإصدار التجريبي.',
      dash_stat_chapters: 'الفصول المتاحة',
      dash_stat_experiments: 'تجارب الديمو',
      dash_stat_progress: 'التجارب المُنجزة',
      dash_recent: 'وصول سريع',
      dash_recent_empty: 'لم تفتح أي تجربة بعد — ابدأ من الفصول بالأسفل.',
      dash_chapters: 'الفصول الدراسية (DEMO)',
      dash_chapters_lead: 'اسحب أو استخدم الأسهم للتنقل بين فصول النسخة التجريبية',
      dash_logout: 'تسجيل الخروج',
      dash_profile: 'الحساب',

      card_experiments_zero: 'لا توجد تجارب',
      card_experiment_one: 'تجربة واحدة',
      card_experiments_two: 'تجربتان',
      card_experiments_few: '{n} تجارب',
      card_experiments_many: '{n} تجربة',
      card_experiments: '{n} تجارب تجريبية',
      card_soon: 'قيد التطوير',
      card_open: 'افتح الفصل',
      card_close: 'إغلاق',
      card_progress: '{done} من {total}',

      panel_title: 'تجارب {chapter}',
      panel_close: 'إغلاق القائمة',
      exp_visited: 'تمت زيارتها',
      exp_open: 'فتح التجربة',

      label_next: 'الفصل التالي',
      label_prev: 'الفصل السابق',
      label_switching: 'جارٍ التبديل',
      label_loading: 'جارٍ التحميل',
      label_explore: 'استكشف',

      theme_to_light: 'الوضع النهاري',
      theme_to_dark: 'الوضع الليلي',

      toast_locked: 'هذا الفصل قيد التطوير والتحضير حالياً!',
      toast_name: 'يرجى كتابة اسم صحيح (٣ أحرف على الأقل)',
      toast_welcome: 'أهلاً بك يا أستاذ {name} في النسخة التجريبية',
      toast_logout: 'تم تسجيل الخروج بأمان'
    },

    en: {
      dir: 'ltr',
      brand_sub: 'Raqeem Labs (DEMO)',
      splash_tag: 'Physics Educational Labs · DEMO',
      lang_switch: 'العربية',

      home_title: 'Physics Educational Portal',
      home_subtitle: 'Selected Demo Edition — Experience state-of-the-art interactive physics simulations',
      home_kicker: 'Digital Physics Lab · DEMO Version',
      home_cta: 'Explore Demo Version',
      home_stat_chapters: 'Demo Chapters',
      home_stat_experiments: 'Selected Labs',
      home_stat_offline: 'Works fully offline',

      auth_title: 'Welcome',
      auth_lead: 'Sign in to access demo chapters & experiments',
      auth_label: "Professor's Name",
      auth_placeholder: 'Enter your name here...',
      auth_submit: 'Enter Demo',
      auth_hint: 'Enter your name to start — no password required',
      auth_back: 'Back',

      dash_greeting: 'Welcome, Prof. {name}',
      dash_lead: 'Pick a chapter and explore the curated demo experiments.',
      dash_stat_chapters: 'Available Chapters',
      dash_stat_experiments: 'Demo Labs',
      dash_stat_progress: 'Labs Completed',
      dash_recent: 'Quick access',
      dash_recent_empty: "You haven't opened an experiment yet — start from below.",
      dash_chapters: 'Curriculum Chapters (DEMO)',
      dash_chapters_lead: 'Drag, swipe or use arrows to navigate',
      dash_logout: 'Sign out',
      dash_profile: 'Account',

      card_experiments_zero: 'No experiments',
      card_experiment_one: 'One experiment',
      card_experiments_two: '2 experiments',
      card_experiments_few: '{n} experiments',
      card_experiments_many: '{n} experiments',
      card_experiments: '{n} demo labs',
      card_soon: 'In development',
      card_open: 'Open chapter',
      card_close: 'Close',
      card_progress: '{done} of {total}',

      panel_title: '{chapter} — demo experiments',
      panel_close: 'Close list',
      exp_visited: 'Visited',
      exp_open: 'Open Lab',

      label_next: 'Next chapter',
      label_prev: 'Previous chapter',
      label_switching: 'Switching',
      label_loading: 'Loading',
      label_explore: 'Explore',

      theme_to_light: 'Light mode',
      theme_to_dark: 'Dark mode',

      toast_locked: 'This chapter is locked in demo mode!',
      toast_name: 'Please enter a valid name (at least 3 characters)',
      toast_welcome: 'Welcome, Prof. {name} — Demo Ready',
      toast_logout: 'Signed out safely'
    }
  }
};
