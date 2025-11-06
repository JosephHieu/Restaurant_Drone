import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home"
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/products/:id" element={<ProductDetails />} />
    </Routes>
  );
};

export default Routers;
