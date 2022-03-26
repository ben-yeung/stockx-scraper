const StockXData = require("stockx-data");
const fetch = require('node-fetch')
const stockX = new StockXData();
const  secrets = require("./secrets.json")

// Format for key:val is query:{size entries}
// Size entries are size:target
// Target price is evaluted on lowest ask
// Leave val to be target price if no size specified
let queries = {
    "yeezy foam rnnr stone sage":{9:200, 13:200}
}

const webhook = secrets["WEBHOOK"];

async function getStockXPrices() {
    for (const [key, val] of Object.entries(queries)) {
        try {
            stockX.searchProducts(key).then((queryResults) => {
                stockX.fetchProductDetails(queryResults[0]).then((productResults) => {
                    console.log(`Scraping ${productResults["name"]}`)
                    if (typeof(val) == "number") {
                        if (productResults.market["lowestAsk"] >= val) {
                            let sourceURL = `https://stockx.com/${productResults.market.productUuid}`;
                            const formattedData = `[Link To StockX](${sourceURL})\n`;
                            const timestamp = new Date().toISOString();
                            embed = {
                                "title":"**" + productResults["name"] + "**",
                                "color":25408,
                                "thumbnail":{
                                    "url":productResults["image"]
                                },
                                "fields": [
                                    {
                                        "name":"Target Price",
                                        "value":`$${val}`,
                                        "inline":true
                                    },
                                    {
                                        "name":"Lowest Ask",
                                        "value":`$${productResults.market["lowestAsk"]}`,
                                        "inline":true
                                    },
                                    {
                                        "name":"Last Sale",
                                        "value":`$${productResults.market["lastSale"]}`,
                                        "inline":true
                                    },
                                ],
                                "description":formattedData,
                                "timestamp":timestamp
                            }
                
                            fetch(webhook, {
                                "method":"POST",
                                "headers": {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    "username":"StockX Scraper",
                                    "embeds":[embed],
                                    "avatar_url":"https://pbs.twimg.com/profile_images/1382744393594064901/_s7Up6o__400x400.jpg"
                                })
                            })
                        }
    
                    } else if (Object.keys(val).length != 0) {
                        for (const [size, target] of Object.entries(val)) {
                            try {
                                stockX.fetchProductDetails(productResults.sizeMap[size.toString()]).then((sizeDetails) => {
                                    // console.log(sizeDetails)
                                    if (sizeDetails.market["lowestAsk"] >= target ) {
                                        let sourceURL = `https://stockx.com/${sizeDetails.market.productUuid}?size=${size}`;
                                        const formattedData = `[Link To StockX](${sourceURL})\n`;
                                        const timestamp = new Date().toISOString();
                                        embed = {
                                            "title":"**Size " + size + " | " + sizeDetails["name"] + "**",
                                            "color":25408,
                                            "thumbnail":{
                                                "url":sizeDetails["image"]
                                            },
                                            "fields": [
                                                {
                                                    "name":"Target Price",
                                                    "value":`$${target}`,
                                                    "inline":true
                                                },
                                                {
                                                    "name":"Lowest Ask",
                                                    "value":`$${sizeDetails.market["lowestAsk"]}`,
                                                    "inline":true
                                                },
                                                {
                                                    "name":"Last Sale",
                                                    "value":`$${sizeDetails.market["lastSale"]}`,
                                                    "inline":true
                                                },
                                            ],
                                            "description":formattedData,
                                            "timestamp":timestamp
                                        }
                            
                                        fetch(webhook, {
                                            "method":"POST",
                                            "headers": {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                "username":"StockX Scraper",
                                                "embeds":[embed],
                                                "avatar_url":"https://pbs.twimg.com/profile_images/1382744393594064901/_s7Up6o__400x400.jpg"
                                            })
                                        })
                                    }
                                })
                            } catch (e) {
                                console.log("ERROR: Fetching size details");
                            }
                            
                        }
                    } else { // Error check for invalid input
                        console.log("ERROR parsing inputted query");
                    }
                })
            })
        } catch (e) {
            console.log("ERROR fetching product double check queries object.");
        }
        
    }
}

getStockXPrices()
setInterval(() => getStockXPrices(), 30 * 60000);

