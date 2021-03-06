import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Select, generateUID } from 'react-components';
import { range } from 'proton-shared/lib/helpers/array';
import { identity } from 'proton-shared/lib/helpers/function';
import { c } from 'ttag';

const SubscriptionAddonRow = ({
    label,
    price,
    format = identity,
    start = 0,
    min = 0,
    max = 999,
    quantity = 0,
    onChange,
    step = 1,
    loading = false
}) => {
    const [idRef] = useState(() => generateUID('subscription-addon-row'));
    const options = range(min, max).map((quantity) => ({
        text: format(start + quantity * step),
        value: quantity
    }));

    return (
        <div className="flex flex-nowrap flex-spacebetween flex-items-center ontablet-w100 mb1">
            <label htmlFor={idRef} className="w10e onmobile-w25 pr1">
                {label}
            </label>
            <div className="flex flex-nowrap w16e ontinymobile-wauto">
                <div className="notinymobile">
                    <Button
                        className="flex-item-noshrink w100"
                        onClick={() => onChange(quantity - 1)}
                        disabled={loading || quantity === min}
                        icon="minus"
                    >
                        <span className="sr-only">{c('Action').t`Decrease`}</span>
                    </Button>
                </div>
                <div className="w10e ontinymobile-wauto pl0-5 pr0-5">
                    <Select
                        disabled={loading}
                        className="w100"
                        id={idRef}
                        options={options}
                        onChange={({ target }) => onChange(+target.value)}
                        value={quantity}
                    />
                </div>
                <div className="notinymobile">
                    <Button
                        className="flex-item-noshrink w100"
                        onClick={() => onChange(quantity + 1)}
                        disabled={loading || quantity === max - 1}
                        icon="plus"
                    >
                        <span className="sr-only">{c('Action').t`Increase`}</span>
                    </Button>
                </div>
            </div>
            <div className="w8e ontablet-w25 big mb0 mt0 alignright">
                {quantity ? (
                    price
                ) : (
                    <span className="subscriptionPlan-customize-included">{c('Info').t`Included`}</span>
                )}
            </div>
        </div>
    );
};

SubscriptionAddonRow.propTypes = {
    loading: PropTypes.bool,
    label: PropTypes.node.isRequired,
    price: PropTypes.node.isRequired,
    start: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    quantity: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    format: PropTypes.func
};

export default SubscriptionAddonRow;
