const path = require('path');

const { renderHtml } = require('../views/render');

function createHomeController() {
  return {
    getHomePage(_req, res) {
      const html = renderHtml(path.resolve(__dirname, '../views/home.html'), {});
      return res.status(200).send(html);
    }
  };
}

module.exports = { createHomeController };
