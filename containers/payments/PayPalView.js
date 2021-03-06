import React from 'react';
import PropTypes from 'prop-types';
import { Alert, DoNotWindowOpenAlertError, Price, Loader } from 'react-components';
import { MIN_PAYPAL_AMOUNT, MAX_PAYPAL_AMOUNT } from 'proton-shared/lib/constants';
import { doNotWindowOpen } from 'proton-shared/lib/helpers/browser';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';
import paypalSvgLight from 'design-system/assets/img/shared/bank-icons/cc-paypal.svg';
import paypalSvgDark from 'design-system/assets/img/shared/bank-icons/cc-paypal-dark.svg';
import { c } from 'ttag';

import PayPalButton from './PayPalButton';

const PayPalView = ({ type, amount, currency, paypal, paypalCredit }) => {
    if (type === 'payment' && amount < MIN_PAYPAL_AMOUNT) {
        return (
            <Alert type="error">
                {c('Error').t`Amount below minimum.`} {`(${(<Price currency={currency}>{MIN_PAYPAL_AMOUNT}</Price>)})`}
            </Alert>
        );
    }

    if (amount > MAX_PAYPAL_AMOUNT) {
        return <Alert type="error">{c('Error').t`Amount above the maximum.`}</Alert>;
    }

    if (doNotWindowOpen()) {
        return <DoNotWindowOpenAlertError />;
    }

    const paypalSvg = getLightOrDark(paypalSvgLight, paypalSvgDark);

    const clickHere = (
        <PayPalButton
            type={type}
            className="pm-button--link alignbaseline p0"
            key="click-here"
            paypal={paypalCredit}
            amount={amount}
        >
            {c('Link').t`click here`}
        </PayPalButton>
    );

    return (
        <div className="p1 bordered-container bg-global-highlight mb1">
            {paypal.loading ? (
                <>
                    <Loader />
                    <Alert>{c('Info').t`Please verify the payment in the new tab.`}</Alert>
                </>
            ) : null}
            {!paypal.loading && ['signup', 'subscription', 'invoice', 'credit'].includes(type) ? (
                <>
                    <Alert>
                        {c('Info')
                            .t`We will redirect you to PayPal in a new browser tab to complete this transaction. If you use any pop-up blockers, please disable them to continue.`}
                    </Alert>
                    <div className="aligncenter mb1">
                        <img src={paypalSvg} alt="PayPal" width="250" />
                    </div>
                    <Alert>{c('Info')
                        .jt`You must have a credit card or bank account linked with your PayPal account. If your PayPal account doesn't have that, please ${clickHere}.`}</Alert>
                </>
            ) : null}
            {!paypal.loading && type === 'update' ? (
                <>
                    <Alert>
                        {c('Info')
                            .t`This will enable PayPal to be used to pay for your Proton subscription. We will redirect you to PayPal in a new browser tab. If you use any pop-up blockers, please disable them to continue.`}
                    </Alert>
                    <div className="aligncenter mb1">
                        <img src={paypalSvg} alt="PayPal" width="250" />
                    </div>
                    <Alert>{c('Info')
                        .t`You must have a credit card or bank account linked with your PayPal account in order to add it as a payment method.`}</Alert>
                </>
            ) : null}
            {!paypal.loading && type === 'donation' ? (
                <>
                    <Alert>
                        {c('Info')
                            .t`We will redirect you to PayPal in a new browser tab to complete this transaction. If you use any pop-up blockers, please disable them to continue.`}
                    </Alert>
                    <div className="aligncenter">
                        <img src={paypalSvg} alt="PayPal" width="250" />
                    </div>
                </>
            ) : null}
        </div>
    );
};

PayPalView.propTypes = {
    type: PropTypes.oneOf(['signup', 'subscription', 'invoice', 'donation', 'credit', 'update']),
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    onPay: PropTypes.func,
    paypal: PropTypes.object.isRequired,
    paypalCredit: PropTypes.object.isRequired
};

export default PayPalView;
