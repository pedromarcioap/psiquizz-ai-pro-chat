const fs = require('fs-extra');
const path = require('path');

const source = path.resolve(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destination = path.resolve(__dirname, 'public', 'pdf.worker.min.js');

fs.copy(source, destination, err => {
  if (err) return console.error('Erro ao copiar o pdf.worker.min.js:', err);
  console.log('pdf.worker.min.js copiado para a pasta public com sucesso!');
});