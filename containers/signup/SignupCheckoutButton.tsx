import React from 'react';
import { PrimaryButton, PayPalButton, classnames } from 'react-components';
import { PAYMENT_METHOD_TYPES } from 'proton-shared/lib/constants';
import { c } from 'ttag';

import { SubscriptionCheckResult, SignupPayPal } from './interfaces';

interface Props {
    className?: string;
    paypal: SignupPayPal;
    canPay: boolean;
    loading: boolean;
    method: string;
    checkResult?: SubscriptionCheckResult;
}

const SignupCheckoutButton = ({ className, paypal, canPay, loading, method, checkResult }: Props) => {
    if (method === PAYMENT_METHOD_TYPES.PAYPAL) {
        return (
            <PayPalButton
                paypal={paypal}
                className={classnames(['pm-button--primary', className])}
                amount={checkResult ? checkResult.AmountDue : 0}
            >{c('Action').t`Pay`}</PayPalButton>
        );
    }

    if (checkResult && !checkResult.AmountDue) {
        return (
            <PrimaryButton className={className} loading={loading} disabled={!canPay} type="submit">{c('Action')
                .t`Confirm`}</PrimaryButton>
        );
    }

    return (
        <PrimaryButton className={className} loading={loading} disabled={!canPay} type="submit">{c('Action')
            .t`Pay`}</PrimaryButton>
    );
};

export default SignupCheckoutButton;
