
db.posts.remove({});
db.posts.insertMany([{
  "body": "This is a sample post",
  "createdAt": "2022-02-25T05:37:04.759Z",
  "author": {
    "$oid": "62185131ebe5ca6b499c0258"
  },
  "body": "This is a sample post",
}, {
  "body": "This is a sample post",
  "createdAt": "2022-02-25T05:37:04.759Z",
  "author": {
    "$oid": "62185131ebe5ca6b499c0258"
  },
  "body": "This is another post",
}]);
