import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import Icon from '../icon/Icon';
import { classnames } from '../../helpers/component';

const Checkbox = ({ id, className, checked, indeterminate, color, backgroundColor, ...rest }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
        <label htmlFor={id} className={className}>
            <input ref={inputRef} id={id} type="checkbox" className="pm-checkbox" checked={checked} {...rest} />
            <span className="pm-checkbox-fakecheck" style={{ background: backgroundColor, color }}>
                <Icon className={classnames(['pm-checkbox-fakecheck-img', color && 'fill-currentColor'])} name="on" />
            </span>
        </label>
    );
};

Checkbox.propTypes = {
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    id: PropTypes.string,
    className: PropTypes.string,
    checked: PropTypes.bool.isRequired,
    indeterminate: PropTypes.bool
};

Checkbox.defaultProps = {
    indeterminate: false
};

export default Checkbox;
