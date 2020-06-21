import React from 'react';

import Posts from './Posts';
import PostCreate from './PostCreate';

export default () => {
  return (
    <div className="container">
      <h2>Create post</h2>
      <PostCreate />
      <hr />
      <h2>Posts</h2>
      <Posts />
    </div>
  );
};
