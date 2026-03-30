import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import Input from '../forms/input.jsx';

import styles from './verification-code.css';

const COUNTDOWN_SECONDS = 60;

const VerificationCode = ({
    value,
    onChange,
    onSend,
    error
}) => {
    const [countdown, setCountdown] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState(null);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSendCode = useCallback(async () => {
        if (countdown > 0 || isSending) return;

        setIsSending(true);
        setSendError(null);

        try {
            const success = await onSend();
            if (success !== false) {
                setCountdown(COUNTDOWN_SECONDS);
            }
        } catch (err) {
            setSendError(err.message || '发送失败，请重试');
        } finally {
            setIsSending(false);
        }
    }, [countdown, isSending, onSend]);

    const formatCountdown = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                <Input
                    type="text"
                    placeholder="请输入验证码"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={6}
                    className={classNames(
                        styles.codeInput,
                        {[styles.inputError]: error}
                    )}
                />
                <button
                    type="button"
                    className={classNames(
                        styles.sendButton,
                        {
                            [styles.disabled]: countdown > 0 || isSending,
                            [styles.sending]: isSending
                        }
                    )}
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSending}
                >
                    {isSending ? (
                        <FormattedMessage
                            defaultMessage="发送中..."
                            description="Sending button"
                            id="gui.auth.sending"
                        />
                    ) : countdown > 0 ? (
                        <FormattedMessage
                            defaultMessage="{time}后重试"
                            description="Retry after time"
                            id="gui.auth.retryAfter"
                            values={{time: formatCountdown()}}
                        />
                    ) : (
                        <FormattedMessage
                            defaultMessage="获取验证码"
                            description="Get verification code"
                            id="gui.auth.getCode"
                        />
                    )}
                </button>
            </div>
            {(error || sendError) && (
                <span className={styles.errorText}>
                    {error || sendError}
                </span>
            )}
        </div>
    );
};

VerificationCode.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    error: PropTypes.string
};

export default VerificationCode;
