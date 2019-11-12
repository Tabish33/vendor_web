const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const json2csv = require("json2csv").parse;
const moment = require("moment");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

admin.initializeApp();
admin.firestore().settings({ timestampsInSnapshots: true });

var instance = new Razorpay({
  key_id: "rzp_live_oltt4ntJTzb2km",
  key_secret: "lCZhyPmsy7Mn3KxkMbb1dLmd"
});

const db = admin.firestore();
const fcm = admin.messaging();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

function formatOrder(order) {
  let order_items = order.order_items;
  let items = "";
  for (let i = 0; i < order_items.length; i++) {
    item = order_items[i];
    if (item.name) {
      items += item.name + ", ";
    } else {
      items += item.id + ", ";
    }
  }

  if (!order.type) {
    order.type = "dine_in";
  }

  order.items = items;

  return order;
}

function sendMail({ emails, data, opts, type, branch, date }) {
  let report = json2csv(data, opts);
  emails.forEach(email => {
    let send_report = email.send_report;
    if (send_report) {
      let email_address = email.email;

      var mailOptions = {
        from: `relllo <noreply@firebase.com>`,
        to: email_address,
        subject: `Daily Report for ${branch} Branch (${date})`,
        html: `Here's your daily report!`
      };

      mailOptions.attachments = [
        {
          filename: `${type} ${date}.csv`,
          content: report
        }
      ];

      mailTransport.sendMail(mailOptions).then(() => {
        console.log(type, " Mail sent to", email.email);
      });
    }
  });
}

async function getData({ branch, uid, date, type }) {
  let data = [];
  let ref = `businesses/${uid}/branches/${branch}/${type}`;

  let query_snapshot;
  if (type == "emails") {
    query_snapshot = await db.collection(ref).get();
  } else {
    query_snapshot = await db
      .collection(ref)
      .where("date", "==", date)
      .get();
  }

  let count = 1;
  query_snapshot.forEach(doc => {
    let item = doc.data();
    if (type.includes("order")) formatOrder(item);
    item.id = count;
    data.push(item);
    count++;
  });

  return data;
}

function generateOrdersReport(orders) {
  if (orders.length > 0) {
    const fields = [
      "id",
      "items",
      "bill",
      "cover",
      "cover_per_person",
      "customer_name",
      "employee_name",
      "payment_mode",
      "discount",
      "floor",
      "section",
      "time",
      "type"
    ];
    const opts = { fields };
    return opts;
  }

  return false;
}

function generateExpensesReport(expenses) {
  if (expenses.length > 0) {
    const fields = ["id", "reason", "amount"];
    const opts = { fields };
    return opts;
  }
  return false;
}

function generateCollectionsReport(orders, expenses) {
  let collections = {
    total_sale: 0,
    cash: 0,
    card: 0,
    credit: 0,
    mobile_wallets: 0,
    total_expenses: 0,
    tax_incurred: 0
  };

  orders.forEach(order => {
    let payment_mode = order.payment_mode.toLowerCase();
    let amount = order.bill;
    let tax_amount = order.tax_amount;

    if (payment_mode.includes("unpaid")) {
      collections.credit += amount;
    } //
    else {
      collections.total_sale += amount;
      collections.tax_incurred += tax_amount;

      if (payment_mode.includes("cash")) {
        collections.cash += amount;
      } else if (payment_mode.includes("card")) {
        collections.card += amount;
      } else if (payment_mode.includes("multiple")) {
        for (let mode in order.multiple_payments) {
          let amount = order.multiple_payments[mode];

          if (mode.includes("cash")) {
            collections.cash += amount;
          } else if (mode.includes("card")) {
            collections.card += amount;
          } else {
            collections.mobile_wallets += amount;
          }
        }
      } else {
        collections.mobile_wallets += amount;
      }
    }
  });

  expenses.forEach(expense => {
    collections.total_expenses += expense.amount;
  });

  if (orders.length > 0 || expenses.length > 0) {
    const fields = [
      "total_sale",
      "cash",
      "card",
      "credit",
      "mobile_wallets",
      "total_expenses",
      "tax_incurred"
    ];
    const opts = { fields };
    return [collections, opts];
  }
  return [false, false];
}

function generateDiscountedOrdersReport(orders) {
  let count = 1;
  let discounted_orders = orders.filter(order => {
    if (order.discount > 0) {
      order.id = count;
      count++;
      return true;
    }
    return false;
  });

  if (discounted_orders.length > 0) {
    const fields = [
      "id",
      "items",
      "discount",
      "discount_amount",
      "bill",
      "cover",
      "cover_per_person",
      "customer_name",
      "employee_name",
      "payment_mode",
      "floor",
      "section",
      "time",
      "type"
    ];
    const opts = { fields };
    return [discounted_orders, opts];
  }
  return [false, false];
}

function generateVoidOrdersReport(void_orders) {
  if (void_orders.length > 0) {
    const fields = [
      "id",
      "void_reason",
      "order_items",
      "bill",
      "cover",
      "customer_name",
      "employee_name",
      "floor",
      "section",
      "time",
      "type"
    ];
    const opts = { fields };
    return opts;
  }

  return false;
}

function generateInventoryConsumptionReport(orders) {
  let inventory_consumption = {};

  orders.forEach(order => {
    let order_items = order.order_items;
    order_items.forEach(item => {
      let recipie = item.recipie;
      if (recipie) {
        recipie.forEach(recipie_item => {
          let name = recipie_item.name;
          let id = recipie_item.id;
          if (!inventory_consumption[id]) {
            inventory_consumption[id] = {};
          }

          let ordered_qty = item.qty;
          let qty_unit = recipie_item.qty_unit;
          let qty = recipie_item.qty;

          if (!inventory_consumption[id].name) {
            inventory_consumption[id].name = name;
            inventory_consumption[id].qty_consumed = qty * ordered_qty;
            inventory_consumption[id].unit = qty_unit;
          } else {
            inventory_consumption[id].qty_consumed += qty * ordered_qty;
          }
        });
      }
    });
  });

  let consumption_array = Object.values(inventory_consumption);

  if (consumption_array.length > 0) {
    const fields = ["name", "qty_consumed", "unit"];
    const opts = { fields };
    return [consumption_array, opts];
  }
  return [false, false];
}

exports.generateDailyReports = functions.https.onCall(
  async ({ branch, uid, date }, context) => {
    // FETCH DATA
    let emails = await getData({ branch, uid, type: "emails" });
    if (emails.length == 0) return { status: "No Emails Found" };

    // ORDER HISTORY
    let orders = await getData({ branch, uid, date, type: "orders" });
    let orders_opts = generateOrdersReport(orders);
    if (orders_opts)
      sendMail({
        emails,
        data: orders,
        opts: orders_opts,
        type: "Order History",
        branch,
        date
      });
    // EXPENSES
    let expenses = await getData({ branch, uid, date, type: "expenses" });
    let expenses_opts = generateExpensesReport(expenses);
    if (expenses_opts)
      sendMail({
        emails,
        data: expenses,
        opts: expenses_opts,
        type: "Expenses",
        branch,
        date
      });
    // COLLECTIONS
    let collections = generateCollectionsReport(orders, expenses);
    if (collections[1])
      sendMail({
        emails,
        data: collections[0],
        opts: collections[1],
        type: "Collections",
        branch,
        date
      });
    // DISCOUNTED ORDERS
    let discounted_orders = generateDiscountedOrdersReport(orders);
    if (discounted_orders[1])
      sendMail({
        emails,
        data: discounted_orders[0],
        opts: discounted_orders[1],
        type: "Dicounted Orders",
        branch,
        date
      });
    // INVENTORY CONSUMPTION
    let inventory_arr = generateInventoryConsumptionReport(orders);
    if (inventory_arr[0])
      sendMail({
        emails,
        data: inventory_arr[0],
        opts: inventory_arr[1],
        type: "Inventory Consumption",
        branch,
        date
      });
    // VOID ORDERS
    let void_orders = await getData({ branch, uid, date, type: "void_orders" });
    let void_orders_opts = generateVoidOrdersReport(void_orders);
    if (expenses_opts)
      sendMail({
        emails,
        data: void_orders,
        opts: void_orders_opts,
        type: "Void Orders",
        branch,
        date
      });   
    
    generateAnalytics({ branch, uid, date,orders });  
    return { status: "Mail Sent" };
  }
);

function generateAnalytics({ branch, uid, date, orders }){ 
  let most_selling_items = generateMostSellingItems(orders);
  console.log(most_selling_items);
  let time_distribuition =  generateTimeDistribution(orders);
  console.log(time_distribuition);
  let ref = `businesses/${uid}/branches/${branch}/analytics/${date}`
  
  db.collection(`businesses/${uid}/branches/${branch}/analytics`).doc(date).set({date});

  for(let id in most_selling_items){
    db.collection(`${ref}/most_selling_items`).doc(id.toString()).set(most_selling_items[id])
  }
  db.collection(`${ref}/customer_visit_times`).doc().set(time_distribuition)

  return { status: "Done" };
}

function generateMostSellingItems(orders){
  let items = {};
  orders.forEach(order=>{
    order.order_items.forEach(item=>{
      if (items[item.id]){
        items[item.id].qty += item.qty;
      } 
      else{
        items[item.id] = {"name": item.name, "qty":item.qty,"id": item.id }
      } 
    })
  });

  let items_list = Object.values(items);
  items_list = items_list.sort((a,b)=>{return b.qty-a.qty})
  items_list = items_list.slice(0, Math.min(6, items_list.length))

  let new_items  = {}
  items_list.forEach(item=>{
    new_items[item.id] = item;
  })

  return new_items;
}

function generateTimeDistribution(orders){
  let times = { "12:00 pm": 0, "01:00 pm": 0, "02:00 pm": 0, "03:00 pm": 0, "04:00 pm": 0,
    "05:00 pm": 0, "06:00 pm": 0, "07:00 pm": 0, "08:00 pm": 0, "09:00 pm": 0, "10:00 pm": 0,
    "11:00 pm": 0, "12:00 am": 0, "01:00 am": 0}
  orders.forEach(order=>{
    let time = order.time.toLowerCase();
    if(!time.length < 8) time = '0'+time;
    let new_time = time[0]+time[1]+time[2] + '00' + time[5]+time[6]+time[7];
    times[new_time] +=1; 
  }) 

  return times;  
}

async function sendVoidOrderNotification(uid, branch, reason) {
  let snap = await admin
    .database()
    .ref(`businesses/${uid}/branches/${branch}/tokens`)
    .once("value");

  let tokens = snap.val();
  console.log("tokens", tokens);

  if (tokens) {
    for (let token in tokens) {
      const payload = (admin.messaging.MessagingPayload = {
        notification: {
          title: `Void Order`,
          body: `${reason}`,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
      });

      fcm.sendToDevice(token, payload);
    }

    return;
  }
}

exports.voidOrder = functions.firestore
  .document("businesses/{uid}/branches/{branch}/void_orders/{document}")
  .onCreate(async (snap, context) => {
    let order = snap.data();
    let uid = context.params.uid;
    let branch = context.params.branch;
    let reason = order.void_reason;

    await sendVoidOrderNotification(uid, branch, reason);
    return 1;
  });

async function sendLowInventoryNotification(uid, branch, name) {
  let snap = await admin
    .database()
    .ref(`businesses/${uid}/branches/${branch}/tokens`)
    .once("value");

  let tokens = snap.val();

  if (tokens) {
    for (let token in tokens) {
      const payload = (admin.messaging.MessagingPayload = {
        notification: {
          title: `${name}  is running low!`,
          body: `Click to re-order`,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
      });

      fcm.sendToDevice(token, payload);
    }
    return;
  }
}

exports.updateInventory = functions.firestore
  .document("businesses/{uid}/branches/{branch}/orders/{document}")
  .onCreate(async (snap, context) => {
    let order_items = snap.data().order_items;
    let uid = context.params.uid;
    let branch = context.params.branch;

    for (let i = 0; i < order_items.length; i++) {
      const recipie = order_items[i].recipie;
      for (let j = 0; j < recipie.length; j++) {
        const recipe_item = recipie[j];
        let doc = await db
          .collection(`businesses/${uid}/branches/${branch}/inventory`)
          .doc(`${recipe_item.id}`)
          .get();

        let inventory_item = doc.data();
        if (inventory_item.qty_left && inventory_item.qty_unit) {
          if (recipe_item.qty_unit == inventory_item.qty_unit) {
            inventory_item.qty_left -= recipe_item.qty * order_items[i].qty;
          } else {
            inventory_item.qty_left -=
              (recipe_item.qty / 1000) * order_items[i].qty;
          }

          inventory_item.qty_left = parseFloat(
            parseFloat(inventory_item.qty_left).toFixed(2)
          );

          db.collection(`businesses/${uid}/branches/${branch}/inventory`)
            .doc(`${inventory_item.id}`)
            .set(inventory_item);

          if (inventory_item.qty_left <= inventory_item.qty_threshold) {
            await sendLowInventoryNotification(
              uid,
              branch,
              inventory_item.name
            );
          }
        }
      }
    }

    return 1;
  });

async function sendPrepaidOrderNotification(uid, name) {
  let ref = `customers/${uid}/tokens`;
  let query_snapshot = await db.collection(ref).get();

  query_snapshot.forEach(doc => {
    let token = doc.id;
    const payload = (admin.messaging.MessagingPayload = {
      notification: {
        title: `${name} Placed!`,
        // body: `Click to re-order`,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      }
    });

    fcm.sendToDevice(token, payload);
  });
}

exports.prepaidOrder = functions.firestore
  .document("customers/{uid}/pre_orders/{document}")
  .onCreate(async (snap, context) => {
    let order = snap.data();
    let uid = context.params.uid;
    await sendPrepaidOrderNotification(uid, order.name);
  });

exports.getOrderId = functions.https.onCall(async (options, context) => {
  let order = await instance.orders.create(options);
  console.log(order);
  return order;
});


async function sendRestroOrderNotification(uid, order) {
  let ref = `Restaurants/${uid}/tokens`;
  let query_snapshot = await db.collection(ref).get();

  query_snapshot.forEach(doc => {
    let token = doc.id;
    const payload = (admin.messaging.MessagingPayload = {
      notification: {
        title: `Payment Confimed for Rs ${order["total_bill"]}`,
        body: "Click to view order",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      data: { "order_id": order["order_id"].toString() },
    });

    fcm.sendToDevice(token, payload);
  });
}

exports.restroOrderUpdate = functions.firestore
  .document("customer_app/general/orders/{document}")
  .onUpdate(async (change, context) => {
    let order = change.after.data();
    if (order["payment"] == true) {
      await sendRestroOrderNotification(order["res_id"], order);
    }
    
  });

async function sendNewRestroOrderNotification(uid, order) {
  let ref = `Restaurants/${uid}/tokens`;
  let query_snapshot = await db.collection(ref).get();

  query_snapshot.forEach(doc => {
    let token = doc.id;
    const payload = (admin.messaging.MessagingPayload = {
      notification: {
        title: `New Order for Rs ${order["total_bill"]}`,
        body: "Accept within 60 seconds",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      data: { "order_id": order["order_id"].toString() },
    });

    fcm.sendToDevice(token, payload);
  });
}

exports.newRestroOrder = functions.firestore
  .document("customer_app/general/orders/{document}")
  .onCreate(async (snap, context) => {
    let order = snap.data();
    await sendNewRestroOrderNotification(order["res_id"], order);
  });