import "dotenv/config";
import { auth } from "../lib/auth";
import { db } from "../lib/db";

async function main() {
  const existingUser = await db.user.findUnique({
    where: { email: "admin@catalog.com" },
  });

  if (!existingUser) {
    const result = await auth.api.signUpEmail({
      body: {
        email: "admin@catalog.com",
        password: "admin123",
        name: "Admin",
      },
    });

    if (!result?.user) {
      throw new Error("Failed to create admin user");
    }

    console.log("Admin user created:");
    console.log("  Email:    admin@catalog.com");
    console.log("  Password: admin123");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const existingCategories = await db.category.count();
  if (existingCategories > 0) {
    console.log("Categories and products already exist, skipping seed.");
    return;
  }

  const categories = await Promise.all([
    db.category.create({
      data: { name: "Peripherals", slug: "peripherals", description: "Mice, keyboards, headsets, webcams, and mousepads" },
    }),
    db.category.create({
      data: { name: "PC Components", slug: "pc-components", description: "GPUs, CPUs, RAM, SSDs, and motherboards" },
    }),
    db.category.create({
      data: { name: "Monitors", slug: "monitors", description: "Gaming monitors, office displays, and ultrawide screens" },
    }),
    db.category.create({
      data: { name: "Accessories", slug: "accessories", description: "USB hubs, cables, stands, and adapters" },
    }),
    db.category.create({
      data: { name: "Networking", slug: "networking", description: "Routers, adapters, and network switches" },
    }),
  ]);

  const [peripherals, pcComponents, monitors, accessories, networking] = categories;

  await db.product.createMany({
    data: [
      // Peripherals (5)
      {
        name: "HyperX Cloud III Wireless", brand: "HyperX", categoryId: peripherals.id,
        description: "Premium wireless gaming headset with DTS Spatial Audio, 53mm drivers with tuned bass, detachable noise-cancelling microphone, and up to 120 hours of battery life.",
        specs: JSON.stringify({ type: "Over-ear wireless gaming headset", driver: "53mm with neodymium magnets", frequency_response: "10Hz - 21kHz", connectivity: "2.4GHz wireless USB dongle", battery: "Up to 120 hours", microphone: "Detachable, noise-cancelling, bi-directional", surround: "DTS Headphone:X Spatial Audio", weight: "330g", compatibility: "PC, PS5, PS4, Nintendo Switch" }),
        price: 149.99, costPrice: 95.00, stock: 12,
        imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600", available: true,
      },
      {
        name: "Logitech G Pro X Superlight 2", brand: "Logitech", categoryId: peripherals.id,
        description: "Ultra-lightweight wireless gaming mouse weighing just 60g. Features the HERO 2 sensor with 44K DPI, LIGHTSPEED wireless technology, and zero-additive PTFE feet.",
        specs: JSON.stringify({ sensor: "HERO 2 (44,000 DPI)", connectivity: "LIGHTSPEED 2.4GHz wireless + USB-C", weight: "60g", battery: "Up to 95 hours", switches: "LIGHTFORCE hybrid optical-mechanical", polling_rate: "2000Hz", feet: "Zero-additive PTFE", buttons: "5 programmable" }),
        price: 159.99, costPrice: 102.00, stock: 8,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", available: true,
      },
      {
        name: "Razer BlackWidow V4 Pro", brand: "Razer", categoryId: peripherals.id,
        description: "Full-size mechanical gaming keyboard with Razer Green switches, per-key RGB Chroma lighting, magnetic wrist rest, command dial, and 8 dedicated macro keys.",
        specs: JSON.stringify({ switches: "Razer Green Mechanical (clicky, 50g actuation)", layout: "Full-size with macro keys", backlighting: "Per-key RGB with Razer Chroma", connectivity: "USB-C detachable, USB passthrough", wrist_rest: "Magnetic leatherette cushion", keycaps: "Doubleshot ABS", anti_ghosting: "Full N-key rollover", macro_keys: "8 dedicated" }),
        price: 229.99, costPrice: 148.00, stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600", available: true,
      },
      {
        name: "Logitech C920s HD Pro Webcam", brand: "Logitech", categoryId: peripherals.id,
        description: "Full HD 1080p webcam with privacy shutter, dual stereo microphones with automatic noise reduction, and HD autofocus.",
        specs: JSON.stringify({ resolution: "1080p / 30fps, 720p / 30fps", field_of_view: "78 degrees", focus: "Autofocus (HD)", microphone: "Dual stereo with auto noise reduction", privacy: "Built-in privacy shutter", connectivity: "USB-A" }),
        price: 69.99, costPrice: 42.00, stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600", available: true,
      },
      {
        name: "SteelSeries QcK Heavy XXL", brand: "SteelSeries", categoryId: peripherals.id,
        description: "Extra-large gaming mousepad with 6mm thick rubber base. QcK micro-woven cloth surface provides optimal tracking for both optical and laser sensors.",
        specs: JSON.stringify({ size: "900mm x 400mm x 6mm (XXL)", surface: "QcK micro-woven cloth", base: "Non-slip rubber (6mm thick)", tracking: "Optimized for optical and laser sensors", edge: "Stitched edges for durability" }),
        price: 34.99, costPrice: 18.00, stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=600", available: true,
      },
      // PC Components (5)
      {
        name: "NVIDIA GeForce RTX 4070 Super", brand: "NVIDIA (Founders Edition)", categoryId: pcComponents.id,
        description: "High-performance graphics card built on the Ada Lovelace architecture. 7168 CUDA cores, 12GB GDDR6X VRAM, DLSS 3.5 with Frame Generation, and ray tracing.",
        specs: JSON.stringify({ gpu: "AD103, 7168 CUDA cores", vram: "12GB GDDR6X, 192-bit bus", boost_clock: "2475 MHz", tdp: "220W", ray_tracing: "3rd gen RT cores", dlss: "DLSS 3.5 with Frame Generation", outputs: "1x HDMI 2.1, 3x DisplayPort 1.4a", psu_recommended: "650W" }),
        price: 599.99, costPrice: 445.00, stock: 4,
        imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600", available: true,
      },
      {
        name: "AMD Ryzen 7 7800X3D", brand: "AMD", categoryId: pcComponents.id,
        description: "The ultimate gaming processor with 3D V-Cache technology. 8 cores, 16 threads, 104MB total cache.",
        specs: JSON.stringify({ cores: "8 cores / 16 threads", base_clock: "4.2 GHz", boost_clock: "5.0 GHz", cache: "104MB total (96MB L3 3D V-Cache)", tdp: "120W", socket: "AM5 (LGA 1718)", architecture: "Zen 4 with 3D V-Cache", pcie: "PCIe 5.0" }),
        price: 349.99, costPrice: 248.00, stock: 7,
        imageUrl: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600", available: true,
      },
      {
        name: "Corsair Vengeance DDR5-6000 32GB", brand: "Corsair", categoryId: pcComponents.id,
        description: "High-performance DDR5 desktop memory kit optimized for AMD EXPO and Intel XMP 3.0. 32GB (2x16GB) at 6000MT/s with CL30 latency.",
        specs: JSON.stringify({ capacity: "32GB (2x16GB)", speed: "DDR5-6000 MT/s", latency: "CL30-36-36-76", voltage: "1.35V", profiles: "AMD EXPO + Intel XMP 3.0", form_factor: "DIMM, 288-pin", warranty: "Lifetime limited" }),
        price: 109.99, costPrice: 72.00, stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600", available: true,
      },
      {
        name: "Samsung 990 Pro 2TB NVMe SSD", brand: "Samsung", categoryId: pcComponents.id,
        description: "Flagship PCIe 4.0 NVMe M.2 SSD with sequential read speeds up to 7,450 MB/s.",
        specs: JSON.stringify({ capacity: "2TB", interface: "PCIe 4.0 x4, NVMe 2.0", form_factor: "M.2 2280", sequential_read: "7,450 MB/s", sequential_write: "6,900 MB/s", endurance: "1,200 TBW", warranty: "5 years" }),
        price: 179.99, costPrice: 118.00, stock: 10,
        imageUrl: "https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=600", available: true,
      },
      {
        name: "ASUS ROG Strix B650E-E Gaming WiFi", brand: "ASUS", categoryId: pcComponents.id,
        description: "Premium AM5 motherboard with PCIe 5.0 support, WiFi 6E, 2.5G LAN, USB4 header, 16+2 power stages.",
        specs: JSON.stringify({ socket: "AM5 (LGA 1718)", chipset: "AMD B650E", form_factor: "ATX", memory: "4x DDR5, up to 128GB, 6400MHz+", pcie: "1x PCIe 5.0 x16 (GPU), 1x PCIe 5.0 M.2", networking: "WiFi 6E + Bluetooth 5.3 + 2.5G LAN", power: "16+2 power stages" }),
        price: 279.99, costPrice: 195.00, stock: 3,
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600", available: true,
      },
      // Monitors (5)
      {
        name: "LG UltraGear 27GP850-B", brand: "LG", categoryId: monitors.id,
        description: "27-inch Nano IPS gaming monitor with 165Hz refresh rate (overclockable to 180Hz), 1ms response time, NVIDIA G-Sync and AMD FreeSync Premium.",
        specs: JSON.stringify({ size: "27 inches", resolution: "2560 x 1440 (QHD)", panel: "Nano IPS", refresh_rate: "165Hz (OC to 180Hz)", response_time: "1ms GtG", adaptive_sync: "G-Sync Compatible + FreeSync Premium", hdr: "VESA DisplayHDR 400", color: "DCI-P3 98%" }),
        price: 349.99, costPrice: 240.00, stock: 6,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600", available: true,
      },
      {
        name: "Samsung Odyssey G7 32\" Curved", brand: "Samsung", categoryId: monitors.id,
        description: "32-inch curved 1000R VA gaming monitor with 240Hz refresh rate, 1ms response time, and Quantum Dot technology.",
        specs: JSON.stringify({ size: "32 inches (1000R curve)", resolution: "2560 x 1440 (QHD)", panel: "VA with Quantum Dot", refresh_rate: "240Hz", response_time: "1ms GtG", adaptive_sync: "G-Sync Compatible + FreeSync Premium Pro", hdr: "VESA DisplayHDR 600" }),
        price: 449.99, costPrice: 310.00, stock: 4,
        imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600", available: true,
      },
      {
        name: "Dell UltraSharp U2723QE", brand: "Dell", categoryId: monitors.id,
        description: "27-inch 4K IPS Black monitor designed for professionals. USB-C 90W power delivery, KVM switch, factory-calibrated Delta E < 2.",
        specs: JSON.stringify({ size: "27 inches", resolution: "3840 x 2160 (4K UHD)", panel: "IPS Black", refresh_rate: "60Hz", contrast: "2000:1 static", color: "sRGB 99%, DCI-P3 98%, Delta E < 2", ports: "HDMI 2.0, DisplayPort 1.4, USB-C 90W PD", use_case: "Professional work, photo/video editing" }),
        price: 519.99, costPrice: 370.00, stock: 3,
        imageUrl: "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600", available: true,
      },
      {
        name: "ASUS TUF Gaming VG249Q1A", brand: "ASUS", categoryId: monitors.id,
        description: "Affordable 24-inch Full HD gaming monitor with 165Hz refresh rate, 1ms MPRT, FreeSync Premium.",
        specs: JSON.stringify({ size: "23.8 inches", resolution: "1920 x 1080 (Full HD)", panel: "IPS", refresh_rate: "165Hz", response_time: "1ms MPRT", adaptive_sync: "AMD FreeSync Premium", ports: "2x HDMI 1.4, 1x DisplayPort 1.2" }),
        price: 159.99, costPrice: 105.00, stock: 14,
        imageUrl: "https://images.unsplash.com/photo-1616711906333-23cf8b244ea5?w=600", available: true,
      },
      {
        name: "LG 34WP65C-B UltraWide", brand: "LG", categoryId: monitors.id,
        description: "34-inch curved ultrawide monitor with 21:9 aspect ratio, 3440x1440 resolution, 160Hz refresh rate, HDR10.",
        specs: JSON.stringify({ size: "34 inches (1800R curve, 21:9)", resolution: "3440 x 1440 (UWQHD)", panel: "VA", refresh_rate: "160Hz", response_time: "1ms MBR", adaptive_sync: "AMD FreeSync Premium", contrast: "3000:1 static", features: "PBP/PIP split screen" }),
        price: 399.99, costPrice: 275.00, stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1547394765-185e1e68d4a1?w=600", available: true,
      },
      // Accessories (5)
      {
        name: "Anker USB-C Hub 7-in-1", brand: "Anker", categoryId: accessories.id,
        description: "Compact 7-in-1 USB-C hub with HDMI 4K@60Hz, 100W PD charging, USB 3.0 ports, SD/microSD card reader.",
        specs: JSON.stringify({ ports: "1x HDMI 4K@60Hz, 2x USB-A 3.0, 1x USB-C PD 100W, 1x SD, 1x microSD", power_delivery: "100W pass-through", video: "HDMI 2.0, 4K@60Hz", material: "Aluminum alloy body" }),
        price: 49.99, costPrice: 28.00, stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600", available: true,
      },
      {
        name: "VIVO Dual Monitor Desk Mount", brand: "VIVO", categoryId: accessories.id,
        description: "Heavy-duty dual monitor arm supporting two screens up to 27 inches each. Full motion adjustment.",
        specs: JSON.stringify({ monitors: "2 screens, 13\" to 27\" each", weight_capacity: "10kg per arm", vesa: "75x75mm and 100x100mm", adjustment: "Height, tilt (±85°), swivel (180°), rotate (360°)", mounting: "C-clamp or grommet" }),
        price: 39.99, costPrice: 22.00, stock: 18,
        imageUrl: "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600", available: true,
      },
      {
        name: "Cable Matters USB4 Cable 0.8m", brand: "Cable Matters", categoryId: accessories.id,
        description: "USB4 cable supporting 40Gbps data transfer, 8K@60Hz video, and 100W PD charging.",
        specs: JSON.stringify({ standard: "USB4 Gen 3x2", data_speed: "40Gbps", video: "8K@60Hz", charging: "100W PD 3.0", length: "0.8m", connector: "USB-C to USB-C", certification: "USB-IF Certified" }),
        price: 24.99, costPrice: 12.00, stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", available: true,
      },
      {
        name: "Elgato Stream Deck MK.2", brand: "Elgato", categoryId: accessories.id,
        description: "15 customizable LCD keys for streaming, content creation, and productivity.",
        specs: JSON.stringify({ keys: "15 customizable LCD keys", display: "72x72px LCD per key", connectivity: "USB-C", software: "Stream Deck software (Windows/macOS)", integrations: "OBS, Twitch, YouTube, Spotify, 200+ plugins" }),
        price: 149.99, costPrice: 98.00, stock: 7,
        imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600", available: true,
      },
      {
        name: "Logitech Desk Mat Studio Series", brand: "Logitech", categoryId: accessories.id,
        description: "Large desk mat made from recycled materials. Anti-slip rubber base, spill-resistant surface.",
        specs: JSON.stringify({ size: "700mm x 300mm x 2mm", material: "Recycled polyester top, anti-slip rubber base", surface: "Smooth, spill-resistant", sustainability: "Made with recycled materials" }),
        price: 29.99, costPrice: 14.00, stock: 22,
        imageUrl: "https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=600", available: true,
      },
      // Networking (5)
      {
        name: "TP-Link Archer AX73 WiFi 6 Router", brand: "TP-Link", categoryId: networking.id,
        description: "Dual-band WiFi 6 router with speeds up to 5400Mbps. 6 external antennas, 1.5GHz quad-core CPU, covers up to 230m².",
        specs: JSON.stringify({ standard: "WiFi 6 (802.11ax)", speed: "5400Mbps", processor: "1.5GHz Quad-Core", antennas: "6 external high-gain", coverage: "Up to 230m²", ports: "1x 2.5G WAN, 4x Gigabit LAN, 1x USB 3.0", security: "WPA3" }),
        price: 109.99, costPrice: 68.00, stock: 9,
        imageUrl: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600", available: true,
      },
      {
        name: "TP-Link Deco X55 Mesh System (3-Pack)", brand: "TP-Link", categoryId: networking.id,
        description: "Whole-home WiFi 6 mesh system covering up to 600m². AX3000 dual-band speeds with seamless roaming.",
        specs: JSON.stringify({ standard: "WiFi 6 (802.11ax)", speed: "3000Mbps", coverage: "Up to 600m² (3 units)", units: "3-pack", devices: "150+ per system", features: "Seamless roaming, adaptive routing", security: "WPA3" }),
        price: 189.99, costPrice: 125.00, stock: 6,
        imageUrl: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600", available: true,
      },
      {
        name: "ASUS USB-AX56 WiFi 6 Adapter", brand: "ASUS", categoryId: networking.id,
        description: "USB WiFi 6 adapter with external antenna for desktop PCs. AX1800 dual-band speeds.",
        specs: JSON.stringify({ standard: "WiFi 6 (802.11ax)", speed: "1800Mbps", interface: "USB 3.0", antenna: "External high-gain with magnetic cradle", security: "WPA3", compatibility: "Windows 10/11" }),
        price: 49.99, costPrice: 30.00, stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600", available: true,
      },
      {
        name: "TP-Link TL-SG108 8-Port Gigabit Switch", brand: "TP-Link", categoryId: networking.id,
        description: "Unmanaged 8-port Gigabit Ethernet switch. Plug-and-play, fanless silent operation.",
        specs: JSON.stringify({ ports: "8x Gigabit Ethernet", speed: "10/100/1000 Mbps per port", switching_capacity: "16 Gbps", type: "Unmanaged (plug and play)", design: "Compact metal body, fanless", warranty: "5 years" }),
        price: 19.99, costPrice: 10.00, stock: 35,
        imageUrl: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600", available: true,
      },
      {
        name: "Cat 8 Ethernet Cable 3m (2-Pack)", brand: "DbillionDa", categoryId: networking.id,
        description: "High-speed Cat 8 Ethernet cables supporting up to 40Gbps and 2000MHz bandwidth.",
        specs: JSON.stringify({ category: "Cat 8 (S/FTP shielded)", speed: "Up to 40Gbps", bandwidth: "2000MHz", length: "3 meters (2-pack)", connector: "Gold-plated RJ45", shielding: "Double shielded (S/FTP)", backward_compatible: "Cat 7, Cat 6a, Cat 6, Cat 5e" }),
        price: 14.99, costPrice: 6.00, stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", available: true,
      },
    ],
  });

  console.log("25 sample products created.");

  const allProducts = await db.product.findMany();
  const now = new Date();

  for (const product of allProducts.slice(0, 20)) {
    for (let i = 0; i < 2; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const quantity = Math.floor(Math.random() * 4) + 1;
      const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      await db.sale.create({
        data: {
          productId: product.id,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
          createdAt: saleDate,
        },
      });
    }
  }

  console.log("Sample sales created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
