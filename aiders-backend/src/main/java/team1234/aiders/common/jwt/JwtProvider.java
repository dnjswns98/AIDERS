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
}

