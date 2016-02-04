var PostService = require('../service/postservice').PostService;
var postsRouter = function(express, apiBaseUri, usersRounter) {
  this.init(express, apiBaseUri, usersRounter);
};

postsRouter.prototype = {
  init: function(express, apiBaseUri, usersRounter) {
    this.postService = new PostService();

    this.apiBaseUri = apiBaseUri;
    this.usersRounter = usersRounter;
    this.routerBaseUri = '/posts';
    this.router = express.Router();
    this.initRouterMiddleware();
    this.initRoutes();
  },
  initRouterMiddleware: function() {
    // middleware that is specific to this router
    var that = this;
    that.router.use(function(req, res, next) {
      console.log('Processing request to ' + that.routerBaseUri + ' router.');
      next();
    });
  },
  initRoutes: function() {
    var that = this;
    that.router.get('/list', function(req, res) {
      that.list(req, res);
    });
    that.router.post('/add', function(req, res) {
      that.add(req, res);
    });
    that.router.post('/like', function(req, res) {
      that.like(req, res);
    });
  },
  useRouter: function(app) {
    app.use(this.apiBaseUri + this.routerBaseUri, this.router);
  },


  list: function(req, res) {
    var that = this;
    var currentUserName = that.usersRounter.getCurrentUserName(req, res);
    console.log('Carregando posts do usuário ' + currentUserName);
    that.postService.listByAuthor(currentUserName, function(err, results) {
      if (err) {
        console.error(err);
      } else {
        var loadedPosts = [];
        for (var i = 0; i < results.length; i++) {
          var post = results[i];
          var loadedPost = {
            id: post._id,
            authorId: post.by,
            author: post.by,
            timestamp: post.creationDate,
            text: post.content
          };
          loadedPosts.push(loadedPost);
        }

        var responseData = {
          posts: loadedPosts
        };
        console.log('Carregados ' + ((loadedPosts) ? loadedPosts.length : 0) + ' posts.');
        res.json(responseData);
      }
    });
  },
  add: function(req, res) {
    var that = this;
    var data = req.body;
    var currentUserName = that.usersRounter.getCurrentUserName(req, res);
    var post = that.postService.create(currentUserName, data.text);
    var responseData = {
      id: post._id,
      authorId: post.by,
      author: post.by,
      timestamp: post.creationDate,
      text: post.content
    };
    console.log('Criado post com id ' + post._id);
    res.json(responseData);
  },
  like: function(req, res) {
    var that = this;
    var data = req.body;
    that.postService.doLike(data.postId, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        var responseData = {
          postId: result._id,
          numLikes: result.likes
        };
        console.log('Efetuado like para o post com id ' + result._id);
        res.json(responseData);
      }
    });
  }
};

module.exports = {
  PostsRouter: postsRouter
};