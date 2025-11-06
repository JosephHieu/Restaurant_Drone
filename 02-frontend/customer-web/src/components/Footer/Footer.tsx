import { ListGroup } from "reactstrap";

import logo from "../../assets/images/res-logo.png";
import "../../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__logo">
        <img src={logo} alt="logo" />
        <h5>FastFood</h5>
        <p>Đồ ăn nhanh, giao hàng siêu tốc</p>
      </div>
      <div>
        <h5 className="footer__title mb-3">Delivery Time</h5>
        <ListGroup>
          <div className="delivery__time-item border-0 ps-0">
            <span>Mỗi ngày</span>
            <p>10:00am - 11:00pm</p>
          </div>
        </ListGroup>
      </div>
    </footer>
  );
};

export default Footer;
