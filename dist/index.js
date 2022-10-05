"use strict";
const command = 'ban wolfy "cause i said so"';
console.log(command.match(/(?:[^\s"']+|['"][^'"]*["'])+/g));
