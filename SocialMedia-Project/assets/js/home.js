let currentPage = 1;
let lastPage = 1;
let isLoading = false;

// التمرير اللانهائي
window.addEventListener("scroll", function () {
  const endOfPage =
    window.innerHeight + window.pageYOffset >=
    document.body.scrollHeight - 1000;

  if (endOfPage && currentPage < lastPage && !isLoading) {
    currentPage = currentPage + 1;
    getPosts(false, currentPage);
  }
});

// تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  setupUI();
  getPosts();
});

// جلب المنشورات
async function getPosts(reload = true, page = 1) {
  if (isLoading) return;

  isLoading = true;
  toggleLoader(true);

  try {
    const response = await PostsAPI.getPosts(page, 6);
    const posts = response.data;
    lastPage = response.meta.last_page;

    const postsContainer = document.getElementById("posts");

    if (reload) {
      postsContainer.innerHTML = "";
      currentPage = 1;
    }

    posts.forEach((post) => {
      const postHTML = createPostHTML(post);
      postsContainer.innerHTML += postHTML;

      // إضافة العلامات للمنشور
      setTimeout(() => {
        addTagsToPost(post);
      }, 100);
    });

    // إظهار رسالة إذا لم توجد منشورات
    if (reload && posts.length === 0) {
      postsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-chat-left-text" style="font-size: 4rem; color: #ccc;"></i>
                    <h4 class="mt-3">لا توجد منشورات حالياً</h4>
                    <p class="text-muted">كن أول من ينشر!</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("خطأ في جلب المنشورات:", error);
    showAlert("حدث خطأ في تحميل المنشورات", "danger");
  } finally {
    toggleLoader(false);
    isLoading = false;
  }
}

// فتح نافذة إضافة منشور جديد
function addBtnClicked() {
  const user = getCurrentUser();
  if (!user) {
    showAlert("يجب تسجيل الدخول أولاً", "warning");
    return;
  }

  // تنظيف النموذج
  document.getElementById("post-modal-submit-btn").innerHTML = `
        <i class="bi bi-plus-circle"></i>
        إنشاء
    `;
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "إنشاء منشور جديد";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  document.getElementById("post-image-input").value = "";

  // إظهار النافذة
  const postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  postModal.show();
}

// إنشاء أو تحديث منشور
async function createNewPostClicked() {
  const postId = document.getElementById("post-id-input").value;
  const isCreate = postId == null || postId == "";

  const title = document.getElementById("post-title-input").value.trim();
  const body = document.getElementById("post-body-input").value.trim();
  const image = document.getElementById("post-image-input").files[0];

  if (!body) {
    showAlert("يرجى كتابة محتوى المنشور", "warning");
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    showAlert("يجب تسجيل الدخول أولاً", "warning");
    return;
  }

  toggleLoader(true);

  try {
    const postData = {
      title: title,
      body: body,
      image: image,
    };

    if (isCreate) {
      await PostsAPI.createPost(postData);
      showAlert("تم إنشاء المنشور بنجاح", "success");
    } else {
      await PostsAPI.updatePost(postId, postData);
      showAlert("تم تحديث المنشور بنجاح", "success");
    }

    // إخفاء النافذة
    const modal = document.getElementById("create-post-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }

    // إعادة تحميل المنشورات
    currentPage = 1;
    getPosts();
  } catch (error) {
    console.error("خطأ في العملية:", error);
    const message = error.response?.data?.message || "حدث خطأ في العملية";
    showAlert(message, "danger");
  } finally {
    toggleLoader(false);
  }
}

// تعديل منشور
function editPostBtnClicked(postObject) {
  try {
    const post = JSON.parse(decodeURIComponent(postObject));

    // التحقق من أن المنشور ملك للمستخدم الحالي
    const user = getCurrentUser();
    if (!user || post.author.id !== user.id) {
      showAlert("لا يمكنك تعديل هذا المنشور", "danger");
      return;
    }

    // ملء النموذج ببيانات المنشور
    document.getElementById("post-modal-submit-btn").innerHTML = `
            <i class="bi bi-pencil"></i>
            تحديث
        `;
    document.getElementById("post-id-input").value = post.id;
    document.getElementById("post-modal-title").innerHTML = "تعديل المنشور";
    document.getElementById("post-title-input").value = post.title || "";
    document.getElementById("post-body-input").value = post.body || "";

    // إظهار النافذة
    const postModal = new bootstrap.Modal(
      document.getElementById("create-post-modal")
    );
    postModal.show();
  } catch (error) {
    console.error("خطأ في تحليل بيانات المنشور:", error);
    showAlert("حدث خطأ في تحميل بيانات المنشور", "danger");
  }
}

// حذف منشور
function deletePostBtnClicked(postObject) {
  try {
    const post = JSON.parse(decodeURIComponent(postObject));

    // التحقق من أن المنشور ملك للمستخدم الحالي
    const user = getCurrentUser();
    if (!user || post.author.id !== user.id) {
      showAlert("لا يمكنك حذف هذا المنشور", "danger");
      return;
    }

    document.getElementById("delete-post-id-input").value = post.id;

    // إظهار نافذة التأكيد
    const deleteModal = new bootstrap.Modal(
      document.getElementById("delete-post-modal")
    );
    deleteModal.show();
  } catch (error) {
    console.error("خطأ في تحليل بيانات المنشور:", error);
    showAlert("حدث خطأ في تحميل بيانات المنشور", "danger");
  }
}

// تأكيد حذف المنشور
async function confirmPostDelete() {
  const postId = document.getElementById("delete-post-id-input").value;

  if (!postId) {
    showAlert("معرف المنشور غير صحيح", "danger");
    return;
  }

  toggleLoader(true);

  try {
    await PostsAPI.deletePost(postId);

    // إخفاء نافذة التأكيد
    const modal = document.getElementById("delete-post-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }

    showAlert("تم حذف المنشور بنجاح", "success");

    // إعادة تحميل المنشورات
    currentPage = 1;
    getPosts();
  } catch (error) {
    console.error("خطأ في حذف المنشور:", error);
    const message = error.response?.data?.message || "حدث خطأ في حذف المنشور";
    showAlert(message, "danger");
  } finally {
    toggleLoader(false);
  }
}

// تحديث المنشورات عند التمرير إلى أعلى
let refreshTimeout;
function refreshPosts() {
  clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(() => {
    if (window.pageYOffset === 0) {
      currentPage = 1;
      getPosts();
    }
  }, 1000);
}

// إضافة مستمع للتمرير إلى أعلى
window.addEventListener("scroll", function () {
  if (window.pageYOffset === 0) {
    refreshPosts();
  }
});

// معالجة الضغط على Enter في نموذج المنشور
document.addEventListener("DOMContentLoaded", function () {
  const postModal = document.getElementById("create-post-modal");
  if (postModal) {
    postModal.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && e.ctrlKey) {
        createNewPostClicked();
      }
    });
  }
});
