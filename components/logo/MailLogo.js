import React from 'react';
import PropTypes from 'prop-types';

import { PLAN_NAMES } from 'proton-shared/lib/constants';

const MailLogo = ({ planName = '' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="logo"
            aria-labelledby="logo__title plan"
            width="148"
            height="36"
        >
            <g>
                <path d="M32.8 16.1c0 1.3-.3 2.3-1 2.8-.6.5-1.5.7-2.8.7h-2.1v-6.8H29c2.6 0 3.8 1.1 3.8 3.3zm1.3-4.5c-1.3-.9-3.1-1.4-5.4-1.4h-5.1V29h3.2v-6.7h1.9c2.3 0 4-.5 5.3-1.4 1.4-1.1 2.1-2.7 2.1-4.8.1-1.9-.6-3.5-2-4.5" />
                <path d="M44.8 14.1c-.9 0-1.7.3-2.3.8-.4.3-.8.8-1.1 1.3l-.2-1.8h-2.8v14.5h3.1v-8.4c.2-.8 1-3.4 2.9-3.4.4 0 .7.1 1.1.1l.4.1.6-3.1-.3-.1c-.4.1-.9 0-1.4 0" />
                <path d="M53.2 26.3c-2.2 0-3.2-1.6-3.2-4.9 0-1.7.3-3 .9-3.8.5-.8 1.3-1.1 2.4-1.1s1.8.4 2.3 1.1c.6.8.9 2.1.9 3.8-.1 3.3-1.1 4.9-3.3 4.9zm0-12.5c-2 0-3.7.8-4.8 2.1-1.1 1.3-1.7 3.2-1.7 5.5s.6 4.1 1.7 5.5c1.1 1.4 2.8 2.1 4.8 2.1s3.7-.8 4.8-2.1c1.1-1.3 1.7-3.2 1.7-5.5s-.6-4.1-1.7-5.5c-1.1-1.4-2.8-2.1-4.8-2.1" />
                <path d="M68.9 25.7c-.6.4-1.1.6-1.6.6-.8 0-1.3-.3-1.3-1.7v-7.9h3.1l.4-2.5h-3.6v-3.5l-3.1.3v3.1h-2.2v2.5h2.2v7.9c0 2.8 1.5 4.4 4.1 4.4 1.3 0 2.4-.4 3.3-1l.3-.2-1.3-2.3-.3.3" />
                <path d="M77.2 26.3c-2.2 0-3.2-1.6-3.2-4.9 0-1.7.3-3 .9-3.8.5-.8 1.3-1.1 2.4-1.1 1.1 0 1.8.4 2.3 1.1.6.8.9 2.1.9 3.8-.1 3.3-1.1 4.9-3.3 4.9zm0-12.5c-2 0-3.7.8-4.8 2.1-1.1 1.3-1.7 3.2-1.7 5.5s.6 4.1 1.7 5.5c1.1 1.4 2.8 2.1 4.8 2.1s3.7-.8 4.8-2.1c1.1-1.3 1.7-3.2 1.7-5.5s-.6-4.1-1.7-5.5c-1.1-1.4-2.8-2.1-4.8-2.1" />
                <path d="M93.6 14.1c-1.5 0-3 .6-4.1 1.7l-.1-1.4h-2.7v14.5h3.1V18.7c.5-.7 1.6-2 3.1-2 1.3 0 1.8.5 1.8 2v10.2h3.1V18.6c0-1.4-.3-2.5-.9-3.2-.8-.9-1.9-1.3-3.3-1.3" />
                <path d="M113.5 10.2l-3.6 12.5-3.8-12.5h-4L100.6 29h3.1l.7-9.6c.1-1.3.2-2.9.2-4.2l3.7 11.9h2.9l3.6-11.9c.1 1.2.1 2.7.3 4.2l.8 9.6h3.1l-1.6-18.8h-3.9" />
                <path d="M128.9 21.8v2.9c-.8 1.1-1.7 1.7-2.8 1.7-1.5 0-2.1-.7-2.1-2.2 0-.8.3-1.3.8-1.7.6-.4 1.6-.7 2.9-.7h1.2zm3.1 3.4v-6.5c0-2.2-.9-4.9-5.4-4.9-1.5 0-3.1.3-4.7.9l-.3.1.9 2.4.3-.1c1.3-.4 2.5-.7 3.5-.7 1.9 0 2.6.6 2.6 2.3v.7h-1.4c-2.2 0-3.8.4-5 1.2-1.2.8-1.8 2.1-1.8 3.6 0 2.8 1.9 4.6 4.8 4.6.9 0 1.7-.2 2.5-.5.6-.3 1.1-.6 1.6-1.1.5.9 1.4 1.5 2.6 1.6h.3l.8-2.3-.3-.1c-.7 0-1-.3-1-1.2" />
                <path d="M137.3 8c-.6 0-1.1.2-1.4.6s-.6.9-.6 1.4c0 1.2.9 2 2 2 .6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.4-.1-1.2-.9-2-2.1-2" />
                <path d="M135.7 29h3.1V14.4h-3.1V29" />
                <path d="M147.2 26l-.3.1c-.2.1-.5.1-.8.1-.3 0-.5 0-.5-.8V8.2l-3.1.4v16.7c0 1.2.3 2.1.9 2.8.6.6 1.3.9 2.3.9.7 0 1.4-.2 2.1-.5l.3-.1-.9-2.4" />
            </g>
            <g>
                <path d="M8.3 25.4c-.4 0-1.1-.1-1.9-.7S0 20.1 0 20.1V28c0 .3 0 .9.9.9h14.9c.9 0 .9-.7.9-.9v-7.9s-5.6 4-6.4 4.6c-.9.6-1.6.7-2 .7z" />
                <path d="M8.3 5.6S0 5.4 0 13v5.1c0 .6.1.6 1.6 1.8 4.8 3.5 5.6 4.3 6.7 4.3s1.9-.8 6.7-4.3c1.6-1.1 1.6-1.2 1.6-1.8V13c.1-7.6-8.3-7.4-8.3-7.4zm4.8 10.7H3.6v-3.2c0-3.8 4.5-4 4.8-4 .3 0 4.8.2 4.8 4v3.2z" />
            </g>
            <title id="logo__title">ProtonMail</title>
            {planName ? (
                <text
                    textAnchor="end"
                    className={`plan fill-${planName} uppercase bold`}
                    x="147"
                    y="42"
                    id="plan"
                    focusable={false}
                >
                    {planName}
                </text>
            ) : null}
        </svg>
    );
};

MailLogo.propTypes = {
    planName: PropTypes.oneOf(Object.keys(PLAN_NAMES))
};

export default MailLogo;
