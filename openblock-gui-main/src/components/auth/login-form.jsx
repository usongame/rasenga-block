import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import Input from '../forms/input.jsx';
import VerificationCode from './verification-code.jsx';

import styles from './auth-forms.css';

const LoginMethod = {
    PHONE: 'phone',
    EMAIL: 'email'
};

const LoginForm = ({
    onSubmit,
    onSendVerificationCode
}) => {
    const [loginMethod, setLoginMethod] = useState(LoginMethod.PHONE);
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        password: '',
        verificationCode: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (loginMethod === LoginMethod.PHONE) {
            if (!formData.phone) {
                newErrors.phone = '请输入手机号';
            } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
                newErrors.phone = '请输入有效的手机号';
            }
        } else {
            if (!formData.email) {
                newErrors.email = '请输入邮箱';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = '请输入有效的邮箱地址';
            }
        }

        if (!formData.password && !formData.verificationCode) {
            newErrors.password = '请输入密码或验证码';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await onSubmit({
                method: loginMethod,
                ...formData
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendCode = async () => {
        const target = loginMethod === LoginMethod.PHONE ? formData.phone : formData.email;
        if (!target) {
            setErrors({
                ...errors,
                [loginMethod]: loginMethod === LoginMethod.PHONE ? '请先输入手机号' : '请先输入邮箱'
            });
            return false;
        }
        return await onSendVerificationCode({
            method: loginMethod,
            target
        });
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null
            });
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.methodToggle}>
                <button
                    type="button"
                    className={classNames(
                        styles.methodButton,
                        {[styles.activeMethod]: loginMethod === LoginMethod.PHONE}
                    )}
                    onClick={() => setLoginMethod(LoginMethod.PHONE)}
                >
                    <FormattedMessage
                        defaultMessage="手机号登录"
                        description="Phone login button"
                        id="gui.auth.phoneLogin"
                    />
                </button>
                <button
                    type="button"
                    className={classNames(
                        styles.methodButton,
                        {[styles.activeMethod]: loginMethod === LoginMethod.EMAIL}
                    )}
                    onClick={() => setLoginMethod(LoginMethod.EMAIL)}
                >
                    <FormattedMessage
                        defaultMessage="邮箱登录"
                        description="Email login button"
                        id="gui.auth.emailLogin"
                    />
                </button>
            </div>

            <div className={styles.inputGroup}>
                {loginMethod === LoginMethod.PHONE ? (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <FormattedMessage
                                defaultMessage="手机号"
                                description="Phone number label"
                                id="gui.auth.phoneNumber"
                            />
                        </label>
                        <Input
                            type="tel"
                            placeholder="请输入手机号"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={classNames(
                                styles.input,
                                {[styles.inputError]: errors.phone}
                            )}
                        />
                        {errors.phone && (
                            <span className={styles.errorText}>{errors.phone}</span>
                        )}
                    </div>
                ) : (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <FormattedMessage
                                defaultMessage="邮箱"
                                description="Email label"
                                id="gui.auth.email"
                            />
                        </label>
                        <Input
                            type="email"
                            placeholder="请输入邮箱"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={classNames(
                                styles.input,
                                {[styles.inputError]: errors.email}
                            )}
                        />
                        {errors.email && (
                            <span className={styles.errorText}>{errors.email}</span>
                        )}
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>
                        <FormattedMessage
                            defaultMessage="密码"
                            description="Password label"
                            id="gui.auth.password"
                        />
                    </label>
                    <Input
                        type="password"
                        placeholder="请输入密码"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={classNames(
                            styles.input,
                            {[styles.inputError]: errors.password}
                        )}
                    />
                </div>

                <div className={styles.divider}>
                    <span className={styles.dividerText}>
                        <FormattedMessage
                            defaultMessage="或使用验证码"
                            description="Or use verification code"
                            id="gui.auth.orUseCode"
                        />
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        <FormattedMessage
                            defaultMessage="验证码"
                            description="Verification code label"
                            id="gui.auth.verificationCode"
                        />
                    </label>
                    <VerificationCode
                        value={formData.verificationCode}
                        onChange={(value) => handleInputChange('verificationCode', value)}
                        onSend={handleSendCode}
                        error={errors.verificationCode}
                    />
                </div>
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
            >
                {isLoading ? (
                    <FormattedMessage
                        defaultMessage="登录中..."
                        description="Logging in button"
                        id="gui.auth.loggingIn"
                    />
                ) : (
                    <FormattedMessage
                        defaultMessage="登录"
                        description="Login button"
                        id="gui.auth.loginButton"
                    />
                )}
            </button>

            <div className={styles.links}>
                <a href="#" className={styles.link}>
                    <FormattedMessage
                        defaultMessage="忘记密码？"
                        description="Forgot password link"
                        id="gui.auth.forgotPassword"
                    />
                </a>
            </div>
        </form>
    );
};

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onSendVerificationCode: PropTypes.func.isRequired
};

export default LoginForm;
