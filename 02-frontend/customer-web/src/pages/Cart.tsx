import CommonSection from "../components/UI/common-section/CommonSection";
import Helmet from "../components/Helmet/Helmet";
import "../styles/cart-page.css";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import { cartActions } from "../store/shopping-cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { formatVND } from "../utils/currencyUtils";

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

const Cart = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);

  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  return (
    <Helmet title="Giỏ hàng">
      <CommonSection title="Giỏ hàng của bạn" />
      <section>
        <Container>
          <Row>
            <Col lg="12">
              {cartItems.length === 0 ? (
                <h5 className="text-center">Giỏ hàng trống</h5>
              ) : (
                <>
                  <h5 className="mb-5">Tóm tắt đơn hàng</h5>
                  <table className="table table-borderless mb-5 align-middle">
                    <tbody>
                      {cartItems.map((item) => (
                        <Tr item={item} key={item.id} />
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div className="mt-4">
                <h6>
                  Tổng tiền: 
                  <span className="cart__subtotal"> {formatVND(totalAmount)}</span>
                </h6>
                <p>Thuế và phí vận chuyển sẽ được tính khi thanh toán</p>
                <div className="cart__page-btn">
                  <button className="addTOCart__btn me-4">
                    <Link to="/products">Tiếp tục mua hàng</Link>
                  </button>
                  <button className="addTOCart__btn" onClick={handleCheckout}>
                    Tiến hành thanh toán
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

interface TrProps {
  item: CartItem;
}

const Tr = (props: TrProps) => {
  const { id, image01, title, price, quantity } = props.item;
  const dispatch = useDispatch();

  const deleteItem = () => {
    dispatch(cartActions.deleteItem(id));
  };
  
  return (
    <tr>
      <td className="text-center cart__img-box">
        <img src={image01} alt="" />
      </td>
      <td className="text-center">{title}</td>
      <td className="text-center">{formatVND(price)}</td>
      <td className="text-center">{quantity} món</td>
      <td className="text-center cart__item-del">
        <i className="ri-delete-bin-line" onClick={deleteItem}></i>
      </td>
    </tr>
  );
};

export default Cart;
