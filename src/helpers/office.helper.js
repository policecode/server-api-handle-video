// const fs = require('fs');

// const RandomString = require(__path_util + 'randomString');
const reader = require('xlsx');
class MicrosoftOffice {
    static readFileXlsx(__path_file) {
        // Reading our test file 
        const file = reader.readFile(__path_file) 
        
        let data = [] 
        
        const sheets = file.SheetNames 
        
        for(let i = 0; i < sheets.length; i++)  { 
            const temp = reader.utils.sheet_to_json( 
                    file.Sheets[file.SheetNames[i]]) 
            temp.forEach((res) => { 
                data.push(res) 
            }) 
        } 
        return data;
    }

    static writeFileXlsx(__path_file, __data, __sheet_name) {
        // Reading our test file 
        const file = reader.readFile(__path_file) 
        const ws = reader.utils.json_to_sheet(__data) 
        reader.utils.book_append_sheet(file,ws,__sheet_name) 
        
        // Writing to our file 
        reader.writeFile(file, __path_file) 
    }

}

module.exports = MicrosoftOffice;
