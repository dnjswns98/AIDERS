package team1234.aiders.application.dispatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import team1234.aiders.application.dispatch.entity.Dispatch;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch,Long> {

}
