import React from 'react';
import { c } from 'ttag';
import { SubTitle, Label, Row, Field, Href, Loader, useUser, useAddresses, useConfig } from 'react-components';
import { CLIENT_TYPES } from 'proton-shared/lib/constants';

const { VPN } = CLIENT_TYPES;

const UsernameSection = () => {
    const [{ Name }] = useUser();
    const [addresses, loading] = useAddresses();
    const [{ Email } = {}] = addresses || [];
    const { CLIENT_TYPE } = useConfig();

    return (
        <>
            <SubTitle>{c('Title').t`Username`}</SubTitle>
            <Row>
                <Label>{c('Label').t`Name`}</Label>
                <Field className="pt0-5">
                    <strong>{Name}</strong>
                </Field>
            </Row>
            {CLIENT_TYPE === VPN ? (
                loading ? (
                    <Loader />
                ) : (
                    <Row>
                        <Label>{c('Label').t`ProtonMail address`}</Label>
                        <Field className="pt0-5">
                            {addresses.length ? (
                                <strong>{Email}</strong>
                            ) : (
                                <Href
                                    url="https://mail.protonmail.com/login"
                                    title={c('Info').t`Log in to ProtonMail to activate your address`}
                                >{c('Link').t`Not activated`}</Href>
                            )}
                        </Field>
                    </Row>
                )
            ) : null}
        </>
    );
};

export default UsernameSection;
