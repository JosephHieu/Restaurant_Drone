import { ListGroup } from "reactstrap";
import { Link } from "react-router-dom";
import CartItem from "./CartItem";
import { useDispatch, useSelector } from "react-redux";
import { cartUiActions } from "../../../store/shopping-cart/cartUiSlice";

import "../../../styles/shopping-cart.css";

interface CartItem {
  id: string;
  title: string;
  image01: string;
  price: number;
  quantity: number;
  totalPrice: number;
  extraIngredients: string[];
}

interface RootState {
  cart: {
    cartItems: CartItem[];
    totalQuantity: number;
    totalAmount: number;
  };
  cartUi: {
    cartIsVisible: boolean;
  };
}

const Carts = () => {
  const dispatch = useDispatch();
  const cartProducts = useSelector((state: RootState) => state.cart.cartItems);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);

  const toggleCart = () => {
    dispatch(cartUiActions.toggle());
  };
  return (
    <div className="cart__container" onClick={toggleCart}>
      <ListGroup onClick={(event) => event.stopPropagation()} className="cart">
        <div className="cart__closeButton">
          <span onClick={toggleCart}>
            <i className="ri-close-fill"></i>
          </span>
        </div>

        <div className="cart__item-list">
          {cartProducts.length === 0 ? (
            <h6 className="text-center">Chưa có sản phẩm nào trong giỏ hàng</h6>
          ) : (
            cartProducts.map((item, index) => (
              <CartItem item={item} key={index} onClose={toggleCart}/>
            ))
          )}
        </div>

        <div className="cart__bottom d-flex align-items-center justify-content-between">
          <h6>
            Tổng tiền : <span>{totalAmount} 000.VNĐ</span>
          </h6>
          <button>
            <Link to="/checkout" onClick={toggleCart}>
              Thanh toán
            </Link>
          </button>
        </div>
      </ListGroup>
    </div>
  );
};

export default Carts;