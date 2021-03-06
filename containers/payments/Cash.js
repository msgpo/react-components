import React from 'react';
import { c } from 'ttag';
import { Alert, useConfig } from 'react-components';
import { CLIENT_TYPES } from 'proton-shared/lib/constants';
import { getLightOrDark } from 'proton-shared/lib/themes/helpers';
import envelopSvgLight from 'design-system/assets/img/shared/envelop.svg';
import envelopSvgDark from 'design-system/assets/img/shared/envelop-dark.svg';

const { VPN } = CLIENT_TYPES;

const Cash = () => {
    const { CLIENT_TYPE } = useConfig();
    const envelopSvg = getLightOrDark(envelopSvgLight, envelopSvgDark);
    const email = <b key="email-contact">{CLIENT_TYPE === VPN ? 'contact@protonvpn.com' : 'contact@protonmail.com'}</b>;

    return (
        <div className="p1 bordered-container bg-global-highlight mb1">
            <Alert>{c('Info for cash payment method')
                .jt`Please contact us at ${email} for instructions on how to pay us with cash.`}</Alert>
            <div className="aligncenter">
                <img src={envelopSvg} alt="" />
            </div>
        </div>
    );
};

export default Cash;
