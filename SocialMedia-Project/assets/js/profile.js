let currentUserId = null;

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupUI();
    getCurrentUserId();
    if (currentUserId) {
        getUser();
        getUserPosts();
    } else {
        showAlert("معرف المستخدم غير صحيح", "danger");
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    }
});

// الحصول على معرف المستخدم من الرابط
function getCurrentUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    currentUserId = urlParams.get("userid");
    return currentUserId;
}

// جلب معلومات المستخدم
async function getUser() {
    if (!currentUserId) return;

    toggleLoader(true);

    try {
        const response = await UsersAPI.getUser(currentUserId);
        const user = response.data;

        displayUserInfo(user);

    } catch (error) {
        console.error('خطأ في جلب معلومات المستخدم:', error);
        showAlert("حدث خطأ في تحميل معلومات المستخدم", "danger");
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } finally {
        toggleLoader(false);
    }
}

// عرض معلومات المستخدم
function displayUserInfo(user) {
    // تحديث الصورة
    const userImage = document.getElementById("main-info-image");
    if (userImage) {
        userImage.src = user.profile_image || 'https://placehold.co/150';
        userImage.onerror = function() {
            this.src = 'https://placehold.co/150';
        };
    }

    // تحديث الاسم
    const userName = document.getElementById("main-info-name");
    if (userName) {
        userName.textContent = user.name || user.username;
    }

    // تحديث اسم المستخدم
    const userUsername = document.getElementById("main-info-username");
    if (userUsername) {
        userUsername.textContent = `@${user.username}`;
    }

    // تحديث البريد الإلكتروني
    const userEmail = document.getElementById("main-info-email");
    if (userEmail) {
        userEmail.textContent = user.email || 'غير متاح';
    }

    // تحديث عدد المنشورات
    const postsCount = document.getElementById("posts-count");
    if (postsCount) {
        postsCount.textContent = user.posts_count || 0;
    }

    // تحديث عدد التعليقات
    const commentsCount = document.getElementById("comments-count");
    if (commentsCount) {
        commentsCount.textContent = user.comments_count || 0;
    }

    // تحديث عنوان المنشورات
    const namePosts = document.getElementById("name-posts");
    if (namePosts) {
        namePosts.textContent = `منشورات ${user.username}`;
    }

    // تحديث عنوان الصفحة
    document.title = `${user.name || user.username} - موقع التواصل الاجتماعي`;
}

// جلب منشورات المستخدم
async function getUserPosts() {
    if (!currentUserId) return;

    toggleLoader(true);

    try {
        const response = await UsersAPI.getUserPosts(currentUserId);
        const posts = response.data;

        displayUserPosts(posts);

    } catch (error) {
        console.error('خطأ في جلب منشورات المستخدم:', error);
        showAlert("حدث خطأ في تحميل منشورات المستخدم", "danger");
    } finally {
        toggleLoader(false);
    }
}

// عرض منشورات المستخدم
function displayUserPosts(posts) {
    const postsContainer = document.getElementById("user-posts");
    
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-chat-left-text" style="font-size: 4rem; color: #ccc;"></i>
                <h5 class="mt-3">لا توجد منشورات</h5>
                <p class="text-muted">لم ينشر هذا المستخدم أي منشورات بعد</p>
            </div>
        `;
        return;
    }

    let postsHTML = '';
    posts.forEach(post => {
        const postHTML = createPostHTML(post);
        postsHTML += postHTML;
    });

    postsContainer.innerHTML = postsHTML;

    // إضافة العلامات للمنشورات
    setTimeout(() => {
        posts.forEach(post => {
            addTagsToPost(post);
        });
    }, 100);
}

// إنشاء HTML منشور للملف الشخصي (نسخة مبسطة)
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
            <img src="${post.image}" class="card-img-top" style="max-height: 300px; object-fit: cover;" 
                 alt="صورة المنشور" onerror="this.style.display='none'">
        `;
    }

    return `
        <div class="card mb-4 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
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
                    <small class="text-muted">اضغط لعرض التفاصيل</small>
                </div>
            </div>
        </div>
    `;
}

// تعديل منشور (إعادة توجيه إلى الصفحة الرئيسية)
function editPostBtnClicked(postObject) {
    try {
        const post = JSON.parse(decodeURIComponent(postObject));
        
        // التحقق من أن المنشور ملك للمستخدم الحالي
        const user = getCurrentUser();
        if (!user || post.author.id !== user.id) {
            showAlert("لا يمكنك تعديل هذا المنشور", "danger");
            return;
        }

        // حفظ بيانات المنشور في localStorage للتعديل
        localStorage.setItem('editPost', JSON.stringify(post));
        
        // التوجه إلى الصفحة الرئيسية مع معامل التعديل
        window.location.href = `home.html?edit=${post.id}`;

    } catch (error) {
        console.error('خطأ في تحليل بيانات المنشور:', error);
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

        // تأكيد الحذف
        if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنشور؟")) {
            deletePost(post.id);
        }
        
    } catch (error) {
        console.error('خطأ في تحليل بيانات المنشور:', error);
        showAlert("حدث خطأ في تحميل بيانات المنشور", "danger");
    }
}

// حذف المنشور
async function deletePost(postId) {
    toggleLoader(true);

    try {
        await PostsAPI.deletePost(postId);
        
        showAlert("تم حذف المنشور بنجاح", "success");
        
        // إعادة تحميل منشورات المستخدم
        getUserPosts();
        
        // إعادة تحميل معلومات المستخدم لتحديث العدادات
        getUser();

    } catch (error) {
        console.error('خطأ في حذف المنشور:', error);
        const message = error.response?.data?.message || "حدث خطأ في حذف المنشور";
        showAlert(message, "danger");
    } finally {
        toggleLoader(false);
    }
}

// التحقق من أن المستخدم الحالي يشاهد ملفه الشخصي
function isCurrentUserProfile() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.id == currentUserId;
}

// إظهار رسالة ترحيب إذا كان المستخدم يشاهد ملفه الشخصي
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (isCurrentUserProfile()) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                showAlert(`مرحباً ${currentUser.name || currentUser.username}!`, "info");
            }
        }
    }, 1000);
});