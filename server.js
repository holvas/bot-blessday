const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Прив'язка до порту
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});