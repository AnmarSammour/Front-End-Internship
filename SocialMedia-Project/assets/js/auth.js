// تسجيل الدخول
async function loginBtnClicked() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;

  if (!username || !password) {
    showAlert("يرجى إدخال اسم المستخدم وكلمة المرور", "warning");
    return;
  }

  toggleLoader(true);

  try {
    const response = await AuthAPI.login(username, password);

    // حفظ بيانات المستخدم
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    // إخفاء نافذة تسجيل الدخول
    const modal = document.getElementById("login-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }

    // إعادة تحديث الواجهة
    setupUI();
    showAlert("تم تسجيل الدخول بنجاح", "success");

    // إعادة تحميل المنشورات إذا كنا في الصفحة الرئيسية
    if (typeof getPosts === "function") {
      getPosts();
    }

    // تنظيف النموذج
    document.getElementById("username-input").value = "";
    document.getElementById("password-input").value = "";
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    const message = error.response?.data?.message || "حدث خطأ في تسجيل الدخول";
    showAlert(message, "danger");
  } finally {
    toggleLoader(false);
  }
}

// تسجيل مستخدم جديد
async function registerBtnClicked() {
  const name = document.getElementById("register-name-input").value;
  const username = document.getElementById("register-username-input").value;
  const password = document.getElementById("register-password-input").value;
  const image = document.getElementById("register-image-input").files[0];

  if (!name || !username || !password) {
    showAlert("يرجى ملء جميع الحقول المطلوبة", "warning");
    return;
  }

  if (password.length < 6) {
    showAlert("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "warning");
    return;
  }

  toggleLoader(true);

  try {
    const userData = {
      name: name,
      username: username,
      password: password,
      image: image,
    };

    const response = await AuthAPI.register(userData);

    // حفظ بيانات المستخدم
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    // إخفاء نافذة التسجيل
    const modal = document.getElementById("register-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }

    // إعادة تحديث الواجهة
    setupUI();
    showAlert("تم إنشاء الحساب بنجاح", "success");

    // إعادة تحميل المنشورات إذا كنا في الصفحة الرئيسية
    if (typeof getPosts === "function") {
      getPosts();
    }

    // تنظيف النموذج
    clearRegisterForm();
  } catch (error) {
    console.error("خطأ في التسجيل:", error);
    const message = error.response?.data?.message || "حدث خطأ في إنشاء الحساب";
    showAlert(message, "danger");
  } finally {
    toggleLoader(false);
  }
}

// تسجيل الخروج
function logout() {
  // إزالة بيانات المستخدم
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // إعادة تحديث الواجهة
  setupUI();
  showAlert("تم تسجيل الخروج بنجاح", "info");

  // إعادة تحميل المنشورات إذا كنا في الصفحة الرئيسية
  if (typeof getPosts === "function") {
    getPosts();
  }

  // التوجه إلى الصفحة الرئيسية إذا كنا في صفحة تتطلب تسجيل دخول
  const currentPage = window.location.pathname;
  if (currentPage.includes("profile.html")) {
    window.location.href = "home.html";
  }
}

// تنظيف نموذج التسجيل
function clearRegisterForm() {
  document.getElementById("register-name-input").value = "";
  document.getElementById("register-username-input").value = "";
  document.getElementById("register-password-input").value = "";
  document.getElementById("register-image-input").value = "";
}

// تنظيف نموذج تسجيل الدخول
function clearLoginForm() {
  document.getElementById("username-input").value = "";
  document.getElementById("password-input").value = "";
}

// التحقق من صحة البيانات قبل الإرسال
function validateLoginForm() {
  const username = document.getElementById("username-input").value.trim();
  const password = document.getElementById("password-input").value;

  if (username.length < 3) {
    showAlert("اسم المستخدم يجب أن يكون 3 أحرف على الأقل", "warning");
    return false;
  }

  if (password.length < 6) {
    showAlert("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "warning");
    return false;
  }

  return true;
}

function validateRegisterForm() {
  const name = document.getElementById("register-name-input").value.trim();
  const username = document
    .getElementById("register-username-input")
    .value.trim();
  const password = document.getElementById("register-password-input").value;

  if (name.length < 2) {
    showAlert("الاسم يجب أن يكون حرفين على الأقل", "warning");
    return false;
  }

  if (username.length < 3) {
    showAlert("اسم المستخدم يجب أن يكون 3 أحرف على الأقل", "warning");
    return false;
  }

  if (password.length < 6) {
    showAlert("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "warning");
    return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  // نموذج تسجيل الدخول
  const loginModal = document.getElementById("login-modal");
  if (loginModal) {
    loginModal.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        loginBtnClicked();
      }
    });
  }

  // نموذج التسجيل
  const registerModal = document.getElementById("register-modal");
  if (registerModal) {
    registerModal.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        registerBtnClicked();
      }
    });
  }
});

// التحقق من صحة الجلسة عند تحميل الصفحة
function checkAuthSession() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && !user) {
    // التوكن موجود لكن بيانات المستخدم مفقودة
    localStorage.removeItem("token");
    setupUI();
  }

  if (!token && user) {
    // بيانات المستخدم موجودة لكن التوكن مفقود
    localStorage.removeItem("user");
    setupUI();
  }
}

// استدعاء فحص الجلسة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  checkAuthSession();
});
