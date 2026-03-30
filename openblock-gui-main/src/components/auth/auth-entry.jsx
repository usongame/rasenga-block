import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import AuthModal from './auth-modal.jsx';
import {isLoggedIn, getUserInfo, getAccessToken} from '../../lib/auth-storage.js';

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
        const checkLoginStatus = () => {
            const loggedInStatus = isLoggedIn();
            const info = getUserInfo();
            console.log('AuthEntry checkLoginStatus:', { loggedInStatus, info });
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
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
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
