import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Location, History } from 'history';
import { useApi, useLoading, useConfig, usePlans, useModals, usePayment } from 'react-components';
import { queryAvailableDomains } from 'proton-shared/lib/api/domains';
import { setupAddress } from 'proton-shared/lib/api/addresses';
import { setupKeys } from 'proton-shared/lib/api/keys';
import { API_CUSTOM_ERROR_CODES } from 'proton-shared/lib/errors';
import { TOKEN_TYPES } from 'proton-shared/lib/constants';
import { subscribe, checkSubscription } from 'proton-shared/lib/api/payments';
import { srpVerify, srpAuth } from 'proton-shared/lib/srp';
import { auth, setCookies } from 'proton-shared/lib/api/auth';
import { mergeHeaders } from 'proton-shared/lib/fetch/helpers';
import { getRandomString } from 'proton-shared/lib/helpers/string';
import { getAuthHeaders } from 'proton-shared/lib/api';
import { isEmail } from 'proton-shared/lib/helpers/validators';
import { c } from 'ttag';
import {
    queryCheckUsernameAvailability,
    queryCreateUser,
    queryCreateUserExternal,
    queryDirectSignupStatus,
    queryVerificationCode,
    queryCheckVerificationCode
} from 'proton-shared/lib/api/user';

import SignupLayout from './SignupLayout';
import SignupAside from './SignupAside';
import SignupAccountForm from './SignupAccountForm';
import SignupRecoveryForm from './SignupRecoveryForm';
import SignupVerificationCodeForm from './SignupVerificationCodeForm';
import SignupHumanVerification from './SignupHumanVerification';
import SignupPlans from './SignupPlans';
import SignupPayment from './SignupPayment';
import { handlePaymentToken } from '../payments/paymentTokenHelper';
import { SignupModel, SignupErros, SignupPlan, SubscriptionCheckResult } from './interfaces';
import { DEFAULT_SIGNUP_MODEL, SIGNUP_STEPS } from './constants';
import humanApiHelper from './humanApi';

interface Props {
    history: History;
    location: Location;
    onLogin: (data: { UID: string; EventID: string }) => void;
}

const {
    ACCOUNT_CREATION_USERNAME,
    ACCOUNT_CREATION_EMAIL,
    NO_SIGNUP,
    RECOVERY_EMAIL,
    RECOVERY_PHONE,
    VERIFICATION_CODE,
    PLANS,
    PAYMENT,
    HUMAN_VERIFICATION
} = SIGNUP_STEPS;

const withAuthHeaders = (UID: string, AccessToken: string, config: any) =>
    mergeHeaders(config, getAuthHeaders(UID, AccessToken));

const SignupContainer = ({ onLogin, history }: Props) => {
    const searchParams = new URLSearchParams(history.location.search);
    const currency = searchParams.get('currency');
    const cycle = Number(searchParams.get('billing'));
    const preSelectedPlan = searchParams.get('plan');
    const api = useApi();
    const { createModal } = useModals();
    const { CLIENT_TYPE } = useConfig();
    const [plans, loadingPlans] = usePlans();
    const [loading, withLoading] = useLoading();
    const [model, updateModel] = useState<SignupModel>({
        ...DEFAULT_SIGNUP_MODEL,
        ...(currency ? { currency } : {}),
        ...(cycle ? { cycle } : {})
        // NOTE preSelectedPlan is used in a useEffect
    });
    const [usernameError, setUsernameError] = useState<string>('');
    const hasPaidPlan = Object.keys(model.planIDs).length;

    const handlePayPal = () => {};

    const {
        card,
        setCard,
        errors: paymentErrors,
        method,
        setMethod,
        parameters: paymentParameters,
        canPay,
        paypal,
        paypalCredit
    } = usePayment({
        amount: model.amount,
        currency: model.currency,
        onPay(params) {
            return withLoading(handlePayPal(params));
        }
    });

    const errors = useMemo<SignupErros>(() => {
        return {
            username: !model.username ? c('Signup error').t`This field is required` : usernameError,
            email: model.email
                ? isEmail(model.email)
                    ? ''
                    : c('Signup error').t`Email address invalid`
                : c('Signup error').t`This field is required`,
            password: model.password ? '' : c('Signup error').t`This field is required`,
            confirmPassword: model.confirmPassword
                ? model.password !== model.confirmPassword
                    ? c('Signup error').t`Password do not match`
                    : ''
                : c('Signup error').t`This field is required`,
            recoveryEmail: model.recoveryEmail
                ? isEmail(model.recoveryEmail)
                    ? ''
                    : c('Signup error').t`Email address invalid`
                : c('Signup error').t`This field is required`,
            recoveryPhone: model.recoveryPhone ? '' : c('Signup error').t`This field is required`,
            verificationCode: model.verificationCode ? '' : c('Signup error').t`This field is required`
        };
    }, [
        usernameError,
        model.username,
        model.email,
        model.password,
        model.confirmPassword,
        model.recoveryEmail,
        model.recoveryPhone,
        model.verificationCode
    ]);

    const goToStep = (step: string) => updateModel({ ...model, step });
    const handleBack = () => {
        let backStep;
        switch (model.step) {
            case ACCOUNT_CREATION_USERNAME:
            case ACCOUNT_CREATION_EMAIL:
                history.goBack();
                break;
            case RECOVERY_EMAIL:
            case RECOVERY_PHONE:
                backStep = ACCOUNT_CREATION_USERNAME;
                break;
            case VERIFICATION_CODE:
                backStep = ACCOUNT_CREATION_EMAIL;
                break;
            case PLANS:
                if (model.username && model.recoveryEmail) {
                    backStep = RECOVERY_EMAIL;
                } else if (model.username && model.recoveryPhone) {
                    backStep = RECOVERY_PHONE;
                } else if (model.email) {
                    backStep = VERIFICATION_CODE;
                }
                break;
            case HUMAN_VERIFICATION:
            case PAYMENT:
                backStep = PLANS;
                break;
        }
        if (backStep) {
            goToStep(backStep);
        }
    };

    const humanApi = <T,>(config: any): Promise<T> => humanApiHelper(config, { api, createModal, model, updateModel });

    const handleSubmit = async (data?: FormEvent<HTMLFormElement>) => {
        if (data) {
            data.preventDefault();
        }

        if (model.step === ACCOUNT_CREATION_USERNAME) {
            try {
                await humanApi(queryCheckUsernameAvailability(model.username));
                goToStep(RECOVERY_EMAIL);
            } catch (error) {
                setUsernameError(error.data ? error.data.Error : c('Error').t`Can't check username, try again later`);
            }
            return;
        }

        if (model.step === ACCOUNT_CREATION_EMAIL) {
            await humanApi(queryVerificationCode('email', { Address: model.email }));
            goToStep(VERIFICATION_CODE);
            return;
        }

        if (model.step === RECOVERY_EMAIL) {
            if (hasPaidPlan) {
                goToStep(PAYMENT);
                return;
            }
            goToStep(PLANS);
            return;
        }

        if (model.step === RECOVERY_PHONE) {
            if (hasPaidPlan) {
                goToStep(PAYMENT);
                return;
            }
            goToStep(PLANS);
            return;
        }

        if (model.step === VERIFICATION_CODE) {
            const verificationToken = `${model.email}:${model.verificationCode}`;
            const verificationTokenType = TOKEN_TYPES.EMAIL;
            await humanApi(queryCheckVerificationCode(verificationToken, verificationTokenType, CLIENT_TYPE));
            if (hasPaidPlan) {
                updateModel({
                    ...model,
                    step: PAYMENT,
                    verificationToken,
                    verificationTokenType
                });
                return;
            }
            updateModel({
                ...model,
                step: PLANS,
                verificationToken,
                verificationTokenType
            });
            return;
        }

        if (model.step === PLANS || model.step === HUMAN_VERIFICATION || model.step === PAYMENT) {
            if (hasPaidPlan && !model.paymentToken) {
                goToStep(PAYMENT);
                return;
            }
            if (hasPaidPlan) {
                const { Payment } = await handlePaymentToken({
                    params: {
                        ...paymentParameters,
                        Amount: model.amount,
                        Currency: model.currency
                    },
                    api,
                    createModal,
                    mode: ''
                });
                updateModel({
                    ...model,
                    paymentToken: Payment ? Payment.Details.Token : '',
                    paymentTokenType: TOKEN_TYPES.PAYMENT
                });
            }
            if (model.username) {
                try {
                    await srpVerify({
                        api: humanApi,
                        credentials: { password: model.password },
                        config: {
                            ...queryCreateUser({
                                Token: model.paymentToken,
                                TokenType: model.paymentTokenType,
                                Type: CLIENT_TYPE,
                                Email: model.recoveryEmail,
                                Username: model.username
                            }),
                            silence: [API_CUSTOM_ERROR_CODES.HUMAN_VERIFICATION_REQUIRED],
                            noHandling: [API_CUSTOM_ERROR_CODES.HUMAN_VERIFICATION_REQUIRED]
                        }
                    });
                } catch (error) {
                    const { data: { Code, Details } = { Code: 0, Details: {} } } = error;
                    const { HumanVerificationMethods = [], HumanVerificationToken = '' } = Details;

                    if (Code === API_CUSTOM_ERROR_CODES.HUMAN_VERIFICATION_REQUIRED) {
                        updateModel({
                            ...model,
                            humanVerificationMethods: HumanVerificationMethods,
                            humanVerificationToken: HumanVerificationToken,
                            step: HUMAN_VERIFICATION
                        });
                        return;
                    }

                    throw error;
                }
            } else if (model.email) {
                await srpVerify({
                    api,
                    credentials: { password: model.password },
                    config: queryCreateUserExternal({
                        Token: model.paymentToken,
                        TokenType: model.paymentTokenType,
                        Type: CLIENT_TYPE,
                        Email: model.email
                    })
                });
            }
            const { UID, EventID, AccessToken, RefreshToken } = await srpAuth({
                api,
                credentials: { username: model.username, password: model.password },
                config: auth({ Username: model.username })
            });
            if (hasPaidPlan) {
                await api(
                    withAuthHeaders(
                        UID,
                        AccessToken,
                        subscribe({
                            PlanIDs: model.planIDs,
                            Amount: 0, // Paid before subscription
                            Currency: model.currency,
                            Cycle: model.cycle
                            // TODO add coupon code
                        })
                    )
                );
            }
            await api(setCookies({ UID, AccessToken, RefreshToken, State: getRandomString(24) }));
            await onLogin({ UID, EventID });

            if (model.username) {
                // Address create
                const [domain = ''] = model.domains;
                await api(
                    setupAddress({
                        Domain: domain,
                        DisplayName: model.username,
                        Signature: ''
                    })
                );
            }

            // Generate keys
            // const emailAddress = model.username ? `${model.username}@${domain}` : model.email;
            // const { passphrase, salt } = await generateKeySaltAndPassphrase(model.password);
            // const newAddressesKeys = await getResetAddressesKeys({ addresses: [emailAddress], passphrase });
            // const [primaryAddress] = newAddressesKeys;
            // await api(
            //     setupKeys({
            //         KeySalt: salt,
            //         PrimaryKey: primaryAddress.PrivateKey,
            //         AddressKeys: newAddressesKeys
            //     })
            // );
            await api(setupKeys());
            return;
        }
    };

    const handleResend = async () => {
        await api(queryVerificationCode('email', { Address: model.email }));
    };

    const fetchDependencies = async () => {
        try {
            const { Direct, VerifyMethods: verifyMethods } = await api(queryDirectSignupStatus(CLIENT_TYPE));

            if (!Direct) {
                // We block the signup from API demand
                throw new Error('No signup');
            }

            const { Domains: domains } = await api(queryAvailableDomains());
            updateModel({ ...model, step: ACCOUNT_CREATION_USERNAME, verifyMethods, domains });
        } catch (error) {
            return goToStep(NO_SIGNUP);
        }
    };

    const checkPlans = async () => {
        const checkResult = (await humanApi(
            checkSubscription({
                PlanIDs: model.planIDs,
                Currency: model.currency,
                Cycle: model.cycle
                // CouponCode: model.couponCode
            })
        )) as SubscriptionCheckResult;
        updateModel({
            ...model,
            checkResult
        });
    };

    useEffect(() => {
        withLoading(fetchDependencies());
    }, []);

    useEffect(() => {
        // Remove error once username change
        if (usernameError) {
            setUsernameError('');
        }
    }, [model.username]);

    useEffect(() => {
        // Pre-select plan
        if (Array.isArray(plans) && preSelectedPlan) {
            const plan = plans.find(({ Name }: SignupPlan) => Name === preSelectedPlan);
            if (plan) {
                const planIDs = { [plan.ID]: 1 };
                updateModel({ ...model, planIDs });
            }
        }
    }, [plans]);

    useEffect(() => {
        // Each time cycle change, we need to change the total amount
        if (hasPaidPlan) {
            const [[planID]] = Object.entries(model.planIDs);
            const plan = plans.find(({ ID }: SignupPlan) => ID === planID);

            if (plan) {
                updateModel({
                    ...model,
                    amount: plan.Pricing[model.cycle]
                });
            }
        }
    }, [model.cycle]);

    useEffect(() => {
        if (model.amount) {
            withLoading(checkPlans());
        }
    }, [model.amount]);

    return (
        <SignupLayout model={model} onBack={handleBack} aside={<SignupAside model={model} errors={errors} />}>
            {model.step === NO_SIGNUP && 'TODO'}
            {model.step === ACCOUNT_CREATION_USERNAME && (
                <SignupAccountForm
                    model={model}
                    errors={errors}
                    onChange={updateModel}
                    onSubmit={(e) => withLoading(handleSubmit(e))}
                    loading={loading}
                />
            )}
            {model.step === ACCOUNT_CREATION_EMAIL && (
                <SignupAccountForm
                    model={model}
                    errors={errors}
                    onChange={updateModel}
                    onSubmit={(e) => withLoading(handleSubmit(e))}
                    loading={loading}
                />
            )}
            {model.step === RECOVERY_EMAIL && (
                <SignupRecoveryForm
                    model={model}
                    errors={errors}
                    onChange={updateModel}
                    onSubmit={(e) => withLoading(handleSubmit(e))}
                    loading={loading}
                />
            )}
            {model.step === RECOVERY_PHONE && (
                <SignupRecoveryForm
                    model={model}
                    errors={errors}
                    onChange={updateModel}
                    onSubmit={(e) => withLoading(handleSubmit(e))}
                    loading={loading}
                />
            )}
            {model.step === VERIFICATION_CODE && (
                <SignupVerificationCodeForm
                    model={model}
                    errors={errors}
                    onChange={updateModel}
                    onSubmit={(e) => withLoading(handleSubmit(e))}
                    onResend={() => withLoading(handleResend())}
                    loading={loading}
                />
            )}
            {model.step === PLANS && (
                <SignupPlans
                    plans={plans}
                    model={model}
                    onChange={updateModel}
                    onSubmit={() => withLoading(handleSubmit())}
                    loading={loading || loadingPlans}
                />
            )}
            {model.step === PAYMENT && (
                <SignupPayment
                    paypal={paypal}
                    paypalCredit={paypalCredit}
                    model={model}
                    onChange={updateModel}
                    card={card}
                    onCardChange={setCard}
                    method={method}
                    onMethodChange={setMethod}
                    errors={paymentErrors}
                    canPay={canPay}
                    plans={plans}
                    loading={loading}
                />
            )}
            {model.step === HUMAN_VERIFICATION && (
                <SignupHumanVerification model={model} onChange={updateModel} onSubmit={handleSubmit} />
            )}
        </SignupLayout>
    );
};

export default SignupContainer;
