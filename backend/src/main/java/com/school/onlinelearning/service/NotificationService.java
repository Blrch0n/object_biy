package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Notification;
import com.school.onlinelearning.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getMyNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to modify this notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(String userId, String title, String message,
                                           Notification.NotificationType type, String link) {
        if (userId == null || userId.isBlank()) return null;
        Notification notification = new Notification(userId, title, message, type, link);
        return notificationRepository.save(notification);
    }
}
