// app.js — E-commerce Cart Logic, Quiz, Mobile Menu & Interactive FAQ

// 1. Product Database
const productsDb = {
  // Teas
  sheng_puerh: {
    id: "sheng_puerh",
    title: "Шен Пуер «Дикі Скелі»",
    category: "Витриманий пуер",
    image: "images/sheng_puerh.webp",
    pricing: {
      "50": 1500,
      "100": 2700,
      "250": 6200
    }
  },
  dahongpao: {
    id: "dahongpao",
    title: "Да Хун Пао «Скельний Притулок»",
    category: "Скельний улун",
    image: "images/dahongpao.webp",
    pricing: {
      "50": 1200,
      "100": 2100,
      "250": 4800
    }
  },
  jinjunmei: {
    id: "jinjunmei",
    title: "Цзинь Цзюнь Мей «Золоті Брови»",
    category: "Елітний червоний чай",
    image: "images/jinjunmei.webp",
    pricing: {
      "50": 1800,
      "100": 3200,
      "250": 7500
    }
  },
  yinzhen: {
    id: "yinzhen",
    title: "Бай Хао Інь Чжень",
    category: "Білий чай першого збору",
    image: "images/yinzhen.webp",
    pricing: {
      "50": 1600,
      "100": 2900,
      "250": 6700
    }
  },
  // Teaware
  teaware_teapot: {
    id: "teaware_teapot",
    title: "Ісінський чайник «Дзен»",
    category: "Посуд",
    image: "images/teaware.webp",
    price: 2400
  },
  teaware_gaiwan: {
    id: "teaware_gaiwan",
    title: "Гайвань «Біла Хмара»",
    category: "Посуд",
    image: "images/hero.webp",
    price: 1100
  },
  teaware_cups: {
    id: "teaware_cups",
    title: "Набір піал «Дров'яний випал»",
    category: "Посуд",
    image: "images/teaware.webp",
    price: 850
  }
};

// 2. State Management
let cart = [];

// Load cart from localStorage on init
function initCart() {
  const savedCart = localStorage.getItem("dzherelo_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }
  updateCartUi();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("dzherelo_cart", JSON.stringify(cart));
}

// 3. UI Helpers
function formatCurrency(val) {
  return `${val.toLocaleString('uk-UA')} ₴`;
}

// 4. Cart Logic
function addToCart(productId, weight = null) {
  const product = productsDb[productId];
  if (!product) return;

  const isTea = weight !== null;
  const cartKey = isTea ? `${productId}_${weight}` : productId;
  const price = isTea ? product.pricing[weight] : product.price;
  const displayName = isTea ? `${product.title} (${weight}г)` : product.title;

  const existingItem = cart.find(item => item.key === cartKey);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      key: cartKey,
      productId: productId,
      name: displayName,
      price: price,
      weight: weight,
      quantity: 1,
      image: product.image
    });
  }

  saveCart();
  updateCartUi();
  openCartDrawer();
}

function updateQuantity(key, change) {
  const item = cart.find(item => item.key === key);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.key !== key);
  }

  saveCart();
  updateCartUi();
}

function removeFromCart(key) {
  cart = cart.filter(item => item.key !== key);
  saveCart();
  updateCartUi();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUi();
}

function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartUi() {
  // Count Badge
  const count = getCartCount();
  document.getElementById("cartCount").textContent = count;

  // Dom elements
  const emptyMsg = document.getElementById("cartEmptyMessage");
  const itemsList = document.getElementById("cartItemsList");
  const checkoutPanel = document.getElementById("checkoutPanel");
  const cartTotalVal = document.getElementById("cartTotalVal");
  const checkoutSuccess = document.getElementById("checkoutSuccess");

  // Always hide success screen when updating cart items list (to avoid layout overlay)
  if (checkoutSuccess) {
    checkoutSuccess.style.display = "none";
  }

  if (cart.length === 0) {
    emptyMsg.style.display = "flex";
    itemsList.style.display = "none";
    checkoutPanel.style.display = "none";
  } else {
    emptyMsg.style.display = "none";
    itemsList.style.display = "flex";
    checkoutPanel.style.display = "block";

    // Clear and render items
    itemsList.innerHTML = "";
    cart.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <span class="cart-item-title">${item.name}</span>
          <span class="cart-item-meta">${formatCurrency(item.price)}</span>
          <div class="cart-item-qty">
            <button class="qty-btn btn-minus" data-key="${item.key}">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn btn-plus" data-key="${item.key}">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${formatCurrency(item.price * item.quantity)}</span>
          <button class="cart-item-remove" data-key="${item.key}">Видалити</button>
        </div>
      `;
      itemsList.appendChild(itemEl);
    });

    // Totals
    const total = getCartTotal();
    cartTotalVal.textContent = formatCurrency(total);

    // Re-bind listeners for items
    bindCartItemEvents();
  }
}

function bindCartItemEvents() {
  document.querySelectorAll(".btn-minus").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      updateQuantity(key, -1);
    });
  });

  document.querySelectorAll(".btn-plus").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      updateQuantity(key, 1);
    });
  });

  document.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      removeFromCart(key);
    });
  });
}

// Cart Drawer open/close
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCartDrawer() {
  // Hide success screen on opening fresh
  const checkoutSuccess = document.getElementById("checkoutSuccess");
  if (checkoutSuccess) {
    checkoutSuccess.style.display = "none";
  }
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Disable scroll
}

function closeCartDrawer() {
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = ""; // Enable scroll
}

// 5. Mobile Menu Toggle
const burgerBtn = document.getElementById("burgerMenuBtn");
const mobileOverlay = document.getElementById("mobileMenuOverlay");

function toggleMobileMenu() {
  burgerBtn.classList.toggle("active");
  mobileOverlay.classList.toggle("active");
  burgerBtn.setAttribute("aria-expanded", String(mobileOverlay.classList.contains("active")));
  
  if (mobileOverlay.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

function closeMobileMenu() {
  burgerBtn.classList.remove("active");
  mobileOverlay.classList.remove("active");
  burgerBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

// 6. Interactive Quiz Logic
const quizIntro = document.getElementById("quizIntro");
const quizResult = document.getElementById("quizResult");
const quizResultImg = document.getElementById("quizResultImg");
const quizResultTitle = document.getElementById("quizResultTitle");
const quizResultDesc = document.getElementById("quizResultDesc");
const quizResultState = document.getElementById("quizResultState");
const quizAddToCartBtn = document.getElementById("quizAddToCartBtn");
const quizResetBtn = document.getElementById("quizResetBtn");

let recommendedProductId = "";

const quizRecommendations = {
  energy: {
    productId: "sheng_puerh",
    stateLabel: "Енергія та фокус",
    title: "Шен Пуер «Дикі Скелі»",
    image: "images/sheng_puerh.webp",
    desc: "Чудовий вибір для активації внутрішніх ресурсів. Цей витриманий пуер дарує тривалий тонізуючий ефект, прояснює думки та налаштовує на продуктивну роботу. Має приємний камфорно-моховий профіль із солодкуватим післясмаком."
  },
  calm: {
    productId: "yinzhen",
    stateLabel: "Медитація та спокій",
    title: "Бай Хао Інь Чжень",
    image: "images/yinzhen.webp",
    desc: "Ідеальний супутник для сповільнення та глибокого розслаблення. Найніжніший білий чай містить багато L-теаніну, який знижує рівень стресу, дарує спокій та легкість. Свіжий аромат польових трав та дині."
  },
  contemplation: {
    productId: "dahongpao",
    stateLabel: "Глибокі роздуми",
    title: "Да Хун Пао «Скельний Притулок»",
    image: "images/dahongpao.webp",
    desc: "Для моментів споглядання, читання або затишних розмов. Багатий скельний аромат диму, шоколаду та горіхів допомагає відволіктися від повсякденної метушні та зануритися у глибину своїх відчуттів."
  }
};

function runQuiz(stateKey) {
  const rec = quizRecommendations[stateKey];
  if (!rec) return;

  recommendedProductId = rec.productId;
  
  // Update result elements
  quizResultImg.src = rec.image;
  quizResultImg.alt = rec.title;
  quizResultTitle.textContent = rec.title;
  quizResultDesc.textContent = rec.desc;
  quizResultState.textContent = rec.stateLabel;

  // Toggle sections
  quizIntro.style.display = "none";
  quizResult.style.display = "block";
}

function resetQuiz() {
  quizResult.style.display = "none";
  quizIntro.style.display = "block";
  recommendedProductId = "";
}

// 7. FAQ Accordion Logic
function initFaq() {
  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const faqItem = button.parentElement;
      const answer = faqItem.querySelector(".faq-answer");
      const isExpanded = button.getAttribute("aria-expanded") === "true";

      // Close all other FAQ items
      document.querySelectorAll(".faq-question").forEach(otherButton => {
        if (otherButton !== button) {
          otherButton.setAttribute("aria-expanded", "false");
          otherButton.parentElement.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      // Toggle current FAQ item
      button.setAttribute("aria-expanded", !isExpanded);
      if (!isExpanded) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        answer.style.maxHeight = null;
      }
    });
  });
}

// 8. Card Price Weight Toggle Logic
function initCardPriceToggles() {
  document.querySelectorAll('.card-weight-selector input[type="radio"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      const name = radio.name; // e.g. "weight_sheng_puerh"
      const productId = name.replace("weight_", "");
      const selectedWeight = radio.value;
      
      const product = productsDb[productId];
      if (product && product.pricing) {
        const priceLabel = document.getElementById(`price_${productId}`);
        if (priceLabel) {
          priceLabel.textContent = formatCurrency(product.pricing[selectedWeight]);
        }
      }
    });
  });
}

// 9. Event Listeners Setup
document.addEventListener("DOMContentLoaded", () => {
  // Init
  initCart();
  initFaq();
  initCardPriceToggles();

  // Cart Drawer triggers
  document.getElementById("cartTrigger").addEventListener("click", openCartDrawer);
  document.getElementById("cartDrawerClose").addEventListener("click", closeCartDrawer);
  cartOverlay.addEventListener("click", closeCartDrawer);
  document.getElementById("cartEmptyBtn").addEventListener("click", closeCartDrawer);

  // Esc key close drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartDrawer();
      closeMobileMenu();
    }
  });

  // Burger Menu toggle
  burgerBtn.addEventListener("click", toggleMobileMenu);
  mobileOverlay.addEventListener("click", (e) => {
    if (e.target === mobileOverlay) {
      closeMobileMenu();
    }
  });

  // Close mobile menu on nav link click
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Product Add to Cart buttons (Catalog)
  document.querySelectorAll(".btn-add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = btn.getAttribute("data-product");
      const card = btn.closest(".product-card");
      if (!card) return;
      
      const radio = card.querySelector(`input[name="weight_${productId}"]:checked`);
      const selectedWeight = radio ? radio.value : "50";
      
      addToCart(productId, selectedWeight);
    });
  });

  // Teaware Add to Cart buttons
  document.querySelectorAll(".btn-add-teaware-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = btn.getAttribute("data-product");
      addToCart(productId); // No weight for teaware
    });
  });

  // Quiz Options
  document.querySelectorAll(".quiz-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const state = btn.getAttribute("data-state");
      runQuiz(state);
    });
  });

  quizResetBtn.addEventListener("click", resetQuiz);
  
  quizAddToCartBtn.addEventListener("click", () => {
    if (recommendedProductId) {
      addToCart(recommendedProductId, "50");
    }
  });

  // Delivery type dropdown change (optional address field label adaptation)
  const deliverySelect = document.getElementById("checkoutDelivery");
  const addressLabel = document.querySelector("#deliveryAddressGroup .form-label");
  const addressInput = document.getElementById("checkoutAddress");

  deliverySelect.addEventListener("change", () => {
    const val = deliverySelect.value;
    if (val === "nova_poshta_office") {
      addressLabel.textContent = "Місто та номер відділення";
      addressInput.placeholder = "Київ, відділення №15";
    } else if (val === "nova_poshta_postbox") {
      addressLabel.textContent = "Місто та номер поштомату";
      addressInput.placeholder = "Львів, поштомат №903";
    } else if (val === "ukrposhta") {
      addressLabel.textContent = "Адреса доставки (Індекс, Місто, Вулиця)";
      addressInput.placeholder = "79000, Львів, вул. Зелена, 12, кв. 4";
    } else {
      addressLabel.textContent = "Місто (самовивіз за адресою шоуруму)";
      addressInput.placeholder = "Київ";
    }
  });

  // Checkout Form Submission
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutPanel = document.getElementById("checkoutPanel");
  const checkoutSuccess = document.getElementById("checkoutSuccess");
  const successDetails = document.getElementById("checkoutSuccessDetails");
  const itemsList = document.getElementById("cartItemsList");

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const clientName = document.getElementById("checkoutName").value.trim();
    const clientPhone = document.getElementById("checkoutPhone").value.trim();
    const delivery = deliverySelect.options[deliverySelect.selectedIndex].text;
    const address = addressInput.value.trim();
    const payment = document.getElementById("checkoutPayment").options[document.getElementById("checkoutPayment").selectedIndex].text;

    if (!clientName || !clientPhone || !address) {
      alert("Будь ласка, заповніть усі необхідні поля.");
      return;
    }

    // Submit animation
    const submitBtn = document.getElementById("checkoutSubmitBtn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Надсилаємо...";

    setTimeout(() => {
      // Mock order payload
      const orderId = `dzr_${Date.now()}`;
      const total = getCartTotal();
      const orderItems = [...cart];
      
      const newOrder = {
        id: orderId,
        client: { name: clientName, phone: clientPhone },
        delivery: { method: delivery, details: address },
        payment: payment,
        items: orderItems,
        total: total,
        date: new Date().toISOString()
      };

      // Save order to localStorage mock database
      const ordersDb = JSON.parse(localStorage.getItem("dzherelo_orders") || "[]");
      ordersDb.push(newOrder);
      localStorage.setItem("dzherelo_orders", JSON.stringify(ordersDb));

      // Clear local Cart state (calls updateCartUi which shows emptyMsg)
      clearCart();

      // Show Success State — explicitly hide all other panels to avoid overlap
      const emptyMsgEl = document.getElementById("cartEmptyMessage");
      if (emptyMsgEl) emptyMsgEl.style.display = "none";
      itemsList.style.display = "none";
      checkoutPanel.style.display = "none";
      checkoutSuccess.style.display = "flex";

      successDetails.innerHTML = `
        Дякуємо, <strong>${clientName}</strong>!<br>
        Ваше замовлення <strong>#${orderId.substring(4, 9).toUpperCase()}</strong> на суму <strong>${formatCurrency(total)}</strong> прийнято.<br><br>
        Спосіб доставки: <strong>${delivery} (${address})</strong>.<br>
        Ми зв'яжемося з вами за номером <strong>${clientPhone}</strong> найближчим часом для підтвердження.
      `;

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      checkoutForm.reset();

    }, 1500);
  });

  // Success screen return button
  document.getElementById("checkoutSuccessCloseBtn").addEventListener("click", () => {
    closeCartDrawer();
  });

  // Scroll Reveal Animations
  const revealElements = document.querySelectorAll(".reveal-el");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
});
