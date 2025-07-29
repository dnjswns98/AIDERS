package team1234.aiders.application.dispatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team1234.aiders.application.dispatch.dto.DispatchRequestDto;
import team1234.aiders.application.dispatch.entity.Dispatch;
import team1234.aiders.application.dispatch.entity.DispatchHistory;
import team1234.aiders.application.dispatch.repository.DispatchHistoryRepository;
import team1234.aiders.application.dispatch.repository.DispatchRepository;
import team1234.aiders.application.user.entity.AmbCurrentStatus;
import team1234.aiders.application.user.entity.Ambulance;
import team1234.aiders.application.user.repository.AmbulanceRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DispatchService {

    private final DispatchRepository dispatchRepository;
    private final DispatchHistoryRepository dispatchHistoryRepository;
    private final AmbulanceRepository ambulanceRepository;

    public void createDispatch(DispatchRequestDto dispatchRequestDto) {
        DispatchHistory history = saveDispatchHistory(dispatchRequestDto);

        List<Long> ambulanceIds = dispatchRequestDto.getAmbulanceIds();
        dispatchAmbulances(ambulanceIds, history);
    }

    private DispatchHistory saveDispatchHistory(DispatchRequestDto dispatchRequestDto) {
        DispatchHistory history = new DispatchHistory(
                dispatchRequestDto.getLatitude(),
                dispatchRequestDto.getLongitude(),
                dispatchRequestDto.getAddress(),
                dispatchRequestDto.getCondition()
        );

        dispatchHistoryRepository.save(history);
        return history;
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
