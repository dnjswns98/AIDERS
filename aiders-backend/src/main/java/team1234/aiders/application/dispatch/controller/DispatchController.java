package team1234.aiders.application.dispatch.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team1234.aiders.application.dispatch.dto.DispatchRequestDto;
import team1234.aiders.application.dispatch.service.DispatchService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dispatch")
public class DispatchController {

    private final DispatchService dispatchService;
    @PostMapping("/")
    public ResponseEntity<Void> dispatch(@RequestBody DispatchRequestDto request,
                                         @AuthenticationPrincipal(expression = "id") Long firestationId) {
        dispatchService.createDispatch(request, firestationId);
        return ResponseEntity.ok().build();
    }
}
