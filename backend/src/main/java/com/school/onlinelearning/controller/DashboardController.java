package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.dashboard.DashboardStatsResponse;
import com.school.onlinelearning.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER', 'ADMIN')")
	@GetMapping("/stats")
	public ResponseEntity<DashboardStatsResponse> getStats() {
		return ResponseEntity.ok(dashboardService.getStats());
	}
}
