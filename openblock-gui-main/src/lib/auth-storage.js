/**
 * 认证状态管理 - 处理登录状态和Token存储
 * Token有效期：30天
 */

const STORAGE_KEY = 'xpni_auth';
const TOKEN_EXPIRY_DAYS = 30;

/**
 * 获取存储的认证信息
 * @returns {Object|null}
 */
export function getAuthData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        
        const auth = JSON.parse(data);
        
        // 检查token是否过期
        if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) {
            // Token已过期，清除存储
            clearAuthData();
            return null;
        }
        
        return auth;
    } catch (e) {
        console.error('Failed to get auth data:', e);
        return null;
    }
}

/**
 * 保存认证信息
 * @param {Object} authData - 认证数据
 * @param {string} authData.accessToken - 访问令牌
 * @param {string} authData.refreshToken - 刷新令牌
 * @param {Object} authData.user - 用户信息
 * @param {string} authData.user.id - 用户ID
 * @param {string} authData.user.username - 用户名
 * @param {string} authData.user.nickname - 昵称
 * @param {string} authData.user.avatarUrl - 头像URL
 */
export function saveAuthData(authData) {
    try {
        // 计算过期时间（30天后）
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);
        
        const data = {
            ...authData,
            expiresAt: expiresAt.toISOString(),
            isLoggedIn: true
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save auth data:', e);
        return false;
    }
}

/**
 * 清除认证信息（登出）
 */
export function clearAuthData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.error('Failed to clear auth data:', e);
        return false;
    }
}

/**
 * 获取访问令牌
 * @returns {string|null}
 */
export function getAccessToken() {
    const auth = getAuthData();
    return auth ? auth.accessToken : null;
}

/**
 * 获取刷新令牌
 * @returns {string|null}
 */
export function getRefreshToken() {
    const auth = getAuthData();
    return auth ? auth.refreshToken : null;
}

/**
 * 获取用户信息
 * @returns {Object|null}
 */
export function getUserInfo() {
    const auth = getAuthData();
    return auth ? auth.user : null;
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
    const auth = getAuthData();
    return auth && auth.isLoggedIn && auth.accessToken;
}

/**
 * 更新用户信息
 * @param {Object} userInfo - 用户信息
 */
export function updateUserInfo(userInfo) {
    const auth = getAuthData();
    if (auth) {
        auth.user = { ...auth.user, ...userInfo };
        saveAuthData(auth);
    }
}

export default {
    getAuthData,
    saveAuthData,
    clearAuthData,
    getAccessToken,
    getRefreshToken,
    getUserInfo,
    isLoggedIn,
    updateUserInfo
};
