var PostService = require('../service/postservice').PostService;
var CommentService = require('../service/commentservice').CommentService;
var commentsRouter = function(express, apiBaseUri, usersRounter) {
  this.init(express, apiBaseUri, usersRounter);
};

commentsRouter.prototype = {
  init: function(express, apiBaseUri) {
    this.postService = new PostService();
    this.commentService = new CommentService();

    this.apiBaseUri = apiBaseUri;
    this.usersRounter = usersRounter;
    this.routerBaseUri = '/comments';
    this.router = express.Router();
    initRounterMiddleware();
    initRoutes();
  },
  initRounterMiddleware: function() {
    // middleware that is specific to this router
    var that = this;
    that.router.use(function(req, res, next) {
      console.log('Processing request to ' + that.routerBaseUri + ' router.');
      next();
    });
  },
  initRoutes: function() {
    var that = this;
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

  add: function(req, res) {
    var that = this;
    var data = req.body;
    var currentUserName = that.usersRounter.getCurrentUserName(req, res);
    var comment = that.commentService.create(currentUserName, data.text);
    that.postService.addComment(data.postId, comment, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        var responseData = {
          postId: result._id,
          id: comment._id,
          authorId: comment.by,
          author: comment.by,
          timestamp: comment.creationDate,
          text: comment.content
        };
        console.log('Criado comentário com id ' + comment._id);
        res.json(responseData);
      }
    });
  },
  like: function(req, res) {
    var that = this;
    var data = req.body;
    if (data.commentId) {
      that.commentService.doLike(data.commentId, function(err, resultComment) {
        if (err) {
          console.error(err);
        } else {
          that.postService.findById(data.postId, function(err, resultPost) {});
          var responseData = {
            commentId: resultComment._id,
            numLikes: resultComment.likes
          };
          console.log('Efetuado like para o comentário com id ' + resultComment._id);
          res.json(responseData);
        }
      });
    }
  }
};

module.exports = commentsRouter;