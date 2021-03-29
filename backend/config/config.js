module.exports = {
  development: {
    username: "dbuser",
    password: "1029",
    database: "preventra",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true
    }
  },
  test: {
    username: "dbuser",
    password: "1029",
    database: "preventra",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "dbuser",
    password: "1029",
    database: "preventra",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  database: {
    host: "127.0.0.1",
    user: "dbuser",
    password: "1029",
    database: "statistics"
  },
  redis: {
    url: '127.0.0.1'
  },
  path: {
    shell: "/home/eunseo/preventra/backend/lib/shell/",
    // python: "/home/seungho/darknet/2020-sw-skku-GIT/",
    video: "/home/seungho/darknet/2020-sw-skku-GIT/video-gumin/"
  },
  secretKey: "secre1tke2yfor3sec5ret5pa2ssword"
}