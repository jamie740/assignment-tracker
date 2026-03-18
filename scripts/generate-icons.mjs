import sharp from "sharp";
import { writeFileSync } from "fs";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#FFD600"/>
  <text x="256" y="360" font-family="Arial Black, Arial, sans-serif" font-size="260" font-weight="900" text-anchor="middle" fill="#000000">AT</text>
</svg>`;

const svgBuffer = Buffer.from(svg);

// apple-touch-icon (180x180)
await sharp(svgBuffer).resize(180, 180).png().toFile("public/apple-touch-icon.png");

// PWA icons
await sharp(svgBuffer).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(svgBuffer).resize(512, 512).png().toFile("public/icon-512.png");

// favicon
await sharp(svgBuffer).resize(32, 32).png().toFile("public/favicon.png");

console.log("Icons generated successfully!");
