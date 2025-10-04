let currentPostId = null;

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupUI();
    getCurrentPostId();
    if (currentPostId) {
        getPost();
    } else {
        showAlert("معرف المنشور غير صحيح", "danger");
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    }
});

// الحصول على معرف المنشور من الرابط
function getCurrentPostId() {
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get("postId");
    return currentPostId;
}

// جلب تفاصيل المنشور
async function getPost() {
    if (!currentPostId) return;

    toggleLoader(true);

    try {
        const response = await PostsAPI.getPost(currentPostId);
        const post = response.data;

        displayPost(post);
        displayComments(post.comments || []);
        
        // إظهار نموذج إضافة تعليق للمستخدمين المسجلين
        const user = getCurrentUser();
        const addCommentDiv = document.getElementById("add-comment-div");
        if (user && addCommentDiv) {
            addCommentDiv.style.display = 'block';
        }

    } catch (error) {
        console.error('خطأ في جلب المنشور:', error);
        showAlert("حدث خطأ في تحميل المنشور", "danger");
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } finally {
        toggleLoader(false);
    }
}

// عرض المنشور
function displayPost(post) {
    const postContainer = document.getElementById("post");
    const author = post.author;
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
            <img src="${post.image}" class="img-fluid rounded mb-3" 
                 alt="صورة المنشور" style="max-height: 500px; width: 100%; object-fit: cover;"
                 onerror="this.style.display='none'">
        `;
    }

    const postHTML = `
        <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center" style="cursor: pointer;" onclick="userClicked(${author.id})">
                    <img src="${author.profile_image || 'https://placehold.co/50'}" 
                         class="rounded-circle me-3" style="width: 50px; height: 50px; object-fit: cover;" 
                         alt="صورة المستخدم" onerror="this.src='https://placehold.co/50'">
                    <div>
                        <h6 class="mb-0">${author.username}</h6>
                        <small class="text-muted">${formatDate(post.created_at)}</small>
                    </div>
                </div>
                ${editBtnContent}
            </div>
            <div class="card-body">
                ${postImage}
                ${post.title ? `<h4 class="card-title">${post.title}</h4>` : ''}
                <p class="card-text" style="white-space: pre-wrap;">${post.body}</p>
                <div id="post-tags-${post.id}" class="mb-3"></div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">
                        <i class="bi bi-chat"></i>
                        ${post.comments_count} تعليق
                    </span>
                    <span class="text-muted">
                        <i class="bi bi-calendar"></i>
                        ${formatDate(post.created_at)}
                    </span>
                </div>
            </div>
        </div>
    `;

    postContainer.innerHTML = postHTML;

    // إضافة العلامات
    setTimeout(() => {
        addTagsToPost(post);
    }, 100);

    // تحديث عنوان الصفحة
    document.title = `${post.title || 'منشور'} - موقع التواصل الاجتماعي`;
}

// عرض التعليقات
function displayComments(comments) {
    const commentsContainer = document.getElementById("comments");
    
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-chat-left-text" style="font-size: 3rem; color: #ccc;"></i>
                <p class="text-muted mt-2">لا توجد تعليقات بعد</p>
                <p class="text-muted">كن أول من يعلق!</p>
            </div>
        `;
        return;
    }

    let commentsHTML = '';
    comments.forEach(comment => {
        const commentHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex mb-2">
                        <img src="${comment.author.profile_image || 'https://placehold.co/40'}" 
                             class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;" 
                             alt="صورة المستخدم" onerror="this.src='https://placehold.co/40'">
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong style="cursor: pointer;" onclick="userClicked(${comment.author.id})">
                                        ${comment.author.username}
                                    </strong>
                                    <small class="text-muted d-block">${formatDate(comment.created_at)}</small>
                                </div>
                            </div>
                            <p class="mb-0 mt-2" style="white-space: pre-wrap;">${comment.body}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        commentsHTML += commentHTML;
    });

    commentsContainer.innerHTML = commentsHTML;
}

// إضافة تعليق جديد
async function createCommentClicked() {
    const commentText = document.getElementById("comment-input").value.trim();

    if (!commentText) {
        showAlert("يرجى كتابة تعليق", "warning");
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        showAlert("يجب تسجيل الدخول أولاً", "warning");
        return;
    }

    if (!currentPostId) {
        showAlert("معرف المنشور غير صحيح", "danger");
        return;
    }

    toggleLoader(true);

    try {
        await CommentsAPI.createComment(currentPostId, commentText);
        
        showAlert("تم إضافة التعليق بنجاح", "success");
        
        // تنظيف النموذج
        document.getElementById("comment-input").value = "";
        
        // إعادة تحميل المنشور لإظهار التعليق الجديد
        getPost();

    } catch (error) {
        console.error('خطأ في إضافة التعليق:', error);
        const message = error.response?.data?.message || "حدث خطأ في إضافة التعليق";
        showAlert(message, "danger");
    } finally {
        toggleLoader(false);
    }
}

// تعديل منشور (من صفحة التفاصيل)
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

// حذف منشور (من صفحة التفاصيل)
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
        
        // التوجه إلى الصفحة الرئيسية
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);

    } catch (error) {
        console.error('خطأ في حذف المنشور:', error);
        const message = error.response?.data?.message || "حدث خطأ في حذف المنشور";
        showAlert(message, "danger");
    } finally {
        toggleLoader(false);
    }
}

// معالجة الضغط على Enter في نموذج التعليق
document.addEventListener('DOMContentLoaded', function() {
    const commentInput = document.getElementById("comment-input");
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                createCommentClicked();
            }
        });
    }
});