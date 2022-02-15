const axios = require('axios')
const puppeteer = require("puppeteer")
var incidents = new Object();

const TelegramBot = require('node-telegram-bot-api');
const { messageTypes } = require('node-telegram-bot-api/src/telegram');
const token = '5231154575:AAG4v6JkWf2BjKv5bAKTCzHF0aXBkFa7a9s';
const bot = new TelegramBot(token, {polling: true});

const CraleyAlertsID = -1001751936806

async function sendNotif(txt){
    bot.sendMessage(CraleyAlertsID, txt,{parse_mode: 'HTML'});
}
const outputURL = 'https://discord.com/api/webhooks/941814337436258325/rDKavTu3U_gUko7_xEMayuhl9ZY8gyKEahMbhdRDH2clmLsXZF3YVGmfmvGRio_MF-wi'
const callURL = 'https://discord.com/api/webhooks/941815905137070121/Pqn4R0mFzEe6WpDf91qk6_icBEMaRw425EsEn_ooDbQ_COeswupPLPapKugxbhi0yGG-'

async function discord(url,txt){
    axios
    .post(url, {
        "content": txt
      })
    .catch(error => {
        console.error(error)
    })
}
function getDate() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time
}

async function scrapeProduct(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    async function scrape(start){
        // Read the page
        await page.reload();
        var data = await page.evaluate(()=>{
            const tds = Array.from(document.querySelectorAll("table tr"))
            console.log()
            return tds.map(td=>td.innerText.split('\t'))
        })
        data = data.filter(function (a){
            return a.length > 2
        });
        const thisLoops = new Object();
        // Add any new incidnets
        for (var i = 0; i < data.length; i++) {
            const d = data[i]
            if(d[0]!="Incident Type"){
               const found = incidents[d.join('')]
               if (!found){
                incidents[d.join('')] = d
                console.log(`Adding Incident: ! box ${d[2]} ${d[3]} -- ${getDate()}`)
                discord(outputURL,`\`Adding Incident: ! box ${d[2]} ${d[3]}\` -- \`${getDate()}\` `)
                if (d[3].match('STRUCTURE') || d[3].match('ENTRAPMENT') || d[7].match('LOWER WINDSOR TWP') || d[7].match('EAST PROESPECT BORO')){
                   sendNotif(`<b>! box: ${d[2]}, ${d[3]}</b>\n${d[4]||d[5]}, ${d[7]}, cross streets: ${d[6]}, ${d[1]}`)
                }
                discord(callURL,`\`! box: ${d[2]} ${d[3]}, ${d[4]||d[5]}, ${d[7]}, cross streets: ${d[6]}\` -- \`WT: ${d[1]}\` -- \`ST: ${getDate()}\``)
               }               
               thisLoops[d.join('')] = d
            }
           
        }

        // Remove any extra incidents

        for (const property in incidents) {
            const d = incidents[property]
            const found = thisLoops[property]
            if (!found){
                incidents[property] = undefined
            }               
           
        }
        setTimeout(function(){scrape(Date.now())},1)
    }
    scrape(Date.now()) 
}
discord(outputURL,'Loading Server')
scrapeProduct('https://ycdes.org/webcad/Default.aspx')