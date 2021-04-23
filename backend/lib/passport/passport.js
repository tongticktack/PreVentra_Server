const passport = require('passport');
const models = require('../../models');
const LocalStrategy = require('passport-local').Strategy;
const {
  validatePassword,
  generateSalt,
  encryptPassword
} = require('./utils')


module.exports = () => {
  // 유저 정보 세션에 저장
  passport.serializeUser((user, done) => {
    console.log("serialize user");
    done(null, user.id);
  });

  // 유저 정보 세션에서 가져옴
  passport.deserializeUser((user_id, done) => {
    console.log("deserialize user");
    done(null, user_id);
    /*
    try {
        models.user.findByPk(user_id, {logging:false, raw: true})
            .then((user) => {
                done(null, user);
            });
    } catch (e) {
        console.error(e);
        done(e);
    }
    */
  });

  // 로컬 로그인
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true,
    passReqToCallback: false
  }, async (email, password, done) => {
    models.user.findOne({
      where: {
        email: email
      },
      raw: true,
      attributes: ['id', 'password', 'salt'],
      logging: false
    }).then(async (user) => {
      if (!user) {
        return done(null, false, {
          message: "Email does not exist!"
        });
      }
      if (await validatePassword(user, password)) {
        console.log('Valid');
        return done(null, user);
      } else {
        return done(null, false, {
          message: "Password does not match!"
        });
      }
    });
  }));

  // 로컬 유저 등록
  passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true,
    passReqToCallback: true
  }, async (req, email, password, done) => {
    console.log('try register...');
    models.user.findOne({
      where: {
        email: email
      },
      raw: true
    }).then(async (user) => {
      if (user)
        return done(null, false, {
          message: "User account already exists!"
        });

      let salt = await generateSalt();
      let key = await encryptPassword(password, salt);

      console.log(email, salt, key, req.body.nickname, req.body.phone_num, "created");

      models.user.create({
        email: email,
        password: key,
        salt: salt,
        nickname: req.body.nickname,
        phone_num: req.body.phone_num
      });
      return done(null, true);
    });
  }));
}