package com.school.onlinelearning.dto.dashboard;

import java.util.List;

public class DashboardActivityResponse {
    private List<ActivityItem> items;

    public DashboardActivityResponse() {}

    public DashboardActivityResponse(List<ActivityItem> items) {
        this.items = items;
    }

    public List<ActivityItem> getItems() { return items; }
    public void setItems(List<ActivityItem> items) { this.items = items; }
}
