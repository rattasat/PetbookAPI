var User = require('mongoose').model('User');
var Follower = require('mongoose').model('Follower');
var Config = require('mongoose').model('Config');
var line = require('node-line-bot-api');
var config = require('../../config/config');
var CronJob = require('cron').CronJob;
var async = require('async');

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
            if (event.message.text.match(/^.* [A-Za-z0-9]{5}$/)) {
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
                        } else if (userverify) {
                            if (userverify.lineStatus == "not active") {
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
}

new CronJob({
    cronTime: '*/20 * * * *',
    onTick: async function () {
        var config = await Config.findOne({}, 'cronTime');
        console.log(config.cronTime);
        startNoti(config.cronTime);
    },
    start: true,
    timeZone: 'Asia/Bangkok'
});

function startNoti(cronTime) {
    new CronJob({
        cronTime: cronTime,
        onTick: async function () {
            var followers = await Follower.find({}, 'lineUserId -_id');
            if (followers.length > 0) {
                var lineUserIds = [];
                for (var i in followers) {
                    lineUserIds.push(followers[i].lineUserId);
                }
                var today = new Date();
                var dd = today.getDate() - 1;
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                today = dd + '/' + mm + '/' + yyyy;
                var link = 'http://petbookthaiapi.herokuapp.com/lostpets/' + today;
                var message = 'แจ้งข่าวสัตว์หายประจำวันที่ ' + today + '\n' + link;
                line.client
                    .multicast({
                        to: lineUserIds,
                        messages: [{
                            "type": "text",
                            "text": message
                        }]
                    });
            }
        },
        start: true,
        timeZone: 'Asia/Bangkok'
    });
}