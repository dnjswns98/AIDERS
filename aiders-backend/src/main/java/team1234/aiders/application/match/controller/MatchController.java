package team1234.aiders.application.match.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team1234.aiders.application.match.dto.MatchRequest;
import team1234.aiders.application.match.dto.MatchResponse;
import team1234.aiders.application.match.service.MatchingService;
import team1234.aiders.application.hospital.entity.Hospital;

@RestController
@RequestMapping("/api/v1/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;

    // 자동 병원 매칭
    @PatchMapping("/{uid}")
    public ResponseEntity<MatchResponse> autoMatch(
            @PathVariable("uid") Long ambulanceId,
            @RequestBody MatchRequest request) {

        Hospital hospital = matchingService.autoMatch(
                ambulanceId,
                request.getLatitude(),
                request.getLongitude()
        );

        return ResponseEntity.ok(
                MatchResponse.builder()
                        .hospitalId(hospital.getId())
                        .name(hospital.getName())
                        .address(hospital.getAddress())
                        .build()
        );
    }

    // 매칭된 병원 정보 조회
    @GetMapping("/{uid}")
    public ResponseEntity<MatchResponse> getMatchedHospital(@PathVariable("uid") Long ambulanceId) {
        Hospital hospital = matchingService.getMatchedHospital(ambulanceId);

        return ResponseEntity.ok(
                MatchResponse.builder()
                        .hospitalId(hospital.getId())
                        .name(hospital.getName())
                        .address(hospital.getAddress())
                        .build()
        );
    }
}
