import { Modal, ModalBody, ModalHeader, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useState } from 'react';
import '../../../styles/login-modal.css';

interface RegisterModalProps {
  isOpen: boolean;
  toggle: () => void;
  switchToLogin: () => void;
}

const RegisterModal = ({ isOpen, toggle, switchToLogin }: RegisterModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Save to localStorage (in real app, call API)
    interface UserData {
      email: string;
      password: string;
      phone?: string;
    }
    const users: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      alert('Email đã được sử dụng!');
      return;
    }

    users.push({ email, password, phone });
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    
    // Reset form and switch to login
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    toggle();
    switchToLogin();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="login-modal">
      <ModalHeader toggle={toggle}>Đăng ký tài khoản</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleRegister}>
          <FormGroup>
            <Label for="email">Email *</Label>
            <Input
              type="email"
              id="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="phone">Số điện thoại</Label>
            <Input
              type="tel"
              id="phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="password">Mật khẩu *</Label>
            <Input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Xác nhận mật khẩu *</Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormGroup>
          <Button color="primary" type="submit" className="w-100">
            Đăng ký
          </Button>
          <div className="text-center mt-3">
            <span>Đã có tài khoản? </span>
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                toggle(); 
                switchToLogin(); 
              }}
              style={{ color: '#df2020', fontWeight: '600' }}
            >
              Đăng nhập ngay
            </a>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default RegisterModal;
