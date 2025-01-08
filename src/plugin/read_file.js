const fs = require("fs");
const { parse } = require("csv-parse");


function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const fileContent = fs.createReadStream(filePath);
        const parser = parse({
            delimiter: ";",
            // columns: true,
            from_line: 2,
        });
        const data = [];
        fileContent.pipe(parser);
        parser.on("data", (row) => {
            data.push(row);
        });
        parser.on("end", () => {
            resolve(data);
        });
        parser.on("error", (error) => {
            reject(error);
        });
    }
    );
}

module.exports = readCSVFile;



