// modified, streamlined its networking script
// remember to add trigger "on form submission"

const webhooks = [""];

// title: defaults to form title.
// thumbnailImage: link to image, must be jpeg/jpg/gif/png format. thumbnails are little images to the right of embeds, can be used for logos.
// shortDescription: MUST BE LESS THAN 2000 CHARACTER DISCORD EMBEDS LIMIT
// color: input hex color, defaults to random color
// mention: ping member or role by id, e.g. "<@!123456789123456789>"

const title = "", thumbnailImage = "", shortDescription = "", color = "", mention = "";

// ----------------------------------------------------------------------------------------------------

const form = FormApp.getActiveForm(), allResponses = form.getResponses();
let response, latestResponse = allResponses[allResponses.length - 1];
var items = []; // to contain questions/answers

// checks for a response, if not - throw error
try {
    response = latestResponse.getItemResponses()
} catch (error) {
    throw "No responses found in the form. :("
}

// check for valid webhook
for (const hook of webhooks) {
    // crazy regex. if this breaks it's joever.
    if (!/^(?:https?:\/\/)?(?:www\.)?(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-+]+$/i.test(hook)) throw `Webhook ${i + 1 || 1} is not valid.`;
}

// check for image url
if (thumbnailImage && !/\.(jpeg|jpg|gif|png)$/.test(thumbnailImage)) throw "Image URL is not a valid link. :(";


// loops through our response and fetches the questions/answers. then stores in the items array above.
for (var i = 0; i < response.length; i++) {
    const question = response[i].getItem().getTitle(), answer = response[i].getResponse();
    if (answer == "") continue;
    items.push({ "name": question, "value": answer });
    
    function data(item) {
        return [`**${item.name}**`, `${item.value}`].join("\n");
    }
}

if (items.map(data).toString().length + shortDescription.length > 1999) throw "Discord character limit reached. Add limits/guidelines to questions.";


function embedText(e) {

    // webhook embed construct, set up the correct formatting for sending to Discord.
    const embed = {
        "method": "post",
        "headers": { "Content-Type": "application/json" },
        "muteHttpExceptions": true,
        "payload": JSON.stringify({
            "content": mention ? mention : '',
            "embeds": [{
                "title": title ? title : form.getTitle(), // either the set title or the form title.
                "description": shortDescription ? `${shortDescription}\n\n${items.map(data).join('\n\n')}` : items.map(data).join('\n\n'), // either the desc or just the res.
                "thumbnail": { url: thumbnailImage ? encodeURI(thumbnailImage) : null }, // either provided image or n/a
                "color": color ? parseInt(color.substr(1), 16) : Math.floor(Math.random() * 16777215), // either the set color or random.
                "timestamp": new Date().toISOString() // today's date.
            }]
        }),
    };

    // loop through webhooks and send them to channels.
    for (var i = 0; i < webhooks.length; i++) { UrlFetchApp.fetch(webhooks[i], embed); };
}