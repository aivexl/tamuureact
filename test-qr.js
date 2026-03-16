import QRCode from 'qrcode';
async function test() {
  try {
    const svg = await QRCode.toString('https://tamuu.id', { type: 'svg', margin: 1, color: { dark: '#1a1a1a', light: '#ffffff' } });
    console.log("SVG length:", svg.length);
    console.log(svg.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
test();
