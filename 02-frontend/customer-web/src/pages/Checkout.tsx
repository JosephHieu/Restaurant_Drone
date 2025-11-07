import { useState } from "react";
import { useSelector } from "react-redux";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import "../styles/checkout.css";
import { AiFillCheckCircle } from "react-icons/ai";
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
  user: {
    username: string;
    email: string;
    isLoggedIn: boolean;
  };
}

const Checkout = () => {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);
  const user = useSelector((state: RootState) => state.user);
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    name: user.username || '',
    email: user.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash',
    note: ''
  });

  // Giá đã là VNĐ từ Redux store
  const shippingCost = 50000; // 50,000 VND
  const finalTotal = totalAmount + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.isLoggedIn) {
      alert('Vui lòng đăng nhập để đặt hàng!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    // Validate form - đặc biệt quan trọng là địa chỉ giao hàng
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin cá nhân!');
      return;
    }

    if (!formData.address || !formData.city) {
      alert('Vui lòng chọn địa điểm giao hàng (địa chỉ và thành phố)!');
      return;
    }

    if (formData.phone.length < 10) {
      alert('Số điện thoại không hợp lệ!');
      return;
    }

    // Save order to localStorage (in real app, call API)
    const order = {
      id: Date.now().toString(),
      user: user.email,
      items: cartItems,
      shippingInfo: formData,
      subtotal: totalAmount,
  shippingCost,
      total: finalTotal,
      date: new Date().toISOString(),
      status: 'pending'
    };

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem('cartItems');
    localStorage.removeItem('totalAmount');
    localStorage.removeItem('totalQuantity');

    setOrderPlaced(true);

    // Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = '/home';
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="checkoutMessage">
        <div className="checkoutTitleContainer">
          <AiFillCheckCircle className="checkoutIcon" />
          <h3>Cảm ơn bạn đã đặt hàng!</h3>
        </div>
        <span>
          Đơn hàng của bạn đang được xử lý và sẽ được giao càng nhanh càng tốt.
        </span>
        <p className="mt-3">Đang chuyển về trang chủ...</p>
      </div>
    );
  }

  return (
    <Helmet title="Thanh toán">
      <CommonSection title="Thanh toán" />
      <section className="checkout-section">
        <Container>
          <Row>
            <Col lg="8">
              <h6 className="mb-4">Thông tin giao hàng</h6>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Họ và tên *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="email">Email *</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Nhập email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="phone">Số điện thoại *</Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                  <FormGroup>
                    <Label for="address">Địa chỉ *</Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Nhập địa chỉ"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="city">Thành phố *</Label>
                      <Input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Nhập thành phố"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="note">Ghi chú</Label>
                  <Input
                    type="textarea"
                    id="note"
                    name="note"
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      padding: '10px',
                      borderRadius: '5px',
                      position: 'relative',
                      zIndex: 555,
                      pointerEvents: 'auto'
                    }}
                  />
                </FormGroup>

                <h6 className="mb-3 mt-4">Phương thức thanh toán</h6>
                <FormGroup check className="mb-3">
                  <Input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                  />
                  <Label check for="cash">
                    Thanh toán khi nhận hàng (COD)
                  </Label>
                </FormGroup>
                <FormGroup check className="mb-3">
                  <Input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                  />
                  <Label check for="card">
                    Thanh toán online (Thẻ/Ví điện tử)
                  </Label>
                </FormGroup>

                <Button type="submit" color="danger" className="checkout-btn mt-4">
                  Đặt hàng
                </Button>
              </Form>
            </Col>

            <Col lg="4">
              <div className="checkout-summary">
                <h6 className="mb-3">Tóm tắt đơn hàng</h6>
                <div className="checkout-summary-content">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item">
                      <div className="d-flex justify-content-between">
                        <span>{item.title} x {item.quantity}</span>
                        <span>{formatVND(item.totalPrice)}</span>
                      </div>
                      {item.extraIngredients && item.extraIngredients.length > 0 && (
                        <div className="extra-ingredients">
                          <small>+ {item.extraIngredients.join(', ')}</small>
                        </div>
                      )}
                    </div>
                  ))}
                  <hr />

                  <div className="d-flex justify-content-between">
                    <span>Tạm tính:</span>
                    <span>{formatVND(totalAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatVND(shippingCost)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between total">
                    <strong>Tổng cộng:</strong>
                    <strong className="text-danger">{formatVND(finalTotal)}</strong>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Checkout;
