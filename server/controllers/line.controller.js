var User = require('mongoose').model('User');
var Follower = require('mongoose').model('Follower');
var line = require('node-line-bot-api');
var config = require('../../config/config');
var cron = require('node-cron');


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