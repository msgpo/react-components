import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon, useConfig, Tooltip, Link } from 'react-components';
import { APPS } from 'proton-shared/lib/constants';
import { useUserScopes, hasScope, USER_SCOPES } from '../../hooks/useUserScopes';

const { PROTONMAIL, PROTONCONTACTS, PROTONMAIL_SETTINGS, PROTONCALENDAR, PROTONDRIVE } = APPS;

const AppsSidebar = ({ items = [] }) => {
    const { APP_NAME } = useConfig();
    const [userScopes, loadingUserScopes] = useUserScopes();

    const driveApp = {
        appNames: [PROTONDRIVE],
        icon: 'protondrive',
        title: 'ProtonDrive',
        link: '/drive'
    };
    const initialApps = [
        { appNames: [PROTONMAIL, PROTONMAIL_SETTINGS], icon: 'protonmail', title: 'ProtonMail', link: '/inbox' },
        { appNames: [PROTONCONTACTS], icon: 'protoncontacts', title: 'ProtonContacts', link: '/contacts' },
        {
            appNames: [PROTONCALENDAR],
            icon: 'protoncalendar',
            title: 'ProtonCalendar',
            link: '/calendar'
        }
    ].filter(Boolean);

    const [apps, setApps] = useState(initialApps);

    useEffect(() => {
        if (!loadingUserScopes && hasScope(userScopes, USER_SCOPES.DRIVE)) {
            setApps([...apps, driveApp].filter(Boolean));
        }
    }, [userScopes, loadingUserScopes]);

    return (
        <aside className="aside noprint nomobile" id="aside-bar">
            <ul className="unstyled m0 aligncenter flex flex-column h100">
                {apps.map(({ appNames = [], icon, title, link }, index) => {
                    const isCurrent = appNames.includes(APP_NAME);
                    const key = `${index}`;
                    return (
                        <li key={key} className="mb0-5">
                            <Tooltip title={title} originalPlacement="right">
                                <Link
                                    to={link}
                                    className="center flex aside-link"
                                    external={!isCurrent}
                                    aria-current={isCurrent}
                                >
                                    <Icon name={icon} className="aside-linkIcon mauto" />
                                </Link>
                            </Tooltip>
                        </li>
                    );
                })}
                <li className="flex-item-fluid" />
                {items.map((item, index) => (
                    <li key={`${index}`} className="mb0-5">
                        {item}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

AppsSidebar.propTypes = {
    items: PropTypes.arrayOf(PropTypes.node)
};

export default AppsSidebar;
