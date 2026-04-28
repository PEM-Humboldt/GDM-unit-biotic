/** eslint verified */
import React from 'react';
import logoanh from './assets/img/Logo_ANH.png';
import logohumboldt from './assets/img/Logo_HUM.png';

const Footer = () => (
  <footer>
    <div className="logos">
      <a
        href="http://www.anh.gov.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={logoanh}
          alt="Agencia Nacional de Hidrocarburos"
        />
      </a>
      <a
        href="http://www.humboldt.org.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={logohumboldt}
          alt="Instituto Alexander von Humboldt"
        />
      </a>
    </div>
    <div className="mapasitio">
      <a href="mailto:svargas@humboldt.org.co">
        <h2>Contacto</h2>
      </a>
      <a
        href="https://geovisor.anh.gov.co/tierras/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h2>Mapa de Tierras</h2>
      </a>
    </div>
  </footer>
);

export default Footer;
