const express = require("express");
const webpush = require("web-push");
const detaspace = require("deta");

const deta = detaspace.Deta();
const db = deta.Base("push-server");

const vapidDetails = {
  publicKey:
    "BCLibaj7-Fend3USLGEJnBG1PbXjgaU3KRum3gW3gGK1q-wRQUs5jPg3_ODDSeg_ZanQwsvufINlD5a3Ro4zF9o",
  privateKey: "zo3GGfukzNiTh5qoQkjtXURwCLaiHjPChdpB4xqGjaQ",
  subject: "mailto:test@email.com",
};

function sendNotifications(subscriptions) {
  // Create the notification content.
  const notification = JSON.stringify({
    title: "Hello, Notifications!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`,
    },
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails,
  };
  // Send a push message to each client specified in the subscriptions array.
  subscriptions.forEach((subscription) => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr(endpoint.length - 8, endpoint.length);
    webpush
      .sendNotification(subscription, notification, options)
      .then((result) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch((error) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/add-subscription", async (request, response) => {
  console.log(`Subscribing ${request.body.endpoint}`);
  const subscriptions = (await db.get("subscriptions")) || [];
  await db.put([...subscriptions.value, request.body], "subscriptions");
  response.sendStatus(200);
});

app.post("/remove-subscription", async (request, response) => {
  console.log(`Unsubscribing ${request.body.endpoint}`);
  const subscriptions = await db.get("subscriptions");
  const updatedSubscriptions = subscriptions.value.filter(
    (s) => s.endpoint !== request.body.endpoint
  );
  await db.put(updatedSubscriptions, "subscriptions");
  response.sendStatus(200);
});

app.post("/notify-me", async (request, response) => {
  console.log(`Notifying ${request.body.endpoint}`);
  const subscriptions = await db.get("subscriptions");
  const subscription = subscriptions.value.find(
    (s) => s.endpoint === request.body.endpoint
  );
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post("/notify-all", async (request, response) => {
  console.log("Notifying all subscribers");
  const subscriptions = await db.get("subscriptions");
  if (subscriptions.value.length > 0) {
    sendNotifications(subscriptions.value);
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 8080, async () => {
  console.log(`Listening on port ${listener.address().port}`);
});
