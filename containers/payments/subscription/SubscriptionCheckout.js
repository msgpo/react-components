import React from 'react';
import PropTypes from 'prop-types';
import { c, msgid } from 'ttag';
import { CurrencySelector, CycleSelector, Price, useConfig, classnames, Info } from 'react-components';
import { toMap } from 'proton-shared/lib/helpers/object';
import { orderBy } from 'proton-shared/lib/helpers/array';
import { hasBit } from 'proton-shared/lib/helpers/bitset';
import { CLIENT_TYPES, PLAN_SERVICES, PLAN_TYPES, CYCLE, PLANS, ADDON_NAMES } from 'proton-shared/lib/constants';
import humanSize from 'proton-shared/lib/helpers/humanSize';

import { getSubTotal } from './helpers';
import CycleDiscountBadge from '../CycleDiscountBadge';
import DiscountBadge from '../DiscountBadge';

const CheckoutRow = ({ title, amount = 0, currency, className = '' }) => {
    return (
        <div className={classnames(['flex flex-nowrap flex-spacebetween mb0-5', className])}>
            <div className="pr0-5">{title}</div>
            <Price className={amount < 0 ? 'color-global-success' : ''} currency={currency}>
                {amount}
            </Price>
        </div>
    );
};

CheckoutRow.propTypes = {
    className: PropTypes.string,
    title: PropTypes.node.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired
};

const SubscriptionCheckout = ({ submit = c('Action').t`Pay`, plans = [], model, setModel, checkResult, loading }) => {
    const plansMap = toMap(plans);
    const storageAddon = plans.find(({ Name }) => Name === ADDON_NAMES.SPACE);
    const addressAddon = plans.find(({ Name }) => Name === ADDON_NAMES.ADDRESS);
    const domainAddon = plans.find(({ Name }) => Name === ADDON_NAMES.DOMAIN);
    const memberAddon = plans.find(({ Name }) => Name === ADDON_NAMES.MEMBER);
    const vpnAddon = plans.find(({ Name }) => Name === ADDON_NAMES.VPN);
    const { CLIENT_TYPE } = useConfig();
    const subTotal =
        getSubTotal({
            cycle: model.cycle,
            plans,
            plansMap: Object.entries(model.planIDs).reduce((acc, [planID, quantity]) => {
                const { Name } = plansMap[planID];
                acc[Name] = quantity;
                return acc;
            }, {})
        }) / model.cycle;
    const total = checkResult.Amount + checkResult.CouponDiscount;
    const monthlyTotal = total / model.cycle;
    const discount = monthlyTotal - subTotal;
    const collection = orderBy(
        Object.entries(model.planIDs).map(([planID, quantity]) => ({ ...plansMap[planID], quantity })),
        'Type'
    ).reverse(); // We need to reverse because: plan type = 1, addon type = 0
    const hasMailPlan = collection.some(
        ({ Type, Services }) => Type === PLAN_TYPES.PLAN && hasBit(Services, PLAN_SERVICES.MAIL)
    );
    const hasVpnPlan = collection.some(
        ({ Type, Services }) => Type === PLAN_TYPES.PLAN && hasBit(Services, PLAN_SERVICES.VPN)
    );
    const hasVisionary = collection.some(({ Name }) => Name === PLANS.VISIONARY);

    const getTitle = (planName, quantity) => {
        const addresses = quantity * addressAddon.MaxAddresses;
        const storage = humanSize(quantity * storageAddon.MaxSpace, 'GB');
        const domains = quantity * domainAddon.MaxDomains;
        const members = quantity * memberAddon.MaxMembers;
        const vpn = quantity * vpnAddon.MaxVPN;
        return {
            [ADDON_NAMES.ADDRESS]: c('Addon').t`+ ${addresses} email addresses`,
            [ADDON_NAMES.SPACE]: c('Addon').t`+ ${storage} storage`,
            [ADDON_NAMES.DOMAIN]: c('Addon').ngettext(
                msgid`+ ${domains} custom domain`,
                `+ ${domains} custom domains`,
                domains
            ),
            [ADDON_NAMES.MEMBER]: c('Addon').ngettext(msgid`+ ${members} user`, `+ ${members} users`, members),
            [ADDON_NAMES.VPN]: c('Addon').ngettext(msgid`+ ${vpn} connection`, `+ ${vpn} connections`, vpn)
        }[planName];
    };

    const printSummary = (service = PLAN_SERVICES.MAIL) => {
        return collection
            .filter(({ Services, quantity }) => hasBit(Services, service) && quantity)
            .map(({ ID, Title, Pricing, Type, Name, quantity }) => {
                return (
                    <CheckoutRow
                        key={ID}
                        className={Type === PLAN_TYPES.PLAN ? 'bold' : ''}
                        title={
                            <>
                                <span className="mr0-5 pr0-5">
                                    {Type === PLAN_TYPES.PLAN ? Title : getTitle(Name, quantity)}
                                </span>
                                {[CYCLE.YEARLY, CYCLE.TWO_YEARS].includes(model.cycle) && (
                                    <CycleDiscountBadge cycle={model.cycle} />
                                )}
                            </>
                        }
                        amount={(quantity * Pricing[model.cycle]) / model.cycle}
                        currency={model.currency}
                    />
                );
            });
    };

    return (
        <>
            <div className="flex flex-nowrap cycle-currency-selectors mb1">
                <CycleSelector
                    className="mr1"
                    loading={loading}
                    cycle={model.cycle}
                    onSelect={(newCycle) => setModel({ ...model, cycle: newCycle })}
                />
                <CurrencySelector
                    currency={model.currency}
                    onSelect={(newCurrency) => setModel({ ...model, currency: newCurrency })}
                />
            </div>
            <div className="rounded mb1">
                <header className="small mt0 mb0 bg-global-border uppercase pl1 pr1 pt0-5 pb0-5">{c('Title')
                    .t`Plan summary`}</header>
                <div className="bg-global-highlight p1">
                    <div className="">
                        {hasMailPlan ? (
                            printSummary(PLAN_SERVICES.MAIL)
                        ) : (
                            <CheckoutRow
                                className="bold"
                                title={c('Info').t`ProtonMail Free`}
                                amount={0}
                                currency={model.currency}
                            />
                        )}
                    </div>
                    {hasVisionary ? null : (
                        <div className="border-top border-top--dashed pt0-5">
                            {hasVpnPlan ? (
                                printSummary(PLAN_SERVICES.VPN)
                            ) : (
                                <CheckoutRow
                                    className="bold"
                                    title={c('Info').t`ProtonVPN Free`}
                                    amount={0}
                                    currency={model.currency}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
            {checkResult.Amount ? (
                <div className="rounded p1 mb1 bg-global-highlight">
                    {model.coupon ? (
                        <div className="border-bottom border-bottom--dashed border-bottom--currentColor mb0-5">
                            <CheckoutRow
                                className="bigger m0"
                                title={c('Title').t`Subtotal`}
                                amount={subTotal}
                                currency={model.currency}
                            />
                            <CheckoutRow
                                title={
                                    <>
                                        <span className="mr0-5">{c('Title').t`Coupon discount`}</span>
                                        <DiscountBadge code={model.coupon} cycle={model.cycle} />
                                    </>
                                }
                                amount={discount}
                                currency={model.currency}
                                className="small mt0 mb0"
                            />
                        </div>
                    ) : null}
                    <div className="border-bottom border-bottom--dashed border-bottom--currentColor mb0-5">
                        {[CYCLE.YEARLY, CYCLE.TWO_YEARS].includes(model.cycle) ? (
                            <CheckoutRow
                                title={c('Title').t`Total (monthly)`}
                                amount={monthlyTotal}
                                currency={model.currency}
                                className="bigger mt0 mb0"
                            />
                        ) : null}
                        <CheckoutRow
                            className="bigger m0"
                            title={c('Title').t`Total`}
                            amount={total}
                            currency={model.currency}
                        />
                    </div>
                    {checkResult.Proration || checkResult.Credit || checkResult.Gift ? (
                        <div className="border-bottom border-bottom--dashed border-bottom--currentColor mb0-5">
                            {checkResult.Proration ? (
                                <CheckoutRow
                                    title={
                                        <>
                                            <span className="mr0-5">{c('Label').t`Proration`}</span>
                                            <Info
                                                url={
                                                    CLIENT_TYPE === CLIENT_TYPES.VPN
                                                        ? 'https://protonvpn.com/support/vpn-credit-proration/'
                                                        : 'https://protonmail.com/support/knowledge-base/credit-proration/'
                                                }
                                            />
                                        </>
                                    }
                                    amount={checkResult.Proration}
                                    currency={model.currency}
                                    className="small mt0 mb0"
                                />
                            ) : null}
                            {checkResult.Credit ? (
                                <CheckoutRow
                                    title={c('Title').t`Credits`}
                                    amount={checkResult.Credit}
                                    currency={model.currency}
                                    className="small mt0 mb0"
                                />
                            ) : null}
                            {checkResult.Gift ? (
                                <CheckoutRow
                                    title={c('Title').t`Gift code`}
                                    amount={checkResult.Gift}
                                    currency={model.currency}
                                    className="small mt0 mb0"
                                />
                            ) : null}
                        </div>
                    ) : null}
                    <CheckoutRow
                        title={c('Title').t`Amount due`}
                        amount={checkResult.AmountDue}
                        currency={model.currency}
                        className="bold bigger m0"
                    />
                    <div className="mt1">{submit}</div>
                </div>
            ) : null}
        </>
    );
};

SubscriptionCheckout.propTypes = {
    submit: PropTypes.node,
    plans: PropTypes.array.isRequired,
    checkResult: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    setModel: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default SubscriptionCheckout;
