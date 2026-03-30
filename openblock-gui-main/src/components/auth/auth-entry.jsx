import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import AuthModal from './auth-modal.jsx';
import {isLoggedIn, getUserInfo, getAccessToken, saveAuthData} from '../../lib/auth-storage.js';
import {AuthAPI} from '../../lib/xpni-api.js';

import styles from './auth-entry.css';

const AuthEntry = ({
    onLogin,
    onSendVerificationCode,
    onLogout,
    className
}) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // 检查登录状态
    useEffect(() => {
        const checkLoginStatus = async () => {
            const loggedInStatus = isLoggedIn();
            const info = getUserInfo();
            console.log('AuthEntry checkLoginStatus:', { loggedInStatus, info });
            
            if (loggedInStatus) {
                // 如果有token，尝试从服务器获取最新用户信息
                try {
                    const token = getAccessToken();
                    if (token) {
                        console.log('Fetching user info from server...');
                        const result = await AuthAPI.validateToken(token);
                        console.log('User info from server:', result);
                        
                        if (result.success && result.data) {
                            // 更新本地存储的用户信息
                            const newUserInfo = {
                                id: result.data.user_id || info.id,
                                username: result.data.nickname || info.username,
                                nickname: result.data.nickname || info.nickname,
                                avatarUrl: result.data.avatar || info.avatarUrl
                            };
                            
                            // 保存更新后的信息
                            saveAuthData({
                                accessToken: token,
                                refreshToken: '',
                                user: newUserInfo
                            });
                            
                            setUserInfo(newUserInfo);
                            setLoggedIn(true);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user info:', error);
                    // 如果获取失败（如token过期），清除登录状态
                    if (error.message && (error.message.includes('过期') || error.message.includes('无效'))) {
                        setLoggedIn(false);
                        setUserInfo(null);
                        return;
                    }
                }
            }
            
            setLoggedIn(loggedInStatus);
            setUserInfo(info);
        };

        checkLoginStatus();
        
        // 监听storage变化（用于多标签页同步）
        const handleStorageChange = (e) => {
            console.log('AuthEntry storage change:', e.key);
            if (e.key === 'xpni_auth' || e.key === null) {
                checkLoginStatus();
            }
        };
        
        // 监听打开登录对话框的事件
        const handleOpenLoginModal = () => {
            console.log('AuthEntry: Opening login modal');
            setIsAuthModalOpen(true);
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('xpni:openLoginModal', handleOpenLoginModal);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('xpni:openLoginModal', handleOpenLoginModal);
        };
    }, []);

    const handleLogin = async (data) => {
        console.log('AuthEntry handleLogin called:', data);
        const success = await onLogin(data);
        console.log('AuthEntry handleLogin success:', success);
        if (success) {
            // 延迟3秒后关闭对话框并更新状态
            setTimeout(() => {
                setIsAuthModalOpen(false);
                // 更新登录状态
                const loggedInStatus = isLoggedIn();
                const info = getUserInfo();
                console.log('AuthEntry after login:', { loggedInStatus, info });
                setLoggedIn(loggedInStatus);
                setUserInfo(info);
            }, 3000);
        }
        return success;
    };

    const handleLogout = async () => {
        await onLogout();
        setLoggedIn(false);
        setUserInfo(null);
    };

    if (loggedIn && userInfo) {
        return (
            <div className={classNames(styles.userInfo, className)}>
                {userInfo.avatarUrl && (
                    <img
                        src={userInfo.avatarUrl}
                        alt={userInfo.nickname || userInfo.username}
                        className={styles.avatar}
                    />
                )}
                <span className={styles.username}>{userInfo.nickname || userInfo.username}</span>
                <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                >
                    <FormattedMessage
                        defaultMessage="退出"
                        description="Logout button"
                        id="gui.auth.logout"
                    />
                </button>
            </div>
        );
    }

    return (
        <React.Fragment>
            <button
                className={classNames(styles.loginButton, className)}
                onClick={() => setIsAuthModalOpen(true)}
            >
                <FormattedMessage
                    defaultMessage="登录"
                    description="Login button"
                    id="gui.auth.login"
                />
            </button>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLogin={handleLogin}
                onSendVerificationCode={onSendVerificationCode}
            />
        </React.Fragment>
    );
};

AuthEntry.propTypes = {
    onLogin: PropTypes.func.isRequired,
    onSendVerificationCode: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default AuthEntry;
