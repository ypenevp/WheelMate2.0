package com.legendss.backend.services;

import com.legendss.backend.entities.*;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.legendss.backend.entities.Panic;
import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.repositories.PanicRepository;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.repositories.WheelchairRepository;
import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.User;
import com.legendss.backend.repositories.FakePanicRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.Duration;

@Service
public class WheelchairService {

    private final WheelchairRepository wheelchairRepository;
    private final UserRepository userRepository;
    private final FakePanicRepository fakePanicRepository;
    private final PanicRepository panicRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MobilityRepository mobilityRepository;
    private final SittingSessionRepository sittingSessionRepository;

    public WheelchairService(WheelchairRepository wheelchairRepository, UserRepository userRepository,
            FakePanicRepository fakePanicRepository, PanicRepository panicRepository,
            SimpMessagingTemplate messagingTemplate, MobilityRepository mobilityRepository,
            SittingSessionRepository sittingSessionRepository) {
        this.wheelchairRepository = wheelchairRepository;
        this.userRepository = userRepository;
        this.fakePanicRepository = fakePanicRepository;
        this.panicRepository = panicRepository;
        this.messagingTemplate = messagingTemplate;
        this.mobilityRepository = mobilityRepository;
        this.sittingSessionRepository = sittingSessionRepository;
    }

    public Wheelchair addWheelchair(Wheelchair wheelchair) {
        return this.wheelchairRepository.save(wheelchair);
    }

    public Wheelchair getWheelchairById(Long id) {
        return wheelchairRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wheelchair not found"));
    }

    public Optional<Wheelchair> getWheelchairByOwner(User owner) {
        return wheelchairRepository.findByOwner(owner);
    }

    public Optional<Wheelchair> getWheelchairByOwnerId(Long ownerId) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return wheelchairRepository.findByOwner(user);
    }

    public Wheelchair updateWheelchair(Long id, Wheelchair wheelchair) {
        boolean isPanicNow = false;
        boolean wasPanicBefore = false;
        boolean isFakeNow = false;
        boolean wasFakeBefore = false;
        boolean isIMobilityNow = false;
        boolean wasIMobilityBefore = false;
        Wheelchair wheelchairToUpdate = this.getWheelchairById(id);

        if (wheelchair.getLocation() != null) {
            wheelchairToUpdate.setLocation(wheelchair.getLocation());
        }

        if (wheelchair.getUserInChair() != null) {
            // wheelchairToUpdate.setUserInChair(wheelchair.getUserInChair());
            boolean wasInChairBefore = wheelchairToUpdate.getUserInChair() != null
                    && wheelchairToUpdate.getUserInChair();
            boolean isInChairNow = wheelchair.getUserInChair();

            if (isInChairNow && !wasInChairBefore) {
                SittingSession session = new SittingSession();
                session.setWheelchair(wheelchairToUpdate);
                session.setStartTime(LocalDateTime.now());
                this.sittingSessionRepository.save(session);
            } else if (!isInChairNow && wasInChairBefore) {
                Optional<SittingSession> openSession = this.sittingSessionRepository
                        .findOpenSession(wheelchairToUpdate.getId());
                openSession.ifPresent(session -> {
                    session.setEndTime(LocalDateTime.now());
                    session.setDurationSeconds(
                            Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds());
                    this.sittingSessionRepository.save(session);
                });
            }
            wheelchairToUpdate.setUserInChair(isInChairNow);
        }

        if (wheelchair.getPanic() != null) {
            wasPanicBefore = wheelchairToUpdate.getPanic() != null && wheelchairToUpdate.getPanic();
            isPanicNow = wheelchair.getPanic();

            if (isPanicNow && !wasPanicBefore) {
                Panic panic = new Panic();
                panic.setLocation(
                        wheelchair.getLocation() != null ? wheelchair.getLocation() : wheelchairToUpdate.getLocation());
                panic.setUserInChair(wheelchair.getUserInChair() != null ? wheelchair.getUserInChair()
                        : wheelchairToUpdate.getUserInChair());
                panic.setWheelchair(wheelchairToUpdate);
                this.panicRepository.save(panic);
            }
            wheelchairToUpdate.setPanic(isPanicNow);
        }

        if (wheelchair.getFakePanic() != null) {
            wasFakeBefore = wheelchairToUpdate.getFakePanic() != null && wheelchairToUpdate.getFakePanic();
            isFakeNow = wheelchair.getFakePanic();

            if (isFakeNow && !wasFakeBefore) {
                FakePanic fakePanic = new FakePanic();
                fakePanic.setLocation(
                        wheelchair.getLocation() != null ? wheelchair.getLocation() : wheelchairToUpdate.getLocation());
                fakePanic.setUserInChair(wheelchair.getUserInChair() != null ? wheelchair.getUserInChair()
                        : wheelchairToUpdate.getUserInChair());
                fakePanic.setWheelchair(wheelchairToUpdate);
                this.fakePanicRepository.save(fakePanic);
            }
            wheelchairToUpdate.setFakePanic(isFakeNow);
        }

        if (wheelchair.getImmobility() != null) {
            wasIMobilityBefore = wheelchairToUpdate.getImmobility() != null && wheelchairToUpdate.getImmobility();
            isIMobilityNow = wheelchair.getImmobility();

            if (isIMobilityNow && !wasIMobilityBefore) {
                Mobility mobility = new Mobility();
                mobility.setImobility(wheelchair.getImmobility() != null ? wheelchair.getImmobility()
                        : wheelchairToUpdate.getImmobility());
                mobility.setWheelchair(wheelchairToUpdate);
                this.mobilityRepository.save(mobility);
            }
            wheelchairToUpdate.setImmobility(isIMobilityNow);
        }

        Wheelchair savedWheelchair = this.wheelchairRepository.save(wheelchairToUpdate);
        messagingTemplate.convertAndSend("/topic/wheelchairs", savedWheelchair);

        if (isPanicNow && !wasPanicBefore) {
            messagingTemplate.convertAndSend("/topic/panics", savedWheelchair);
        }

        if (isFakeNow && !wasFakeBefore) {
            messagingTemplate.convertAndSend("/topic/fakePanics", savedWheelchair);
        }

        if (isIMobilityNow && !wasIMobilityBefore) {
            messagingTemplate.convertAndSend("/topic/mobilities", savedWheelchair);
        }

        return savedWheelchair;
    }

    public Wheelchair getWheelchairByUser(Long id) {
        return wheelchairRepository.findById(id).orElse(null);
    }

    public void deleteWheelchair(Long id) {
        this.wheelchairRepository.deleteById(id);
    }

    public Set<User> getAllRelatives(String email) {
        return userRepository.findRelativesByUserEmail(email);
    }

    public Set<String> getRelativesNumbers(String email) {
        Set<User> relatives = getAllRelatives(email);
        return relatives.stream()
                .map(User::getPhone)
                .collect(Collectors.toSet());
    }

    public List<String> getRelativeNumbersList(Long wheelchairId) {
        Wheelchair wheelchair = wheelchairRepository.findById(wheelchairId)
                .orElseThrow(() -> new ResourceNotFoundException("Wheelchair not found with ID: " + wheelchairId));

        Set<String> numbersSet = getRelativesNumbers(wheelchair.getOwner().getEmail());
        return new ArrayList<>(numbersSet);
    }
}