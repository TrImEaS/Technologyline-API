const fs = require('fs').promises
const path = require('path')

const statistics = path.resolve(__dirname, '../Data/statistics.json')

const viewsCounter = async () => {
  try {
    // Leer el archivo de estadísticas
    const data = await fs.readFile(statistics, 'utf8');
    const jsonData = JSON.parse(data);

    // Incrementar el contador de page_views
    jsonData.statistics.page_views += 1;

    // Escribir los datos actualizados en el archivo
    await fs.writeFile(statistics, JSON.stringify(jsonData, null, 2));
  } catch (err) {
    console.error('Error al leer/escribir en el archivo de estadísticas:', err);
  }
}

module.exports = viewsCounter
