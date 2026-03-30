/**
 * XPNI 云函数 API 封装
 */

const API_CONFIG = {
    auth: 'https://auth-xpni-bodjoorrfy.cn-shanghai.fcapp.run',
    order: 'https://order-xpni-eyceznmoga.cn-shanghai.fcapp.run',
    query: 'https://query-xpni-zzhpznmogo.cn-shanghai.fcapp.run'
};

const BEARER_TOKEN = 'token-jb49dj0hb3dgbhd82j0f3439id4c';

async function request(service, path, body) {
    const baseUrl = API_CONFIG[service];
    const url = baseUrl + path;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + BEARER_TOKEN
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

export const AuthAPI = {
    sendCode: function(method, target, actionType) {
        return request('auth', '/sendCode', {
            method: method,
            phone: method === 'phone' ? target : undefined,
            email: method === 'email' ? target : undefined,
            actionType: actionType || 'login'
        });
    },

    /**
     * 登录/注册
     * @param {Object} params - 登录参数
     * @param {string} params.method - 'phone' 或 'email'
     * @param {string} params.phone - 手机号（method为phone时）
     * @param {string} params.email - 邮箱（method为email时）
     * @param {string} params.password - 密码（method为email时）
     * @param {string} params.verificationCode - 验证码（method为phone时）
     * @returns {Promise<Object>} - 返回包含accessToken、refreshToken和userInfo的数据
     */
    login: function(params) {
        return request('auth', '/auth', params);
    },

    /**
     * 验证Token
     * @param {string} token - 访问令牌
     * @returns {Promise<Object>}
     */
    validateToken: function(token) {
        return request('auth', '/validateToken', { token });
    },

    /**
     * 刷新Token
     * @param {string} refreshToken - 刷新令牌
     * @returns {Promise<Object>}
     */
    refreshToken: function(refreshToken) {
        return request('auth', '/refreshToken', { refreshToken });
    },

    /**
     * 删除Token（登出）
     * @param {string} token - 访问令牌
     * @returns {Promise<Object>}
     */
    deleteToken: function(token) {
        return request('auth', '/delToken', { token });
    }
};

export const OrderAPI = {
    createOrder: function(orderData) {
        return request('order', '/create', orderData);
    },

    getOrder: function(orderId) {
        return request('order', '/get', { orderId: orderId });
    }
};

export const QueryAPI = {
    query: function(queryType, params) {
        return request('query', '/' + queryType, params);
    }
};

export default {
    Auth: AuthAPI,
    Order: OrderAPI,
    Query: QueryAPI
};
