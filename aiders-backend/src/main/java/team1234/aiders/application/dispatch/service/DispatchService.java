package team1234.aiders.application.dispatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.dispatch.dto.DispatchHistoryResponseDto;
import team1234.aiders.application.dispatch.dto.DispatchRequestDto;
import team1234.aiders.application.dispatch.entity.Dispatch;
import team1234.aiders.application.dispatch.entity.DispatchHistory;
import team1234.aiders.application.dispatch.repository.DispatchHistoryRepository;
import team1234.aiders.application.dispatch.repository.DispatchRepository;
import team1234.aiders.application.ambulance.entity.AmbCurrentStatus;
import team1234.aiders.application.ambulance.entity.Ambulance;
import team1234.aiders.application.firestation.entity.Firestation;
import team1234.aiders.application.ambulance.repository.AmbulanceRepository;
import team1234.aiders.application.firestation.repository.FirestationRepository;
import team1234.aiders.config.security.CustomUserDetails;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DispatchService {

    private final DispatchRepository dispatchRepository;
    private final DispatchHistoryRepository dispatchHistoryRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final FirestationRepository firestationRepository;

    public void createDispatch(DispatchRequestDto request, CustomUserDetails user) {
        Long userId = user.getId();

        Firestation firestation = firestationRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("소방서를 찾을 수 없습니다."));

        DispatchHistory history = saveDispatchHistory(request, firestation);
        dispatchAmbulances(request.getAmbulanceIds(), history);
    }

    @Transactional(readOnly = true)
    public List<DispatchHistoryResponseDto> getDispatchHistories(CustomUserDetails user) {
        Long userId = user.getId();

        List<DispatchHistory> histories = dispatchHistoryRepository.findByFirestationId(userId);

        return histories.stream()
                .map(history -> {
                    List<Long> ambulanceIds = dispatchRepository.findByDispatchHistoryId(history.getId())
                            .stream()
                            .map(dispatch -> dispatch.getAmbulance().getId())
                            .toList();

                    return DispatchHistoryResponseDto.fromEntity(history, ambulanceIds);
                })
                .toList();
    }

    private DispatchHistory saveDispatchHistory(DispatchRequestDto dto, Firestation firestation) {
        DispatchHistory history = DispatchHistory.create(
                firestation,
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getAddress(),
                dto.getCondition()
        );
        return dispatchHistoryRepository.save(history);
    }

    private void dispatchAmbulances(List<Long> ambulanceIds, DispatchHistory history) {
        for (Long ambulanceId : ambulanceIds) {
            Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                    .orElseThrow(() -> new IllegalArgumentException("ambulance not found"));

            ambulance.changeStatus(AmbCurrentStatus.DISPATCH);

            Dispatch dispatch = new Dispatch(ambulance, history);
            dispatchRepository.save(dispatch);
        }
    }

}
