var User = require('mongoose').model('User');
var Pet = require('mongoose').model('Pet');
var Follower = require('mongoose').model('Follower');
var Report = require('mongoose').model('Report');
var Config = require('mongoose').model('Config');
var line = require('node-line-bot-api');
var config = require('../../config/config');
var CronJob = require('cron').CronJob;

line.init({
    accessToken: config.accessToken,
    channelSecret: config.channelSecret
});
line.validator.validateSignature();

exports.webhook = function (req, res, next) {
    var promises = req.body.events.map(event => {
        if (event.type === 'message') {
            Follower.findOneAndUpdate({
                lineUserId: event.source.userId,
            }, {
                lineUserId: event.source.userId,
            }, {
                upsert: true,
                new: true
            }, function (err) {
                if (err) {
                    throw err;
                }
            });
            if (event.message.text.match(/^.* [0-9]{4}$/)) {
                var str = event.message.text.split(" ");
                var username = str[0];
                var verifyCode = str[1];
                User.findOne({
                        username: username,
                        verifyCode: verifyCode
                    }, 'username verifyCode lineStatus',
                    function (err, userverify) {
                        if (err) {
                            line.client
                                .replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        type: 'text',
                                        text: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่ภายหลัง'
                                    }]
                                });
                            // throw err;
                        } else if (userverify) {
                            if (userverify.lineStatus == "notActive") {
                                User.findOneAndUpdate({
                                    username: username
                                }, {
                                    lineUserId: event.source.userId,
                                    lineStatus: "active"
                                }, function (err) {
                                    if (err) {
                                        line.client
                                            .replyMessage({
                                                replyToken: event.replyToken,
                                                messages: [{
                                                    type: 'text',
                                                    text: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่ภายหลัง'
                                                }]
                                            });
                                        // throw err;
                                    } else {
                                        line.client
                                            .replyMessage({
                                                replyToken: event.replyToken,
                                                messages: [{
                                                    type: 'text',
                                                    text: 'ทำการยืนยันตัวตนสำหรับ ' + username + ' เรียบร้อยแล้ว'
                                                }]
                                            });
                                    }
                                });
                            } else {
                                line.client
                                    .replyMessage({
                                        replyToken: event.replyToken,
                                        messages: [{
                                            type: 'text',
                                            text: username + ' ได้ทำการยืนยันตัวตนก่อนหน้านี้แล้ว'
                                        }]
                                    });
                            }
                        } else if (!userverify) {
                            line.client
                                .replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        type: 'text',
                                        text: 'โปรดตรวจสอบ username และ verify code'
                                    }]
                                });
                        }
                    });
            }
            return Promise.resolve();
        } else if (event.type === 'follow') {
            User.findOneAndUpdate({
                lineUserId: event.source.userId
            }, {
                lineStatus: "active"
            }, function (err) {
                if (err) {
                    throw err;
                }
            });
            Follower.findOneAndUpdate({
                lineUserId: event.source.userId,
            }, {
                lineUserId: event.source.userId,
            }, {
                upsert: true,
                new: true
            }, function (err) {
                if (err) {
                    throw err;
                } else {
                    line.client
                        .replyMessage({
                            replyToken: event.replyToken,
                            messages: [{
                                    type: 'text',
                                    text: 'ยินดีต้อนรับเข้าสู่ Petbook'
                                },
                                {
                                    type: 'text',
                                    text: 'official line นี้เป็นแหล่งสำหรับกระจายข่าวสารข้อมูลสัตว์เลี้ยงและสำหรับยืนยันตัวตนกับทางเว็บไซต์'
                                },
                                {
                                    type: 'text',
                                    text: 'หากท่านทำการสมัครสมาชิกกับทางเว็บไซต์เรียบร้อยแล้วกรุณาทำการยืนยันตัวตนโดยการ พิมพ์ username เว้นวรรค แล้วตามด้วย verify code 5 หลัก ที่ได้มาจากเว็บไซต์  เช่น "petbookuser 12abc" '
                                }
                            ]
                        });
                }
            });
            return Promise.resolve();
        } else if (event.type === 'unfollow') {
            Follower.remove({
                lineUserId: event.source.userId
            }, function (err) {
                if (err) {
                    throw err;
                }
            });
            User.findOneAndUpdate({
                lineUserId: event.source.userId
            }, {
                lineStatus: "block"
            }, function (err) {
                if (err) {
                    throw err;
                }
            });
            return Promise.resolve();
        }
    });
    Promise
        .all(promises)
        .then(() => res.json({
            success: true
        }));
};

exports.pushmessage = function (lineUserId, message) {
    line.client
        .pushMessage({
            to: lineUserId,
            messages: [{
                "type": "text",
                "text": message
            }]
        });
};


Config.find({}, 'cronTime -_id', function (err, cronTime) {
    if (err) {
        throw err;
    } else {
        var ct = cronTime[0].cronTime;
        new CronJob({
            cronTime: ct,
            // cronTime: '45 * * * * *',
            onTick: function () {
                Follower.find({}, 'lineUserId -_id', function (err, lineId) {
                    if (err) {
                        throw err;
                    } else {
                        if (lineId.length > 0) {
                            new Promise((resolve, reject) => {
                                var l;
                                var lineUserIds = [];
                                for (l in lineId) {
                                    lineUserIds.push(lineId[l].lineUserId);
                                }
                                var today = new Date();
                                var dd = today.getDate();
                                var mm = today.getMonth() + 1; //January is 0!
                                var yyyy = today.getFullYear();
                                if (dd < 10) {
                                    dd = '0' + dd;
                                }

                                if (mm < 10) {
                                    mm = '0' + mm;
                                }
                                today = dd + '/' + mm + '/' + yyyy;
                                // console.log(today);
                                var link = 'http://petbookthai.herokuapp.com/lostpets/' + today;
                                var message = 'แจ้งข่าวสัตว์หายประจำวันที่ ' + today + '\n'  + link;
                                line.client
                                    .multicast({
                                        to: lineUserIds,
                                        messages: [{
                                            "type": "text",
                                            "text": message
                                        }]
                                    });
                            });
                        }
                    }
                });
            },
            start: true,
            timeZone: 'Asia/Bangkok'
        });
    }
});


// var cronTime = '00 00 10 * * *'; //every 10 am
// var cronTime = '15 * * * * *'; //every 1 minute

// var job = new CronJob({
//     cronTime: cronTime,
//     onTick: function () {
//         Follower.find({}, 'lineUserId -_id', function (err, lineId) {
//             if (err) {
//                 throw err;
//             } else {
//                 var l;
//                 var lineUserIds = [];
//                 for (l in lineId) {
//                     lineUserIds.push(lineId[l].lineUserId);
//                 }
//                 var fDate = new Date(Date.now());
//                 var sDate = new Date(fDate);
//                 sDate.setDate(fDate.getDate() - 1);
//                 Report.find({
//                     created: {
//                         '$gte': sDate,
//                         '$lt': fDate
//                     }
//                 }, function (err, reports) {
//                     if (err) {
//                         throw err;
//                     } else {
//                         if (reports.length > 0) {
//                             console.log(reports);
//                             for (var i in reports) {
//                                 var username = reports[i].username;
//                                 var petId = reports[i].petId;
//                                 var text = reports[i].message;
//                                 var first = "";
//                                 User.findOne({
//                                     username: username
//                                 }, 'firstName lastName email tel', function (err, petOwn) {
//                                     if (err) {
//                                         throw err;
//                                     } else {
//                                         Pet.findOne({
//                                             _id: petId
//                                         }, '-lostStatus -deleteFlag', function (err, petReported) {
//                                             if (err) {
//                                                 throw err;
//                                             } else {
//                                                 first = "แจ้งข่าวสัตว์หาย\nName : ";
//                                                 first = first + petReported.name;
//                                                 if (petReported.type != "null" && petReported.type) {
//                                                     first = first + "\n" + "Type : " + petReported.type;
//                                                 }
//                                                 if (petReported.gender != "null" && petReported.gender) {
//                                                     first = first + "\n" + "Gender : " + petReported.gender;
//                                                 }
//                                                 if (petReported.age != "null" && petReported.age) {
//                                                     first = first + "\n" + "Age : " + petReported.age;
//                                                 }
//                                                 if (petReported.remarkable != "null" && petReported.remarkable) {
//                                                     first = first + "\n" + "Remark : " + petReported.remarkable;
//                                                 }
//                                                 first = first + "\nรายละเอียด\n -" + text + "\n";
//                                                 first = first + "กรุณาติดต่อ\nName: "
//                                                 first = first + petOwn.firstName + " " + petOwn.lastName;
//                                                 if (petOwn.tel != "null" && petOwn.tel) {
//                                                     first = first + "\n" + "Tel : " + petOwn.tel;
//                                                 }
//                                                 if (petOwn.email != "null" && petOwn.email) {
//                                                     first = first + "\n" + "Email : " + petOwn.email;
//                                                 }
//                                                 new Promise((resolve, reject) => {
//                                                     line.client
//                                                         .multicast({
//                                                             to: lineUserIds,
//                                                             messages: [{
//                                                                 "type": "text",
//                                                                 "text": first
//                                                             }]
//                                                         });
//                                                 });
//                                             }
//                                         });
//                                     }
//                                 });
//                             }
//                         }
//                     }
//                 });
//             }
//         });
//     },
//     start: true,
//     timeZone: 'Asia/Bangkok'
// });