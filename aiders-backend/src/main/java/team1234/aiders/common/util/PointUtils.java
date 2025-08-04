package team1234.aiders.common.util;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

public class PointUtils {
    private static final GeometryFactory geometryFactory = new GeometryFactory();

    public static Point createPoint(Double latitude, Double longitude) {
        Point point = geometryFactory.createPoint(new Coordinate(latitude, longitude));
        point.setSRID(4326);
        return point;
    }
}
