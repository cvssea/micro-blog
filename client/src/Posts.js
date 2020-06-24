import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

import CommentCreate from './CommentCreate';
import CommentList from './CommentList';

const Posts = () => {
  const [posts, setPosts] = useState({});

  useEffect(() => {
    axios
      .get('http://posts.com/posts')
      .then(({ data }) => setPosts(data))
      .catch((e) => console.log(e));
  }, []);

  const renderedPosts = useMemo(() => {
    return Object.values(posts).map(({ id, title, comments }) => (
      <div
        key={id}
        className="card text-white bg-secondary m-2"
        style={{ width: '15rem' }}
      >
        <div className="card-header">{title}</div>
        <div className="card-body">
          <h5 className="card-title">Comments</h5>
          <CommentList comments={comments} />
          <CommentCreate postId={id} />
        </div>
      </div>
    ));
  }, [posts]);

  return (
    <div className="d-flex flex-wrap justify-content-between">
      {renderedPosts}
    </div>
  );
};

export default Posts;
