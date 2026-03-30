import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import Input from '../forms/input.jsx';
import VerificationCode from './verification-code.jsx';

import styles from './auth-forms.css';

const RegisterMethod = {
    PHONE: 'phone',
    EMAIL: 'email'
};

const RegisterForm = ({
    onSubmit,
    onSendVerificationCode
}) => {
    const [registerMethod, setRegisterMethod] = useState(RegisterMethod.PHONE);
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        verificationCode: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (registerMethod === RegisterMethod.PHONE) {
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

        if (!formData.username) {
            newErrors.username = '请输入用户名';
        } else if (formData.username.length < 3) {
            newErrors.username = '用户名至少3个字符';
        }

        if (!formData.password) {
            newErrors.password = '请输入密码';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少6个字符';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '两次输入的密码不一致';
        }

        if (!formData.verificationCode) {
            newErrors.verificationCode = '请输入验证码';
        }

        if (!agreedToTerms) {
            newErrors.terms = '请同意服务条款';
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
                method: registerMethod,
                ...formData
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendCode = async () => {
        const target = registerMethod === RegisterMethod.PHONE ? formData.phone : formData.email;
        if (!target) {
            setErrors({
                ...errors,
                [registerMethod]: registerMethod === RegisterMethod.PHONE ? '请先输入手机号' : '请先输入邮箱'
            });
            return false;
        }
        return await onSendVerificationCode({
            method: registerMethod,
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
                        {[styles.activeMethod]: registerMethod === RegisterMethod.PHONE}
                    )}
                    onClick={() => setRegisterMethod(RegisterMethod.PHONE)}
                >
                    <FormattedMessage
                        defaultMessage="手机号注册"
                        description="Phone register button"
                        id="gui.auth.phoneRegister"
                    />
                </button>
                <button
                    type="button"
                    className={classNames(
                        styles.methodButton,
                        {[styles.activeMethod]: registerMethod === RegisterMethod.EMAIL}
                    )}
                    onClick={() => setRegisterMethod(RegisterMethod.EMAIL)}
                >
                    <FormattedMessage
                        defaultMessage="邮箱注册"
                        description="Email register button"
                        id="gui.auth.emailRegister"
                    />
                </button>
            </div>

            <div className={styles.inputGroup}>
                {registerMethod === RegisterMethod.PHONE ? (
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
                            defaultMessage="用户名"
                            description="Username label"
                            id="gui.auth.username"
                        />
                    </label>
                    <Input
                        type="text"
                        placeholder="请输入用户名"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={classNames(
                            styles.input,
                            {[styles.inputError]: errors.username}
                        )}
                    />
                    {errors.username && (
                        <span className={styles.errorText}>{errors.username}</span>
                    )}
                </div>

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
                        placeholder="请输入密码（至少6位）"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={classNames(
                            styles.input,
                            {[styles.inputError]: errors.password}
                        )}
                    />
                    {errors.password && (
                        <span className={styles.errorText}>{errors.password}</span>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        <FormattedMessage
                            defaultMessage="确认密码"
                            description="Confirm password label"
                            id="gui.auth.confirmPassword"
                        />
                    </label>
                    <Input
                        type="password"
                        placeholder="请再次输入密码"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={classNames(
                            styles.input,
                            {[styles.inputError]: errors.confirmPassword}
                        )}
                    />
                    {errors.confirmPassword && (
                        <span className={styles.errorText}>{errors.confirmPassword}</span>
                    )}
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
                    {errors.verificationCode && (
                        <span className={styles.errorText}>{errors.verificationCode}</span>
                    )}
                </div>
            </div>

            <div className={styles.termsContainer}>
                <label className={styles.termsLabel}>
                    <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                            setAgreedToTerms(e.target.checked);
                            if (errors.terms) {
                                setErrors({...errors, terms: null});
                            }
                        }}
                        className={styles.checkbox}
                    />
                    <span className={styles.termsText}>
                        <FormattedMessage
                            defaultMessage="我已阅读并同意"
                            description="I have read and agree to"
                            id="gui.auth.agreeTo"
                        />
                        <a href="#" className={styles.termsLink}>
                            <FormattedMessage
                                defaultMessage="服务条款"
                                description="Terms of service"
                                id="gui.auth.termsOfService"
                            />
                        </a>
                        <FormattedMessage
                            defaultMessage="和"
                            description="and"
                            id="gui.auth.and"
                        />
                        <a href="#" className={styles.termsLink}>
                            <FormattedMessage
                                defaultMessage="隐私政策"
                                description="Privacy policy"
                                id="gui.auth.privacyPolicy"
                            />
                        </a>
                    </span>
                </label>
                {errors.terms && (
                    <span className={styles.errorText}>{errors.terms}</span>
                )}
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
            >
                {isLoading ? (
                    <FormattedMessage
                        defaultMessage="注册中..."
                        description="Registering button"
                        id="gui.auth.registering"
                    />
                ) : (
                    <FormattedMessage
                        defaultMessage="注册"
                        description="Register button"
                        id="gui.auth.registerButton"
                    />
                )}
            </button>
        </form>
    );
};

RegisterForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onSendVerificationCode: PropTypes.func.isRequired
};

export default RegisterForm;
