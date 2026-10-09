export const categoryThemes = [
  { slug: "phones", name: "Phones", description: "Smart devices for every kind of day.", accent: "bg-[#E4EBFB]", icon: "smartphone" },
  { slug: "laptops", name: "Laptops", description: "Portable power for work and play.", accent: "bg-[#FDEFEC]", icon: "laptop" },
  { slug: "tablets", name: "Tablets", description: "Big ideas in a beautifully portable form.", accent: "bg-[#EFEBFA]", icon: "tablet" },
  { slug: "chargers", name: "Chargers", description: "Keep every part of your setup moving.", accent: "bg-[#E1F2EC]", icon: "zap" },
  { slug: "audio", name: "Audio", description: "Better sound for focus, travel, and downtime.", accent: "bg-[#FDE8E7]", icon: "headphones" },
  { slug: "accessories", name: "Accessories", description: "Small upgrades that make a big difference.", accent: "bg-[#E8F0FC]", icon: "mouse" },
  { slug: "pc-components", name: "PC Components", description: "Build a setup that works your way.", accent: "bg-[#EDE8FB]", icon: "cpu" },
  { slug: "gaming", name: "Gaming", description: "Gear up for longer sessions and bigger wins.", accent: "bg-[#FCEBD7]", icon: "gamepad" },
  { slug: "cameras", name: "Cameras", description: "Capture the details worth keeping.", accent: "bg-[#E4F3EF]", icon: "camera" },
  { slug: "desktops", name: "Desktops", description: "Serious performance for serious desks.", accent: "bg-[#E9EAF7]", icon: "monitor" },
  { slug: "wearables", name: "Wearables", description: "Useful technology that stays close.", accent: "bg-[#F5E8F2]", icon: "watch" },
] as const;

export type CategoryTheme = (typeof categoryThemes)[number];