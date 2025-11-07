import { Modal, ModalBody, ModalHeader, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../../store/userSlice';
import '../../../styles/login-modal.css';

interface LoginModalProps {
  isOpen: boolean;
  toggle: () => void;
  switchToRegister: () => void;
}

const LoginModal = ({ isOpen, toggle, switchToRegister }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Check credentials (in real app, call API)
    interface UserData {
      email: string;
      password: string;
    }
    const users: UserData[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      alert('Email hoặc mật khẩu không đúng!');
      return;
    }

    // Dispatch login action - sử dụng email làm username
    dispatch(login({ username: user.email, email: user.email }));
    
    // Reset form and close modal
    setEmail('');
    setPassword('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="login-modal">
      <ModalHeader toggle={toggle}>Đăng nhập</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleLogin}>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="password">Mật khẩu</Label>
            <Input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <Button color="primary" type="submit" className="w-100">
            Đăng nhập
          </Button>
          <div className="text-center mt-3">
            <span>Chưa có tài khoản? </span>
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                toggle(); 
                switchToRegister(); 
              }}
              style={{ color: '#df2020', fontWeight: '600' }}
            >
              Đăng ký ngay
            </a>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default LoginModal;
