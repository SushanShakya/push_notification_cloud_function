const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config.functions);

var newData;


//  Here 'Subjects' is also a collection in firestore
exports.homeworkTrigger = functions.firestore.document('Subjects/{subjectId}').onUpdate(async (snapshot, context) => {
    if (snapshot.empty) {
        console.log("No Devices");
        return;
    }

    newData = snapshot.after.data();

    if (newData.start_time === "" && newData.end_time === "") {
        console.log('Its a new Day');
    } else {
        var tokens = [];


        // Here "Device Tokens" is a collection name
        const parentDeviceTokens = await admin.firestore().collection('Device Tokens').get();

        for (var token of parentDeviceTokens.docs) {
            tokens.push(token.data().token);
        }

        var payload = {
            notification: {
                title: 'Subject : ' + newData.Name,
                body: 'Homework is ' + newData.status
            },
            data: {
                message: 'Sample Message'
            }
        }

        try {
            const response = await admin.messaging().sendToDevice(tokens, payload);
            console.log('Notification send successfully');
        } catch (error) {
            console.log('Error sending notification');
        }

    }

});
