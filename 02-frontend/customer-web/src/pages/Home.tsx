import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col } from "reactstrap";

import { Link } from "react-router-dom";

import droneImg from "../assets/images/drone.jpg"
import "../styles/hero-section.css";

const Home = () => {
  return (
    <Helmet title="Home">
      <section>
        <Container>
          <Row>
            <Col lg="6" md="6">
              <div className="hero__content">
                <h5 className="mb-3">Đặt hàng dễ dàng & Giao hàng nhanh chóng</h5>
                <h1 className="mb-4 hero__title">
                  <span>Enjoy</span> your favorite FastFood
                </h1>

                <button className="order__btn d-flex align-items-center justify-content-between ">
                  <Link to="/products">
                    Món ăn <i className="ri-arrow-right-s-line"></i>
                  </Link>
                </button>
              </div>
            </Col>

            <Col lg="6" md="6">
              <div className="hero__img">
                <img src={droneImg} alt="delivery-drone" className="w-100" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Home;
