import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import AuthModal from './auth-modal.jsx';

import styles from './auth-entry.css';

const AuthEntry = ({
    isLoggedIn,
    username,
    avatarUrl,
    onLogin,
    onSendVerificationCode,
    onLogout,
    className
}) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleLogin = async (data) => {
        const success = await onLogin(data);
        if (success) {
            setIsAuthModalOpen(false);
        }
        return success;
    };

    if (isLoggedIn) {
        return (
            <div className={classNames(styles.userInfo, className)}>
                {avatarUrl && (
                    <img
                        src={avatarUrl}
                        alt={username}
                        className={styles.avatar}
                    />
                )}
                <span className={styles.username}>{username}</span>
                <button
                    className={styles.logoutButton}
                    onClick={onLogout}
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
    isLoggedIn: PropTypes.bool.isRequired,
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
    onLogin: PropTypes.func.isRequired,
    onSendVerificationCode: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default AuthEntry;
