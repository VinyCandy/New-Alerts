const puppeteer = require('puppeteer');
const axios = require('axios')

var incidents = new Object();


async function sendNotif(txt){
    axios
    .post('https://api.pushed.co/1/push', {
        app_key: 'eXMGd6tvRgmRXek183tU',
        app_secret: '2KkXMwqyL6SnJIztbm7gney2HqCp2Yuhn1LcDfoNzugqZGwB0kgaVl0ocNMgYLAQ',
        target_type: 'app',
        content: txt
    })
    .then(res => {
        console.log(`Notification Sent! statusCode: ${res.status}`)
    })
    .catch(error => {
        console.error(error)
    })
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
                   sendNotif(`! box: ${d[2]} ${d[3]}, ${d[4]||d[5]}, ${d[7]}, cross streets: ${d[6]} -- ${d[1]}`)
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