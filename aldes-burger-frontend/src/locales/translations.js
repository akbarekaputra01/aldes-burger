const translations = {
  en: {
    // ──────────────────────────────────────
    // COMMON
    // ──────────────────────────────────────
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      loading: 'Loading...',
      loadingProfile: 'Preparing Your Profile...',
      loadingDashboard: 'Loading Dashboard...',
      loadingInventory: 'Loading Inventory Data...',
      loadingOrderDetails: 'Fetching Order Details...',
      loadingMenuManagement: 'Loading Menu Management...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      back: 'Back',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      search: 'Search',
      default: 'Default',
      noData: 'No data available.',
      guest: 'Guest',
    },

    // ──────────────────────────────────────
    // NAVBAR
    // ──────────────────────────────────────
    navbar: {
      menu: 'Menu',
      transactions: 'Transactions',
      cart: 'Cart',
      profile: 'Profile',
      login: 'Login',
      signup: 'Sign Up',
      searchPlaceholder: 'SEARCH...',
      searchTitle: 'Search Menu',
    },

    // ──────────────────────────────────────
    // FOOTER
    // ──────────────────────────────────────
    footer: {
      tagline: 'Enjoy the deliciousness of an authentic burger made with carefully selected premium ingredients. Your satisfaction is our top priority.',
      quickLinks: 'Quick Links',
      contactUs: 'Contact Us',
      orderNow: 'Order Now',
      buildBurger: 'Build Your Burger',
      checkTransaction: 'Check Transaction',
      myAccount: 'My Account',
      copyright: 'All Rights Reserved.',
    },

    // ──────────────────────────────────────
    // LANDING PAGE
    // ──────────────────────────────────────
    landing: {
      badge: 'Freshly Grilled Daily 🔥',
      headline1: 'YOUR BURGER',
      headline2: 'YOUR RULES.',
      subheadline: "Build every layer exactly how you like it. Extra cheese? No onions? Double patty? It's all in your hands.",
      startBuilding: 'Start Building',
      exploreMenu: 'Explore Menu',
      estPrice: 'Est. Price',
      seeHowTitle: 'See How It Comes Together',
      seeHowSub: 'Scroll to assemble your master stack',
      yourMasterpiece: 'Your Masterpiece',
      orderNow: 'Order Now',
      fromKitchenBadge: 'Fresh Kitchen Logistics',
      fromKitchenTitle: 'FROM KITCHEN TO YOUR DOORSTEP',
      fromKitchenSub: 'See exactly how your custom burger goes from our grills straight to your hands.',
      step1Title: '1. Design Your Order',
      step1Desc: 'Pick your base canvas, stack your favorite patties, cheese types, and signature house sauces inside the builder.',
      step2Title: '2. Grilled on Demand',
      step2Desc: 'Our chefs immediately grill your premium beef patties over an open flame according to your exact specifications.',
      step3Title: '3. Heat-Sealed Packing',
      step3Desc: 'Your burger is packed into dedicated insulative foils to fully preserve the warmth and melted cheese texture.',
      step4Title: '4. Fast Dispatch',
      step4Desc: 'Our delivery network is dispatched to get your order to your physical location in under 30 minutes.',
      reviewsTitle: 'WHAT THEY SAY ABOUT US',
      reviewsSub: 'Real community feedback from our custom burger architects',
      orderVerified: 'ORDER VERIFIED ✔',
      ctaBadge: '🔥 Hunger Alert Sequence Detected',
      ctaTitle1: 'SERVED HOT.',
      ctaTitle2: 'DELIVERED FAST.',
      ctaSub: 'Thick juicy patties, melted cheddar blankets, and your customized signature ingredients delivered fresh to your doorstep right now.',
      ctaButton: 'ORDER NOW',
    },

    // ──────────────────────────────────────
    // MENU PAGE
    // ──────────────────────────────────────
    menu: {
      burgers: 'BURGERS',
      sideDishes: 'SIDE DISHES',
      drinks: 'DRINKS',
      kitchen: 'Kitchen',
      tastySide: 'Tasty Side',
      refreshment: 'Refreshment',
      signatureBurger: 'Signature Burger',
      customize: 'Customize',
      add: 'Add',
      confirm: 'Confirm',
      clearSearch: 'Clear Search',
      showingResultsFor: 'Showing Results For:',
      foundItems: (n) => `Found ${n} items`,
      noItemsFound: 'Oops!',
      noItemsDesc: (q) => `No items found for "${q}"`,
      seeAllMenu: 'See All Menu',
      imageNotFound: 'Image Not Found',
      addedToCart: (qty, name) => `Successfully added ${qty}x ${name}`,
      outOfStock: 'Out of Stock',
    },

    // ──────────────────────────────────────
    // CART PAGE
    // ──────────────────────────────────────
    cart: {
      title: 'MY ORDERS',
      subtitle: 'CHECK AND MANAGE YOUR ITEMS BEFORE CHECKOUT! ✨',
      selectAll: (n) => `SELECT ALL (${n} ITEMS)`,
      addMoreOrders: 'ADD MORE ORDERS',
      totalItemsSelected: (n) => `TOTAL ITEMS SELECTED (${n})`,
      totalPayment: 'TOTAL PAYMENT',
      proceedToCheckout: 'PROCEED TO CHECKOUT',
      noImg: 'No Img',
    },

    // ──────────────────────────────────────
    // CHECKOUT PAGE
    // ──────────────────────────────────────
    checkout: {
      deliveryAddress: 'Delivery Address',
      loadingAddresses: 'Loading addresses...',
      noAddress: 'No address found. Please add one.',
      addAddress: 'Add Address',
      addNewAddress: 'Add New Address',
      change: 'Change',
      paymentMethod: 'Payment Method',
      bankTransfer: 'Online Payment',
      cash: 'Cash',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      free: 'FREE',
      grandTotal: 'Grand Total',
      placeOrder: 'Place Order',
      ordering: 'Ordering...',
      selectAddressWarning: '⚠ Please select a delivery address',
      processingOrder: 'Processing Order',
      preparingPayment: 'Preparing Payment',
      pleaseWait: 'Please wait a moment...',
      default: 'Default',
      failed: 'Failed to place order. Please try again.',
    },

    // ──────────────────────────────────────
    // PROFILE PAGE
    // ──────────────────────────────────────
    profile: {
      default: 'Default',
      myProfile: 'My Profile',
      hello: (name) => `Hello, ${name}!`,
      member: 'Member',
      email: 'Email',
      phone: 'Phone',
      unset: 'Unset',
      security: 'Security',
      changePassword: 'CHANGE PASSWORD',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      savePassword: 'SAVE',
      passwordUpdated: 'Password updated successfully!',
      passwordMismatch: 'New password confirmation does not match!',
      passwordChangeFailed: 'Failed to change password. Please ensure your current password is correct.',
      logOut: 'LOG OUT ACCOUNT',
      logoutConfirm: 'Are you sure you want to log out of your account?',
      addressBook: 'Address Book',
      saved: (n) => `${n} Saved`,
      noAddressYet: 'No Address Yet',
      noAddressDesc: 'Add a delivery address to make ordering faster.',
      addNewAddress: 'ADD NEW ADDRESS',
      setAsDefault: 'Set as Default',
      editAddress: 'Edit Address',
      deleteAddress: 'Delete Address',
      loadError: 'Failed to load profile data. Please refresh the page.',
      deleteError: 'Failed to delete address. Please try again.',
      language: 'Language / Bahasa',
    },

    // ──────────────────────────────────────
    // TRANSACTIONS PAGE
    // ──────────────────────────────────────
    transactions: {
      statusUpdate: 'Status Update',
      orderJournal: 'Order',
      orderJournal2: 'Journal',
      onGoing: 'On Going',
      history: 'History',
      totalBill: 'Total Bill',
      promoApplied: 'Promo Applied',
      kitchenQuiet: "Kitchen is Quiet!",
      kitchenQuietDesc: "You haven't ordered anything yet. Let's get some burgers!",
      noHistory: 'No History Yet',
      noHistoryDesc: 'Your past orders will appear here.',
      letsOrder: "Let's Cook Something!",
    },

    // ──────────────────────────────────────
    // TRANSACTION DETAIL PAGE
    // ──────────────────────────────────────
    transactionDetail: {
      orderDetail: 'Order Detail',
      back: 'Back',
      status: 'Status',
      paymentMethod: 'Payment Method',
      deliveryAddress: 'Delivery Address',
      orderItems: 'Order Items',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      free: 'FREE',
      total: 'Total',
      cancelOrder: 'Cancel Order',
      payNow: 'Pay Now',
      orderDate: 'Order Date',
      noItems: 'No items found.',
      cancelConfirm: 'Are you sure you want to cancel this order?',
    },

    // ──────────────────────────────────────
    // PAYMENT STATUS PAGE
    // ──────────────────────────────────────
    paymentStatus: {
      success: 'Payment Successful!',
      successDesc: 'Your order has been confirmed and is being prepared.',
      failed: 'Payment Failed',
      failedDesc: 'Something went wrong with your payment. Please try again.',
      pending: 'Payment Pending',
      pendingDesc: 'Your payment is being processed.',
      viewOrders: 'View My Orders',
      backToMenu: 'Back to Menu',
    },

    // ──────────────────────────────────────
    // AUTH PAGE
    // ──────────────────────────────────────
    auth: {
      freshJuicyCrispy: 'Fresh. Juicy. Crispy.',
      welcomeBack: 'Welcome',
      welcomeBack2: 'Back!',
      resetPassword: 'Reset',
      resetPassword2: 'Password',
      verifyOtp: 'Verify',
      verifyOtp2: 'OTP Code',
      almostThere: 'Almost',
      almostThere2: 'There!',
      loginDesc: 'Log in with your registered email to continue your order.',
      forgotDesc: "Enter your registered email and we'll send you an OTP code.",
      verifyDesc: 'Enter the OTP code we sent you to proceed.',
      resetDesc: 'Create a new secure password for your account.',
      memberLogin: 'Member Login',
      forgotPassword: 'Forgot Password',
      otpValidation: 'OTP Validation',
      createNewPass: 'Create New Pass',
      logIn: 'Log In',
      recover: 'Recover',
      verify: 'Verify',
      newPass: 'New Pass',
      registeredEmail: 'Registered Email',
      password: 'Password',
      forgot: 'Forgot?',
      signingIn: 'Signing In...',
      sending: 'Sending OTP...',
      verifying: 'Verifying...',
      resetting: 'Resetting...',
      sendOtp: 'Send OTP',
      verifyOtpBtn: 'Verify OTP',
      updatePassword: 'Update Password',
      backToLogin: 'Back to Login',
      cancelBtn: 'Cancel',
      enterSixDigit: 'Enter 6-Digit Code',
      newPasswordLabel: 'New Password',
      confirmPassword: 'Confirm Password',
      newToAldes: 'New to Aldes Burger?',
      createAccount: 'Create account',
      fast: 'Fast',
      fastSub: 'Login',
      hot: 'Hot',
      hotSub: 'Deals',
      fresh: 'Fresh',
      freshSub: 'Taste',
      enterPassword: 'Enter your password',
      enterNewPassword: 'Enter new password',
      reEnterNewPassword: 'Re-enter new password',
      // Validation errors
      errEmail: 'Please enter your registered email address.',
      errGmail: 'Please use a valid Gmail address ending with @gmail.com.',
      errPassword: 'Please enter your password.',
      errNotRegistered: 'This email is not registered. Please check your email or create a new account.',
      errWrongPassword: 'The password does not match the registered email.',
      errLoginFailed: 'Login failed. Please check your credentials.',
      errEmailNotRegistered: 'This email is not registered.',
      errSendOtp: 'Failed to send OTP. Please try again.',
      errInvalidOtp: 'Invalid OTP code. Please try again.',
      errOtpDigits: 'OTP must be exactly 6 digits.',
      errNewPassword: 'Please enter a new password.',
      errPasswordMismatch: 'Password confirmation does not match.',
      errResetFailed: 'Failed to reset password. Please try again.',
      successOtpSent: 'An OTP code has been sent to your email.',
      successOtpVerified: 'OTP Verified! Please enter your new password.',
      successReset: 'Your password has been reset successfully. Please log in.',
    },

    // ──────────────────────────────────────
    // SIGNUP PAGE
    // ──────────────────────────────────────
    signup: {
      title: 'Create Account',
      subtitle: 'Join Aldes Burger and start building your perfect burger!',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      alreadyHave: 'Already have an account?',
      loginHere: 'Login here',
      creating: 'Creating...',
    },

    // ──────────────────────────────────────
    // KITCHEN PAGE
    // ──────────────────────────────────────
    kitchen: {
      title: 'Build Your Burger',
      subtitle: 'Customize your stack below',
      ingredients: 'Ingredients',
      yourStack: 'Your Stack',
      addToCart: 'Add to Cart',
      totalPrice: 'Total Price',
      clearStack: 'Clear Stack',
      emptyStack: 'Start adding ingredients above!',
      noIngredients: 'No ingredients available.',
    },

    // ──────────────────────────────────────
    // NOT FOUND PAGE
    // ──────────────────────────────────────
    notFound: {
      title: '404',
      subtitle: 'Page Not Found',
      desc: "The page you're looking for doesn't exist or has been moved.",
      backHome: 'Back to Home',
    },

    // ──────────────────────────────────────
    // ADMIN — Layout
    // ──────────────────────────────────────
    adminLayout: {
      adminPanel: 'Admin Panel',
      overview: 'Overview',
      orders: 'Orders',
      menu: 'Menu',
      inventory: 'Inventory',
      logout: 'Logout',
      loggingOut: 'Logging out...',
      headerTitle: 'Kitchen Operations & Business Insights',
    },

    // ──────────────────────────────────────
    // ADMIN — Dashboard
    // ──────────────────────────────────────
    adminDashboard: {
      totalOrders: 'Total Orders',
      pending: 'Pending',
      cooking: 'Cooking',
      cancelled: 'Cancelled',
      revenue: 'Revenue (Done)',
      showing: 'Showing:',
      orders: 'Orders',
      completed: 'Completed (Done)',
      orderId: 'Order ID',
      customer: 'Customer',
      items: 'Items',
      status: 'Status',
      noOrders: 'No orders found for this category.',
    },

    // ──────────────────────────────────────
    // ADMIN — Orders
    // ──────────────────────────────────────
    adminOrders: {
      title: 'Live Orders',
      subtitle: 'Manage and update kitchen orders in real-time',
      activeOrders: 'Active Orders',
      allClear: 'All Clear!',
      allClearDesc: 'No active orders right now.',
      refresh: 'Refresh',
      lastUpdated: 'Last updated',
      buildOrder: 'Build Order / Ingredients:',
      customerNote: 'Customer Note',
      markAs: (status) => `Mark as ${status}`,
      cancelOrder: 'Cancel Order',
      cancelConfirm: 'Cancel this order?',
      viewDetails: 'View Details',
      sortBy: 'Sort By',
      newest: 'Newest First',
      oldest: 'Oldest First',
    },

    // ──────────────────────────────────────
    // ADMIN — Menu Management
    // ──────────────────────────────────────
    adminMenu: {
      title: 'Menu Management',
      addMenu: 'Add New Menu',
      editMenu: 'Edit Menu',
      deleteMenu: 'Delete Menu',
      menuName: 'Menu Name',
      price: 'Price',
      category: 'Category',
      description: 'Description',
      isCustom: 'Custom (Kitchen)',
      save: 'Save',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this menu?',
      noMenu: 'No menu items found.',
      ingredients: 'Ingredients',
      manageIngredients: 'Manage Ingredients',
    },

    // ──────────────────────────────────────
    // ADMIN — Inventory
    // ──────────────────────────────────────
    adminInventory: {
      title: 'Inventory',
      addIngredient: 'Add Ingredient',
      editIngredient: 'Edit Ingredient',
      deleteIngredient: 'Delete Ingredient',
      ingredientName: 'Ingredient Name',
      stock: 'Stock',
      unit: 'Unit',
      price: 'Price',
      save: 'Save',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this ingredient?',
      noIngredients: 'No ingredients found.',
      lowStock: 'Low Stock',
    },

    // ──────────────────────────────────────
    // ADDRESS FORM
    // ──────────────────────────────────────
    addressForm: {
      recipientName: 'Recipient Name',
      recipientNamePlaceholder: 'e.g. Sam Raimi',
      phoneNumber: 'Phone Number',
      phoneNumberPlaceholder: 'e.g. 081317539933',
      usePhone: 'Use',
      selectRegion: 'Select Region',
      selectRegionPlaceholder: 'Select location points below',
      regionLabel: 'Province, City, District, Postal Code',
      province: 'PROVINCE',
      city: 'CITY',
      district: 'DISTRICT',
      postal: 'POSTAL',
      selectProvince: 'Select Province',
      selectCity: 'Select City/Regency',
      selectDistrict: 'Select District',
      selectPostalCode: 'Select or type Postal Code',
      selectDistrictFirst: 'Select district first',
      streetAddress: 'Street Address',
      streetAddressPlaceholder: 'Street Name, Building, House No.',
      selectRegionFirst: 'Select Region First',
      placeAccuratePin: 'Place an accurate pin',
      deliverToMap: 'We will deliver to your map location.',
      currentLoc: 'Current Loc',
      addLocation: 'Add Location',
      viewFullMap: 'View Full Map',
      otherDetails: 'Other Details',
      otherDetailsPlaceholder: 'Other Details (e.g. Block / Unit No., Landmarks)',
      labelAs: 'Label As:',
      home: 'Home',
      work: 'Work',
      other: 'Other',
      setAsDefault: 'Set as Default Address',
      saveAddress: 'Save Address',
      saving: 'Saving...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      pinLocation: 'Pin Location',
      yourPinIsHere: 'Your pin is here',
      dragMap: 'DRAG MAP TO ADJUST',
      useCurrentLocation: 'Use Current Location',
      noPinSelected: 'No location pin selected',
      fillStreetFirst: 'Fill in the street address first to display the map.',
      chooseLocationWarning: 'Choose a location from the suggestions or set a map pin so the courier can find your address.',
      postalCodeFirstWarning: 'Please select or type a postal code first to see street suggestions.',
      postalCodeUnavailableWarning: 'Postal code recommendations are unavailable, please type 5 digits manually.',
      searchingSuggestions: 'Searching address suggestions...',
      noSuggestionsFound: 'No suggestions found.',
      fetchSuggestionsFailed: 'Unable to fetch suggestions right now. Try moving the map pin manually.',
      addressNotFound: 'Address not found.',
      loadAddressFailed: 'Unable to load selected address.',
      loadMapFailed: 'Unable to load map.',
      completeAllFields: 'Please complete all address fields first.',
      saveAddressFailed: 'Failed to save the address details.',
      geolocationUnsupported: 'Geolocation is not supported by your browser.',
      retrieveLocationFailed: 'Unable to retrieve your location. Please check browser permissions.',
      editPin: 'Edit Pin Location',
    },
  },

  // ════════════════════════════════════════
  // BAHASA INDONESIA
  // ════════════════════════════════════════
  id: {
    // ──────────────────────────────────────
    // COMMON
    // ──────────────────────────────────────
    common: {
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      add: 'Tambah',
      loading: 'Memuat...',
      loadingProfile: 'Menyiapkan Profilmu...',
      loadingDashboard: 'Memuat Dashboard...',
      loadingInventory: 'Memuat Data Inventaris...',
      loadingOrderDetails: 'Mengambil Detail Pesanan...',
      loadingMenuManagement: 'Memuat Manajemen Menu...',
      error: 'Kesalahan',
      success: 'Berhasil',
      confirm: 'Konfirmasi',
      back: 'Kembali',
      close: 'Tutup',
      yes: 'Ya',
      no: 'Tidak',
      search: 'Cari',
      default: 'Utama',
      noData: 'Tidak ada data.',
      guest: 'Tamu',
    },

    // ──────────────────────────────────────
    // NAVBAR
    // ──────────────────────────────────────
    navbar: {
      menu: 'Menu',
      transactions: 'Transaksi',
      cart: 'Keranjang',
      profile: 'Profil',
      login: 'Masuk',
      signup: 'Daftar',
      searchPlaceholder: 'CARI...',
      searchTitle: 'Cari Menu',
    },

    // ──────────────────────────────────────
    // FOOTER
    // ──────────────────────────────────────
    footer: {
      tagline: 'Nikmati kelezatan burger otentik yang dibuat dengan bahan-bahan premium pilihan. Kepuasan Anda adalah prioritas utama kami.',
      quickLinks: 'Tautan Cepat',
      contactUs: 'Hubungi Kami',
      orderNow: 'Pesan Sekarang',
      buildBurger: 'Rakit Burger Anda',
      checkTransaction: 'Cek Transaksi',
      myAccount: 'Akun Saya',
      copyright: 'Semua Hak Dilindungi.',
    },

    // ──────────────────────────────────────
    // LANDING PAGE
    // ──────────────────────────────────────
    landing: {
      badge: 'Dipanggang Segar Setiap Hari 🔥',
      headline1: 'BURGER MU',
      headline2: 'ATURAN MU.',
      subheadline: 'Susun setiap lapisan sesuai seleramu. Extra keju? Tanpa bawang? Double patty? Semua ada di tanganmu.',
      startBuilding: 'Mulai Rakit',
      exploreMenu: 'Jelajahi Menu',
      estPrice: 'Est. Harga',
      seeHowTitle: 'Lihat Cara Membuatnya',
      seeHowSub: 'Gulir untuk merakit burger impianmu',
      yourMasterpiece: 'Mahakarya Kamu',
      orderNow: 'Pesan Sekarang',
      fromKitchenBadge: 'Logistik Dapur Segar',
      fromKitchenTitle: 'DARI DAPUR KE PINTU RUMAHMU',
      fromKitchenSub: 'Lihat bagaimana burger kustom kamu pergi dari panggangan kami langsung ke tanganmu.',
      step1Title: '1. Rancang Pesananmu',
      step1Desc: 'Pilih kanvas dasarmu, susun patty favoritmu, jenis keju, dan saus khas rumah di dalam builder.',
      step2Title: '2. Dipanggang Sesuai Pesanan',
      step2Desc: 'Chef kami langsung memanggang patty daging sapi premium di atas api terbuka sesuai spesifikasi tepatmu.',
      step3Title: '3. Dikemas Kedap Panas',
      step3Desc: 'Burgermu dikemas dalam foil insulatif khusus untuk menjaga kehangatan dan tekstur keju yang meleleh.',
      step4Title: '4. Pengiriman Cepat',
      step4Desc: 'Jaringan pengiriman kami siap mengantarkan pesananmu ke lokasimu dalam waktu kurang dari 30 menit.',
      reviewsTitle: 'APA KATA MEREKA',
      reviewsSub: 'Ulasan nyata dari komunitas perakit burger kustom kami',
      orderVerified: 'PESANAN TERVERIFIKASI ✔',
      ctaBadge: '🔥 Peringatan Lapar Terdeteksi',
      ctaTitle1: 'DISAJIKAN PANAS.',
      ctaTitle2: 'DIANTAR CEPAT.',
      ctaSub: 'Patty tebal dan juicy, selimut cheddar meleleh, dan bahan khas kustom kamu diantarkan segar ke pintu rumahmu sekarang.',
      ctaButton: 'PESAN SEKARANG',
    },

    // ──────────────────────────────────────
    // MENU PAGE
    // ──────────────────────────────────────
    menu: {
      burgers: 'BURGER',
      sideDishes: 'MAKANAN PENDAMPING',
      drinks: 'MINUMAN',
      kitchen: 'Dapur',
      tastySide: 'Pendamping Lezat',
      refreshment: 'Minuman Segar',
      signatureBurger: 'Burger Andalan',
      customize: 'Kustomisasi',
      add: 'Tambah',
      confirm: 'Konfirmasi',
      clearSearch: 'Hapus Pencarian',
      showingResultsFor: 'Menampilkan Hasil Untuk:',
      foundItems: (n) => `Ditemukan ${n} item`,
      noItemsFound: 'Ups!',
      noItemsDesc: (q) => `Tidak ada item untuk "${q}"`,
      seeAllMenu: 'Lihat Semua Menu',
      imageNotFound: 'Gambar Tidak Ada',
      addedToCart: (qty, name) => `Berhasil menambahkan ${qty}x ${name}`,
      outOfStock: 'Stok Habis',
    },

    // ──────────────────────────────────────
    // CART PAGE
    // ──────────────────────────────────────
    cart: {
      title: 'PESANAN SAYA',
      subtitle: 'PERIKSA DAN KELOLA ITEM SEBELUM CHECKOUT! ✨',
      selectAll: (n) => `PILIH SEMUA (${n} ITEM)`,
      addMoreOrders: 'TAMBAH PESANAN',
      totalItemsSelected: (n) => `TOTAL ITEM DIPILIH (${n})`,
      totalPayment: 'TOTAL PEMBAYARAN',
      proceedToCheckout: 'LANJUT KE CHECKOUT',
      noImg: 'Tdk Ada Foto',
    },

    // ──────────────────────────────────────
    // CHECKOUT PAGE
    // ──────────────────────────────────────
    checkout: {
      deliveryAddress: 'Alamat Pengiriman',
      loadingAddresses: 'Memuat alamat...',
      noAddress: 'Alamat tidak ditemukan. Silakan tambahkan.',
      addAddress: 'Tambah Alamat',
      addNewAddress: 'Tambah Alamat Baru',
      change: 'Ganti',
      paymentMethod: 'Metode Pembayaran',
      bankTransfer: 'Pembayaran Online',
      cash: 'Tunai',
      orderSummary: 'Ringkasan Pesanan',
      subtotal: 'Subtotal',
      delivery: 'Pengiriman',
      free: 'GRATIS',
      grandTotal: 'Total Keseluruhan',
      placeOrder: 'Buat Pesanan',
      ordering: 'Memproses...',
      selectAddressWarning: '⚠ Silakan pilih alamat pengiriman',
      processingOrder: 'Memproses Pesanan',
      preparingPayment: 'Menyiapkan Pembayaran',
      pleaseWait: 'Mohon tunggu sebentar...',
      default: 'Utama',
      failed: 'Gagal membuat pesanan. Silakan coba lagi.',
    },

    // ──────────────────────────────────────
    // PROFILE PAGE
    // ──────────────────────────────────────
    profile: {
      default: 'Utama',
      myProfile: 'Profil Saya',
      hello: (name) => `Halo, ${name}!`,
      member: 'Anggota',
      email: 'Email',
      phone: 'Telepon',
      unset: 'Belum Diisi',
      security: 'Keamanan',
      changePassword: 'UBAH KATA SANDI',
      currentPassword: 'Kata Sandi Saat Ini',
      newPassword: 'Kata Sandi Baru',
      confirmNewPassword: 'Konfirmasi Kata Sandi Baru',
      savePassword: 'SIMPAN',
      passwordUpdated: 'Kata sandi berhasil diperbarui!',
      passwordMismatch: 'Konfirmasi kata sandi baru tidak cocok!',
      passwordChangeFailed: 'Gagal mengubah kata sandi. Pastikan kata sandi saat ini sudah benar.',
      logOut: 'KELUAR AKUN',
      logoutConfirm: 'Apakah Anda yakin ingin keluar dari akun Anda?',
      addressBook: 'Buku Alamat',
      saved: (n) => `${n} Tersimpan`,
      noAddressYet: 'Belum Ada Alamat',
      noAddressDesc: 'Tambahkan alamat pengiriman agar pemesanan lebih cepat.',
      addNewAddress: 'TAMBAH ALAMAT BARU',
      setAsDefault: 'Jadikan Utama',
      editAddress: 'Edit Alamat',
      deleteAddress: 'Hapus Alamat',
      loadError: 'Gagal memuat data profil. Silakan refresh halaman.',
      deleteError: 'Gagal menghapus alamat. Silakan coba lagi.',
      language: 'Bahasa / Language',
    },

    // ──────────────────────────────────────
    // TRANSACTIONS PAGE
    // ──────────────────────────────────────
    transactions: {
      statusUpdate: 'Pembaruan Status',
      orderJournal: 'Jurnal',
      orderJournal2: 'Pesanan',
      onGoing: 'Berlangsung',
      history: 'Riwayat',
      totalBill: 'Total Tagihan',
      promoApplied: 'Promo Diterapkan',
      kitchenQuiet: 'Dapur Sepi!',
      kitchenQuietDesc: 'Kamu belum memesan apapun. Yuk pesan burger!',
      noHistory: 'Belum Ada Riwayat',
      noHistoryDesc: 'Pesanan masa lalumu akan muncul di sini.',
      letsOrder: 'Yuk Masak Sesuatu!',
    },

    // ──────────────────────────────────────
    // TRANSACTION DETAIL PAGE
    // ──────────────────────────────────────
    transactionDetail: {
      orderDetail: 'Detail Pesanan',
      back: 'Kembali',
      status: 'Status',
      paymentMethod: 'Metode Pembayaran',
      deliveryAddress: 'Alamat Pengiriman',
      orderItems: 'Item Pesanan',
      subtotal: 'Subtotal',
      delivery: 'Pengiriman',
      free: 'GRATIS',
      total: 'Total',
      cancelOrder: 'Batalkan Pesanan',
      payNow: 'Bayar Sekarang',
      orderDate: 'Tanggal Pesanan',
      noItems: 'Tidak ada item.',
      cancelConfirm: 'Apakah kamu yakin ingin membatalkan pesanan ini?',
    },

    // ──────────────────────────────────────
    // PAYMENT STATUS PAGE
    // ──────────────────────────────────────
    paymentStatus: {
      success: 'Pembayaran Berhasil!',
      successDesc: 'Pesananmu telah dikonfirmasi dan sedang dipersiapkan.',
      failed: 'Pembayaran Gagal',
      failedDesc: 'Terjadi kesalahan pada pembayaranmu. Silakan coba lagi.',
      pending: 'Pembayaran Tertunda',
      pendingDesc: 'Pembayaranmu sedang diproses.',
      viewOrders: 'Lihat Pesanan Saya',
      backToMenu: 'Kembali ke Menu',
    },

    // ──────────────────────────────────────
    // AUTH PAGE
    // ──────────────────────────────────────
    auth: {
      freshJuicyCrispy: 'Segar. Juicy. Renyah.',
      welcomeBack: 'Selamat',
      welcomeBack2: 'Datang!',
      resetPassword: 'Reset',
      resetPassword2: 'Kata Sandi',
      verifyOtp: 'Verifikasi',
      verifyOtp2: 'Kode OTP',
      almostThere: 'Hampir',
      almostThere2: 'Selesai!',
      loginDesc: 'Masuk dengan email terdaftar untuk melanjutkan pesananmu.',
      forgotDesc: 'Masukkan email terdaftarmu dan kami akan mengirimkan kode OTP.',
      verifyDesc: 'Masukkan kode OTP yang kami kirimkan untuk melanjutkan.',
      resetDesc: 'Buat kata sandi baru yang aman untuk akunmu.',
      memberLogin: 'Masuk Anggota',
      forgotPassword: 'Lupa Kata Sandi',
      otpValidation: 'Validasi OTP',
      createNewPass: 'Buat Sandi Baru',
      logIn: 'Masuk',
      recover: 'Pulihkan',
      verify: 'Verifikasi',
      newPass: 'Sandi Baru',
      registeredEmail: 'Email Terdaftar',
      password: 'Kata Sandi',
      forgot: 'Lupa?',
      signingIn: 'Masuk...',
      sending: 'Mengirim OTP...',
      verifying: 'Memverifikasi...',
      resetting: 'Mereset...',
      sendOtp: 'Kirim OTP',
      verifyOtpBtn: 'Verifikasi OTP',
      updatePassword: 'Perbarui Kata Sandi',
      backToLogin: 'Kembali ke Login',
      cancelBtn: 'Batal',
      enterSixDigit: 'Masukkan Kode 6 Digit',
      newPasswordLabel: 'Kata Sandi Baru',
      confirmPassword: 'Konfirmasi Kata Sandi',
      newToAldes: 'Baru di Aldes Burger?',
      createAccount: 'Buat akun',
      fast: 'Cepat',
      fastSub: 'Masuk',
      hot: 'Hot',
      hotSub: 'Promo',
      fresh: 'Segar',
      freshSub: 'Rasa',
      enterPassword: 'Masukkan kata sandi',
      enterNewPassword: 'Masukkan kata sandi baru',
      reEnterNewPassword: 'Masukkan ulang kata sandi baru',
      // Validation errors
      errEmail: 'Masukkan alamat email terdaftarmu.',
      errGmail: 'Gunakan alamat Gmail yang valid dengan @gmail.com.',
      errPassword: 'Masukkan kata sandimu.',
      errNotRegistered: 'Email ini belum terdaftar. Periksa email atau buat akun baru.',
      errWrongPassword: 'Kata sandi tidak cocok dengan email terdaftar.',
      errLoginFailed: 'Login gagal. Periksa kredensialmu.',
      errEmailNotRegistered: 'Email ini belum terdaftar.',
      errSendOtp: 'Gagal mengirim OTP. Silakan coba lagi.',
      errInvalidOtp: 'Kode OTP tidak valid. Silakan coba lagi.',
      errOtpDigits: 'OTP harus tepat 6 digit.',
      errNewPassword: 'Masukkan kata sandi baru.',
      errPasswordMismatch: 'Konfirmasi kata sandi tidak cocok.',
      errResetFailed: 'Gagal mereset kata sandi. Silakan coba lagi.',
      successOtpSent: 'Kode OTP telah dikirimkan ke emailmu.',
      successOtpVerified: 'OTP Terverifikasi! Silakan masukkan kata sandi baru.',
      successReset: 'Kata sandimu berhasil direset. Silakan masuk.',
    },

    // ──────────────────────────────────────
    // SIGNUP PAGE
    // ──────────────────────────────────────
    signup: {
      title: 'Buat Akun',
      subtitle: 'Bergabung dengan Aldes Burger dan mulai rakit burger sempurnamu!',
      name: 'Nama Lengkap',
      email: 'Alamat Email',
      phone: 'Nomor Telepon',
      password: 'Kata Sandi',
      confirmPassword: 'Konfirmasi Kata Sandi',
      createAccount: 'Buat Akun',
      alreadyHave: 'Sudah punya akun?',
      loginHere: 'Masuk di sini',
      creating: 'Membuat...',
    },

    // ──────────────────────────────────────
    // KITCHEN PAGE
    // ──────────────────────────────────────
    kitchen: {
      title: 'Rakit Burgermu',
      subtitle: 'Kustomisasi tumpukanmu di bawah ini',
      ingredients: 'Bahan-Bahan',
      yourStack: 'Tumpukan Kamu',
      addToCart: 'Tambah ke Keranjang',
      totalPrice: 'Total Harga',
      clearStack: 'Kosongkan Tumpukan',
      emptyStack: 'Mulai tambahkan bahan di atas!',
      noIngredients: 'Tidak ada bahan tersedia.',
    },

    // ──────────────────────────────────────
    // NOT FOUND PAGE
    // ──────────────────────────────────────
    notFound: {
      title: '404',
      subtitle: 'Halaman Tidak Ditemukan',
      desc: 'Halaman yang kamu cari tidak ada atau telah dipindahkan.',
      backHome: 'Kembali ke Beranda',
    },

    // ──────────────────────────────────────
    // ADMIN — Layout
    // ──────────────────────────────────────
    adminLayout: {
      adminPanel: 'Panel Admin',
      overview: 'Ikhtisar',
      orders: 'Pesanan',
      menu: 'Menu',
      inventory: 'Inventaris',
      logout: 'Keluar',
      loggingOut: 'Keluar...',
      headerTitle: 'Operasi Dapur & Wawasan Bisnis',
    },

    // ──────────────────────────────────────
    // ADMIN — Dashboard
    // ──────────────────────────────────────
    adminDashboard: {
      totalOrders: 'Total Pesanan',
      pending: 'Menunggu',
      cooking: 'Dimasak',
      cancelled: 'Dibatalkan',
      revenue: 'Pendapatan (Selesai)',
      showing: 'Menampilkan:',
      orders: 'Pesanan',
      completed: 'Selesai (Done)',
      orderId: 'ID Pesanan',
      customer: 'Pelanggan',
      items: 'Item',
      status: 'Status',
      noOrders: 'Tidak ada pesanan untuk kategori ini.',
    },

    // ──────────────────────────────────────
    // ADMIN — Orders
    // ──────────────────────────────────────
    adminOrders: {
      title: 'Pesanan Langsung',
      subtitle: 'Kelola dan perbarui pesanan dapur secara real-time',
      activeOrders: 'Pesanan Aktif',
      allClear: 'Semua Beres!',
      allClearDesc: 'Tidak ada pesanan aktif saat ini.',
      refresh: 'Refresh',
      lastUpdated: 'Terakhir diperbarui',
      buildOrder: 'Susunan Pesanan / Bahan:',
      customerNote: 'Catatan Pelanggan',
      markAs: (status) => `Tandai sebagai ${status}`,
      cancelOrder: 'Batalkan Pesanan',
      cancelConfirm: 'Batalkan pesanan ini?',
      viewDetails: 'Lihat Detail',
      sortBy: 'Urutkan',
      newest: 'Terbaru',
      oldest: 'Terlama',
    },

    // ──────────────────────────────────────
    // ADMIN — Menu Management
    // ──────────────────────────────────────
    adminMenu: {
      title: 'Manajemen Menu',
      addMenu: 'Tambah Menu Baru',
      editMenu: 'Edit Menu',
      deleteMenu: 'Hapus Menu',
      menuName: 'Nama Menu',
      price: 'Harga',
      category: 'Kategori',
      description: 'Deskripsi',
      isCustom: 'Kustom (Dapur)',
      save: 'Simpan',
      cancel: 'Batal',
      deleteConfirm: 'Apakah kamu yakin ingin menghapus menu ini?',
      noMenu: 'Tidak ada item menu.',
      ingredients: 'Bahan-Bahan',
      manageIngredients: 'Kelola Bahan',
    },

    // ──────────────────────────────────────
    // ADMIN — Inventory
    // ──────────────────────────────────────
    adminInventory: {
      title: 'Inventaris',
      addIngredient: 'Tambah Bahan',
      editIngredient: 'Edit Bahan',
      deleteIngredient: 'Hapus Bahan',
      ingredientName: 'Nama Bahan',
      stock: 'Stok',
      unit: 'Satuan',
      price: 'Harga',
      save: 'Simpan',
      cancel: 'Batal',
      deleteConfirm: 'Apakah kamu yakin ingin menghapus bahan ini?',
      noIngredients: 'Tidak ada bahan.',
      lowStock: 'Stok Rendah',
    },

    // ──────────────────────────────────────
    // ADDRESS FORM
    // ──────────────────────────────────────
    addressForm: {
      recipientName: 'Nama Penerima',
      recipientNamePlaceholder: 'misal: Sam Raimi',
      phoneNumber: 'Nomor Telepon',
      phoneNumberPlaceholder: 'misal: 081317539933',
      usePhone: 'Gunakan',
      selectRegion: 'Pilih Wilayah',
      selectRegionPlaceholder: 'Pilih titik lokasi di bawah ini',
      regionLabel: 'Provinsi, Kota, Kecamatan, Kode Pos',
      province: 'PROVINSI',
      city: 'KOTA/KABUPATEN',
      district: 'KECAMATAN',
      postal: 'KODE POS',
      selectProvince: 'Pilih Provinsi',
      selectCity: 'Pilih Kota/Kabupaten',
      selectDistrict: 'Pilih Kecamatan',
      selectPostalCode: 'Pilih atau ketik Kode Pos',
      selectDistrictFirst: 'Pilih kecamatan terlebih dahulu',
      streetAddress: 'Alamat Jalan',
      streetAddressPlaceholder: 'Nama Jalan, Gedung, No. Rumah',
      selectRegionFirst: 'Pilih Wilayah Terlebih Dahulu',
      placeAccuratePin: 'Tempatkan pin yang akurat',
      deliverToMap: 'Kami akan mengirimkan ke lokasi peta Anda.',
      currentLoc: 'Lokasi Saat Ini',
      addLocation: 'Tambah Lokasi',
      viewFullMap: 'Lihat Peta Lengkap',
      otherDetails: 'Detail Lainnya',
      otherDetailsPlaceholder: 'Detail Lainnya (misal: Blok / No. Unit, Patokan)',
      labelAs: 'Label Sebagai:',
      home: 'Rumah',
      work: 'Kantor',
      other: 'Lainnya',
      setAsDefault: 'Jadikan Alamat Utama',
      saveAddress: 'Simpan Alamat',
      saving: 'Menyimpan...',
      cancel: 'Batal',
      confirm: 'Konfirmasi',
      pinLocation: 'Pin Lokasi',
      yourPinIsHere: 'Pin Anda di sini',
      dragMap: 'GESER PETA UNTUK MENYESUAIKAN',
      useCurrentLocation: 'Gunakan Lokasi Saat Ini',
      noPinSelected: 'Tidak ada pin lokasi yang dipilih',
      fillStreetFirst: 'Isi alamat jalan terlebih dahulu untuk menampilkan peta.',
      chooseLocationWarning: 'Pilih lokasi dari saran atau atur pin peta agar kurir dapat menemukan alamat Anda.',
      postalCodeFirstWarning: 'Silakan pilih atau ketik kode pos terlebih dahulu untuk melihat saran jalan.',
      postalCodeUnavailableWarning: 'Rekomendasi kode pos tidak tersedia, silakan ketik 5 digit secara manual.',
      searchingSuggestions: 'Mencari saran alamat...',
      noSuggestionsFound: 'Saran tidak ditemukan.',
      fetchSuggestionsFailed: 'Gagal mengambil saran saat ini. Coba geser pin peta secara manual.',
      addressNotFound: 'Alamat tidak ditemukan.',
      loadAddressFailed: 'Gagal memuat alamat yang dipilih.',
      loadMapFailed: 'Gagal memuat peta.',
      completeAllFields: 'Silakan lengkapi semua bidang alamat terlebih dahulu.',
      saveAddressFailed: 'Gagal menyimpan detail alamat.',
      geolocationUnsupported: 'Geolokasi tidak didukung oleh browser Anda.',
      retrieveLocationFailed: 'Gagal mendapatkan lokasi Anda. Silakan periksa izin browser.',
      editPin: 'Ubah Lokasi Pin',
    },
  },
}

export default translations
