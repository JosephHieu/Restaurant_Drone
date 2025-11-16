package com.josephhieu.droneservice.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

// Phiên bản đơn giản, chỉ chứa thông tin lấy từ JWT
public class CustomUserDetails implements UserDetails {
    private final Integer id;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Integer id, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.authorities = authorities;
    }

    public Integer getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    // Các phương thức dưới đây không cần thiết vì ta tin tưởng token
    // (nhưng vẫn phải implement)
    @Override
    public String getPassword() { return null; }
    @Override
    public String getUsername() { return id.toString(); }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}