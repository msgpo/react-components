import { useEffect, useState } from 'react';
import { c } from 'ttag';
import { useApi, useLoading, useAuthentication } from 'react-components';
import { BLACK_FRIDAY, PAYMENT_METHOD_TYPES } from 'proton-shared/lib/constants';
import { isExpired } from 'proton-shared/lib/helpers/card';
import { queryPaymentMethods } from 'proton-shared/lib/api/payments';

const usePaymentMethods = ({ amount, coupon, type }) => {
    const api = useApi();
    const { UID } = useAuthentication();
    const isAuthenticated = !!UID;
    const [methods, setMethods] = useState([]);
    const [loading, withLoading] = useLoading();

    const isPaypalAmountValid = amount >= 500;
    const isInvoice = type === 'invoice';
    const isSignup = type === 'signup';
    const alreadyHavePayPal = methods.some(({ Type }) => Type === PAYMENT_METHOD_TYPES.PAYPAL);

    const getMethod = (type, { Brand = '', Last4 = '', Payer = '' }) => {
        switch (type) {
            case PAYMENT_METHOD_TYPES.CARD:
                return `[${Brand}] •••• ${Last4}`;
            case PAYMENT_METHOD_TYPES.PAYPAL:
                return `[PayPal] ${Payer}`;
            default:
                return '';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case PAYMENT_METHOD_TYPES.CARD:
                return 'payments-type-card';
            case PAYMENT_METHOD_TYPES.PAYPAL:
                return 'payments-type-pp';
            default:
                return '';
        }
    };

    const options = [
        {
            icon: 'payments-type-card',
            value: PAYMENT_METHOD_TYPES.CARD,
            text: c('Payment method option').t`Credit/debit card`
        }
    ];

    if (methods.length) {
        options.unshift(
            ...methods.map(({ ID: value, Details, Type }, index) => ({
                icon: getIcon(Type),
                text: [
                    getMethod(Type, Details),
                    isExpired(Details) && `(${c('Info').t`Expired`})`,
                    index === 0 && `(${c('Info').t`default`})`
                ]
                    .filter(Boolean)
                    .join(' '),
                value,
                disabled: isExpired(Details)
            }))
        );
    }

    if (!alreadyHavePayPal && (isPaypalAmountValid || isInvoice)) {
        options.push({
            icon: 'payments-type-pp',
            text: c('Payment method option').t`PayPal`,
            value: PAYMENT_METHOD_TYPES.PAYPAL
        });
    }

    if (!isSignup && coupon !== BLACK_FRIDAY.COUPON_CODE) {
        options.push({
            icon: 'payments-type-bt',
            text: c('Payment method option').t`Bitcoin`,
            value: 'bitcoin'
        });

        options.push({
            icon: 'payments',
            text: c('Label').t`Cash`,
            value: 'cash'
        });
    }

    useEffect(() => {
        if (isAuthenticated) {
            withLoading(api(queryPaymentMethods()).then(({ PaymentMethods = [] }) => setMethods(PaymentMethods)));
        }
    }, []);

    return {
        methods,
        loading,
        options
    };
};

export default usePaymentMethods;
