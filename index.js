const StockXData = require("stockx-data");
const fetch = require('node-fetch')
const stockX = new StockXData();
const  secrets = require("./secrets.json")

// Format for key:val is query:{size entries}
// Size entries are size:target
// Leave val to be target price if no size specified
let queries = {
    "yeezy foam rnnr stone sage":{9:200, 13:200}
}

const webhook = secrets["WEBHOOK"];

async function getStockXPrices() {
    for (const [key, val] of Object.entries(queries)) {
        stockX.searchProducts(key).then((queryResults) => {
            stockX.fetchProductDetails(queryResults[0]).then((productResults) => {
                if (typeof(val) == "number") {

                } else if (Object.keys(val).length != 0) {
                    for (const [size, target] of Object.entries(val)) {
                        try {
                            stockX.fetchProductDetails(productResults.sizeMap[size.toString()]).then((sizeDetails) => {
                                console.log(sizeDetails)
                                if (sizeDetails.market["lastSale"] > target) {
                                    console.log(`Target price met for size ${size}`);
                                    let sourceURL = `https://stockx.com/${sizeDetails.market.productUuid}?size=${size}`
                                    const formattedData = `[Link To StockX](${sourceURL})\n`
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
                                        "description":formattedData
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
                            console.log("ERROR: Fetching size details")
                        }
                        
                    }
                } else { // No sizes specified

                }
            })
        })
    }
}
getStockXPrices()

// setInterval(() => getStockXPrices(), 5000);

