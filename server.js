const express = require('express');
const chalk = require('chalk');
const app = express();
const PORT = 3000; //process.env.PORT || 3000;

const errorMsg = chalk.bgKeyword('white').redBright;
const successMsg = chalk.bgKeyword('green').white;

// Прив'язка до порту
app.listen(PORT, (error) => {
  error ? console.log(errorMsg(error)) : console.log(successMsg(`Server is running on port ${PORT}`));
});