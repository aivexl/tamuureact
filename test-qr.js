import QRCode from 'qrcode';
QRCode.toString('test', { type: 'svg' })
  .then(svg => console.log('SVG SUCCESS:', svg.substring(0, 50)))
  .catch(err => console.error('SVG ERROR:', err));
