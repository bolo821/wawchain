const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/config');
const { CLIENT_ORIGIN } = require('../config/config');
const crypto = require('../crypto');

const mongoose = require('mongoose');
const User = mongoose.model('User');

const sendEmail = require('../models/sendMail');
const creditManager = require('./creditManager');

router.post('/signup', (req, res) => {
  User.find({ email: req.body.email }).then(user => {
    if (user.length) {
      res.json({
        success: false,
        msg: 'Email already exists.',
      });
    } else {
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        verified: false
      };
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          let userInstance = new User(newUser);
          userInstance.save().then(nuser => {

            const content = {
              Subject: "Confirm Email",
              // HTMLPart: `<a href="${CLIENT_ORIGIN}/verify/${nuser._id}">Click here to confirm email</a>`,
              HTMLPart: getMailHtml(`${CLIENT_ORIGIN}/verify/${nuser._id}`, 'Confirm your email'),
              TextPart: "Copy and paste this link: " + CLIENT_ORIGIN + "/confirm/" + nuser._id,
              CustomID: "CustomID"
            }
            sendEmail(req.body.email, content).then(()=>{
              res.json({
                success: true,
              });
            }).catch(err => {
              console.log('sending email error: ', err);
              res.json({
                success: false,
                msg: 'Internal server error.',
              })
            })

          }).catch(err => {
            console.log('error: ', err);
            res.json({
              success: false,
              msg: 'Internal server error.',
            });
          })
        });
      });
    }
  });
});

router.post('/signin', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.find({ email: email }).then(user => {
    if (!user.length) {
      res.json({
        success: false,
        msg: 'There is no such user.',
      });
      return;
    }
    let userr = user[0];
    if(!userr.verified){
      res.json({
        success: false,
        msg: "Please verify your email.",
      });
      return;
    }

    bcrypt.compare(password, userr.password).then(isMatch => {
      if (isMatch) {
        const payload = { 
          _id: userr._id,
          name: userr.name,
          email: userr.email,
          verified: userr.verified,
          credits: userr.credits,
          rank: userr.rank,
        };
        jwt.sign(
          payload,
          keys.SECRET_KEY,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            });
          }
        );
      } else {
        res.json({
          success: false,
          msg: 'Passwrod incorrect.',
        });
      }
    });
  }).catch(err => {
    console.log('error: ', err);
    res.json({
      success: false,
      msg: 'Internal server error.',
    })
  })
});

router.post('/signinWithSavedData', (req, res) => {
  const email = req.body.email;
  User.find({ email: email }).then(user => {
    if (!user.length) {
      res.json({
        success: false,
        msg: 'There is no such user.',
      });
      return;
    }
    let userr = user[0];
    if(!userr.verified) {
      res.json({
        success: false,
        msg: "Please verify your email.",
      });
      return;
    } else {
      res.json({
        success: true,
        msg: "Logged in with saved data.",
        credits: userr.credits,
      })
    }
  });
});

router.post('/verifyEmail', (req, res) => {
  const userId = req.body.userId;
  User.findOneAndUpdate({_id: userId}, {$set:{verified: true}}, function(err, doc) {
    if(err){
        console.log("error: ", err);
        res.json({
          success: false,
          msg: 'Internal server error.',
        });
        return;
    } else {
      res.json({
        success: true,
      })
    }
    
  });
});

router.post('/forgotPassword', (req, res) => {
  User.find({ email: req.body.email }).then(user => {
    if (!user.length) {
      res.json({
        success: false,
        msg: 'There is no such user.',
      });
    } else {
      if(!user[0].verified) {
        res.json({
          success: false,
          msg: 'Please confirm your email.',
        });
        return;
      }
      let nuser = user[0];

      User.findOneAndUpdate({_id: nuser._id}, {$set: { resetpass: true }}, function(err, doc) {
        if(err) {
          res.json({
            success: false,
            msg: 'Internal server error.'
          });
        } else {
          const content = {
            Subject: "Forgot Password",
            HTMLPart: getMailHtml(`${CLIENT_ORIGIN}/resetpass/${JSON.stringify(crypto.encrypt(nuser._id.toString()))}`, 'Reset your password'),
            TextPart: "Copy and paste this link: " + CLIENT_ORIGIN + "/resetpass/" + nuser._id,
            CustomID: "CustomID"
          }
          sendEmail(req.body.email, content).then(()=>{
            res.json({
              success: true,
            });
          }).catch(err => {
            console.log('sending email error: ', err);
            res.json({
              success: false,
              msg: 'Internal server error.',
            })
          });         
        }
      });
    }
  });
});

router.post('/resetPassword', (req, res) => {
  let userId = crypto.decrypt(JSON.parse(req.body.userId));
  userId = parseInt(userId);
  User.find({_id: userId}).then(function(user) {
    if(!user.length){
        res.json({
          success: false,
          msg: 'No such user.',
        });
        return;
    } else if (!user[0].resetpass) {
      res.json({
        success: false,
        msg: 'Please send us your email to reset password.',
      });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;
          User.findOneAndUpdate({_id: userId}, {$set: { password: hash, resetpass: false }}, function(err, doc) {
            if(err) {
              res.json({
                success: false,
                msg: 'Internal server error.'
              });
            } else {
              res.json({
                success: true,
              });
            }
          });
        });
      });
    }
  });
});

function getMailHtml(url, btnTxt) {
  return `
  <!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title>Team</title><!--[if !mso]><!-- --><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding:0; }
          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
          p { display:block;margin:13px 0; }</style><!--[if mso]>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]--><!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix { width:100% !important; }
        </style>
        <![endif]--><style type="text/css">@media only screen and (min-width:480px) {
        .mj-column-per-100 { width:100% !important; max-width: 100%; }
.mj-column-per-50 { width:50% !important; max-width: 50%; }
      }</style><style type="text/css">[owa] .mj-column-per-100 { width:100% !important; max-width: 100%; }
[owa] .mj-column-per-50 { width:50% !important; max-width: 50%; }</style><style type="text/css">@media only screen and (max-width:480px) {
      table.mj-full-width-mobile { width: 100% !important; }
      td.mj-full-width-mobile { width: auto !important; }
    }</style></head><body style="background-color:#1e1e1e;"><div style="background-color:#1e1e1e;"><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#000000;background-color:#000000;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#000000;background-color:#000000;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:10px;padding-top:10px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;"><div style="font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;"><h1 class="text-build-content" style="text-align:center;; margin-top: 10px; margin-bottom: 10px; font-weight: normal;" data-testid="DCfpdXNI1nl"><span style="color:#ffffff;"><b>WaWChain Team</b></span></h1></div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><v:rect style="width:600px;" xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"><v:fill origin="0.5, 0" position="0.5, 0" src="http://191n.mj.am/tplimg/191n/b/0350/qu6x.png" color="#161616" type="tile" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0"><![endif]--><div style="background:#161616 url(http://191n.mj.am/tplimg/191n/b/0350/qu6x.png) top center / 100% 100% no-repeat;margin:0px auto;max-width:600px;"><div style="line-height:0;font-size:0;"><table align="center" background="http://191n.mj.am/tplimg/191n/b/0350/qu6x.png" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#161616 url(http://0whkl.mjt.lu/tplimg/0whkl/b/shooo/6wvt.jpeg) top center / 100% 100% no-repeat;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:125px 0px 150px 0px;padding-bottom:150px;padding-left:0px;padding-right:0px;padding-top:125px;;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div></div><!--[if mso | IE]></v:textbox></v:rect></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#000000;background-color:#000000;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#000000;background-color:#000000;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:5px;padding-top:10px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#000000;background-color:#000000;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#000000;background-color:#000000;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:10px;padding-top:10px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"><tr><td align="center" bgcolor="#C12727" role="presentation" style="border:none;border-radius:1px;cursor:auto;mso-padding-alt:10px 25px;background:#C12727;" valign="middle"><a href="${url}" style="display:inline-block;background:#C12727;color:#ffffff;font-family:Arial, sans-serif;font-size:35px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:1px;" target="_blank"><span style="font-size:35px;"><b>${btnTxt}</b></span></a></td></tr></table></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#161615;background-color:#161615;margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#161615;background-color:#161615;width:100%;"><tbody><tr><td style="border:0px solid #ffffff;direction:ltr;font-size:0px;padding:20px 0px 20px 0px;padding-left:0px;padding-right:0px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:300px;" ><![endif]--><div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%"><tr><td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;"><div style="font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;"><p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="line-height:22px;font-size:18px;font-family:Arial;color:#ffffff;text-align:center;">Contact us</span></p></div></td></tr><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:32px;"><a href="https://www.example.com" target="_blank"><img alt="" height="auto" src="http://191n.mj.am/tplimg/191n/b/0350/qu63.png" style="border:none;border-radius:px;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="32"></a></td></tr></tbody></table></td></tr></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:middle;width:300px;" ><![endif]--><div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%"><tr><td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;"><div style="font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;"><p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="line-height:22px;font-size:18px;font-family:Arial;color:#ffffff;text-align:center;">Follow us</span></p></div></td></tr><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tr><td style="padding:4px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#3B5998;border-radius:3px;width:20px;"><tr><td style="font-size:0;height:20px;vertical-align:middle;width:20px;"><a href="https://www.facebook.com/sharer/sharer.php?u=[[SHORT_PERMALINK]]" target="_blank"><img height="20" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/facebook.png" style="border-radius:3px;display:block;" width="20"></a></td></tr></table></td></tr></table><!--[if mso | IE]></td><td><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tr><td style="padding:4px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#1DA1F2;border-radius:3px;width:20px;"><tr><td style="font-size:0;height:20px;vertical-align:middle;width:20px;"><a href="https://twitter.com/home?status=[[SHORT_PERMALINK]]" target="_blank"><img height="20" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/twitter.png" style="border-radius:3px;display:block;" width="20"></a></td></tr></table></td></tr></table><!--[if mso | IE]></td><td><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tr><td style="padding:4px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#DD4B39;border-radius:3px;width:20px;"><tr><td style="font-size:0;height:20px;vertical-align:middle;width:20px;"><img height="20" src="https://www.mailjet.com/images/theme/v1/icons/ico-social/google-plus.png" style="border-radius:3px;display:block;" width="20"></td></tr></table></td></tr></table><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="left" style="font-size:0px;padding:0px 20px 0px 20px;padding-top:0px;padding-bottom:0px;word-break:break-word;"><div style="font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;"><p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="font-size:16px;text-align:center;color:#4e5762;font-family:Arial;line-height:22px;">This e-mail has been sent to [[EMAIL_TO]], <a href="[[UNSUB_LINK_EN]]" style="color:inherit;text-decoration:none;" target="_blank">click here to unsubscribe</a>.</span></p></div></td></tr><tr><td align="left" style="font-size:0px;padding:0px 20px 0px 20px;padding-top:0px;padding-bottom:0px;word-break:break-word;"><div style="font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;"><p style="text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;"><span style="font-size:16px;text-align:center;color:#4e5762;font-family:Arial;line-height:22px;">   CA</span></p></div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>
  `
}

router.post('/withdrawCreditForGame', (req, res) => {
  const userId = req.body.userId;
  User.find({_id: userId}).then(function(user) {
    if(!user.length){
        res.json({
          success: false,
          msg: 'No such user.',
        });
        return;
    } else {
      userr = user[0];
      if (userr.credits < 10) {
        res.json({
          success: false,
          msg: `You don't have enough credits to withdraw.`,
        });
      } else {
        let query = {'_id': userId};
        userr.credits = userr.credits - 10;

        User.findOneAndUpdate(query, userr, {upsert: true}, function(err, doc) {
            if (err) {
              res.json({
                success: false,
                msg: 'Internal server error.'
              });
            } else {
              res.json({
                success: true,
              })
            }
        });
      }
    }
  });
});

router.post('/depositeFromWin', (req, res) => {
  const userId = req.body.userId;
  User.find({_id: userId}).then(function(user) {
    if(!user.length){
        res.json({
          success: false,
          msg: 'No such user.',
        });
        return;
    } else {
      userr = user[0];
      let query = {'_id': userId};
      userr.credits = userr.credits + 20;

      User.findOneAndUpdate(query, userr, {upsert: true}, function(err, doc) {
          if (err) {
            res.json({
              success: false,
              msg: 'Internal server error.'
            });
          } else {
            res.json({
              success: true,
            })
          }
      });
    }
  });
});

router.post('/depositeFromCancel', async (req, res) => {
  const userId = req.body.userId;
  const cancelRes = await creditManager.depositeFromCancel(userId);
  res.json(cancelRes);
});

module.exports = router;