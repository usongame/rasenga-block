import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import Modal from '../modal/modal.jsx';
import LoginForm from './login-form.jsx';
import RegisterForm from './register-form.jsx';

import styles from './auth-modal.css';

const AuthModal = ({
    isOpen,
    onClose,
    onLogin,
    onRegister,
    onSendVerificationCode
}) => {
    const [activeTab, setActiveTab] = useState('login');

    return (
        <Modal
            className={styles.modalContent}
            contentLabel="Auth Modal"
            onRequestClose={onClose}
            isOpen={isOpen}
        >
            <div className={styles.authContainer}>
                <div className={styles.authHeader}>
                    <div className={styles.tabContainer}>
                        <button
                            className={classNames(
                                styles.tabButton,
                                {[styles.activeTab]: activeTab === 'login'}
                            )}
                            onClick={() => setActiveTab('login')}
                        >
                            <FormattedMessage
                                defaultMessage="登录"
                                description="Login tab button"
                                id="gui.auth.loginTab"
                            />
                        </button>
                        <button
                            className={classNames(
                                styles.tabButton,
                                {[styles.activeTab]: activeTab === 'register'}
                            )}
                            onClick={() => setActiveTab('register')}
                        >
                            <FormattedMessage
                                defaultMessage="注册"
                                description="Register tab button"
                                id="gui.auth.registerTab"
                            />
                        </button>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className={styles.authBody}>
                    {activeTab === 'login' ? (
                        <LoginForm
                            onSubmit={onLogin}
                            onSendVerificationCode={onSendVerificationCode}
                        />
                    ) : (
                        <RegisterForm
                            onSubmit={onRegister}
                            onSendVerificationCode={onSendVerificationCode}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

AuthModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onRegister: PropTypes.func.isRequired,
    onSendVerificationCode: PropTypes.func.isRequired
};

export default AuthModal;
