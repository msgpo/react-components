import React from 'react';
import { c } from 'ttag';
import PropTypes from 'prop-types';
import { Label, Block, Input, Select } from 'react-components';

import { getFullList } from '../../helpers/countries';
import ExpInput from './ExpInput';
import CardNumberInput from './CardNumberInput';

const Card = ({ card, errors, onChange, loading = false }) => {
    const countries = getFullList().map(({ value, label: text, disabled }) => ({ value, text, disabled }));
    const handleChange = (key) => ({ target }) => onChange(key, target.value);

    return (
        <>
            <Block>
                <Label className="mb0-5 bl" htmlFor="ccname">{c('Label').t`Name on card`}</Label>
                <Input
                    autoComplete="cc-name"
                    id="ccname"
                    name="ccname"
                    value={card.fullname}
                    onChange={handleChange('fullname')}
                    placeholder="Thomas Anderson"
                    error={errors.fullname}
                    disabled={loading}
                    required
                />
            </Block>
            <Block>
                <Label className="mb0-5 bl" htmlFor="ccnumber">{c('Label').t`Card number`}</Label>
                <CardNumberInput
                    id="ccnumber"
                    value={card.number}
                    onChange={(value) => onChange('number', value)}
                    error={errors.number}
                    disabled={loading}
                    required
                />
            </Block>
            <div className="flex-autogrid">
                <div className="flex-autogrid-item ">
                    <Label className="mb0-5 bl" htmlFor="exp">{c('Label').t`Expiry date`}</Label>
                    <ExpInput
                         id="exp"
                         month={card.month}
                        year={card.year}
                        error={errors.month}
                        disabled={loading}
                        onChange={({ month, year }) => {
                            onChange('month', month);
                            onChange('year', year);
                        }}
                        required
                    />
                </div>
                <div className="flex-autogrid-item">
                    <Label className="mb0-5 bl" htmlFor="cvc">{c('Label').t`Security code`}</Label>
                    <Input
                        autoComplete="cc-csc"
                        id="cvc"
                        name="cvc"
                        value={card.cvc}
                        onChange={handleChange('cvc')}
                        placeholder="000"
                        error={errors.cvc}
                        disabled={loading}
                        required
                    />
                </div>
            </div>
            <div className="flex-autogrid">
                <div className="flex-autogrid-item">
                    <Label className="mb0-5 bl" htmlFor="country">{c('Label').t`Country`}</Label>
                    <Select
                        id="country"
                        value={card.country}
                        onChange={handleChange('country')}
                        options={countries}
                        disabled={loading}
                        autoComplete="country"
                        title={c('Label').t`Select your country`}
                    />
                </div>
                <div className="flex-autogrid-item">
                    <Label className="mb0-5 bl" htmlFor="postalcode">
                        {card.country === 'US' ? c('Label').t`ZIP` : c('Label').t`Postal code`}
                    </Label>
                    <Input
                        id="postalcode"
                        autoComplete="postal-code"
                        value={card.zip}
                        onChange={handleChange('zip')}
                        placeholder={card.country === 'US' ? c('Placeholder').t`ZIP` : c('Placeholder').t`Postal code`}
                        title={c('Title').t`ZIP / postal code`}
                        error={errors.zip}
                        disabled={loading}
                        minLength={3}
                        maxLength={9}
                        required
                    />
                </div>
            </div>
        </>
    );
};

Card.propTypes = {
    loading: PropTypes.bool,
    card: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Card;
