import { useEffect, useState } from 'react';

import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdjust, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from 'providers/AppProvider';

const ThemeDropdown = () => {
  const {
    config: { theme },
    setConfig
  } = useAppContext(); // import AppContext from 'src/context/Context.js'

  const [iconLight, setIconLight] = useState(false);
  const [iconDark, setIconDark] = useState(false);
  const [iconAuto, setIconAuto] = useState(false);

  useEffect(() => {
    theme === 'light' ? setIconLight(true) : setIconLight(false);
    theme === 'dark' ? setIconDark(true) : setIconDark(false);
    theme === 'auto' ? setIconAuto(true) : setIconAuto(false);
  }, [theme]);

  return (
    <Dropdown className="theme-control-dropdown">
      <Dropdown.Toggle
        variant="phoenix-secondary"
        size="sm"
        style={{
          minWidth: '40px'
        }}
        className="dropdown-caret-none"
      >
        <FontAwesomeIcon
          id="iconLight"
          className={iconLight !== true ? 'd-none' : 'd-inline'}
          icon={faSun}
        />
        <FontAwesomeIcon
          id="iconDark"
          className={iconDark !== true ? 'd-none' : 'd-inline'}
          icon={faMoon}
        />
        <FontAwesomeIcon
          id="iconAuto"
          className={iconAuto !== true ? 'd-none' : 'd-inline'}
          icon={faAdjust}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="dropdown-caret border border-translucent py-0 mt-2"
        aria-labelledby="themeSwitchDropdown"
      >
        <div className="rounded-2 py-2">
          <Dropdown.Item
            onClick={() => setConfig({ theme: 'light' })}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faSun} />
            light
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => setConfig({ theme: 'dark' })}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faMoon} />
            Dark
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => setConfig({ theme: 'auto' })}
            className="d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faAdjust} />
            Auto
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeDropdown;
