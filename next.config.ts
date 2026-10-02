import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Hosts allowed to request dev-only assets (HMR, dev endpoints).
   *
   * Development only — Next ignores this in production builds. It exists so the
   * dev server can be opened from another device on the LAN (a real phone is
   * the only honest way to check the mobile layout and the terminal's on-screen
   * keyboard behaviour).
   *
   * The wildcard covers the whole local subnet so a new DHCP lease does not
   * break this again. Keep it scoped to private ranges — never add a public
   * host here.
   */
  allowedDevOrigins: ["192.168.31.*", "192.168.1.*", "10.0.0.*"],
};

export default nextConfig;
