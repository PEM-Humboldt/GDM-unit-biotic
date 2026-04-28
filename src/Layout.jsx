/** eslint verified */
import React from 'react';
import PropTypes from 'prop-types';

import Footer from './Footer';
import Header from './Header';

const Layout = ({
  activeArea,
  activateHome,
  activateIndicators,
  activateSummary,
  children,
}) => {
  const className = !activateHome ? 'bgimghome' : '';
  return (
    <div className={className}>
      <Header
        activeArea={activeArea}
        activateHome={activateHome}
        activateIndicators={activateIndicators}
        activateSummary={activateSummary}
      />
      {children}
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.any,
  activeArea: PropTypes.object,
  activateHome: PropTypes.bool,
  activateIndicators: PropTypes.bool,
  activateSummary: PropTypes.bool,
};

Layout.defaultProps = {
  children: null,
  activeArea: {},
  activateHome: false,
  activateIndicators: false,
  activateSummary: false,
};

export default Layout;
