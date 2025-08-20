package team1234.aiders.application.dispatch.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.dispatch.dto.DispatchHistoryResponseDto;
import team1234.aiders.application.dispatch.dto.DispatchRequestDto;
import team1234.aiders.application.dispatch.service.DispatchService;
import team1234.aiders.config.security.CustomUserDetails;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dispatch")
public class DispatchController {

    private final DispatchService dispatchService;

    @PostMapping("/")
    public ResponseEntity<Void> dispatch(@RequestBody DispatchRequestDto request,
                                         @AuthenticationPrincipal CustomUserDetails user) {
        dispatchService.createDispatch(request, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<DispatchHistoryResponseDto>> getDispatchHistory(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<DispatchHistoryResponseDto> response = dispatchService.getDispatchHistories(user);
        return ResponseEntity.ok(response);
    }
}
