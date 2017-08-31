var path = require('path');
var fs = require('fs');
var join = path.join;
var MongoClient = require('../models/Photo').MongoClient;
var url = require('../models/Photo').url;
var ObjectId = require('mongodb').ObjectID;

exports.list = function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) {
      return next(err)
    }
    db.collection('photos').find({}).toArray(function (err, result) {
      if (err) {
        return next(err)
      }
      res.render('photos', {title: 'Photos Show!', photos: result});
      db.close();
    })
  })
};

exports.form = function (req, res) {
  res.render('photos/upload', {
    title: 'Photo Upload!'
  })
};

exports.submit = function (dir) {
  return function (req, res, next) {
    var img = req.files.image;
    var name = req.body.name || img.name;
    var path = join(dir, img.name);
    var readStream = fs.createReadStream(img.path);
    var writeStream = fs.createWriteStream(path);
    readStream.pipe(writeStream);
    readStream.on('end', function (err) {
      if (err) {
        return next(err)
      }
      fs.unlinkSync(img.path);
    });
    MongoClient.connect(url, function (err, db) {
      if (err) {
        return next(err)
      }
      var newPhoto = {name: name, path: img.name};
      console.log(JSON.stringify({newPhoto: newPhoto}));
      db.collection('photos').insertOne(newPhoto, function (err) {
        if (err) {
          return next(err)
        }
        db.close();
        res.redirect('/');
      })
    });
  }
};


exports.download = function (dir) {
  return function (req, res, next) {
    var id = req.params.id;
    MongoClient.connect(url, function (err, db) {
      if (err) {
        return next(err)
      }

      //根据Id查询mongodb数据库需要引入ObjectId()
      var query = {_id: new ObjectId(id)};
      db.collection('photos').find(query).toArray(function (err, result) {
        if (err) {
          return next(err)
        }

        var path = join(dir, result[0].path);
        var name = result[0].name;
        var type = /.+\.(.+)/.exec(result[0].path)[1];
        res.download(path, name + '.' + type);
        db.close()
      })
    })
  }
};

