import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import logo from "../../assets/images/res-logo.png";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { cartUiActions } from "../../store/shopping-cart/cartUiSlice";
import { logout } from "../../store/userSlice";
import LoginModal from "../UI/modal/LoginModal";
import RegisterModal from "../UI/modal/RegisterModal";
import "../../styles/Header.css";
import "../../styles/login-modal.css";

interface RootState {
  cart: {
    totalQuantity: number;
  };
  user: {
    username: string;
    email: string;
    isLoggedIn: boolean;
  };
}

const nav__links = [
  {
    display: "Trang chủ",
    path: "/home",
  },
  {
    display: "Món ăn",
    path: "/products",
  },
  {
    display: "Giỏ hàng",
    path: "/cart",
  },
];

const Header = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const totalQuantity = useSelector((state: RootState) => state.cart.totalQuantity);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleLoginModal = () => setIsLoginModalOpen(!isLoginModalOpen);
  const toggleRegisterModal = () => setIsRegisterModalOpen(!isRegisterModalOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.classList.toggle("show__menu");
    }
  };

  const navigate = useNavigate();

  const toggleCart = () => {
    dispatch(cartUiActions.toggle());
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current?.classList.add("header__shrink");
      } else {
        headerRef.current?.classList.remove("header__shrink");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <div className="nav__wrapper d-flex align-items-center justify-content-between">
          <div className="logo" onClick={() => navigate("/home")}>
            <img src={logo} alt="logo" />
            <h5>Fast Food</h5>
          </div>
          {/* ======= menu ======= */}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <div
              className="menu d-flex align-items-center gap-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="header__closeButton">
                <span onClick={toggleMenu}>
                  <i className="ri-close-fill"></i>
                </span>
              </div>
              {nav__links.map((item, index) => (
                <NavLink
                  to={item.path}
                  key={index}
                  className={(navClass) =>
                    navClass.isActive ? "active__menu" : ""
                  }
                  onClick={toggleMenu}
                >
                  {item.display}
                </NavLink>
              ))}
            </div>
          </div>

          {/* ======== nav right icons ========= */}
          <div className="nav__right d-flex align-items-center gap-4">
            <span className="cart__icon" onClick={toggleCart}>
              <i className="ri-shopping-basket-line"></i>
              <span className="cart__badge">{totalQuantity}</span>
            </span>
            
            {user.isLoggedIn ? (
              <div className="user-dropdown">
                <div className="user-info" onClick={toggleDropdown}>
                  <i className="ri-user-line"></i>
                  <span className="user-name">{user.username}</span>
                  <i className="ri-arrow-down-s-line"></i>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu-custom">
                    <div className="dropdown-item-custom" onClick={handleLogout}>
                      <i className="ri-logout-box-line"></i>
                      <span>Đăng xuất</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="user__icon" onClick={toggleLoginModal} style={{ cursor: 'pointer' }}>
                <i className="ri-user-line"></i>
              </span>
            )}
            
            <span className="mobile__menu" onClick={toggleMenu}>
              <i className="ri-menu-line"></i>
            </span>
          </div>
        </div>
      </Container>
      
      <LoginModal isOpen={isLoginModalOpen} toggle={toggleLoginModal} switchToRegister={switchToRegister} />
      <RegisterModal isOpen={isRegisterModalOpen} toggle={toggleRegisterModal} switchToLogin={switchToLogin} />
    </header>
  );
};

export default Header;