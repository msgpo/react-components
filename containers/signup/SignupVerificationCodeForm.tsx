import React, { ChangeEvent, FormEvent } from 'react';
import { c } from 'ttag';
import { VerificationCodeInput, InlineLinkButton, Alert } from 'react-components';

import { SignupModel, SignupErros } from './interfaces';
import { PrimaryButton } from '../../components/button';

interface Props {
    model: SignupModel;
    onChange: (model: SignupModel) => void;
    onResend: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    errors: SignupErros;
    loading: boolean;
}

const SignupVerificationCodeForm = ({ model, onChange, onSubmit, onResend, errors, loading }: Props) => {
    const disableSubmit = !!errors.verificationCode;
    return (
        <>
            <h1 className="h2">{c('Title').t`Human verification`}</h1>
            <Alert>{c('Info').t`For security reasons, please verify that your are not a robot.`}</Alert>
            <form name="humanForm" onSubmit={onSubmit}>
                <label htmlFor="verification-code">{c('Label')
                    .t`Enter the verification code that was sent to ${model.email}. If you don't find the email in your inbox, please check your spam folder`}</label>
                <div className="mb1">
                    <VerificationCodeInput
                        id="verification-code"
                        className="mb1"
                        value={model.verificationCode}
                        error={errors.verificationCode}
                        onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
                            onChange({ ...model, verificationCode: target.value })
                        }
                        autoFocus
                        required
                    />
                </div>
                <div className="mb1">
                    <InlineLinkButton disabled={loading} onClick={onResend}>{c('Action')
                        .t`Did not receive the code?`}</InlineLinkButton>
                </div>
                <div className="alignright">
                    <PrimaryButton
                        className="pm-button--large"
                        type="submit"
                        disabled={disableSubmit}
                        loading={loading}
                    >{c('Action').t`Verify`}</PrimaryButton>
                </div>
            </form>
        </>
    );
};

export default SignupVerificationCodeForm;
