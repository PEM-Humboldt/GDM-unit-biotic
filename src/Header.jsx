/** eslint verified */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Images to import
import backIcon from './assets/img/back.png';
import homeIcon from './assets/img/home.png';

const Header = ({
  activeArea, activateHome, activateSummary, activateIndicators,
}) => (
  <header>
    <Link to="/">
      <h3>
        <b>mi</b>
        área
      </h3>
    </Link>
    {activeArea && (
    <nav>
      <h2>
        {activeArea.name}
      </h2>
      <h4>
        {activeArea.sedimentary_name}
        <br />
        <b>
          {activeArea.description}
        </b>
      </h4>
      <div className="navbtns">
        {activateSummary
          && (
            <Link to={`/summary/${activeArea.name}`}>
              <img
                src={backIcon}
                alt="Visor de Mi Bloque"
              />
            </Link>
          )}
        {activateIndicators
          && (
            <Link to={`/indicatorsDash/${activeArea.name}`}>
              <img
                src={backIcon}
                alt="Volver a Indicadores"
              />
            </Link>
          )}
        {activateHome
          && (
            <Link to="/">
              <img
                src={homeIcon}
                alt="Volver al inicio"
              />
            </Link>
          )}
      </div>
    </nav>
    )}
  </header>
);

Header.propTypes = {
  activeArea: PropTypes.object,
  activateHome: PropTypes.bool,
  activateIndicators: PropTypes.bool,
  activateSummary: PropTypes.bool,
};

Header.defaultProps = {
  activeArea: {},
  activateHome: false,
  activateIndicators: false,
  activateSummary: false,
};

export default Header;
