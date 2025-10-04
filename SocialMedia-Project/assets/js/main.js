// عرض شاشة التحميل
function toggleLoader(show = true) {
    const loader = document.getElementById("loader");
    if (loader) {
        if (show) {
            loader.style.visibility = 'visible';
        } else {
            loader.style.visibility = 'hidden';
        }
    }
}

// عرض التنبيهات
function showAlert(message, type = "success") {
    const alertPlaceholder = document.getElementById('success-alert');
    if (!alertPlaceholder) return;

    const alertId = 'alert-' + Date.now();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertPlaceholder.appendChild(wrapper);

    // إخفاء التنبيه تلقائياً بعد 5 ثوان
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, 5000);
}

// الحصول على المستخدم الحالي من التخزين المحلي
function getCurrentUser() {
    try {
        const storageUser = localStorage.getItem("user");
        if (storageUser) {
            return JSON.parse(storageUser);
        }
        return null;
    } catch (error) {
        console.error('خطأ في قراءة بيانات المستخدم:', error);
        return null;
    }
}

// إعداد واجهة المستخدم حسب حالة تسجيل الدخول
function setupUI() {
    const token = localStorage.getItem("token");
    const loginDiv = document.getElementById("logged-in-div");
    const logoutDiv = document.getElementById("logout-div");
    const addBtn = document.getElementById("add-btn");

    if (token == null) {
        // المستخدم غير مسجل دخول (زائر)
        if (addBtn) {
            addBtn.style.setProperty("display", "none", "important");
        }
        if (loginDiv) {
            loginDiv.style.setProperty("display", "flex", "important");
        }
        if (logoutDiv) {
            logoutDiv.style.setProperty("display", "none", "important");
        }
    } else {
        // المستخدم مسجل دخول
        if (addBtn) {
            addBtn.style.setProperty("display", "block", "important");
        }
        if (loginDiv) {
            loginDiv.style.setProperty("display", "none", "important");
        }
        if (logoutDiv) {
            logoutDiv.style.setProperty("display", "flex", "important");
        }

        const user = getCurrentUser();
        if (user) {
            const navUsername = document.getElementById("nav-username");
            const navUserImage = document.getElementById("nav-user-image");
            
            if (navUsername) {
                navUsername.innerHTML = user.username;
            }
            if (navUserImage) {
                navUserImage.src = user.profile_image || 'https://placehold.co/30';
                navUserImage.onerror = function() {
                    this.src = 'https://placehold.co/30';
                };
            }
        }
    }
}

// التنقل إلى الملف الشخصي
function profileClicked() {
    const user = getCurrentUser();
    if (user) {
        const userId = user.id;
        window.location = `profile.html?userid=${userId}`;
    } else {
        showAlert("يجب تسجيل الدخول أولاً", "warning");
    }
}

// النقر على منشور للانتقال إلى تفاصيله
function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`;
}

// النقر على مستخدم للانتقال إلى ملفه الشخصي
function userClicked(userId) {
    window.location = `profile.html?userid=${userId}`;
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    setupUI();
});

// معالجة الصور التالفة
function handleImageError(img, fallbackUrl = 'https://placehold.co/300x200?text=صورة+غير+متاحة') {
    img.onerror = function() {
        this.src = fallbackUrl;
        this.onerror = null; // منع التكرار اللانهائي
    };
}

// تنسيق التاريخ
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // أقل من دقيقة
        if (diff < 60000) {
            return 'منذ لحظات';
        }
        
        // أقل من ساعة
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `منذ ${minutes} دقيقة`;
        }
        
        // أقل من يوم
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `منذ ${hours} ساعة`;
        }
        
        // أكثر من يوم
        const days = Math.floor(diff / 86400000);
        if (days < 7) {
            return `منذ ${days} يوم`;
        }
        
        // إرجاع التاريخ العادي
        return date.toLocaleDateString('ar-SA');
    } catch (error) {
        return dateString;
    }
}

// إنشاء HTML للمنشور
function createPostHTML(post) {
    const author = post.author;
    let postTitle = post.title || "";
    const user = getCurrentUser();
    const isMyPost = user != null && post.author.id == user.id;
    
    let editBtnContent = '';
    if (isMyPost) {
        const encodedPost = encodeURIComponent(JSON.stringify(post));
        editBtnContent = `
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="editPostBtnClicked('${encodedPost}')">
                        <i class="bi bi-pencil"></i> تعديل
                    </a></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="deletePostBtnClicked('${encodedPost}')">
                        <i class="bi bi-trash"></i> حذف
                    </a></li>
                </ul>
            </div>
        `;
    }

    let postImage = '';
    if (post.image && typeof post.image === 'string') {
        postImage = `
            <img src="${post.image}" class="card-img-top" style="max-height: 400px; object-fit: cover;" 
                 alt="صورة المنشور" onerror="this.style.display='none'">
        `;
    }

    return `
        <div class="card mb-4 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center" style="cursor: pointer;" onclick="userClicked(${author.id})">
                    <img src="${author.profile_image || 'https://placehold.co/40'}" 
                         class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;" 
                         alt="صورة المستخدم" onerror="this.src='https://placehold.co/40'">
                    <div>
                        <strong>${author.username}</strong>
                        <small class="text-muted d-block">${formatDate(post.created_at)}</small>
                    </div>
                </div>
                ${editBtnContent}
            </div>
            ${postImage}
            <div class="card-body" style="cursor: pointer;" onclick="postClicked(${post.id})">
                ${postTitle ? `<h5 class="card-title">${postTitle}</h5>` : ''}
                <p class="card-text">${post.body}</p>
                <div id="post-tags-${post.id}" class="mb-2"></div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="bi bi-chat"></i>
                        (${post.comments_count}) تعليق
                    </small>
                    <small class="text-muted">اضغط للمزيد من التفاصيل</small>
                </div>
            </div>
        </div>
    `;
}

// إضافة العلامات (Tags) للمنشور
function addTagsToPost(post) {
    const tagsContainer = document.getElementById(`post-tags-${post.id}`);
    if (tagsContainer && post.tags && post.tags.length > 0) {
        tagsContainer.innerHTML = '';
        post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'badge bg-secondary me-1';
            tagElement.textContent = tag.name;
            tagsContainer.appendChild(tagElement);
        });
    }
}