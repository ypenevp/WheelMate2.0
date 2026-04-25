package com.legendss.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ActivityLogResponse {
    private Long wheelchairId;
    private String wheelchairName;
    private String userName;
    private String userEmail;

    @JsonProperty("mobilityLogs")
    private List<MobilityLogDTO> mobilityLogs;

    @JsonProperty("activityPeriods")
    private List<ActivityPeriodDTO> activityPeriods;

    @JsonProperty("wheelchairStatus")
    private WheelchairStatusDTO wheelchairStatus;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class MobilityLogDTO {
        private Long id;
        private Boolean inWheelchair;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long durationSeconds;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ActivityPeriodDTO {
        private String date;
        private String action;
        private String time;
        private LocalDateTime timestamp;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class WheelchairStatusDTO {
        private Boolean userInChair;
        private String location;
        private Boolean isPanic;
        private Boolean isFakePanic;
        private Boolean isImmobility;
        private LocalDateTime lastUpdate;
    }
}
