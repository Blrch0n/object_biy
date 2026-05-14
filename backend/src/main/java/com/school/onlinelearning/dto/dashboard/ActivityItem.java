package com.school.onlinelearning.dto.dashboard;

import java.time.LocalDateTime;

public class ActivityItem {
    private String type;
    private String title;
    private String link;
    private LocalDateTime createdAt;
    private String actorName;

    public ActivityItem() {}

    public ActivityItem(String type, String title, String link, LocalDateTime createdAt, String actorName) {
        this.type = type;
        this.title = title;
        this.link = link;
        this.createdAt = createdAt;
        this.actorName = actorName;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
}
