const prompt = require('prompt-sync')({
    'fake_val': 'OPTIONAL CONFIG VALUES HERE'
});
let userChoice=prompt("Enter text or voice");
const transcribeAudio=require("./speech-toTextv2.js");
const getResponse=require("./test-aiv2.js");

async function main(){
if(userChoice.toLowerCase() === "text")
{
    let query=prompt("Enter your text query");
    //console.log(query);
    await getResponse(query);

}
else
{
    let fileName=prompt("Enter name of file");
    const userQuery=await transcribeAudio(fileName);
    //console.log(userQuery);
    await getResponse(userQuery);

}
}
main();