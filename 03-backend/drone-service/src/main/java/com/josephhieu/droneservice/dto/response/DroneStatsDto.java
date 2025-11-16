package com.josephhieu.droneservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DroneStatsDto {
    private long totalDrones;
    private long idleDrones;
    private long deliveringDrones;
}