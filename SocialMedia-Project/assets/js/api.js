const baseUrl = "https://tarmeezacademy.com/api/v1";

axios.defaults.timeout = 10000;

// إضافة interceptor للتعامل مع الأخطاء العامة
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.error("API Error:", error);
    if (error.code === "ECONNABORTED") {
      showAlert("انتهت مهلة الاتصال بالخادم", "danger");
    } else if (error.response) {
      const message = error.response.data?.message || "حدث خطأ غير متوقع";
      showAlert(message, "danger");
    } else if (error.request) {
      showAlert("لا يمكن الاتصال بالخادم", "danger");
    }
    return Promise.reject(error);
  }
);

// دوال API للمنشورات
const PostsAPI = {
  // جلب المنشورات مع إمكانية التصفح
  async getPosts(page = 1, limit = 6) {
    try {
      const response = await axios.get(
        `${baseUrl}/posts?limit=${limit}&page=${page}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // جلب منشور معين بالمعرف
  async getPost(postId) {
    try {
      const response = await axios.get(`${baseUrl}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // إنشاء منشور جديد
  async createPost(postData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const formData = new FormData();
    formData.append("body", postData.body);
    formData.append("title", postData.title);
    if (postData.image) {
      formData.append("image", postData.image);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.post(`${baseUrl}/posts`, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // تحديث منشور
  async updatePost(postId, postData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const formData = new FormData();
    formData.append("body", postData.body);
    formData.append("title", postData.title);
    formData.append("_method", "put");
    if (postData.image) {
      formData.append("image", postData.image);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.post(
        `${baseUrl}/posts/${postId}`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // حذف منشور
  async deletePost(postId) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const config = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.delete(`${baseUrl}/posts/${postId}`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// دوال API للتعليقات
const CommentsAPI = {
  // إضافة تعليق على منشور
  async createComment(postId, comment) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const config = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.post(
        `${baseUrl}/posts/${postId}/comments`,
        {
          body: comment,
        },
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// دوال API للمستخدمين
const UsersAPI = {
  // جلب معلومات مستخدم
  async getUser(userId) {
    try {
      const response = await axios.get(`${baseUrl}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // جلب منشورات مستخدم معين
  async getUserPosts(userId) {
    try {
      const response = await axios.get(`${baseUrl}/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// دوال API للمصادقة
const AuthAPI = {
  // تسجيل الدخول
  async login(username, password) {
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        username: username,
        password: password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // تسجيل مستخدم جديد
  async register(userData) {
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("username", userData.username);
    formData.append("password", userData.password);
    if (userData.image) {
      formData.append("image", userData.image);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const response = await axios.post(
        `${baseUrl}/register`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
