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
                            username: username;
                        }, 'lineUserId', function (err, thisUser) {
                            if (err) {
                                line.client
                                    .replyMessage({
                                        replyToken: event.replyToken,
                                        messages: [{
                                            type: 'text',
                                            text: 'not found' + username
                                        }]
                                    });
                            } else {
                                // if (thisUser.lineUserid) {
                                line.client
                                    .replyMessage({
                                        replyToken: event.replyToken,
                                        messages: [{
                                            type: 'text',
                                            text: username + "already in petbook."
                                        }]
                                    });
                            }
                        }
                    });
                // line.client
                //     .replyMessage({
                //         replyToken: event.replyToken,
                //         messages: [{
                //                 type: 'text',
                //                 text: username
                //             },
                //             {
                //                 type: 'text',
                //                 text: "Already in petbook."
                //             }
                //         ]
                //     });
            }
            return Promise.resolve();
        } else if (event.type === 'follow') {
            var follower = new Follower({
                lineUserid: event.source.userId
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
    });
Promise
    .all(promises)
    .then(() => res.json({
        success: true
    }));
};

exports.pushmessage = function (lineUserid, message) {
    line.client
        .pushMessage({
            to: lineUserid,
            message: [{
                "type": "text",
                "text": message
            }]
        });
};