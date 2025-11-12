"use client";

import { Carousel } from "antd";
import Image from "next/image";

const banners = [
  { id: 1, url: "/images/banners/banner2.png", alt: "Banner 1" },
  { id: 2, url: "/images/banners/banner1.png", alt: "Banner 2" },
  { id: 3, url: "/images/banners/banner6.png", alt: "Banner 3" },
];

export default function PromoCarousel() {
  return (
    <div className="w-full">
      <Carousel autoplay>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div className="relative w-full h-[380px] md:h-[450px]">
              <Image
                src={banner.url}
                alt={banner.alt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
