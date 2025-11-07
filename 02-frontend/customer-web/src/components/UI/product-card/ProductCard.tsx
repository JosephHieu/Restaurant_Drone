import "../../../styles/product-card.css";

import { useDispatch } from "react-redux";
import { cartActions } from "../../../store/shopping-cart/cartSlice";

import { Link } from "react-router-dom";
import { formatVND } from "../../../utils/currencyUtils";

interface ExtraIngredient {
  id: string;
  name: string;
  price: number;
}

interface ProductCardProps {
  item: {
    id: string;
    title: string;
    image01: string;
    price: number;
    extraIngredients?: ExtraIngredient[];
  };
}

const ProductCard = (props: ProductCardProps) => {
  const { id, title, image01, price, extraIngredients = [] } = props.item;
  const dispatch = useDispatch();

  const addToCart = () => {
    dispatch(
      cartActions.addItem({
        id,
        title,
        image01,
        price,
        extraIngredients
      })
    );
  };

  return (
    <div className="product__item d-flex flex-column justify-content-between">
      <div className="product__content">
        <img className="product__img w-50" src={image01} alt="Pizza" />
        <h5>
          <Link to={`/pizzas/${id}`}>{title}</Link>
        </h5>
      </div>
      <div className="d-flex flex-column align-items-center justify-content-between">
        <span className="product__price mb-2">{formatVND(price)}</span>
        <button className="addTOCART__btn" onClick={addToCart}>
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductCard;