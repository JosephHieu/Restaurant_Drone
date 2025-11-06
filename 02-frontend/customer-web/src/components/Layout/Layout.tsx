import Header from "../Header/Header.tsx";
import Footer from "../Footer/Footer.tsx";
import Routes from "../../routes/Routers.tsx";
import Carts from "../UI/cart/Carts.tsx";

import { useSelector } from "react-redux";

interface RootState {
  cartUi: {
    cartIsVisible: boolean;
  };
}

const Layout = () => {
    const showCart = useSelector((state: RootState) => state.cartUi.cartIsVisible);
  return (
    <div className="d-flex flex-column vh-100 justify-content-between">
      <Header />
      {showCart && <Carts />}
      <div>
        <Routes />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
