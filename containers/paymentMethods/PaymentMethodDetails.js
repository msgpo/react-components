import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Bordered } from 'react-components';
import { c } from 'ttag';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';
import { PAYMENT_METHOD_TYPES } from 'proton-shared/lib/constants';
import useSvgGraphicsBbox from '../../hooks/useSvgGraphicsBbox';

const banks = require.context('design-system/assets/img/shared/bank-icons', true, /.svg$/);

const banksMap = banks.keys().reduce((acc, key) => {
    acc[key] = () => banks(key);
    return acc;
}, {});

const getBankSvg = (type = '') => {
    const key = `./cc-${type}.svg`;
    const keyDark = `./cc-${type}-dark.svg`;
    if (!banksMap[key]) {
        return;
    }
    const ligthLogo = banksMap[key]().default;
    const darkLogo = !banksMap[keyDark] ? ligthLogo : banksMap[keyDark]().default;

    return getLightOrDark(ligthLogo, darkLogo);
};

const BANKS = {
    'American Express': 'american-express',
    'Diners Club': 'diners-club',
    Discover: 'discover',
    JCB: 'jcb',
    Maestro: 'maestro',
    MasterCard: 'mastercard',
    UnionPay: 'unionpay',
    Visa: 'visa'
};

const PaymentMethodDetails = ({ type, details = {} }) => {
    const { Last4, Name, ExpMonth, ExpYear, Payer, Brand = '' } = details;

    const cardNumberText = `•••• •••• •••• ${Last4}`;
    const textRef = useRef();
    const textBbox = useSvgGraphicsBbox(textRef, [cardNumberText]);
    const textWidth = Math.floor(textBbox.width);

    if (type === PAYMENT_METHOD_TYPES.CARD) {
        const bankIcon = getBankSvg(BANKS[Brand]);
        return (
            <Bordered className="bg-global-highlight inline-flex flex-column w100 pl2 pr2 pb2">
                {bankIcon ? <img width="70" src={bankIcon} alt={Brand} className="mb1" /> : null}
                <span className="color-global-grey-dm bl mb1 opacity-40">{c('Label').t`Card number`}</span>
                <div className="ratio-container-5-1 aligncenter">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inner-ratio-container fill-currentColor"
                        viewBox={`0 0 ${textWidth} 50`}
                        xmlSpace="preserve"
                    >
                        <text x="0px" y="40px" className="size-40 strong" ref={textRef}>
                            {cardNumberText}
                        </text>
                    </svg>
                </div>
                <div className="flex flex-nowrap mw100">
                    <div className="flex-item-fluid">
                        <span className="color-global-grey-dm bl mb0-5 opacity-40">{c('Label').t`Card holder`}</span>
                        <span className="bigger mt0 mb0 inbl ellipsis mw100">{Name}</span>
                    </div>
                    <div className="alignright flex-item-noshrink pl1">
                        <span className="color-global-grey-dm bl mb0-5 opacity-40">{c('Label').t`Expires`}</span>
                        <span className="bigger mt0 mb0">
                            {ExpMonth}/{ExpYear}
                        </span>
                    </div>
                </div>
            </Bordered>
        );
    }

    if (type === PAYMENT_METHOD_TYPES.PAYPAL) {
        const bankIcon = getBankSvg('paypal');
        return (
            <Bordered className="bg-global-highlight p2">
                <div>
                    <img width="70" src={bankIcon} alt="PayPal" className="mb1" />
                </div>
                <div className="flex flex-wrap flex-items-center">
                    <label className="color-global-grey-dm flex-item-noshrink mr1" htmlFor="paypal-payer">{c('Label')
                        .t`Payer`}</label>
                    <code id="paypal-payer" className="bl bigger mb0 mb1 ellipsis" title={Payer}>
                        {Payer}
                    </code>
                </div>
            </Bordered>
        );
    }

    return null;
};

PaymentMethodDetails.propTypes = {
    type: PropTypes.string.isRequired,
    details: PropTypes.object.isRequired
};

export default PaymentMethodDetails;
