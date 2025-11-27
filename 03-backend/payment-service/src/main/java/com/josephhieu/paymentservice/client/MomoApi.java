package com.josephhieu.paymentservice.client;

import com.josephhieu.paymentservice.dto.request.MomoRequest;
import com.josephhieu.paymentservice.dto.response.MomoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "momo", url = "${momo.end-point}")
public interface MomoApi {

    @PostMapping("/create")
    MomoResponse createMomoQR(@RequestBody MomoRequest momoRequest);
}
