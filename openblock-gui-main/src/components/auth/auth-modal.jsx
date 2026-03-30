import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import Modal from '../modal/modal.jsx';
import LoginForm from './login-form.jsx';

import styles from './auth-modal.css';

const AuthModal = ({
    isOpen,
    onClose,
    onLogin,
    onSendVerificationCode
}) => (
    <Modal
        className={styles.modalContent}
        contentLabel={
            <FormattedMessage
                defaultMessage="登录"
                description="Login modal title"
                id="gui.auth.modalTitle"
            />
        }
        onRequestClose={onClose}
        isOpen={isOpen}
        closeButtonVisible={true}
    >
        <div className={styles.authContainer}>
            <div className={styles.authBody}>
                <LoginForm
                    onSubmit={onLogin}
                    onSendVerificationCode={onSendVerificationCode}
                />
            </div>
        </div>
    </Modal>
);

AuthModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onSendVerificationCode: PropTypes.func.isRequired
};

export default AuthModal;
