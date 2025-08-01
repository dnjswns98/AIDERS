package team1234.aiders.config.websocket;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import team1234.aiders.common.jwt.JwtProvider;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        // query string에서 token 추출
        String uri = request.getURI().toString();
        String token = null;
        if (uri.contains("token=")) {
            token = uri.substring(uri.indexOf("token=") + 6);
        }

        if (token != null && jwtProvider.validateToken(token)) {
            Long userId = jwtProvider.getUserIdFromToken(token);
            String userKey = jwtProvider.getUserKeyFromToken(token);
            attributes.put("userId", userId);
            attributes.put("userKey", userKey);
            return true;
        }

        return false;
    }
}
