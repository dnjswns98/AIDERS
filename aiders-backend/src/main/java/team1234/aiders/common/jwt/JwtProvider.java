package team1234.aiders.common.jwt;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtProvider {

    private final long EXPIRE_SECONDS = 60 * 60 * 1000; // 1시간

    @Value("${spring.jwt.secret}")
    private String SECRET_KEY;

    private SecretKey key;

    @PostConstruct
    public void generateKey() {
        this.key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(JwtUserDto user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRE_SECONDS);

        return Jwts.builder()
                .setSubject(String.valueOf(user.getUserId()))
                .claim("userKey", user.getUserKey())
                .claim("role", user.getRole())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(JwtUserDto user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7일

        return Jwts.builder()
                .setSubject(String.valueOf(user.getUserId()))
                .claim("userKey", user.getUserKey())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }


    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // 토큰이 유효하지 않음
            return false;
        }
    }

    public String getUserKeyFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userKey", String.class);
    }


    public Long getUserIdFromToken(String token) {
        return Long.parseLong(
                Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody().getSubject());
    }

    // 1. 임시(비밀번호 재설정) 토큰 발급
    public String generatePasswordResetToken(String userKey) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 10 * 60 * 1000); // 10분
        return Jwts.builder()
                .setSubject("PASSWORD_RESET")
                .claim("userKey", userKey)
                .claim("tokenType", "PASSWORD_RESET")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. userKey 추출 + 타입 검증
    public String getUserKeyFromPasswordResetToken(String token) {
        var claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        String tokenType = claims.get("tokenType", String.class);
        if (!"PASSWORD_RESET".equals(tokenType)) {
            throw new IllegalArgumentException("비밀번호 재설정 토큰이 아닙니다.");
        }
        return claims.get("userKey", String.class);
    }

    // 3. 토큰 타입 검증 메서드 (선택)
    public boolean isPasswordResetToken(String token) {
        try {
            var claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return "PASSWORD_RESET".equals(claims.get("tokenType", String.class));
        } catch (Exception e) {
            return false;
        }
    }
}

