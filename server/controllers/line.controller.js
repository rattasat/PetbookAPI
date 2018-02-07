var User = require('mongoose').model('User');
var Follower = require('mongoose').model('Follower');
var line = require('node-line-bot-api');
var config = require('../../config/config');


line.init({
    accessToken: config.accessToken,
    channelSecret: config.channelSecret
});
line.validator.validateSignature();

exports.webhook = function (req, res, next) {
    var promises = req.body.events.map(event => {
        if (event.type === 'message') {
            if (event.message.text.match(/^.* confirm$/)) {
                var str = event.message.text.split(" ");
                var username = str[0];
                User.findOne({
                        username: username
                    }, 'username lineUserId',
                    function (err, thisUser) {
                        if (err) {
                            throw err;
                        } else {
                            if (!thisUser) {
                                line.client
                                    .replyMessage({
                                        replyToken: event.replyToken,
                                        messages: [{
                                            type: 'text',
                                            text: 'ไม่พบ ' + username
                                        }]
                                    });
                            } else {
                                if (thisUser.lineUserId != "null") {
                                    line.client
                                        .replyMessage({
                                            replyToken: event.replyToken,
                                            messages: [{
                                                type: 'text',
                                                text: username + ' ได้ทำการยืนยันตัวตนก่อนหน้านี้แล้ว'
                                            }]
                                        });
                                } else {
                                    User.findOneAndUpdate({
                                        username: username
                                    }, {
                                        lineUserId: event.source.userId
                                    }, function (err) {
                                        if (err) {
                                            throw err;
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
                                }
                            }
                        }
                    });
            }
            return Promise.resolve();
        } else if (event.type === 'follow') {
            var follower = new Follower({
                lineUserId: event.source.userId
            });
            follower.save(function (err) {
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
                                    text: 'หากท่านทำการสมัครสมาชิกกับทางเว็บไซต์เรียบร้อยแล้วกรุณาทำการยืนยันตัวตนโดยการ พิมพ์ username เว้นวรรค แลัวตามด้วย confirm เช่น "petbook confirm" '
                                }
                            ]
                        });
                }
            });
            return Promise.resolve();
        }
        // else if (event.type === 'unfollow') {
        //     Follower.remove({
        //         lineUserId: event.source.userId
        //     }, function (err) {
        //         throw err;
        //     });
        //     User.findOneAndUpdate({
        //         lineUserId: event.source.userId
        //     }, {
        //         lineUserId: "null"
        //     }, function (err) {
        //         throw err;
        //     });
        //     return Promise.resolve();
        // }
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