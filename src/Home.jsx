/** eslint verified */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import Layout from './Layout';
import RestAPI from './commons/RestAPI';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedElement: null,
      toggledBar: null,
    };
  }

  async componentDidMount() {
    try {
      const areasResponse = await RestAPI.requestANHAreas();
      this.setState({
        toggledBar: false,
        data: areasResponse.map((element) => ({
          name: element.name,
          label: element.name,
        })).sort((a, b) => a.name > b.name),
      });
    } catch (error) {
      // TODO: Set state in a error (handling error)
    }
  }

  handleChange = (selectedElement) => {
    this.setState({
      selectedElement,
    });
  };

  showSideBar = () => {
    const { toggledBar } = this.state;
    this.setState({ toggledBar: !toggledBar });
  }

  hideSideBar = () => {
    const { toggledBar } = this.state;
    this.setState({ toggledBar: !toggledBar });
  }

  render() {
    const {
      selectedElement, toggledBar, data,
    } = this.state;
    const { sedimentaryList, setActiveArea } = this.props;
    const isToggled = toggledBar;
    return (
      <Layout
        activateHome={false}
        activeArea={null}
      >
        <section className="sectionhome">
          <div className="mancha" />
          <div className="columna">
            <h1>Cartografía e indicadores de prefactibilidad y monitoreo</h1>
            <div className="line" />
            <p>
              MiÁrea, es el módulo de consulta para la información socio-ambiental de las áreas de interés a asignar y definidas por la Agencia Nacional de Hidrocarburos (ANH) a través del mapa de tierras (https://geovisor.anh.gov.co/tierras/).
            </p>
          </div>
          <form action="" key="45">
            <p>
              Busca tu área de interés con su
              <b> identificador único. </b>
              El buscador muestra opciones desde tres caracteres de coincidencia.
            </p>
            <Select
              className="home_selector"
              value={selectedElement}
              onChange={this.handleChange}
              options={data}
              placeholder="Busca tu área"
              isSearchable="true"
              isClearable="true"
            />
            <div className="formbtns">
              <button
                id="sideBarOpen"
                type="button"
                className={isToggled ? 'sidebtn' : 'sidebtnact'}
                onClick={isToggled ? this.hideSideBar : this.showSideBar}
              >
                cuencas sedimentarias
              </button>
              <Link to={`/summary/${selectedElement ? selectedElement.name : ''}`}>
                <input
                  type="submit"
                  key="1-o"
                  value="ir a mi área"
                  onClick={() => setActiveArea(selectedElement ? selectedElement.name : null)}
                />
              </Link>
            </div>
          </form>
        </section>
        <div className={`sideguide ${isToggled ? 'vis' : ''}`}>
          <button
            id="sideBarClose"
            type="button"
            className="close"
            onClick={this.hideSideBar}
          >
            X
          </button>
          <h1>
            Abreviaturas de cuencas sedimentarias
          </h1>
          <div className="line" />
          <div className="col1">
            {sedimentaryList.map((item) => (
              <span key={item.code}>
                {item.code}
                <br />
              </span>
            ))}
          </div>
          <div className="col2">
            {sedimentaryList.map((item) => (
              <span key={item.name}>
                {item.name}
                <br />
              </span>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
}

Home.propTypes = {
  setActiveArea: PropTypes.func,
  sedimentaryList: PropTypes.array,
};

Home.defaultProps = {
  setActiveArea: () => {},
  sedimentaryList: [],
};

export default Home;
