package team1234.aiders.application.hospital.entity;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor
@Getter
public class BedInfo {

    private Integer available;
    private Integer total;
    private Boolean isAvailable;
    private Boolean isExist;

    private BedInfo(Integer available, Integer total, Boolean isAvailable, Boolean isExist) {
        this.available = available;
        this.total = total;
        this.isAvailable = isAvailable;
        this.isExist = isExist;
    }

    public static BedInfo from(Integer available, Integer total, Boolean isAvailable, Boolean isExist) {
        boolean isEmpty = available == null && total == null;
        if (isEmpty) {
            return new BedInfo(null, null, false, false);
        }
        return new BedInfo(available, total,
                isAvailable != null ? isAvailable : true,
                isExist != null ? isExist : true);
    }

    public BedInfo update(Integer available, Integer total, Boolean isAvailable, Boolean isExist) {
        return BedInfo.from(
                available != null ? available : this.available,
                total != null ? total : this.total,
                isAvailable != null ? isAvailable : this.isAvailable,
                isExist != null ? isExist : this.isExist
        );
    }

    public BedInfo increaseAvailable() {
        if (available == null) {
            return this;
        }
        return new BedInfo(available + 1, total, isAvailable, isExist);
    }

    public BedInfo decreaseAvailable() {
        if (available == null || available == 0) {
            return this;
        }
        return new BedInfo(available - 1, total, isAvailable, isExist);
    }
}
