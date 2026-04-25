package com.legendss.backend.controllers;

import com.legendss.backend.dto.ActivityLogResponse;
import com.legendss.backend.entities.*;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.repositories.SittingSessionRepository;
import com.legendss.backend.services.MobilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/mobility")
public class MobilityController {

    private final MobilityService mobilityService;
    private final UserRepository userRepository;
    private final SittingSessionRepository sittingSessionRepository;

    public MobilityController(MobilityService mobilityService, UserRepository userRepository,
                              SittingSessionRepository sittingSessionRepository) {
        this.mobilityService = mobilityService;
        this.userRepository = userRepository;
        this.sittingSessionRepository = sittingSessionRepository;
    }

    @GetMapping("/relative/my-tracked")
    public ResponseEntity<List<Mobility>> getTrackedMobilities(@RequestAttribute("email") String email) {
        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }

        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());
        List<Mobility> allMobilities = new ArrayList<>();

        for (User u : trackedUsers) {
            if (u.getWheelchair() != null) {
                allMobilities.addAll(mobilityService.getMobilitiesByWheelchairId(u.getWheelchair().getId()));
            }
        }

        return ResponseEntity.ok(allMobilities);
    }

    @GetMapping("/relative/activity-logs/{userId}")
    public ResponseEntity<?> getActivityLogsForRelative(
            @RequestAttribute("email") String email,
            @PathVariable Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }

        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());
        User trackedUser = trackedUsers.stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("You don't have access to this user."));

        if (trackedUser.getWheelchair() == null) {
            throw new ResourceNotFoundException("This user doesn't have a wheelchair.");
        }

        Wheelchair wheelchair = trackedUser.getWheelchair();

        List<Mobility> mobilityLogs;
        if (startDate != null && endDate != null) {
            LocalDateTime from = LocalDateTime.parse(startDate);
            LocalDateTime to = LocalDateTime.parse(endDate);
            mobilityLogs = mobilityService.getMobilitiesByWheelchairIdAndDateRange(wheelchair.getId(), from, to);
        } else {
            mobilityLogs = mobilityService.getMobilitiesByWheelchairIdSorted(wheelchair.getId());
        }

        List<ActivityLogResponse.MobilityLogDTO> mobilityDTOs = mobilityLogs.stream()
                .map(log -> {
                    long duration = 0;
                    if (log.getStarttime() != null) {
                        if (log.getFinishtime() != null) {
                            duration = Duration.between(log.getStarttime(), log.getFinishtime()).getSeconds();
                        } else {
                            duration = Duration.between(log.getStarttime(), LocalDateTime.now()).getSeconds();
                        }
                    }
                    return new ActivityLogResponse.MobilityLogDTO(
                            log.getId(),
                            log.getImobility(),
                            log.getStarttime(),
                            log.getFinishtime(),
                            duration);
                })
                .collect(Collectors.toList());

        List<SittingSession> sittingSessions = sittingSessionRepository.findByWheelchairIdOrderByStartTimeDesc(wheelchair.getId());

        List<ActivityLogResponse.ActivityPeriodDTO> activityPeriods = new ArrayList<>();
        sittingSessions.forEach(session -> {
            activityPeriods.add(new ActivityLogResponse.ActivityPeriodDTO(
                    session.getStartTime().toLocalDate().toString(),
                    "sit",
                    session.getStartTime().toLocalTime().toString().substring(0, 5),
                    session.getStartTime()));

            if (session.getEndTime() != null) {
                activityPeriods.add(new ActivityLogResponse.ActivityPeriodDTO(
                        session.getEndTime().toLocalDate().toString(),
                        "up",
                        session.getEndTime().toLocalTime().toString().substring(0, 5),
                        session.getEndTime()));
            }
        });

        activityPeriods.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

        ActivityLogResponse.WheelchairStatusDTO status = new ActivityLogResponse.WheelchairStatusDTO(
                wheelchair.getUserInChair(),
                wheelchair.getLocation(),
                wheelchair.getPanic(),
                wheelchair.getFakePanic(),
                wheelchair.getImmobility(),
                LocalDateTime.now());

        ActivityLogResponse response = new ActivityLogResponse(
                wheelchair.getId(),
                wheelchair.getName(),
                trackedUser.getUsername(),
                trackedUser.getEmail(),
                mobilityDTOs,
                activityPeriods,
                status);

        return ResponseEntity.ok(response);
    }

    @MessageMapping("/activity-logs-subscribe/{userId}")
    @SendTo("/topic/activity-logs/{userId}")
    public ActivityLogResponse subscribeToActivityLogs(
            @DestinationVariable Long userId,
            @RequestAttribute("email") String email) {

        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }

        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());
        User trackedUser = trackedUsers.stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("You don't have access to this user."));

        if (trackedUser.getWheelchair() == null) {
            throw new ResourceNotFoundException("This user doesn't have a wheelchair.");
        }

        Wheelchair wheelchair = trackedUser.getWheelchair();

        List<Mobility> mobilityLogs = mobilityService.getMobilitiesByWheelchairIdSorted(wheelchair.getId());

        List<ActivityLogResponse.MobilityLogDTO> mobilityDTOs = mobilityLogs.stream()
                .map(log -> {
                    long duration = 0;
                    if (log.getStarttime() != null) {
                        if (log.getFinishtime() != null) {
                            duration = Duration.between(log.getStarttime(), log.getFinishtime()).getSeconds();
                        } else {
                            duration = Duration.between(log.getStarttime(), LocalDateTime.now()).getSeconds();
                        }
                    }
                    return new ActivityLogResponse.MobilityLogDTO(
                            log.getId(),
                            log.getImobility(),
                            log.getStarttime(),
                            log.getFinishtime(),
                            duration);
                })
                .collect(Collectors.toList());

        List<SittingSession> sittingSessions = sittingSessionRepository.findByWheelchairIdOrderByStartTimeDesc(wheelchair.getId());

        List<ActivityLogResponse.ActivityPeriodDTO> activityPeriods = new ArrayList<>();
        sittingSessions.forEach(session -> {
            activityPeriods.add(new ActivityLogResponse.ActivityPeriodDTO(
                    session.getStartTime().toLocalDate().toString(),
                    "sit",
                    session.getStartTime().toLocalTime().toString().substring(0, 5),
                    session.getStartTime()));

            if (session.getEndTime() != null) {
                activityPeriods.add(new ActivityLogResponse.ActivityPeriodDTO(
                        session.getEndTime().toLocalDate().toString(),
                        "up",
                        session.getEndTime().toLocalTime().toString().substring(0, 5),
                        session.getEndTime()));
            }
        });

        activityPeriods.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

        ActivityLogResponse.WheelchairStatusDTO status = new ActivityLogResponse.WheelchairStatusDTO(
                wheelchair.getUserInChair(),
                wheelchair.getLocation(),
                wheelchair.getPanic(),
                wheelchair.getFakePanic(),
                wheelchair.getImmobility(),
                LocalDateTime.now());

        return new ActivityLogResponse(
                wheelchair.getId(),
                wheelchair.getName(),
                trackedUser.getUsername(),
                trackedUser.getEmail(),
                mobilityDTOs,
                activityPeriods,
                status);
    }
}